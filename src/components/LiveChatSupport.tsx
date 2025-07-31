'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle,
  X,
  Send,
  Phone,
  Video,
  Paperclip,
  Smile,
  MoreVertical,
  CheckCheck,
  Clock,
  User,
  Bot,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'bot';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file' | 'system';
  agentInfo?: {
    name: string;
    avatar: string;
    title: string;
  };
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Hello! I\'m here to help you with any questions about our products or your order. How can I assist you today?',
    sender: 'bot',
    timestamp: new Date(Date.now() - 300000),
    status: 'read',
    type: 'text'
  }
];

const agentInfo = {
  name: 'Sarah Wilson',
  avatar: '/api/placeholder/40/40',
  title: 'Customer Support Specialist',
  online: true
};

const quickReplies = [
  'Track my order',
  'Return policy',
  'Product information',
  'Shipping options',
  'Payment issues',
  'Technical support'
];

const suggestedActions = [
  { icon: '📦', text: 'Track Order', action: 'track-order' },
  { icon: '💳', text: 'Billing Help', action: 'billing' },
  { icon: '🔄', text: 'Returns', action: 'returns' },
  { icon: '📞', text: 'Call Support', action: 'call' }
];

export default function LiveChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAgentOnline, setIsAgentOnline] = useState(true);
  const [chatStatus, setChatStatus] = useState<'bot' | 'agent' | 'queue'>('bot');
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate message being sent
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );
    }, 500);

    // Simulate agent typing and response
    setTimeout(() => {
      setIsTyping(true);
    }, 1000);

    setTimeout(() => {
      setIsTyping(false);
      const response = generateResponse(text);
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: chatStatus === 'agent' ? 'agent' : 'bot',
        timestamp: new Date(),
        status: 'read',
        type: 'text',
        agentInfo: chatStatus === 'agent' ? agentInfo : undefined
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, 2000 + Math.random() * 2000);
  };

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('track') || lowerMessage.includes('order')) {
      return 'I can help you track your order! Please provide your order number or email address, and I\'ll look it up for you right away.';
    }
    
    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return 'Our return policy allows returns within 30 days of purchase. Most items are eligible for return if they\'re in original condition. Would you like me to start a return for you?';
    }
    
    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      return 'We offer several shipping options including free standard shipping on orders over $35, expedited shipping, and same-day delivery in select areas. What would you like to know about shipping?';
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('billing')) {
      return 'I can help with payment and billing questions. Are you having trouble with a payment method, need to update billing information, or have questions about charges?';
    }
    
    if (lowerMessage.includes('product') || lowerMessage.includes('item')) {
      return 'I\'d be happy to help you learn more about our products! Which specific product are you interested in, or do you need help finding something particular?';
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! Great to chat with you. I\'m here to help with any questions about orders, products, shipping, returns, or anything else you need assistance with.';
    }
    
    if (lowerMessage.includes('agent') || lowerMessage.includes('human')) {
      setChatStatus('agent');
      return 'I\'m connecting you with one of our customer service agents. Sarah will be with you shortly to provide personalized assistance.';
    }
    
    return 'Thank you for your message! I\'m here to help with orders, products, shipping, returns, and more. Could you please provide a bit more detail about what you need assistance with?';
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const handleSuggestedAction = (action: string) => {
    switch (action) {
      case 'track-order':
        sendMessage('I need help tracking my order');
        break;
      case 'billing':
        sendMessage('I have a billing question');
        break;
      case 'returns':
        sendMessage('I want to return an item');
        break;
      case 'call':
        // In a real app, this would initiate a phone call
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: 'Phone support is available 24/7 at 1-800-123-4567. Average wait time is currently 2-3 minutes.',
          sender: 'bot',
          timestamp: new Date(),
          status: 'read',
          type: 'system'
        }]);
        break;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="relative h-14 w-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`bg-white rounded-lg shadow-2xl border ${
        isMinimized ? 'w-80 h-16' : 'w-80 h-96'
      } transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-orange-500 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {chatStatus === 'agent' ? (
                <Image
                  src={agentInfo.avatar}
                  alt={agentInfo.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              {chatStatus === 'agent' && isAgentOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">
                {chatStatus === 'agent' ? agentInfo.name : 'TFM Support'}
              </h3>
              <p className="text-orange-100 text-xs">
                {chatStatus === 'agent' 
                  ? `${agentInfo.title} • ${isAgentOnline ? 'Online' : 'Away'}`
                  : 'AI Assistant • Online'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {chatStatus === 'agent' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-orange-600 p-1 h-8 w-8"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-orange-600 p-1 h-8 w-8"
                >
                  <Video className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-orange-600 p-1 h-8 w-8"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-orange-600 p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 max-h-64 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`flex max-w-xs ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  } items-end space-x-2`}>
                    {message.sender !== 'user' && (
                      <div className="w-6 h-6 flex-shrink-0">
                        {message.sender === 'agent' ? (
                          <Image
                            src={agentInfo.avatar}
                            alt={agentInfo.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <Bot className="h-3 w-3 text-gray-600" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`px-3 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-orange-500 text-white'
                        : message.type === 'system'
                        ? 'bg-gray-100 text-gray-600 text-sm'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-1 ${
                        message.sender === 'user' ? 'text-orange-100' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{formatTime(message.timestamp)}</span>
                        {message.sender === 'user' && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2">
                    <div className="w-6 h-6 flex-shrink-0">
                      {chatStatus === 'agent' ? (
                        <Image
                          src={agentInfo.avatar}
                          alt={agentInfo.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <Bot className="h-3 w-3 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <div className="grid grid-cols-2 gap-2">
                  {suggestedActions.map((action) => (
                    <Button
                      key={action.action}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedAction(action.action)}
                      className="text-xs h-8 justify-start"
                    >
                      <span className="mr-1">{action.icon}</span>
                      {action.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6"
                    >
                      <Paperclip className="h-3 w-3 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6"
                    >
                      <Smile className="h-3 w-3 text-gray-400" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => sendMessage(inputText)}
                  disabled={!inputText.trim()}
                  className="bg-orange-500 hover:bg-orange-600 p-2 h-9 w-9"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Quick Reply Suggestions */}
              {messages.length > 2 && inputText === '' && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {quickReplies.slice(0, 3).map((reply) => (
                    <Button
                      key={reply}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs h-6 px-2"
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
