# InterviewAI - Parakeet AI-Like Functionality

## Overview

This enhanced InterviewAI application now provides comprehensive Parakeet AI-like functionality with real-time speech recognition, context-aware AI responses, and seamless interview assistance. The system follows an 8-step modal workflow that collects user preferences and context before launching into a fully-featured trial interview session.

## 🚀 Key Features (Parakeet AI Compatible)

### Real-Time Speech Recognition
- **Browser-based Speech API**: Uses Web Speech Recognition API for real-time transcription
- **Continuous Listening**: Maintains active listening throughout the interview
- **Silence Detection**: Automatically processes answers after 2.5 seconds of silence
- **Manual Override**: Users can manually trigger AI processing
- **Error Handling**: Graceful fallback to manual input if speech recognition fails

### Context-Aware AI Responses
- **Resume Integration**: AI responses are personalized based on uploaded resume data
- **Role-Specific Answers**: Tailored responses based on job position and company
- **Conversation Memory**: Maintains context throughout the interview session
- **Multi-Model Support**: GPT-4, Claude-3.5, GPT-3.5 Turbo via OpenRouter API
- **Confidence Scoring**: Each AI response includes confidence metrics

### 8-Step Modal Workflow

#### Step 1: Trial Session Setup (TrialSessionModal)
- Company name input
- Job description/position input
- Validates and prepares basic session context

#### Step 2: Language & Instructions (LanguageInstructionsModal)
- Language selection (52+ languages supported)
- Simple English toggle
- Custom instructions input
- AI model selection

#### Step 3: Resume Selection (ResumeSelectionModal)
- Choose from uploaded resumes
- Resume context integration
- Default resume selection

#### Step 4: Transcript Summary (TranscriptSummaryModal)
- Transcript saving preferences
- Summary generation options
- Privacy settings

#### Step 5: Ready to Create (ReadyToCreateModal)
- Final confirmation screen
- Session summary review
- Preparation checklist

#### Step 6: Platform Selection (PlatformSelectionModal)
- Browser vs Desktop app choice
- Platform-specific optimizations
- Integration preferences

#### Step 7: Connect Settings (ConnectModal)
- Final AI model confirmation
- Language settings review
- Connection establishment

#### Step 8: Trial Interview Session
- **Live interview simulation**
- **Real-time AI assistance**
- **Context-aware responses**

## 🎯 Trial Interview Session Features

### Core Interface
```
┌─────────────────────┬─────────────────────┐
│   Transcript Panel  │   AI Response Panel │
│                     │                     │
│ • Live transcription│ • AI-generated      │
│ • Speech controls   │   answers           │
│ • Manual input      │ • Key points        │
│ • Session timer     │ • Suggestions       │
│ • Question display  │ • Confidence scores │
└─────────────────────┴─────────────────────┘
```

### Context Integration
- **Company Information**: Responses tailored to specific company
- **Job Role**: Answers aligned with position requirements  
- **Resume Data**: Personalized examples from user's background
- **Language Preferences**: Simplified English or professional tone
- **Custom Instructions**: User-provided guidance for responses

### AI Response Generation
```typescript
// Example context building
const aiRequest = {
  question: "Tell me about your experience with React",
  context: "Interview for Senior Software Engineer at Microsoft",
  resume: buildResumeContext(sessionData.resumeData),
  jobRole: "Senior Software Engineer",
  model: "gpt-4"
};

const aiResponse = await openRouterService.generateResponse(aiRequest);
```

### Smart Features

#### Automatic Processing
- Listens continuously during interview
- Processes user speech after natural pauses
- Generates contextual AI responses
- Extracts key points and suggestions

#### Resume Context Building
```typescript
// Resume context integration
const buildResumeContext = (resumeData) => {
  let context = `Name: ${resumeData.personalDetails.name}\n`;
  
  if (resumeData.experience) {
    context += '\nExperience:\n';
    resumeData.experience.forEach(exp => {
      context += `- ${exp.title} at ${exp.company} (${exp.duration}): ${exp.description}\n`;
    });
  }
  
  if (resumeData.skills) {
    context += `\nSkills: ${resumeData.skills.join(', ')}\n`;
  }
  
  return context;
};
```

#### Confidence Scoring
- Length-based quality assessment
- Content analysis (examples, quantification, action words)
- Context relevance scoring
- Resume alignment checking

## 🔧 Technical Implementation

### Data Flow
1. **8-Step Modal Collection**: Gather user preferences and context
2. **URL Parameter Passing**: Transfer data to trial session via URL
3. **Session Initialization**: Load context and prepare AI services
4. **Speech Recognition Setup**: Initialize browser speech API
5. **Real-Time Processing**: Continuous speech-to-text conversion
6. **AI Response Generation**: Context-aware answer creation
7. **Response Display**: Formatted output with suggestions

### OpenRouter Integration
```typescript
// Enhanced OpenRouter service configuration
const response = await axios.post(`${this.baseURL}/chat/completions`, {
  model: this.getModelName(request.model || 'gpt-4'),
  messages: [
    {
      role: 'system',
      content: this.buildSystemPrompt(request)
    },
    {
      role: 'user', 
      content: this.buildUserPrompt(request)
    }
  ],
  max_tokens: 600,
  temperature: 0.7,
  top_p: 0.9,
  frequency_penalty: 0.1,
  presence_penalty: 0.1
}, {
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
    'X-Title': 'InterviewAI Assistant'
  }
});
```

### Speech Recognition Setup
```typescript
// Browser speech recognition initialization
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = sessionData?.language || 'en-US';

recognition.onresult = (event) => {
  // Process speech results
  // Auto-trigger AI response after silence
};
```

## 🎨 UI/UX Features

### Screen Sharing Simulation
- Red notification bar indicating active screen sharing
- Professional interview environment simulation
- Undetectable overlay interface

### Responsive Design
- Two-panel layout (transcript | AI responses)
- Mobile-friendly interface
- Dark/light mode support
- Accessibility compliance

### Real-Time Feedback
- Live transcription display
- Processing status indicators
- Confidence score visualization
- Error handling and recovery

## 🔒 Privacy & Security

### Data Handling
- No permanent storage of conversation data
- Encrypted API communications
- Local speech processing when possible
- User-controlled data retention

### API Security
- Secure OpenRouter API integration
- Environment variable protection
- Request rate limiting
- Error boundary implementations

## 📱 Browser Compatibility

### Supported Browsers
- ✅ Chrome (recommended)
- ✅ Microsoft Edge  
- ✅ Safari (limited speech features)
- ⚠️ Firefox (manual input only)

### Required Permissions
- Microphone access for speech recognition
- Local storage for session data
- Network access for API calls

## 🚀 Usage Instructions

### Starting a Trial Session
1. Navigate to Interview Sessions page
2. Click "Start Trial Session"
3. Complete 8-step modal workflow:
   - Enter company and position details
   - Select language and AI preferences  
   - Choose resume for personalization
   - Configure transcript settings
   - Confirm session setup
   - Select platform (browser/desktop)
   - Review final settings
4. Begin trial interview with AI assistance

### During the Interview
1. **Listen**: AI continuously transcribes speech
2. **Answer**: Speak naturally to interview questions
3. **Process**: AI generates contextual responses automatically
4. **Review**: Check suggested answers and key points
5. **Adapt**: Use AI guidance to improve responses

### Best Practices
- Ensure quiet environment for speech recognition
- Speak clearly and at moderate pace
- Use specific examples from your background
- Review AI suggestions before responding
- Practice with different question types

## 🔧 Development Setup

### Environment Variables Required
```env
VITE_OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
VITE_API_URL=http://localhost:5000/api
VITE_DEV_MODE=true
```

### Key Dependencies
```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x", 
  "axios": "^1.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^3.x"
}
```

### API Integration
- OpenRouter API for AI model access
- Web Speech API for voice recognition
- Custom backend for session management
- Resume parsing and analysis services

This implementation provides a complete Parakeet AI-like experience with professional interview assistance, real-time speech processing, and context-aware AI responses that help candidates perform better in job interviews.
