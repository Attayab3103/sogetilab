import axios from 'axios';

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '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';

export interface AIRequest {
  question: string;
  context?: string;
  resume?: string;
  jobRole?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  model?: 'gpt-4' | 'claude-3.5' | 'gpt-3.5-turbo';
  systemPrompt?: string; // Add support for custom system prompts
  image?: string; // Add support for image analysis (base64)
}

export interface AIResponse {
  answer: string;
  confidence: number;
  reasoning?: string;
  suggestions?: string[];
}

class OpenRouterService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = API_KEY;
    this.baseURL = OPENROUTER_API_BASE;
    
    if (!this.apiKey) {
      console.warn('OpenRouter API key not found in environment variables');
    }
  }

  /**
   * Generate AI response for interview questions
   */
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const systemPrompt = request.systemPrompt || this.buildSystemPrompt(request);
      const userContent = this.buildUserContent(request);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.getModelName(request.model || 'gpt-4', !!request.image),
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userContent
            }
          ],
          max_tokens: 800, // Increased for screen analysis
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'InterviewAI Assistant'
          }
        }
      );

      const aiAnswer = response.data.choices[0].message.content;
      
      // Process the response to extract structured information
      const processedResponse = this.processResponse(aiAnswer, request);

      return {
        answer: processedResponse.answer,
        confidence: this.calculateConfidence(processedResponse.answer, request),
        suggestions: processedResponse.suggestions,
        reasoning: processedResponse.reasoning
      };
    } catch (error) {
      console.error('OpenRouter API error:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('API Response:', error.response.data);
        
        // Handle specific error codes
        if (error.response.status === 402) {
          throw new Error('OpenRouter API: Insufficient credits or payment required. Please check your OpenRouter account balance.');
        } else if (error.response.status === 401) {
          throw new Error('OpenRouter API: Invalid API key. Please check your API key configuration.');
        } else if (error.response.status === 429) {
          throw new Error('OpenRouter API: Rate limit exceeded. Please try again in a few moments.');
        } else if (error.response.status >= 500) {
          throw new Error('OpenRouter API: Server error. Please try again later.');
        } else {
          throw new Error(`OpenRouter API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
        }
      }
      throw new Error('Failed to connect to OpenRouter API. Please check your internet connection.');
    }
  }

  /**
   * Generate response for coding interview questions
   */
  async generateCodingResponse(question: string, language: string = 'javascript'): Promise<AIResponse> {
    try {
      const prompt = `
Coding Interview Question: ${question}

Please provide:
1. A clear explanation of the approach
2. Complete code solution in ${language}
3. Time and space complexity analysis
4. Alternative approaches if applicable

Format your response to be clear and professional for an interview setting.
`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'openai/gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert software engineer helping with coding interview preparation. Provide clear, concise, and accurate solutions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'InterviewAI Coding Assistant'
          }
        }
      );

      const aiAnswer = response.data.choices[0].message.content;
      
      return {
        answer: aiAnswer,
        confidence: 0.9,
        suggestions: ['Practice similar problems', 'Review data structures', 'Time complexity optimization']
      };
    } catch (error) {
      console.error('OpenRouter coding API error:', error);
      throw new Error('Failed to generate coding response');
    }
  }

  /**
   * Build comprehensive system prompt for interview assistance
   */
  private buildSystemPrompt(request: AIRequest): string {
    const basePrompt = `You are an expert interview coach and AI assistant helping a candidate during a live job interview. Your role is to provide professional, authentic, and contextually relevant responses that showcase the candidate's strengths and experience.

CORE PRINCIPLES:
1. Generate responses that sound natural and conversational
2. Use specific examples from the candidate's background when relevant
3. Maintain a confident but humble tone
4. Structure answers clearly and concisely
5. Focus on demonstrating relevant skills and experience

RESPONSE FORMAT:
Provide a clear, well-structured answer that directly addresses the interview question. The response should be professional yet personable, demonstrating the candidate's qualifications for the role.`;

    if (request.jobRole) {
      return `${basePrompt}\n\nROLE CONTEXT: The candidate is interviewing for a ${request.jobRole} position and should tailor responses to demonstrate relevant skills and experience for this role.`;
    }

    return basePrompt;
  }

  /**
   * Build user content with support for text and images
   */
  private buildUserContent(request: AIRequest): any {
    // If there's an image, use the multimodal format
    if (request.image) {
      return [
        {
          type: 'text',
          text: request.question
        },
        {
          type: 'image_url',
          image_url: {
            url: request.image
          }
        }
      ];
    }

    // Otherwise, build traditional text prompt
    let prompt = `INTERVIEW QUESTION: "${request.question}"\n\n`;
    
    if (request.resume) {
      prompt += `CANDIDATE'S BACKGROUND:\n${request.resume}\n\n`;
    }
    
    if (request.jobRole) {
      prompt += `TARGET ROLE: ${request.jobRole}\n\n`;
    }
    
    if (request.context) {
      prompt += `INTERVIEW CONTEXT: ${request.context}\n\n`;
    }
    
    // If no custom system prompt is provided, add instructions here
    if (!request.systemPrompt) {
      prompt += `INSTRUCTIONS:
Generate a professional interview response that:
1. Directly answers the question asked
2. Uses specific examples from the candidate's background
3. Demonstrates relevant skills and experience
4. Maintains appropriate length (2-4 sentences for behavioral questions)
5. Shows enthusiasm and cultural fit
6. Sounds natural and conversational

Please provide only the response text without any meta-commentary or labels.`;
    }
    
    return prompt;
  }

  /**
   * Process AI response to extract structured information
   */
  private processResponse(aiAnswer: string, request: AIRequest): {
    answer: string;
    suggestions: string[];
    reasoning: string;
  } {
    const suggestions = this.generateContextualSuggestions(request.question);
    
    return {
      answer: aiAnswer.trim(),
      suggestions,
      reasoning: `Response generated based on ${request.jobRole || 'general'} interview context with ${request.resume ? 'personalized' : 'generic'} background information.`
    };
  }

  /**
   * Generate contextual suggestions based on question type and content
   */
  private generateContextualSuggestions(question: string): string[] {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('tell me about yourself')) {
      return [
        'Use the Present-Past-Future framework',
        'Keep response to 2-3 minutes',
        'Connect your background to the role',
        'End with enthusiasm for the position'
      ];
    }
    
    if (questionLower.includes('weakness') || questionLower.includes('areas for improvement')) {
      return [
        'Choose a real but not critical weakness',
        'Explain steps you\'re taking to improve',
        'Show self-awareness and growth mindset',
        'Don\'t use cliché weaknesses like "perfectionist"'
      ];
    }
    
    if (questionLower.includes('experience') || questionLower.includes('example') || questionLower.includes('time when')) {
      return [
        'Use the STAR method (Situation, Task, Action, Result)',
        'Quantify your impact with specific numbers',
        'Choose examples relevant to the role',
        'Focus on your specific contributions'
      ];
    }
    
    if (questionLower.includes('why') && (questionLower.includes('company') || questionLower.includes('role'))) {
      return [
        'Research the company\'s mission and values',
        'Connect your goals to their objectives',
        'Mention specific company achievements or projects',
        'Show genuine enthusiasm and interest'
      ];
    }
    
    if (questionLower.includes('challenge') || questionLower.includes('difficult') || questionLower.includes('problem')) {
      return [
        'Focus on your problem-solving approach',
        'Highlight lessons learned from the experience',
        'Show how you handled pressure or uncertainty',
        'Demonstrate resilience and adaptability'
      ];
    }
    
    if (questionLower.includes('goals') || questionLower.includes('future') || questionLower.includes('see yourself')) {
      return [
        'Align your goals with the company\'s growth',
        'Show ambition but also commitment',
        'Mention skills you want to develop',
        'Connect to the role\'s career progression'
      ];
    }
    
    // Technical questions
    if (questionLower.includes('technical') || questionLower.includes('code') || questionLower.includes('algorithm')) {
      return [
        'Explain your thought process clearly',
        'Discuss trade-offs and alternatives',
        'Mention relevant technologies or frameworks',
        'Ask clarifying questions if needed'
      ];
    }
    
    // Default suggestions
    return [
      'Be specific with examples and details',
      'Show enthusiasm and genuine interest',
      'Connect your answer to the role requirements',
      'Use confident but humble language'
    ];
  }

  /**
   * Map our model names to OpenRouter model names
   */
  private getModelName(model: string, hasImage: boolean = false): string {
    // Use vision models when image is present
    if (hasImage) {
      const visionModelMap: Record<string, string> = {
        'gpt-4': 'openai/gpt-4-vision-preview',
        'claude-3.5': 'anthropic/claude-3.5-sonnet', // Claude has vision support
        'gpt-3.5-turbo': 'openai/gpt-4-vision-preview' // Fallback to GPT-4 Vision
      };
      return visionModelMap[model] || visionModelMap['gpt-4'];
    }

    // Regular text models
    const modelMap: Record<string, string> = {
      'gpt-4': 'openai/gpt-4-turbo-preview',
      'claude-3.5': 'anthropic/claude-3.5-sonnet',
      'gpt-3.5-turbo': 'openai/gpt-3.5-turbo'
    };
    
    return modelMap[model] || modelMap['gpt-4'];
  }

  /**
   * Calculate confidence score based on response quality and context
   */
  private calculateConfidence(answer: string, request?: AIRequest): number {
    // Enhanced heuristic based on answer quality, length, and context
    const length = answer.length;
    const hasExamples = /example|experience|when I|in my role|at \w+|worked on/i.test(answer);
    const hasStructure = answer.includes('.') && answer.split('.').length > 2;
    const hasQuantification = /\d+(%|percent|times|years|months|people|team)/i.test(answer);
    const hasActionWords = /led|managed|developed|created|improved|increased|reduced|implemented/i.test(answer);
    
    let confidence = 0.7; // Base confidence
    
    // Length-based scoring
    if (length > 100) confidence += 0.05;
    if (length > 200) confidence += 0.05;
    if (length > 300) confidence += 0.05;
    
    // Content quality scoring
    if (hasExamples) confidence += 0.08;
    if (hasStructure) confidence += 0.05;
    if (hasQuantification) confidence += 0.07;
    if (hasActionWords) confidence += 0.06;
    
    // Context-based adjustments
    if (request?.resume && hasExamples) confidence += 0.05;
    if (request?.jobRole && answer.toLowerCase().includes(request.jobRole.toLowerCase())) confidence += 0.03;
    
    return Math.min(confidence, 0.95);
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }
}

export const openRouterService = new OpenRouterService();
