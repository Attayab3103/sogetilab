import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Clock, Monitor } from 'lucide-react';
import { openRouterService } from '../services/openRouterService';
import { sessionAPI, resumeAPI } from '../services/api';
import ReadyToCreateModal from '../components/ReadyToCreateModal';
import { toast } from 'sonner';


interface ConversationEntry {
  question: string;
  userAnswer: string;
  aiResponse?: AIResponse;
  timestamp: Date;
  processed: boolean;
}

interface SessionData {
  company: string;
  position: string;
  resumeId: string;
  resumeData?: any;
  language: string;
  simpleEnglish: boolean;
  aiModel: string;
  extraInstructions?: string;
  sessionId?: string; // Add database session ID
  sessionType: 'trial' | 'premium'; // Add sessionType property
}

interface AIResponse {
  answer: string;
  confidence: number;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

function getSessionStorageKey() {
  return 'trialInterviewSession';
}

export default function TrialInterviewSession() {
  // Core session state
  const [isTrial, setIsTrial] = useState(true); // Re-add isTrial state
  const [timeRemaining, setTimeRemaining] = useState(540); // 9 minutes for trial
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  // Speech recognition state
  const [transcript, setTranscript] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  // AI response state
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  // Screen capture state
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastScreenshot, setLastScreenshot] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  // Screen preview size controls
  const [previewWidth, setPreviewWidth] = useState(800); // Default width in pixels
  const [previewHeight, setPreviewHeight] = useState(576); // Default height (36rem = 576px)
  // Session persistence
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showReadyToCreateModal, setShowReadyToCreateModal] = useState(false);


  const clearSessionState = () => {
    try {
      localStorage.removeItem(getSessionStorageKey());
    } catch (error) {
      console.error('Failed to clear session state:', error);
    }
  };

  // Save session state to localStorage
  const saveSessionState = () => {
    try {
      const state = {
        sessionData,
        selectedModel,
        conversation,
        timeRemaining,
        sessionStartTime,
        previewWidth,
        previewHeight
      };
      localStorage.setItem(getSessionStorageKey(), JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save session state:', error);
    }
  };

  // Initialize session with data from URL params or use defaults
  useEffect(() => {
    if (!isInitialized) {
      initializeSession();
    }
  }, []);

  // Auto-save session state when conversation or important state changes
  useEffect(() => {
    if (isInitialized && sessionData) {
      saveSessionState();
    }
  }, [conversation, timeRemaining, sessionData, selectedModel, previewWidth, previewHeight, isInitialized]);

  // Timer countdown (only for trial)
  useEffect(() => {
    if (!isTrial) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTrial]);

  // Speech recognition setup
  useEffect(() => {
    if (isListening && !recognitionRef.current) {
      // Always use latest sessionData
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error('Speech recognition is not supported in this browser.');
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = sessionData?.language || 'en-US';
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + ' ' + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setCurrentTranscript(interimTranscript);
      };
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      recognition.onend = () => {
        if (isListening) {
          recognition.start(); // Restart if still listening
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
    } else if (!isListening && recognitionRef.current) {
      // Clean up recognition when not listening
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.error('Error cleaning up recognition:', error);
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        } catch (error) {
          console.error('Error stopping recognition in cleanup:', error);
        }
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [isListening]);

  // Screen sharing cleanup
  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [screenStream]);

  // Handle page visibility changes to refresh video when coming back to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isScreenSharing && videoRef.current && screenStream) {
        console.log('Page became visible, checking video state');
        const video = videoRef.current;
        
        // Check if video needs to be refreshed
        if (video.videoWidth === 0 || video.videoHeight === 0 || video.paused) {
          console.log('Refreshing video after tab focus');
          
          // Re-assign the stream and try to play
          video.srcObject = screenStream;
          video.play()
            .then(() => {
              console.log('Video refreshed successfully after tab focus');
              setVideoReady(true);
              setCurrentTranscript('Screen preview refreshed! You can now capture screens for AI analysis or continue with voice questions.');
            })
            .catch(error => {
              console.error('Failed to refresh video after tab focus:', error);
              setCurrentTranscript('Screen sharing is active, but preview needs refresh. Try clicking Connect again.');
            });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also handle focus events
    const handleFocus = () => {
      if (isScreenSharing && videoRef.current && screenStream) {
        setTimeout(() => handleVisibilityChange(), 100);
      }
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isScreenSharing, screenStream]);

  // Cleanup on unmount - save final state
  useEffect(() => {
    return () => {
      if (isInitialized && sessionData) {
        // Save one final time before unmounting
        saveSessionState();
      }
    };
  }, [isInitialized, sessionData]);

  const initializeSession = async () => {
    try {
      setCurrentTranscript('Loading your interview session...');
      
      const existingSessionId = searchParams.get('sessionId');
      
      if (existingSessionId) {
        // Load existing session from database if sessionId is provided in URL
        try {
          const response = await sessionAPI.getById(existingSessionId);
          const dbSession = response.data.data;
          
          let resumeData = null;
          if (dbSession.metadata?.resumeId) {
            try {
              const resumeResponse = await resumeAPI.getById(dbSession.metadata.resumeId);
              resumeData = resumeResponse.data.data;
            } catch (resumeError) {
              console.error('Failed to load resume for existing session:', resumeError);
              resumeData = null;
            }
          }
          
          const sessionConfig: SessionData = {
            company: dbSession.company,
            position: dbSession.position,
            resumeId: dbSession.metadata?.resumeId || 'demo-resume',
            language: dbSession.metadata?.language || 'en',
            simpleEnglish: dbSession.metadata?.simpleEnglish || false,
            aiModel: dbSession.metadata?.aiModel || 'gpt-4',
            extraInstructions: dbSession.metadata?.extraInstructions || '',
            sessionId: existingSessionId,
            resumeData: resumeData,
            sessionType: dbSession.sessionType, // Add sessionType property
          };
          
          setSessionData(sessionConfig);
          setSelectedModel(sessionConfig.aiModel);
          setSessionStartTime(new Date());
          setIsTrial(dbSession.sessionType === 'trial'); // Set isTrial based on DB session type
          
          try {
            const questionsResponse = await sessionAPI.getQuestions(existingSessionId);
            if (questionsResponse.data.data && questionsResponse.data.data.length > 0) {
              const dbConversation = questionsResponse.data.data.map((q: any) => ({
                question: q.question,
                userAnswer: q.question,
                aiResponse: {
                  answer: q.answer,
                  confidence: q.confidence || 0.8,
                },
                timestamp: new Date(q.createdAt),
                processed: true,
              }));
              setConversation(dbConversation);
              console.log('Loaded conversation history from database:', dbConversation.length, 'messages');
            }
          } catch (historyError) {
            console.error('Failed to load conversation history:', historyError);
          }
          
          setCurrentTranscript(`Session loaded! Interviewing for ${dbSession.position}${dbSession.company ? ` for ${dbSession.company}` : ''}.`);
          
        } catch (error) {
          console.error('Failed to load session from database:', error);
          setCurrentTranscript('Error: Could not load session from database. Please try again.');
        }
      } else {
        // Create new session in database if no sessionId is provided
        const sessionConfig = await createNewDatabaseSession();
        setSessionData(sessionConfig);
        setSelectedModel(sessionConfig.aiModel);
        setSessionStartTime(new Date());
        setIsTrial(sessionConfig.sessionType === 'trial'); // Set isTrial based on new session type
        setCurrentTranscript('New session created! Ready. Click "Connect" to enable voice transcription and screen sharing...');
      }
      
      setIsInitialized(true);
      
      setTimeout(() => {
        console.log('Session ready for user interaction');
      }, 1000);
    } catch (error) {
      console.error('Session initialization error:', error);
      setCurrentTranscript('Error: Could not initialize session');
      setIsInitialized(true);
    }
  };

  const createNewDatabaseSession = async (): Promise<SessionData> => {
    try {
      const sessionData = {
        sessionType: 'trial' as const,
        company: searchParams.get('company') || '',
        position: searchParams.get('position') || '',
        resumeId: searchParams.get('resumeId') || '',
        language: searchParams.get('language') || 'en',
        simpleEnglish: searchParams.get('simpleEnglish') === 'true',
        extraInstructions: searchParams.get('extraInstructions') || '',
        aiModel: searchParams.get('aiModel') || 'gpt-4'
      };

      console.log('Creating new session with data:', sessionData);

      const response = await sessionAPI.create(sessionData);
      const createdSession = response.data.data;

      // Load actual resume data if resumeId is provided
      let resumeData = null;
      if (sessionData.resumeId) {
        try {
          const resumeResponse = await resumeAPI.getById(sessionData.resumeId);
          resumeData = resumeResponse.data.data;
        } catch (resumeError) {
          console.error('Failed to load resume:', resumeError);
          resumeData = null;
        }
      }

      return {
        company: sessionData.company,
        position: sessionData.position,
        resumeId: sessionData.resumeId,
        language: sessionData.language,
        simpleEnglish: sessionData.simpleEnglish,
        aiModel: sessionData.aiModel,
        extraInstructions: sessionData.extraInstructions,
        sessionId: createdSession._id,
        resumeData: resumeData,
        sessionType: sessionData.sessionType, // Add sessionType property
      };
    } catch (error) {
      console.error('Failed to create session in database:', error);
      // If DB fails, throw error
      throw error;
    }
  };

  // Optionally, you can still use browser speech recognition for fallback, but now you can stream transcript via WebSocket.

  // Live AI answer streaming state
  const [streamedAIAnswer, setStreamedAIAnswer] = useState<string>('');
  const [isStreamingAI, setIsStreamingAI] = useState<boolean>(false);

  const processUserAnswer = async (answer: string) => {
    if (!sessionData || !answer.trim() || isGenerating) return;

    setIsGenerating(true);
    setIsStreamingAI(true);
    setCurrentTranscript('Processing your answer...');
    setStreamedAIAnswer('');

    // Clear silence timer
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }

    try {
      // Build comprehensive system prompt with ALL user data
      const systemPrompt = buildComprehensiveSystemPrompt(sessionData, answer);

      // Only send allowed model values to the API
      const allowedModels = ['gpt-4', 'gpt-3.5-turbo', 'claude-3.5'] as const;
      let selected = selectedModel || sessionData.aiModel;
      if (selected === 'gpt-4.1') selected = 'gpt-4';
      const model = allowedModels.includes(selected as any)
        ? (selected as typeof allowedModels[number])
        : 'gpt-4';

      // Add user message to conversation immediately for UI feedback
      setConversation(prev => [
        ...prev,
        {
          question: answer,
          userAnswer: answer,
          aiResponse: undefined,
          timestamp: new Date(),
          processed: false
        }
      ]);

      // --- Direct API call for AI answer (no WebSocket) ---
      const aiResponse = await openRouterService.generateResponse({
        systemPrompt,
        question: answer,
        model,
      });

      setIsGenerating(false);
      setIsStreamingAI(false);
      setStreamedAIAnswer(aiResponse.answer);
      // Add AI response to conversation (replace last entry)
      setConversation(prev => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (!updated[i].processed && updated[i].userAnswer === answer) {
            updated[i] = {
              ...updated[i],
              aiResponse: { answer: aiResponse.answer, confidence: aiResponse.confidence ?? 1 },
              processed: true
            };
            break;
          }
        }
        return updated;
      });
      setTranscript('');
      setCurrentTranscript('AI candidate response is ready. You can continue or ask another question.');
      // Save question and answer to database
      if (sessionData?.sessionId) {
        try {
          await sessionAPI.addQuestion(sessionData.sessionId, {
            question: answer,
            answer: aiResponse.answer,
            confidence: aiResponse.confidence ?? 1
          });
          console.log('Question and answer saved to database');
        } catch (dbError) {
          console.error('Failed to save to database:', dbError);
        }
      }
    } catch (error) {
      setIsGenerating(false);
      setIsStreamingAI(false);
      setCurrentTranscript('AI error: ' + (error as any)?.message || 'Unknown error');
      setStreamedAIAnswer('');
    }
  };

  const getContextualResponseAdjustments = (question: string, conversationLength: number): string => {
    const q = question.toLowerCase();
    let adjustments = [];

    // Interview stage considerations
    if (conversationLength === 0) {
      adjustments.push("**OPENING INTERVIEW**: This is your first response - make a strong first impression with confidence and enthusiasm.");
    } else if (conversationLength >= 1 && conversationLength <= 3) {
      adjustments.push("**EARLY STAGE**: Building rapport and establishing your qualifications. Be engaging and show personality.");
    } else if (conversationLength >= 4 && conversationLength <= 7) {
      adjustments.push("**MID INTERVIEW**: Deep dive phase. Provide detailed examples and demonstrate expertise thoroughly.");
    } else if (conversationLength >= 8) {
      adjustments.push("**CLOSING STAGE**: Focus on mutual fit, show genuine interest, and ask thoughtful questions.");
    }

    // Technical vs behavioral question adjustments
    if (q.includes('technical') || q.includes('code') || q.includes('algorithm') || q.includes('system') || q.includes('architecture')) {
      adjustments.push("**TECHNICAL QUESTION**: Balance technical accuracy with clear explanation. Use specific examples and explain your thought process.");
    } else if (q.includes('team') || q.includes('conflict') || q.includes('leadership') || q.includes('communication')) {
      adjustments.push("**BEHAVIORAL QUESTION**: Use the STAR method (Situation, Task, Action, Result). Focus on soft skills and interpersonal abilities.");
    }

    // Role-specific adjustments
    if (q.includes('manage') || q.includes('lead') || q.includes('team')) {
      adjustments.push("**LEADERSHIP FOCUS**: Emphasize management philosophy, team building, and strategic thinking.");
    } else if (q.includes('individual') || q.includes('independent') || q.includes('solo')) {
      adjustments.push("**INDIVIDUAL CONTRIBUTOR**: Highlight self-direction, initiative, and individual technical skills.");
    }

    // Question complexity adjustments
    if (q.includes('complex') || q.includes('challenging') || q.includes('difficult')) {
      adjustments.push("**COMPLEX SCENARIO**: Provide extra detail on your problem-solving approach and show analytical thinking.");
    } else if (q.includes('simple') || q.includes('basic') || q.includes('straightforward')) {
      adjustments.push("**STRAIGHTFORWARD QUESTION**: Keep response focused and avoid over-complicating your answer.");
    }

    return adjustments.length > 0 
      ? `\n## CONTEXTUAL ADJUSTMENTS\n${adjustments.map(adj => `- ${adj}`).join('\n')}\n`
      : '';
  };

  const analyzeQuestionTypeAndLength = (question: string): string => {
    const q = question.toLowerCase().trim();
    // Define question patterns and their expected response lengths
    const patterns = {
      // SHORT RESPONSES (15-30 seconds, 50-100 words)
      shortAnswers: [
        /^(yes|no|sure|okay|ok|alright)/,
        /how are you/,
        /nice to meet you/,
        /thank you/,
        /what's your name/,
        /where are you from/,
        /are you ready/,
        /any questions for me/,
        /do you have/,
        /can you/,
        /will you/,
        /would you like/,
        /quick question/,
        /briefly/,
        /in one word/,
        /yes or no/,
        /rate yourself/,
        /scale of/
      ],
      
      // MEDIUM RESPONSES (30-60 seconds, 100-200 words)
      mediumAnswers: [
        /tell me about yourself/,
        /describe yourself/,
        /what are your strengths/,
        /what are your weaknesses/,
        /why do you want/,
        /what interests you/,
        /what motivates you/,
        /how do you handle/,
        /what would you do/,
        /describe a time/,
        /give me an example/,
        /how would you/,
        /what's your approach/,
        /how do you deal with/,
        /what's your experience with/,
        /what do you know about/,
      ],
      
      // LONG RESPONSES (60-120 seconds, 200-400 words)
      longAnswers: [
        /tell me about a project/,
        /describe a challenging situation/,
        /walk me through/,
        /explain how you/,
        /describe your most/,
        /tell me about a time when/,
        /give me a detailed example/,
        /describe your experience/,
        /explain your process/,
        /how would you solve/,
        /describe a complex/,
        /tell me about your background/,
        /explain your career path/,
        /describe your leadership/,
        /tell me about a conflict/,
        /explain a technical/,
        /describe how you would/,
        /walk through your thought process/,
      ],
      
      // VERY LONG RESPONSES (2+ minutes, 300-500 words)
      veryLongAnswers: [
        /tell me about your career journey/,
        /describe your professional background/,
        /walk me through your resume/,
        /explain your long-term goals/,
        /describe your ideal work environment/,
        /tell me about your biggest achievement/,
        /describe a major project you led/,
        /explain how you would design/,
        /describe your management philosophy/,
        /tell me about your entrepreneurial/,
        /explain your vision for/,
        /describe how you would build/,
        /design a system/,
        /architect a solution/,
        /explain the entire process/,
        /walk through the complete/,
        /describe your full approach/,
      ],

      // TECHNICAL CODING RESPONSES (varies based on complexity)
      codingAnswers: [
        /write a function/,
        /implement an algorithm/,
        /solve this problem/,
        /code this up/,
        /write some code/,
        /implement this/,
        /how would you code/,
        /write a program/,
        /coding challenge/,
        /algorithm question/,
        /data structure/,
        /big o notation/,
        /time complexity/,
        /space complexity/,
      ]
    };

    // Check patterns in order of specificity (longest first)
    
    // Special handling for coding/technical questions
    for (const pattern of patterns.codingAnswers) {
      if (pattern.test(q)) {
        return `## RESPONSE LENGTH GUIDANCE - TECHNICAL/CODING ANSWER
**Target Length**: Variable based on complexity (100-400 words)
**Structure**: This is a technical/coding question requiring systematic problem-solving.

**Required Elements**:
- **Problem Understanding**: Clarify the requirements and constraints
- **Approach Explanation**: Outline your solution strategy before coding
- **Step-by-Step Solution**: Write clean, commented code if applicable
- **Complexity Analysis**: Discuss time/space complexity
- **Edge Cases**: Consider and mention edge cases
- **Alternative Solutions**: If time permits, mention other approaches
- **Testing Strategy**: Briefly explain how you'd test this

**Tone**: Analytical, methodical, and confident in technical abilities
**Note**: If screen sharing is active, use the capture feature to analyze the coding problem`;
      }
    }

    for (const pattern of patterns.veryLongAnswers) {
      if (pattern.test(q)) {
        return `## RESPONSE LENGTH GUIDANCE - COMPREHENSIVE ANSWER
**Target Length**: 300-500 words (2-3 minutes speaking time)
**Structure**: This question requires a detailed, comprehensive response with multiple examples and thorough explanation.

**Required Elements**:
- **Detailed Introduction**: Set comprehensive context
- **Multiple Examples**: Provide 2-3 specific, detailed examples with outcomes
- **Process Explanation**: Walk through your methodology/approach step-by-step  
- **Results & Impact**: Quantify achievements and explain broader implications
- **Future Application**: Connect to the role and show forward-thinking
- **Professional Depth**: Demonstrate expertise and strategic thinking

**Tone**: Professional, confident, and comprehensive while maintaining engagement`;
      }
    }

    for (const pattern of patterns.longAnswers) {
      if (pattern.test(q)) {
        return `## RESPONSE LENGTH GUIDANCE - DETAILED ANSWER
**Target Length**: 200-400 words (60-120 seconds speaking time)
**Structure**: This question needs a structured, detailed response with specific examples.

**Required Elements**:
- **Clear Setup**: Provide context and background (1-2 sentences)
- **Specific Example**: Give a detailed, relevant example from your experience
- **Action Taken**: Explain what you did and your thought process
- **Results Achieved**: Share measurable outcomes and impact
- **Learning/Growth**: What you learned or how it shaped you
- **Relevance**: Connect back to the role/company

**Tone**: Professional, engaging, and story-driven with concrete details`;
      }
    }

    for (const pattern of patterns.mediumAnswers) {
      if (pattern.test(q)) {
        return `## RESPONSE LENGTH GUIDANCE - MODERATE ANSWER
**Target Length**: 100-200 words (30-60 seconds speaking time)
**Structure**: This question needs a focused, well-organized response.

**Required Elements**:
- **Direct Answer**: Address the question clearly upfront
- **Supporting Example**: Provide one relevant example or evidence
- **Brief Explanation**: Give context or reasoning (2-3 sentences)
- **Connection**: Link to the role or demonstrate value
- **Confident Close**: End with a strong, forward-looking statement

**Tone**: Professional, concise, and confident without being rushed`;
      }
    }

    for (const pattern of patterns.shortAnswers) {
      if (pattern.test(q)) {
        return `## RESPONSE LENGTH GUIDANCE - BRIEF ANSWER
**Target Length**: 50-100 words (15-30 seconds speaking time)
**Structure**: This question requires a concise, direct response.

**Required Elements**:
- **Immediate Answer**: Respond directly to the question
- **Brief Support**: Add 1-2 sentences of context or reasoning if needed
- **Professional Tone**: Keep it warm but efficient
- **Clear Close**: End definitively without trailing off

**Tone**: Friendly, confident, and appropriately brief`;
      }
    }

    // Follow-up and probing questions should be shorter
    if (q.includes('follow up') || q.includes('can you elaborate') || q.includes('tell me more') || 
        q.includes('what else') || q.includes('anything else') || q.includes('expand on')) {
      return `## RESPONSE LENGTH GUIDANCE - FOLLOW-UP ANSWER
**Target Length**: 75-150 words (30-45 seconds speaking time)
**Structure**: This is a follow-up question - build on your previous answer.

**Required Elements**:
- **Reference Previous**: Acknowledge your previous response
- **Additional Detail**: Provide the specific elaboration requested
- **New Insight**: Add something valuable you didn't mention before
- **Natural Conclusion**: End without being repetitive

**Tone**: Engaging and additive - show you have more depth to offer`;
    }

    // Default to medium length for unclassified questions
    return `## RESPONSE LENGTH GUIDANCE - STANDARD ANSWER
**Target Length**: 150-250 words (45-75 seconds speaking time)
**Structure**: This question needs a balanced, professional response.

**Required Elements**:
- **Clear Opening**: Address the question directly
- **Supporting Details**: Provide relevant context and examples
- **Professional Insight**: Show your thinking and expertise
- **Strong Conclusion**: End with confidence and relevance to the role

**Tone**: Professional, engaging, and appropriately detailed`;
  };

  const buildConversationHistory = (): string => {
    if (conversation.length === 0) {
      return '## CONVERSATION HISTORY\nThis is the start of the interview. No previous questions have been asked.';
    }

    let historyContext = '## CONVERSATION HISTORY\nHere is what has been discussed so far in this interview:\n\n';
    
    // Get only the completed conversation entries
    const completedEntries = conversation.filter(entry => entry.processed && entry.aiResponse);
    
    if (completedEntries.length === 0) {
      return '## CONVERSATION HISTORY\nThis is the start of the interview. No previous questions have been completed yet.';
    }
    
    completedEntries.forEach((entry, index) => {
      historyContext += `### Exchange ${index + 1}:\n`;
      historyContext += `**Interviewer Asked:** "${entry.question}"\n`;
      historyContext += `**You Responded:** "${entry.aiResponse!.answer}"\n`;
      
      // Add contextual notes for common interview patterns
      if (index === 0) {
        historyContext += `*Note: This was your opening response - establish rapport and set the tone.*\n`;
      }
      
      historyContext += '\n';
    });

    // Add contextual guidance based on conversation progress
    const contextualGuidance = generateContextualGuidance(completedEntries);
    historyContext += contextualGuidance;

    historyContext += `**IMPORTANT:** Use this conversation history to:\n`;
    historyContext += `- Maintain consistency with previous answers\n`;
    historyContext += `- Reference earlier topics naturally when relevant ("As I mentioned earlier..." or "Building on what we discussed about...")\n`;
    historyContext += `- Show you're engaged and following the interview flow\n`;
    historyContext += `- Avoid repeating the same information unless specifically asked to elaborate\n`;
    historyContext += `- Demonstrate how different aspects of your background connect\n\n`;
    
    return historyContext;
  };

  const generateContextualGuidance = (completedEntries: ConversationEntry[]): string => {
    const numCompleted = completedEntries.length;
    let guidance = '';

    if (numCompleted === 1) {
      guidance += `**CONTEXT NOTE:** You've answered one question. The interviewer is likely diving deeper or exploring different aspects of your background. Build naturally on your introduction.\n\n`;
    } else if (numCompleted >= 2) {
      guidance += `**CONTEXT NOTE:** You're ${numCompleted} questions into the interview. Look for opportunities to connect current answers to previous topics, show consistency, and demonstrate how different aspects of your experience relate to each other.\n\n`;
      
      // Analyze recent topics for connection opportunities
      const recentTopics = analyzeRecentTopics(completedEntries);
      if (recentTopics.length > 0) {
        guidance += `**RECENT DISCUSSION THEMES:** ${recentTopics.join(', ')}. Consider how your next answer might connect to these themes.\n\n`;
      }
    }

    return guidance;
  };

  const analyzeRecentTopics = (entries: ConversationEntry[]): string[] => {
    const topics: string[] = [];
    
    // Take the last 3 entries for recent context
    const recentEntries = entries.slice(-3);
    
    recentEntries.forEach(entry => {
      const question = entry.question.toLowerCase();
      const answer = entry.aiResponse?.answer.toLowerCase() || '';
      
      // Identify common interview topics
      if (question.includes('yourself') || question.includes('background')) {
        topics.push('personal background');
      }
      if (question.includes('experience') || answer.includes('experience')) {
        topics.push('work experience');
      }
      if (question.includes('skill') || answer.includes('skill')) {
        topics.push('skills and abilities');
      }
      if (question.includes('strength') || question.includes('weakness')) {
        topics.push('strengths and areas for growth');
      }
      if (question.includes('project') || answer.includes('project')) {
        topics.push('specific projects');
      }
      if (question.includes('challenge') || answer.includes('challenge')) {
        topics.push('challenges and problem-solving');
      }
      if (question.includes('team') || answer.includes('team')) {
        topics.push('teamwork and collaboration');
      }
      if (question.includes('goal') || question.includes('future')) {
        topics.push('career goals and aspirations');
      }
    });

    // Remove duplicates and return
    return [...new Set(topics)];
  };

  const buildResumeContext = (resumeData: any): string => {
    if (!resumeData) {
      return `No resume data available. Please respond based on general qualifications for the ${sessionData?.position} role.`;
    }
    
    let context = '';
    
    // Personal Details
    if (resumeData.personalDetails) {
      if (resumeData.personalDetails.name) {
        context += `CANDIDATE NAME: ${resumeData.personalDetails.name}\n`;
      }
      if (resumeData.personalDetails.email) {
        context += `Email: ${resumeData.personalDetails.email}\n`;
      }
      if (resumeData.personalDetails.phone) {
        context += `Phone: ${resumeData.personalDetails.phone}\n`;
      }
      if (resumeData.personalDetails.location) {
        context += `Location: ${resumeData.personalDetails.location}\n`;
      }
      context += '\n';
    }
    
    // Professional Summary
    if (resumeData.summary) {
      context += `PROFESSIONAL SUMMARY:\n${resumeData.summary}\n\n`;
    }
    
    // Work Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      context += 'WORK EXPERIENCE:\n';
      resumeData.experience.forEach((exp: any, index: number) => {
        context += `${index + 1}. ${exp.title || 'Position'} at ${exp.company || 'Company'}\n`;
        if (exp.duration) context += `   Duration: ${exp.duration}\n`;
        if (exp.location) context += `   Location: ${exp.location}\n`;
        if (exp.description) context += `   ${exp.description}\n`;
        if (exp.achievements && exp.achievements.length > 0) {
          context += `   Key Achievements:\n`;
          exp.achievements.forEach((achievement: string) => {
            context += `   • ${achievement}\n`;
          });
        }
        context += '\n';
      });
    }
    
    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      context += `TECHNICAL SKILLS: ${resumeData.skills.join(', ')}\n\n`;
    }
    
    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      context += 'EDUCATION:\n';
      resumeData.education.forEach((edu: any, index: number) => {
        context += `${index + 1}. ${edu.degree || 'Degree'} from ${edu.institution || 'Institution'}`;
        if (edu.year) context += ` (${edu.year})`;
        if (edu.gpa) context += ` - GPA: ${edu.gpa}`;
        context += '\n';
        if (edu.coursework) context += `   Relevant Coursework: ${edu.coursework}\n`;
        if (edu.honors) context += `   Honors: ${edu.honors}\n`;
      });
      context += '\n';
    }
    
    // Certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      context += 'CERTIFICATIONS:\n';
      resumeData.certifications.forEach((cert: any) => {
        context += `• ${cert.name}`;
        if (cert.issuer) context += ` - ${cert.issuer}`;
        if (cert.date) context += ` (${cert.date})`;
        context += '\n';
      });
      context += '\n';
    }
    
    // Projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      context += 'KEY PROJECTS:\n';
      resumeData.projects.forEach((project: any, index: number) => {
        context += `${index + 1}. ${project.name || 'Project'}\n`;
        if (project.description) context += `   ${project.description}\n`;
        if (project.technologies) context += `   Technologies: ${project.technologies}\n`;
        if (project.url) context += `   URL: ${project.url}\n`;
        context += '\n';
      });
    }
    
    // Languages
    if (resumeData.languages && resumeData.languages.length > 0) {
      context += `LANGUAGES: ${resumeData.languages.join(', ')}\n\n`;
    }
    
    return context.trim();
  };

  const stopListening = () => {
    if (isListening) {
      console.log('Stopping speech recognition');
      setIsListening(false);
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current = null; // Clear the reference
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
      
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      // First start screen sharing, then start listening
      if (!isScreenSharing) {
        setCurrentTranscript('Requesting screen sharing access...');
        try {
          await startScreenCapture();
          // Only start listening after screen sharing is successful
          setIsListening(true);
        } catch (error) {
          console.error('Screen sharing failed:', error);
          toast.error('Screen sharing failed. You can still use voice features.');
          // Start listening even if screen sharing fails
          setIsListening(true);
        }
      } else {
        // Screen sharing already active, just start listening
        setIsListening(true);
      }
    }
  };

  const handleManualProcess = () => {
    const trimmed = transcript.trim();
    if (trimmed) {
      setTranscript(''); // Clear field immediately for UX
      processUserAnswer(trimmed);
    }
  };

  const handleClearTranscript = () => {
    setTranscript('');
    setCurrentTranscript('Cleared. Start speaking...');
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
  };

  // formatTime removed (unused)

  const handleEndSession = async () => {
    stopListening();
    
    // Save session completion to database
    if (sessionData?.sessionId) {
      try {
        await sessionAPI.completeSession(sessionData.sessionId, {
          status: 'completed',
          endTime: new Date(),
          duration: Math.floor((540 - timeRemaining) / 60) // Duration in minutes
        });
        console.log('Session completed and saved to database');
      } catch (error) {
        console.error('Failed to save session completion:', error);
      }
    }
    
    // Clear localStorage when session ends
    clearSessionState();
    
    navigate('/interview-sessions');
  };

  // Screen capture functions
  const startScreenCapture = async () => {
    try {
      setCurrentTranscript('Please select the tab/window you want to share and enable audio sharing...');
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 15, max: 30 }
        },
        audio: true // Request audio sharing
      });

      console.log('Screen stream obtained:', stream);
      setScreenStream(stream);
      setIsScreenSharing(true);
      setCurrentTranscript('Screen sharing started! Setting up preview...');

      // Set up video element to show the stream with proper handling
      if (videoRef.current) {
        const video = videoRef.current;
        
        // Reset video state
        setVideoReady(false);
        
        // Configure video properties before setting srcObject
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.controls = false;
        
        console.log('Setting video srcObject to stream');
        
        // Set the stream immediately
        video.srcObject = stream;
        
        // Add comprehensive event listeners
        const handleLoadedMetadata = () => {
          console.log('Video metadata loaded:', {
            width: video.videoWidth,
            height: video.videoHeight,
            readyState: video.readyState
          });
          
          // Force play the video immediately
          video.play()
            .then(() => {
              console.log('Video playing successfully');
              setVideoReady(true);
              setCurrentTranscript('Screen preview is now live! You can capture screens for AI analysis or continue with voice questions.');
            })
            .catch(error => {
              console.error('Error playing video:', error);
              // Try to play again after a short delay
              setTimeout(() => {
                video.play()
                  .then(() => {
                    console.log('Video playing after retry');
                    setVideoReady(true);
                    setCurrentTranscript('Screen preview is now live! You can capture screens for AI analysis or continue with voice questions.');
                  })
                  .catch(e => console.error('Retry play failed:', e));
              }, 100);
            });
        };
        
        const handleCanPlay = () => {
          console.log('Video can play, ready state:', video.readyState);
          if (video.readyState >= 3) { // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
            setVideoReady(true);
            setCurrentTranscript('Screen preview is now live! You can capture screens for AI analysis or continue with voice questions.');
          }
        };
        
        const handleLoadedData = () => {
          console.log('Video data loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            setVideoReady(true);
            setCurrentTranscript('Screen preview is now live! You can capture screens for AI analysis or continue with voice questions.');
          }
        };
        
        const handleError = (error: any) => {
          console.error('Video error:', error);
          console.error('Video error details:', {
            error: video.error,
            networkState: video.networkState,
            readyState: video.readyState
          });
          setVideoReady(false);
          setCurrentTranscript('Video preview error, but screen sharing is active. Capture function should still work.');
        };
        
        const handlePlaying = () => {
          console.log('Video is now playing');
          setVideoReady(true);
          setCurrentTranscript('Screen preview is now live! You can capture screens for AI analysis or continue with voice questions.');
        };
        
        const handleTimeUpdate = () => {
          // This fires when video is actually playing content
          if (!videoReady && video.videoWidth > 0 && video.videoHeight > 0) {
            console.log('Video time update - stream is active');
            setVideoReady(true);
            setCurrentTranscript('Screen preview is now live! You can capture screens for AI analysis or continue with voice questions.');
          }
        };
        
        // Add all event listeners
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('error', handleError);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('timeupdate', handleTimeUpdate);
        
        // Cleanup function to remove listeners
        const cleanup = () => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('loadeddata', handleLoadedData);
          video.removeEventListener('error', handleError);
          video.removeEventListener('playing', handlePlaying);
          video.removeEventListener('timeupdate', handleTimeUpdate);
        };
        
        // Store cleanup function for later use
        (video as any)._cleanup = cleanup;
        
        // Force load and play after a short delay to ensure everything is set up
        setTimeout(() => {
          if (video.srcObject) {
            console.log('Force loading video');
            video.load();
            video.play()
              .then(() => {
                console.log('Forced video play successful');
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                  setVideoReady(true);
                  setCurrentTranscript('Screen preview is now live! You can capture screens for AI analysis or continue with voice questions.');
                }
              })
              .catch(error => {
                console.log('Forced video play failed:', error);
                // Still mark as ready if we have dimensions
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                  setVideoReady(true);
                  setCurrentTranscript('Screen sharing active! Preview may take a moment to load, but capture function works.');
                }
              });
          }
        }, 200);
        
        // Final fallback: If video doesn't start playing within 5 seconds, still mark as ready
        setTimeout(() => {
          if (!videoReady && stream.active) {
            console.log('Fallback: Marking video as ready after timeout');
            setVideoReady(true);
            setCurrentTranscript('Screen sharing is active! Preview may not show, but screen capture and AI analysis are working.');
          }
        }, 5000);
      }

      // Handle stream ending
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          console.log('Screen sharing track ended');
          stopScreenCapture();
          setCurrentTranscript('Screen sharing stopped. Click "Connect" again to restart screen sharing.');
        });
      }

    } catch (error) {
      console.error('Error starting screen capture:', error);
      toast.error('Screen sharing was cancelled or not available. You can still use voice features by clicking "Connect" again.');
      // Don't throw error - let the session continue without screen sharing
    }
  };

  const stopScreenCapture = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);
    setLastScreenshot(null);
    setVideoReady(false);
    
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Clean up event listeners if they exist
      if ((video as any)._cleanup) {
        (video as any)._cleanup();
        delete (video as any)._cleanup;
      }
      
      // Reset video element
      video.srcObject = null;
      video.load(); // Reset video element state
    }
    
    setCurrentTranscript('Screen sharing stopped. Ready for voice questions.');
  };

  const captureScreenshot = async () => {
    if (!screenStream || !videoRef.current || !canvasRef.current) {
      toast.error('No screen sharing active. Please start screen sharing first.');
      return;
    }

    const video = videoRef.current;
    
    // Check if video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('Video not ready yet. Please wait a moment and try again.');
      return;
    }

    setIsCapturing(true);
    setCurrentTranscript('Capturing screen and analyzing...');

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to base64 image
      const screenshot = canvas.toDataURL('image/png');
      setLastScreenshot(screenshot);

      console.log('Screenshot captured:', {
        width: canvas.width,
        height: canvas.height,
        dataLength: screenshot.length
      });

      // Send screenshot to AI for analysis
      await analyzeScreenshot(screenshot);

    } catch (error) {
      console.error('Error capturing screenshot:', error);
      setCurrentTranscript('Error capturing screen. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const analyzeScreenshot = async (screenshot: string) => {
    if (!sessionData) return;

    try {
      // Build prompt for screen analysis
      const screenAnalysisPrompt = buildScreenAnalysisPrompt(sessionData, screenshot);

      const aiRequest = {
        systemPrompt: screenAnalysisPrompt,
        question: "Analyze this coding problem and provide solution guidance",
        model: (selectedModel || sessionData.aiModel) as 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3.5',
        image: screenshot // Include screenshot for vision models
      };

      // Generate AI response for screen analysis
      const aiResponse = await openRouterService.generateResponse(aiRequest);

      // Add screen analysis to conversation
      const analysisResponse: AIResponse = {
        answer: `📸 Screen Analysis: ${aiResponse.answer}`,
        confidence: aiResponse.confidence
      };

      setConversation(prev => [
        ...prev,
        {
          question: "Screen Capture Analysis",
          userAnswer: "Analyzed shared screen content",
          aiResponse: analysisResponse,
          timestamp: new Date(),
          processed: true
        }
      ]);

      setCurrentTranscript('Screen analysis complete. Check the AI response for coding guidance.');

    } catch (error) {
      console.error('Error analyzing screenshot:', error);
      setCurrentTranscript('Error analyzing screen content. Please try again.');
    }
  };

  const buildScreenAnalysisPrompt = (sessionData: SessionData, _screenshot: string): string => {
    return `# CODING INTERVIEW SCREEN ANALYSIS

You are analyzing a screenshot from a coding interview screen share. The candidate is interviewing for "${sessionData.position}" at "${sessionData.company}".

## ANALYSIS TASK
1. **Identify the Problem**: Look for coding problems, algorithm challenges, or technical questions on the screen
2. **Understand Context**: Determine if this is from LeetCode, HackerRank, IDE, whiteboard, or other platform
3. **Provide Guidance**: Give step-by-step approach and solution hints

## YOUR RESPONSE SHOULD INCLUDE:
- **Problem Identification**: What coding problem or question is visible?
- **Solution Approach**: High-level strategy to solve this problem
- **Key Concepts**: Important algorithms, data structures, or patterns needed
- **Implementation Tips**: Specific coding guidance or pseudocode
- **Time/Space Complexity**: Expected complexity analysis
- **Edge Cases**: Important test cases to consider

## GUIDELINES:
- Be concise but comprehensive
- Focus on approach rather than complete solution
- Help the candidate think through the problem systematically
- Consider the interview context and role level
- If no clear problem is visible, describe what you can see and suggest next steps

Analyze the screenshot and provide helpful coding interview guidance.`;
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing your AI interview session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Start Session Buttons */}
      <div className="flex justify-center items-center py-6 gap-4">
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => {
            // Ensure a new full session is created every time
            clearSessionState(); 
            navigate('/dashboard'); // Navigate back to dashboard to start flow for full session
          }}
        >
          Start Session
        </button>
      {/* ReadyToCreateModal for full session */}
      <ReadyToCreateModal
        isOpen={showReadyToCreateModal}
        onClose={() => setShowReadyToCreateModal(false)}
        onBack={() => setShowReadyToCreateModal(false)}
        onNext={() => {
          setShowReadyToCreateModal(false);
          // Place logic to actually start the session here if needed
        }}
        isTrial={false}
      />
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={() => {
            // Ensure a new trial session is created every time
            clearSessionState(); 
            navigate('/interview/trial-session');
          }}
        >
          Start Trial Session
        </button>
      </div>
      {/* Hidden canvas for screenshot capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Screen Capture + Transcript & Controls */}
        <div 
          className="border-r border-gray-200 flex flex-col bg-[#fafbfc]"
          style={{ 
            width: `${Math.max(previewWidth + 50, 700)}px`, 
            minWidth: '700px', 
            maxWidth: '1300px' 
          }}
        >
          
          {/* Screen Capture Section */}
          <div className="border-b border-gray-200 bg-white">
            {/* Screen Capture Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
              <div className="font-semibold text-lg text-gray-800">
                Screen Preview 
                {isScreenSharing && <span className="text-sm font-normal text-green-600 ml-2">● Live</span>}
              </div>
              <div className="flex items-center gap-3">
                {/* Preview Size Controls */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Size:</span>
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-gray-500">W:</label>
                    <input
                      type="range"
                      min="600"
                      max="1200"
                      step="50"
                      value={previewWidth}
                      onChange={(e) => setPreviewWidth(Number(e.target.value))}
                      className="w-16 h-1 bg-gray-200 rounded-lg cursor-pointer"
                      title={`Width: ${previewWidth}px`}
                    />
                    <span className="text-xs text-gray-500 w-8">{previewWidth}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-gray-500">H:</label>
                    <input
                      type="range"
                      min="300"
                      max="800"
                      step="25"
                      value={previewHeight}
                      onChange={(e) => setPreviewHeight(Number(e.target.value))}
                      className="w-16 h-1 bg-gray-200 rounded-lg cursor-pointer"
                      title={`Height: ${previewHeight}px`}
                    />
                    <span className="text-xs text-gray-500 w-8">{previewHeight}</span>
                  </div>
                  <button
                    onClick={() => {
                      setPreviewWidth(800);
                      setPreviewHeight(576);
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border"
                    title="Reset to default size"
                  >
                    Reset
                  </button>
                </div>
                
                {isScreenSharing && (
                  <button
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded border border-blue-200"
                    onClick={() => {
                      if (videoRef.current && screenStream) {
                        console.log('Manual video refresh requested');
                        const video = videoRef.current;
                        video.srcObject = screenStream;
                        video.play()
                          .then(() => {
                            console.log('Manual video refresh successful');
                            setVideoReady(true);
                            setCurrentTranscript('Screen preview refreshed manually!');
                          })
                          .catch(error => {
                            console.error('Manual video refresh failed:', error);
                          });
                      }
                    }}
                    title="Refresh video preview if black screen appears"
                  >
                    🔄 Refresh Preview
                  </button>
                )}
                <div className="text-sm text-gray-500">
                  {isScreenSharing ? 'Screen sharing active' : 'Click "Connect" to start screen sharing'}
                </div>
              </div>
            </div>
            
            {/* Session Context Banner */}
            {sessionData && (
              <div className="px-6 py-2 bg-blue-50 border-b border-blue-100">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Interview Session:</span> {sessionData.position}
                  {sessionData.company && (
                    <span> at {sessionData.company}</span>
                  )}
                </div>
              </div>
            )}
            
            {/* Screen Preview */}
            <div className="p-2">
              {isScreenSharing ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="bg-black rounded-lg border border-gray-300 shadow-sm"
                    style={{ 
                      width: `${previewWidth}px`,
                      height: `${previewHeight}px`,
                      objectFit: 'contain',
                      backgroundColor: '#000'
                    }}
                    muted={true}
                    playsInline={true}
                    autoPlay={true}
                    controls={false}
                  />
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                    🔴 LIVE
                  </div>
                  {lastScreenshot && (
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                      📸 Captured
                    </div>
                  )}
                  {/* Debug info */}
                  <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-xs">
                    {videoReady ? 
                      `${videoRef.current?.videoWidth || 0}x${videoRef.current?.videoHeight || 0}` : 
                      'Loading...'
                    }
                  </div>
                  {/* Capture button overlay */}
                  {videoReady && !isCapturing && (
                    <div className="absolute bottom-3 right-3">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors"
                        onClick={captureScreenshot}
                        title="Capture and analyze screen"
                      >
                        📸 Capture & Analyze
                      </button>
                    </div>
                  )}
                  {/* Analyzing overlay */}
                  {isCapturing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="bg-white px-4 py-2 rounded-lg text-sm font-medium">
                        📸 Analyzing screen...
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                  style={{ 
                    width: `${previewWidth}px`,
                    height: `${previewHeight}px`
                  }}
                >
                  <div className="text-center text-gray-500">
                    <Monitor className="w-28 h-28 mx-auto mb-6 opacity-50" />
                    <p className="text-3xl font-medium mb-3">No screen sharing active</p>
                    <p className="text-xl mt-3">Click "Connect" to start screen sharing</p>
                    <p className="text-sm mt-4 text-gray-400">
                      Adjust size using controls above: {previewWidth}×{previewHeight}px
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transcript Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white" style={{minHeight: 56}}>
            <div className="font-semibold text-lg text-gray-800">Transcript</div>
            <div className="flex items-center gap-2">
              <button
                className={`flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-sm font-medium border border-gray-200 ${isListening ? 'ring-2 ring-green-400' : ''}`}
                onClick={toggleListening}
                title={isListening ? 'Disconnect voice & screen' : 'Connect voice & screen sharing'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />} 
                {isListening ? 'Disconnect' : 'Connect'}
              </button>
              <button
                className="ml-2 px-3 py-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium bg-gray-100 border border-gray-200 rounded"
                onClick={handleClearTranscript}
              >
                ✕ Clear
              </button>
            </div>
          </div>
          {/* Transcript Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-2 text-gray-700 text-base whitespace-pre-line min-h-[32px]">
              {/* Show live transcript from WebSocket if available, else fallback to currentTranscript */}
              {currentTranscript || <span className="text-gray-400">Speak or type to see your transcript here...</span>}
            </div>
          </div>
        </div>

        {/* Right: Chat/AI Panel */}
        <div className="flex-1 flex flex-col bg-white">
          {/* AI Model Dropdown */}
          <div className="flex items-center justify-between px-8 py-2 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-3">
              <label htmlFor="ai-model-select" className="text-sm text-gray-700 font-medium">AI Model:</label>
              <select
                id="ai-model-select"
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                value={selectedModel || sessionData?.aiModel || 'gpt-4'}
                onChange={e => {
                  setSelectedModel(e.target.value);
                  setSessionData(prev => prev ? { ...prev, aiModel: e.target.value } : prev);
                }}
              >
                <option value="gpt-4">GPT-4 (OpenRouter)</option>
                <option value="gpt-4.1">GPT-4.1 (OpenRouter)</option>
                <option value="claude-3.5">Claude 3.5 (OpenRouter)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenRouter)</option>
              </select>
            </div>
            {/* Session Info Display */}
            {sessionData && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{sessionData.position}</span>
                {sessionData.company && (
                  <span> at <span className="font-medium">{sessionData.company}</span></span>
                )}
              </div>
            )}
          </div>
          {/* Top Right: Timer and Exit */}
          <div className="flex items-center justify-end gap-4 px-8 py-3 border-b border-gray-100 bg-white" style={{minHeight: 56}}>
          {isTrial && (
            <div className="flex items-center gap-2 text-red-600 font-semibold text-base">
              <Clock className="w-5 h-5" />
              <span>{Math.floor(timeRemaining/60)} mins <span className="text-xs font-normal text-gray-500">(Trial)</span></span>
            </div>
          )}
          <button
            className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-semibold text-sm"
            onClick={handleEndSession}
          >
            Exit
          </button>
          </div>
          {/* Chat Body */}
          <div className="flex-1 flex flex-col gap-4 px-8 py-6 overflow-y-auto">
          {conversation.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-gray-400 text-base mb-2">No messages yet.</div>
              <div className="text-gray-500 text-sm">Click "AI Answer" to start!</div>
            </div>
          ) : (
            <>
              {/* Session restored indicator */}
              {conversation.length > 0 && (
                <div className="text-center py-2 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-600 font-medium">
                    💾 Session restored with {conversation.length} previous message{conversation.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
          {conversation.map((entry, idx) => (
            entry.aiResponse && (
              <div key={idx} className="flex flex-col gap-2">
                {/* Only show AI response */}
                <div className="self-start max-w-[80%] bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-gray-900 shadow-sm">
                  <div className="text-xs text-blue-700 font-semibold mb-1">AI Candidate</div>
                  <div className="whitespace-pre-line text-base">
                    {Array.isArray(entry.aiResponse.answer)
                      ? (
                        <ul className="list-disc pl-5">
                          {entry.aiResponse.answer.map((point: string, i: number) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      )
                      : (() => {
                          // Split answer into lines, filter empty, and render as points
                          const lines = entry.aiResponse.answer
                            .split(/\r?\n/)
                            .map(line => line.trim())
                            .filter(line => line.length > 0);
                          if (lines.length > 1) {
                            return (
                              <ul className="list-disc pl-5">
                                {lines.map((line, i) => <li key={i}>{line}</li>)}
                              </ul>
                            );
                          } else {
                            return <span>{entry.aiResponse.answer}</span>;
                          }
                        })()
                    }
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{
                    entry.timestamp instanceof Date
                      ? entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : typeof entry.timestamp === 'string' || typeof entry.timestamp === 'number'
                        ? new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''
                  }</div>
                </div>
              </div>
            )
          ))}
          {/* Live AI answer streaming UI */}
          {isStreamingAI && (
            <div className="flex flex-col gap-2">
              <div className="self-start max-w-[80%] bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-gray-900 shadow-sm animate-pulse">
                <div className="text-xs text-blue-700 font-semibold mb-1">AI Candidate</div>
                <div className="whitespace-pre-line text-base">{streamedAIAnswer || <span className="text-gray-400">AI is typing...</span>}</div>
                <div className="text-xs text-gray-400 mt-1">Now</div>
              </div>
            </div>
          )}
            </>
          )}
          </div>
          {/* Chat Footer: Input and Buttons */}
          <div className="px-8 py-4 border-t border-gray-100 bg-white flex items-center gap-3">
            <input
              type="text"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-200"
              placeholder="Type a manual message..."
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleManualProcess(); }}
              disabled={isGenerating}
              autoFocus
            />
            <button
              className="px-8 py-3 bg-[#0a1e2d] hover:bg-[#14304a] text-white rounded-lg font-semibold text-base shadow-sm transition disabled:bg-gray-400"
              onClick={handleManualProcess}
              disabled={isGenerating || !transcript}
            >
              ⚡ AI Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
