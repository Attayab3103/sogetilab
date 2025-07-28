import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { 
  CheckCircle, 
  Star,
  Play,
  ArrowRight,
  MessageSquare,
  Wand2,
  Monitor,
  FileText,
  Globe,
  BarChart3,
  Eye
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  // Platform logos
  const platforms = [
    { name: 'Zoom', icon: '📹' },
    { name: 'Google Meet', icon: '🟢' },
    { name: 'Microsoft Teams', icon: '🟦' },
    { name: 'HackerRank', icon: '💻' },
    { name: 'LeetCode', icon: '🔧' },
    { name: 'Amazon Chime', icon: '📞' },
    { name: 'Webex', icon: '🌐' },
    { name: 'Phone', icon: '📱' }
  ];

  // Company logos
  const companies = [
    { name: 'Google', logo: 'G' },
    { name: 'Microsoft', logo: 'M' },
    { name: 'Amazon', logo: 'A' },
    { name: 'Meta', logo: 'f' },
    { name: 'Tesla', logo: 'T' }
  ];

  const features = [
    {
      icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
      title: "SPEECH RECOGNITION 💬",
      subtitle: "Blazing Fast Transcription",
      description: "We use a state-of-the-art transcription model that provides a highly accurate transcription in record breaking speed.",
      graphic: "🎙️"
    },
    {
      icon: <Wand2 className="h-8 w-8 text-purple-600" />,
      title: "AI ANSWERS 🪄",
      subtitle: "100% Accurate Responses", 
      description: "You choose between GPT-4.1 and Claude 4.0 Sonnet, the best LLM models available, to provide the most accurate and helpful answers.",
      graphic: "🤖"
    },
    {
      icon: <Monitor className="h-8 w-8 text-green-600" />,
      title: "PROGRAMMING 💻",
      subtitle: "Full Coding Interview Support",
      description: "You can use SOGETI LAB for coding interviews. It can both listen for coding questions and capture the screen if a LeetCode-style question is being screen shared with you.",
      graphic: "⌨️"
    },
    {
      icon: <FileText className="h-8 w-8 text-orange-600" />,
      title: "RESUME 📝",
      subtitle: "Upload your Resume",
      description: "Upload once and get instant interview answers perfectly matched to your experience and background.",
      graphic: "📄"
    },
    {
      icon: <Globe className="h-8 w-8 text-cyan-600" />,
      title: "MULTILINGUAL 🌍",
      subtitle: "52 Languages",
      description: "Real-time interview responses in any language - communicate fluently and naturally, wherever you interview.",
      graphic: "🗣️"
    },
    {
      icon: <Eye className="h-8 w-8 text-indigo-600" />,
      title: "PRIVATE 🥷",
      subtitle: "Undetectable",
      description: "Good security ensures your AI assistance stays completely private - no interviewer will ever know you used SOGETI LAB.",
      graphic: "🛡️"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-red-600" />,
      title: "SUMMARY 🪄",
      subtitle: "AI Summary & Analysis",
      description: "After each interview, get detailed insights on your performance and AI-powered recommendations for improvement.",
      graphic: "📊"
    }
  ];

  const testimonials = [
    {
      name: "Rosie D.",
      email: "rosied...@gmail.com",
      content: "If I'm honest, there were absolutely zero faults. It is really a game changer. I've already recommended it to all my friends and family. Thank you for creating such an amazing app!",
      date: "Jan 17, 2025",
      rating: 5,
      avatar: "RD"
    },
    {
      name: "Kumar S.",
      email: "kumar.s...@gmail.com", 
      content: "I had no issues during the interview. The app was straightforward and easy to use. It is well-designed, and there is no need to make any changes to it.",
      date: "Apr 29, 2025",
      rating: 5,
      avatar: "KS"
    },
    {
      name: "Mark",
      company: "Microsoft",
      role: "Manager",
      content: "I used SOGETI LAB to help me prepare for my interview. It's a great tool for interview prep.",
      avatar: "M"
    },
    {
      name: "Sarah",
      company: "WrumerSound", 
      role: "Support",
      content: "I've always wanted to work at WrumerSound. I finally nailed it with SOGETI LAB.",
      avatar: "S"
    },
    {
      name: "Anna",
      company: "Google",
      role: "Product Manager", 
      content: "I had no experience with CS, but I still crushed the interviews using SOGETI LAB.",
      avatar: "A"
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: 29.50,
      credits: 3,
      subtitle: "3 Interview Credits",
      popular: false,
      features: [
        "3 Interview Credits",
        "Real-time AI responses",
        "Speech recognition",
        "All platforms supported",
        "Resume integration"
      ]
    },
    {
      name: "Plus", 
      price: 59.00,
      credits: 6,
      freeCredits: 2,
      subtitle: "6 Interview Credits + 2 Free",
      popular: true,
      features: [
        "6 Interview Credits + 2 Free",
        "Real-time AI responses", 
        "Advanced speech recognition",
        "All platforms supported",
        "Resume integration",
        "Priority support"
      ]
    },
    {
      name: "Advanced",
      price: 88.50, 
      credits: 9,
      freeCredits: 6,
      subtitle: "9 Interview Credits + 6 Free",
      popular: false,
      features: [
        "9 Interview Credits + 6 Free",
        "Premium AI models",
        "Advanced speech recognition", 
        "All platforms supported",
        "Resume integration",
        "Priority support",
        "Analytics dashboard"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Special Offer Banner */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-center py-2 text-sm">
        Special offer for 🇵🇰 Pakistan users: Use code <strong>PAKISTAN25</strong> for 25% off!
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block text-gray-900">Your</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Real-Time ✨
              </span>
              <span className="block text-gray-900">AI Interview Assistant</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              Automatically get an answer to every job interview question with ChatGPT AI software. 
              An AI Interview copilot.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link 
                to={user ? "/dashboard" : "/signup"} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transform transition-all duration-200 hover:scale-105 inline-flex items-center"
              >
                TRY FOR FREE
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              
              <div className="text-sm text-gray-600 flex flex-col items-center">
                <span className="font-semibold">One-time payment</span>
                <span>No subscription</span>
              </div>
            </div>
            
            {/* User Count and Rating */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">34,135+</div>
                <div className="text-gray-600">people</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-2xl font-bold">4.7</span>
                <span className="text-gray-600">/234</span>
              </div>
            </div>
            
            {/* Video Link */}
            <div className="mb-12">
              <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold">
                <Play className="mr-2 h-5 w-5" />
                View video for desktop
              </button>
            </div>
            
            {/* Usage Stats */}
            <p className="text-lg text-gray-600 mb-8">
              Used for <strong>10,000+</strong> Job Interviews
            </p>
            
            {/* Company Logos */}
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {companies.map((company, index) => (
                <div key={index} className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-600">
                  {company.logo}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-1/3 w-16 h-16 bg-indigo-200/30 rounded-full blur-xl"></div>
      </section>

      {/* Platform Support Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Land your next job effortlessly 🤙
          </h2>
          <h3 className="text-2xl font-semibold text-gray-700 mb-8">
            Works with any interview platform
          </h3>
          <p className="text-lg text-gray-600 mb-12 max-w-4xl mx-auto">
            You can use SOGETI LAB with any video or coding platform including Zoom, Google Meet, 
            Microsoft Teams, HackerRank, and LeetCode.
          </p>
          
          <div className="mb-8">
            <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold">
              <Play className="mr-2 h-5 w-5" />
              Video tutorial: How to connect
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {platforms.map((platform, index) => (
              <div key={index} className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="text-4xl mb-2">{platform.icon}</div>
                <span className="text-sm text-gray-600 text-center">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {features.map((feature, index) => (
              <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    {feature.icon}
                    <h3 className="text-sm font-bold text-gray-500 tracking-wider">{feature.title}</h3>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">{feature.subtitle}</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
                <div className="flex-1 flex justify-center items-center">
                  <div className="w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                    <div className="text-8xl">{feature.graphic}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              People love SOGETI LAB 💬
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl border hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      {testimonial.email && (
                        <span className="text-sm text-gray-500">{testimonial.email}</span>
                      )}
                    </div>
                    {testimonial.company && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">{testimonial.company}</span>
                        <span>- {testimonial.role}</span>
                      </div>
                    )}
                    {testimonial.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                {testimonial.date && (
                  <p className="text-sm text-gray-500 mt-2">{testimonial.date}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screen Sharing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <Eye className="h-8 w-8 text-purple-600" />
                <h3 className="text-sm font-bold text-gray-500 tracking-wider">STAY UNDETECTED 🥷</h3>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">How to Share Your Screen</h2>
              <p className="text-lg text-gray-600 mb-8">
                A short video explaining what to do if the interviewer asks you to share your screen.
              </p>
              <div className="flex gap-4">
                <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold">
                  <Play className="mr-2 h-5 w-5" />
                  Video: Desktop
                </button>
                <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold">
                  <Play className="mr-2 h-5 w-5" />
                  Video: Web
                </button>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                <div className="text-8xl">🖥️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">PRICING</h2>
            <div className="flex flex-wrap justify-center gap-8 mb-8 text-lg">
              <span className="flex items-center text-green-600 font-semibold">
                <CheckCircle className="mr-2 h-5 w-5" />
                No Subscription
              </span>
              <span className="flex items-center text-blue-600 font-semibold">
                <CheckCircle className="mr-2 h-5 w-5" />
                One-time payment
              </span>
              <span className="flex items-center text-purple-600 font-semibold">
                <CheckCircle className="mr-2 h-5 w-5" />
                30-Day Money Back
              </span>
              <span className="flex items-center text-orange-600 font-semibold">
                <CheckCircle className="mr-2 h-5 w-5" />
                Credits Never Expire
              </span>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-semibold underline mb-8">
              1 Credit = 1h Interview
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white border-2 rounded-2xl p-8 text-center relative ${
                plan.popular ? 'border-blue-500 shadow-2xl transform scale-105' : 'border-gray-200 shadow-lg'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                </div>
                <p className="text-lg text-gray-600 mb-8">{plan.subtitle}</p>
                
                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  Get Credits
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              You can split credits into 30-minute sessions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
                  P
                </div>
                <span className="text-xl font-bold">SOGETI LAB</span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <span>Contact us</span>
              <a href="mailto:support@jyothis-ai.com" className="hover:text-blue-400">
                support@jyothis-ai.com
              </a>
              <Link to="/terms" className="hover:text-blue-400">Terms & Conditions</Link>
              <Link to="/privacy" className="hover:text-blue-400">Privacy Policy</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>Besistem d.o.o. (SOGETI LAB), All Rights Reserved.</p>
            <p className="mt-2">
              Checkout our other project: <a href="https://www.clozerai.com/" className="text-blue-400 hover:text-blue-300">ClozerAI</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
