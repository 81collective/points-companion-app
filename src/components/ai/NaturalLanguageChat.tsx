'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle,
  Bot,
  User,
  Send,
  RotateCcw,
  Sparkles,
  Clock,
  MapPin,
  CreditCard,
  DollarSign,
  TrendingUp,
  Target,
  Mic,
  MicOff,
  Volume2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Star,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: {
    location?: string;
    merchantType?: string;
    amount?: number;
    previousCard?: string;
  };
  recommendations?: CardRecommendation[];
  thinking?: boolean;
  error?: boolean;
}

interface CardRecommendation {
  cardName: string;
  issuer: string;
  reason: string;
  rewardsRate: string;
  confidence: number;
  annualFee: number;
  welcomeBonus?: string;
  benefits: string[];
}

interface QuickAction {
  id: string;
  label: string;
  query: string;
  icon: React.ReactNode;
  category: string;
}

const NaturalLanguageChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const { user } = useAuth();

  // Speech recognition states (disabled for TypeScript compliance)
  const [speechRecognition] = useState<null>(null);
  const [speechSupported] = useState(false);

  useEffect(() => {
    initializeChat();
    getCurrentLocation();
  }, []);

  const initializeChat = () => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('ai_chat_messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.slice(0, 50)); // Limit to last 50 messages
      } catch {
        // Ignore parsing errors
      }
    }

    // Add welcome message if no history
    if (!savedMessages) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'assistant',
        content: "👋 Hi! I'm your AI card advisor. I can help you choose the best credit card for any situation. Try asking me things like:\n\n• \"What card should I use for dinner tonight?\"\n• \"Best card for grocery shopping?\"\n• \"I'm planning a trip to Europe, which card is best?\"\n• \"Show me cards with no annual fee\"\n\nWhat would you like to know?",
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  };

  const setupSpeechRecognition = () => {
    // Speech recognition disabled for TypeScript compatibility
  };

  const getCurrentLocation = () => {
    // Mock location - in real app this would use geolocation API
    setCurrentLocation('Seattle, WA');
  };

  const processNaturalLanguageQuery = async (query: string): Promise<ChatMessage> => {
    // Mock AI processing - in real app this would call OpenAI API
    const processingDelay = 1500 + Math.random() * 1000; // 1.5-2.5 seconds
    await new Promise(resolve => setTimeout(resolve, processingDelay));

    const lowerQuery = query.toLowerCase();
    let response = '';
    let recommendations: CardRecommendation[] = [];

    // Dining queries
    if (lowerQuery.includes('dining') || lowerQuery.includes('restaurant') || lowerQuery.includes('dinner') || lowerQuery.includes('lunch')) {
      response = "For dining, I'd recommend these cards based on their restaurant rewards:";
      recommendations = [
        {
          cardName: 'Chase Sapphire Preferred',
          issuer: 'Chase',
          reason: 'Excellent for dining with 3x points on restaurants worldwide',
          rewardsRate: '3x points',
          confidence: 94,
          annualFee: 95,
          welcomeBonus: '80,000 points after $4,000 spend',
          benefits: ['No foreign transaction fees', 'Transfer partners', 'Travel insurance']
        },
        {
          cardName: 'American Express Gold',
          issuer: 'Amex',
          reason: 'Outstanding dining rewards with additional Uber credits',
          rewardsRate: '4x points',
          confidence: 91,
          annualFee: 250,
          welcomeBonus: '90,000 points after $4,000 spend',
          benefits: ['$120 Uber Cash', '$120 dining credit', 'No preset spending limit']
        }
      ];
    }
    // Travel queries
    else if (lowerQuery.includes('travel') || lowerQuery.includes('flight') || lowerQuery.includes('hotel') || lowerQuery.includes('trip')) {
      response = "For travel, these premium cards offer excellent rewards and benefits:";
      recommendations = [
        {
          cardName: 'Chase Sapphire Reserve',
          issuer: 'Chase',
          reason: 'Premium travel card with comprehensive benefits and protections',
          rewardsRate: '3x points on travel and dining',
          confidence: 96,
          annualFee: 550,
          welcomeBonus: '70,000 points after $4,000 spend',
          benefits: ['$300 travel credit', 'Priority Pass lounge access', 'Global Entry credit']
        },
        {
          cardName: 'American Express Platinum',
          issuer: 'Amex',
          reason: 'Luxury travel card with exceptional airport and hotel benefits',
          rewardsRate: '5x points on flights',
          confidence: 93,
          annualFee: 695,
          welcomeBonus: '100,000 points after $6,000 spend',
          benefits: ['Centurion Lounge access', 'Hotel elite status', 'Uber credits']
        }
      ];
    }
    // Grocery queries
    else if (lowerQuery.includes('grocery') || lowerQuery.includes('supermarket') || lowerQuery.includes('food shopping')) {
      response = "For grocery shopping, these cards maximize your rewards at supermarkets:";
      recommendations = [
        {
          cardName: 'American Express Gold',
          issuer: 'Amex',
          reason: 'Industry-leading grocery rewards at U.S. supermarkets',
          rewardsRate: '4x points (up to $25k annually)',
          confidence: 89,
          annualFee: 250,
          welcomeBonus: '90,000 points after $4,000 spend',
          benefits: ['Uber Eats credits', 'Dining rewards', 'Membership Rewards points']
        },
        {
          cardName: 'Chase Freedom Flex',
          issuer: 'Chase',
          reason: 'No annual fee with rotating bonus categories including groceries',
          rewardsRate: '5x points (quarterly categories)',
          confidence: 85,
          annualFee: 0,
          welcomeBonus: '$200 after $500 spend',
          benefits: ['No annual fee', 'Flexible redemption', 'Purchase protection']
        }
      ];
    }
    // Gas queries
    else if (lowerQuery.includes('gas') || lowerQuery.includes('fuel') || lowerQuery.includes('gas station')) {
      response = "For gas purchases, consider these cards with strong fuel rewards:";
      recommendations = [
        {
          cardName: 'Chase Freedom Flex',
          issuer: 'Chase',
          reason: 'Currently offering 5x points on gas stations (Q4 2024)',
          rewardsRate: '5x points (limited time)',
          confidence: 96,
          annualFee: 0,
          welcomeBonus: '$200 after $500 spend',
          benefits: ['Quarterly bonus categories', 'No annual fee', 'Mobile payments bonus']
        }
      ];
    }
    // No annual fee queries
    else if (lowerQuery.includes('no annual fee') || lowerQuery.includes('free') || lowerQuery.includes('no fee')) {
      response = "Here are excellent cards with no annual fees:";
      recommendations = [
        {
          cardName: 'Chase Freedom Unlimited',
          issuer: 'Chase',
          reason: 'Solid all-around rewards with no annual fee',
          rewardsRate: '1.5x points on everything',
          confidence: 88,
          annualFee: 0,
          welcomeBonus: '$200 after $500 spend',
          benefits: ['No annual fee', 'No rotating categories', 'Transfer to partners']
        },
        {
          cardName: 'Capital One Quicksilver',
          issuer: 'Capital One',
          reason: 'Simple cashback with no annual fee',
          rewardsRate: '1.5% cashback',
          confidence: 85,
          annualFee: 0,
          welcomeBonus: '$200 after $500 spend',
          benefits: ['No annual fee', 'No foreign transaction fees', 'Simple cashback']
        }
      ];
    }
    // Welcome bonus queries
    else if (lowerQuery.includes('welcome bonus') || lowerQuery.includes('sign up bonus') || lowerQuery.includes('bonus')) {
      response = "These cards currently have excellent welcome bonuses:";
      recommendations = [
        {
          cardName: 'American Express Platinum',
          issuer: 'Amex',
          reason: 'Highest current welcome bonus with premium benefits',
          rewardsRate: '5x points on flights',
          confidence: 91,
          annualFee: 695,
          welcomeBonus: '100,000 points after $6,000 spend',
          benefits: ['Premium travel benefits', 'Lounge access', 'Hotel elite status']
        },
        {
          cardName: 'Chase Sapphire Preferred',
          issuer: 'Chase',
          reason: 'Excellent value welcome bonus with versatile rewards',
          rewardsRate: '3x points on dining and travel',
          confidence: 93,
          annualFee: 95,
          welcomeBonus: '80,000 points after $4,000 spend',
          benefits: ['Transfer partners', 'Purchase protection', 'Travel insurance']
        }
      ];
    }
    // General/fallback response
    else {
      response = "Based on your query, here are some versatile card recommendations:";
      recommendations = [
        {
          cardName: 'Chase Sapphire Preferred',
          issuer: 'Chase',
          reason: 'Excellent all-around card for dining, travel, and everyday spending',
          rewardsRate: '3x points on dining and travel',
          confidence: 87,
          annualFee: 95,
          welcomeBonus: '80,000 points after $4,000 spend',
          benefits: ['Flexible redemption', 'Transfer partners', 'Travel protections']
        }
      ];
    }

    return {
      id: `assistant_${Date.now()}`,
      type: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      recommendations,
      context: {
        location: currentLocation,
        merchantType: lowerQuery.includes('dining') ? 'restaurant' : 
                     lowerQuery.includes('grocery') ? 'supermarket' :
                     lowerQuery.includes('gas') ? 'gas station' : 'general'
      }
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
      context: {
        location: currentLocation
      }
    };

    setMessages(prev => [userMessage, ...prev]);
    setInputValue('');
    setIsProcessing(true);
    setShowQuickActions(false);

    // Add thinking message
    const thinkingMessage: ChatMessage = {
      id: `thinking_${Date.now()}`,
      type: 'assistant',
      content: 'Analyzing your request...',
      timestamp: new Date().toISOString(),
      thinking: true
    };

    setMessages(prev => [thinkingMessage, ...prev]);

    try {
      const assistantMessage = await processNaturalLanguageQuery(userMessage.content);
      
      // Remove thinking message and add real response
      setMessages(prev => {
        const withoutThinking = prev.filter(msg => msg.id !== thinkingMessage.id);
        return [assistantMessage, ...withoutThinking];
      });

      // Save to localStorage
      const updatedMessages = [assistantMessage, userMessage, ...messages];
      localStorage.setItem('ai_chat_messages', JSON.stringify(updatedMessages.slice(0, 50)));

    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        error: true
      };

      setMessages(prev => {
        const withoutThinking = prev.filter(msg => msg.id !== thinkingMessage.id);
        return [errorMessage, ...withoutThinking];
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    // Voice input disabled for TypeScript compatibility
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputValue(action.query);
    setShowQuickActions(false);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleMessageFeedback = (messageId: string, positive: boolean) => {
    // In real app, this would send feedback to improve AI responses
    console.log(`Feedback for ${messageId}: ${positive ? 'positive' : 'negative'}`);
  };

  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'Best dining card',
      query: 'What is the best credit card for dining out?',
      icon: <CreditCard className="w-4 h-4" />,
      category: 'dining'
    },
    {
      id: '2',
      label: 'Travel rewards',
      query: 'Show me the best travel reward credit cards',
      icon: <MapPin className="w-4 h-4" />,
      category: 'travel'
    },
    {
      id: '3',
      label: 'No annual fee',
      query: 'What are the best credit cards with no annual fee?',
      icon: <DollarSign className="w-4 h-4" />,
      category: 'fees'
    },
    {
      id: '4',
      label: 'Grocery rewards',
      query: 'Best card for grocery shopping rewards',
      icon: <TrendingUp className="w-4 h-4" />,
      category: 'grocery'
    },
    {
      id: '5',
      label: 'Welcome bonuses',
      query: 'Which cards have the best welcome bonuses right now?',
      icon: <Star className="w-4 h-4" />,
      category: 'bonus'
    },
    {
      id: '6',
      label: 'Gas station cards',
      query: 'Best credit card for gas station purchases',
      icon: <Target className="w-4 h-4" />,
      category: 'gas'
    }
  ];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-[600px] flex flex-col bg-white rounded-lg border border-gray-200">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Card Advisor</h3>
            <p className="text-sm text-gray-600">Ask me anything about credit cards</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {currentLocation && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{currentLocation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Actions */}
        {showQuickActions && messages.length <= 1 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Quick questions to get started:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center space-x-2 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {action.icon}
                  <span className="text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-blue-600' 
                      : message.error 
                        ? 'bg-red-600' 
                        : 'bg-gray-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : message.error ? (
                      <AlertTriangle className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="space-y-2">
                    <div className={`rounded-lg px-4 py-2 ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : message.error
                          ? 'bg-red-50 border border-red-200'
                          : message.thinking
                            ? 'bg-gray-100 border border-gray-200'
                            : 'bg-gray-50 border border-gray-200'
                    }`}>
                      {message.thinking ? (
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="w-4 h-4 animate-spin text-gray-600" />
                          <span className="text-gray-600">{message.content}</span>
                        </div>
                      ) : (
                        <p className={`text-sm whitespace-pre-line ${
                          message.type === 'user' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {message.content}
                        </p>
                      )}
                    </div>

                    {/* Card Recommendations */}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="space-y-3 mt-3">
                        {message.recommendations.map((rec, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">{rec.cardName}</h4>
                                <p className="text-sm text-gray-600">{rec.issuer}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">{rec.rewardsRate}</div>
                                <div className="text-xs text-gray-500">{rec.confidence}% match</div>
                              </div>
                            </div>

                            <p className="text-sm text-gray-700 mb-3">{rec.reason}</p>

                            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                              <div>
                                <span className="text-gray-600">Annual Fee:</span>
                                <span className="ml-1 font-medium">
                                  {rec.annualFee === 0 ? 'No Fee' : `$${rec.annualFee}`}
                                </span>
                              </div>
                              {rec.welcomeBonus && (
                                <div>
                                  <span className="text-gray-600">Welcome Bonus:</span>
                                  <span className="ml-1 font-medium text-green-600">{rec.welcomeBonus}</span>
                                </div>
                              )}
                            </div>

                            <div className="border-t border-gray-100 pt-2">
                              <p className="text-xs text-gray-600 mb-1">Key Benefits:</p>
                              <div className="flex flex-wrap gap-1">
                                {rec.benefits.slice(0, 3).map((benefit, idx) => (
                                  <span key={idx} className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">
                                    {benefit}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Actions */}
                    {!message.thinking && message.type === 'assistant' && (
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleCopyMessage(message.content)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy message"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMessageFeedback(message.id, true)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMessageFeedback(message.id, false)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about credit cards... (e.g., 'Best card for dining?')"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isProcessing}
            />
            
            {false && speechSupported && (
              <button
                onClick={handleVoiceInput}
                className={`absolute right-12 top-2 p-1 rounded transition-colors ${
                  isListening 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            {isProcessing ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {isListening && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
            <Volume2 className="w-4 h-4" />
            <span>Listening... Speak clearly into your microphone</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NaturalLanguageChat;
