import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image, Paperclip, Bot, User, Plus, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useHealthData } from '../contexts/HealthDataContext';
import { getAIResponse, ChatMessage as OpenAIMessage } from '../utils/openai';
import toast from 'react-hot-toast';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
};

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  date: Date;
};

const ChatAssistant: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { healthMetrics, healthProfile } = useHealthData();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('chat.welcomeMessage'),
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: t('chat.newChat'),
      lastMessage: t('chat.startNewConversation'),
      date: new Date(),
    },
  ]);
  const [activeConversation, setActiveConversation] = useState('1');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!user) {
      toast.error('Please sign in to use the chat assistant');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      // Convert our messages to the format expected by the OpenAI API
      const openaiMessages: OpenAIMessage[] = messages
        .concat(userMessage)
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Get AI response from our utility function
      const response = await getAIResponse(
        openaiMessages, 
        user.id,
        true // Include health data in the context
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update conversation list
      setConversations((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((c) => c.id === activeConversation);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            lastMessage: message,
            date: new Date(),
          };
        }
        return updated;
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get a response. Please try again later.');
    } finally {
      setIsTyping(false);
    }
  };

  const startNewConversation = () => {
    const newId = (conversations.length + 1).toString();
    const newConversation: Conversation = {
      id: newId,
      title: t('chat.newChat'),
      lastMessage: t('chat.startNewConversation'),
      date: new Date(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversation(newId);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: t('chat.welcomeMessage'),
        timestamp: new Date(),
      },
    ]);
  };

  const shareHealthData = async () => {
    if (!user) {
      toast.error('Please sign in to share health data');
      return;
    }

    setIsTyping(true);
    try {
      // Build a health summary message
      let healthSummary = "Here's a summary of my current health metrics:\n\n";
      
      if (healthMetrics && healthMetrics.length > 0) {
        const latestMetric = healthMetrics[0];
        if (latestMetric.blood_glucose) healthSummary += `Blood Glucose: ${latestMetric.blood_glucose} mg/dL\n`;
        if (latestMetric.weight) healthSummary += `Weight: ${latestMetric.weight} kg\n`;
        if (latestMetric.blood_pressure_systolic && latestMetric.blood_pressure_diastolic) 
          healthSummary += `Blood Pressure: ${latestMetric.blood_pressure_systolic}/${latestMetric.blood_pressure_diastolic} mmHg\n`;
        if (latestMetric.steps) healthSummary += `Steps: ${latestMetric.steps}\n`;
        if (latestMetric.sleep_hours) healthSummary += `Sleep: ${latestMetric.sleep_hours} hours\n`;
      } else {
        healthSummary += "I don't have any recent health metrics recorded yet.\n";
      }
      
      if (healthProfile) {
        healthSummary += "\nMy health profile includes:\n";
        if (healthProfile.age) healthSummary += `Age: ${healthProfile.age}\n`;
        if (healthProfile.height) healthSummary += `Height: ${healthProfile.height} cm\n`;
        
        if (healthProfile.medical_conditions && healthProfile.medical_conditions.length > 0) {
          const conditions = Array.isArray(healthProfile.medical_conditions) 
            ? healthProfile.medical_conditions 
            : JSON.parse(healthProfile.medical_conditions);
          healthSummary += `Medical conditions: ${conditions.join(', ')}\n`;
        }
      }
      
      // Add the health summary as a user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: healthSummary,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      
      // Get AI response to the health data
      const openaiMessages: OpenAIMessage[] = [
        ...messages.filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: healthSummary
        }
      ];
      
      const response = await getAIResponse(openaiMessages, user.id, true);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error processing health data share:', error);
      toast.error('Failed to process health data. Please try again later.');
    } finally {
      setIsTyping(false);
    }
  };

  // Function to render markdown content
  const renderMessageContent = (content: string) => {
    // Basic markdown parsing for the assistant's messages
    // Convert markdown to HTML
    let formattedContent = content
      // Headers
      .replace(/### (.*)/g, '<h3 class="text-lg font-bold text-blue-700 mt-3 mb-2">$1</h3>')
      .replace(/## (.*)/g, '<h2 class="text-xl font-bold text-blue-800 mt-4 mb-2">$1</h2>')
      .replace(/# (.*)/g, '<h1 class="text-2xl font-bold text-blue-900 mt-4 mb-3">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Lists
      .replace(/^\s*[\-\*]\s+(.*)/gm, '<li class="ml-4">$1</li>')
      .replace(/^\s*\d+\.\s+(.*)/gm, '<li class="ml-4 list-decimal">$1</li>')
      
      // Code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-pink-600 font-mono">$1</code>')
      
      // Links (if any)
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
      
      // Handle paragraphs (lines with content)
      .replace(/^(?!<[hl]|<li|<code|<a|<strong|<em)(.+)$/gm, '<p class="mb-2">$1</p>')
      
      // Make numeric values in health contexts stand out
      .replace(/(\d+\s*(?:mg\/dL|mmHg|kg|lbs|hours|steps))/g, 
               '<span class="font-medium text-blue-600">$1</span>')
      
      // Wrap consecutive list items
      .replace(/(<li[^>]*>.*<\/li>\n<li[^>]*>.*<\/li>)/g, '<ul class="mb-3">$1</ul>');
    
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversations sidebar */}
      <div className="hidden md:block w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
        <div className="p-4">
          <button
            onClick={startNewConversation}
            className="flex items-center justify-center w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('chat.newChat')}
          </button>
        </div>
        
        <div className="flex justify-between items-center px-4 py-2">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {t('chat.recentChats')}
          </h3>
          <button 
            onClick={shareHealthData}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
          >
            <FileText className="h-3 w-3 mr-1" />
            Share Health Data
          </button>
        </div>

        <div className="space-y-1 px-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setActiveConversation(conversation.id)}
              className={`w-full text-left p-3 rounded-lg ${
                activeConversation === conversation.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <Bot className="h-5 w-5 mr-3" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conversation.title}</p>
                  <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start mb-6 ${
                  msg.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="bg-blue-600 rounded-full p-2">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                      : 'bg-white text-gray-800 rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none text-gray-800">
                      {renderMessageContent(msg.content)}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  )}
                  <div
                    className={`text-xs mt-2 ${
                      msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 ml-3">
                    <div className="bg-blue-700 rounded-full p-2">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0 mr-3">
                  <div className="bg-blue-600 rounded-full p-2">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="max-w-[80%] p-4 rounded-lg bg-white text-gray-800 rounded-tl-none shadow-md">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="h-3 w-3 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                    <div className="h-3 w-3 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 bg-white shadow-md">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between mb-2">
              <button
                onClick={shareHealthData}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center md:hidden"
                disabled={isTyping}
              >
                <FileText className="h-4 w-4 mr-1" />
                Share Health Data
              </button>
              <button
                onClick={startNewConversation}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center md:hidden"
                disabled={isTyping}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Chat
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex items-center">
              <button
                type="button"
                className="p-2 text-gray-500 rounded-full hover:bg-gray-100 mr-1"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-2 text-gray-500 rounded-full hover:bg-gray-100 mr-1"
              >
                <Image className="h-5 w-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-full py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  placeholder={t('chat.typePlaceholder')}
                  disabled={isTyping}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>
              <button
                type="submit"
                className={`p-3 ml-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isTyping || !message.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
            <div className="mt-2 text-xs text-center text-gray-500">
              {t('chat.disclaimer')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;