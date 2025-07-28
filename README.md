# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# InterviewAI - AI-Powered Interview Assistant

A comprehensive AI interview assistant that provides real-time speech recognition, AI-powered answer generation, and intelligent feedback during job interviews.

## ✨ Latest Updates

### 🤖 Enhanced AI Integration (Latest)
- **OpenRouter API Integration**: Full support for multiple AI models (GPT-4, Claude-3.5, Gemini)
- **Context-Aware Responses**: AI generates personalized answers based on resume and job context
- **Real-Time Processing**: Instant AI response generation during live interviews
- **Enhanced Prompting**: Sophisticated prompt engineering for high-quality responses
- **Confidence Scoring**: Advanced metrics for response quality assessment

### 🎤 Advanced Speech Recognition
- **Browser Speech API**: Real-time speech-to-text conversion with high accuracy
- **Silence Detection**: Automatic processing after natural speech pauses
- **Manual Override**: Option to manually process answers and responses
- **Multi-language Support**: Configurable language detection and processing
- **Error Recovery**: Graceful fallbacks when speech recognition fails

### 📝 Complete Trial Session Experience
- **8-Step Modal Workflow**: Progressive data collection for personalized experience
- **Context Integration**: Company, role, resume, and preference awareness
- **Professional UI**: Split-panel design mimicking industry-standard interview tools
- **Session Management**: Timer, controls, and session state management
- **Performance Analytics**: Key points extraction and improvement suggestions

## 🎯 Features

### Core Functionality
- **Real-Time Speech Recognition**: Blazing fast transcription with high accuracy
- **AI-Powered Answers**: Choose between multiple AI models for accurate responses
- **Multi-Platform Support**: Works with Zoom, Google Meet, Microsoft Teams, Webex, and more
- **Coding Interview Support**: Full assistance for HackerRank, LeetCode, and coding platforms

### Advanced Features
- **Resume Integration**: Upload resume for personalized responses
- **Multi-Language Support**: 52+ languages supported
- **Undetectable Operation**: Advanced privacy features
- **Post-Interview Analytics**: Detailed performance insights and recommendations
- **Credit-Based System**: Flexible pricing with no subscriptions

### Platform Compatibility
- 📹 Zoom
- 📱 Google Meet  
- 💼 Microsoft Teams
- 🌐 Webex
- 📞 Phone Interviews
- 💻 HackerRank
- 🧮 LeetCode

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with speech recognition support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/interviewai.git
cd interviewai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + Zustand
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Speech Recognition**: Web Speech API
- **AI Integration**: OpenAI API, Anthropic Claude API

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Main application pages
├── contexts/          # React contexts (Auth, Settings)
├── hooks/             # Custom React hooks
├── services/          # API services and integrations
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── App.tsx           # Main application component
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_CLAUDE_API_KEY=your_claude_api_key
VITE_FIREBASE_CONFIG=your_firebase_config
```

### Speech Recognition Setup
The application uses the Web Speech API for real-time speech recognition. Ensure you're using a supported browser:
- Chrome 25+
- Firefox 44+
- Safari 14.1+
- Edge 79+

## 🎮 Usage

1. **Sign Up**: Create an account and get free credits
2. **Upload Resume**: Upload your resume for personalized responses
3. **Start Session**: Choose your interview platform and start recording
4. **Get Real-Time Help**: Receive AI-generated answers in real-time
5. **Review Analytics**: Get detailed insights after your interview

## 💰 Pricing

- **Basic**: $29.50 - 3 Interview Credits
- **Plus**: $59.00 - 6 + 2 Free Credits  
- **Advanced**: $88.50 - 9 + 6 Free Credits

- One-time payment (no subscription)
- 30-day money-back guarantee
- Credits never expire
- 1 Credit = 1 hour interview

## 🔒 Privacy & Security

- **Undetectable**: Advanced privacy features ensure interviewers cannot detect usage
- **Secure**: All data encrypted in transit and at rest
- **Private**: No data sharing with third parties
- **Local Processing**: Speech recognition happens locally when possible

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@interviewai.com or join our Discord community.

## 🌟 Acknowledgments

- Inspired by the need for accessible interview preparation tools
- Built with modern web technologies and best practices
- Thanks to the open-source community for amazing tools and libraries

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
