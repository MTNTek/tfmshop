'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageCircle,
  ShoppingCart,
  Search,
  Sparkles,
  Zap,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Settings,
  User,
  Heart,
  Star,
  TrendingUp,
  Filter,
  MapPin,
  CreditCard,
  Truck
} from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface VoiceCommand {
  id: string;
  command: string;
  intent: string;
  confidence: number;
  timestamp: Date;
  response: string;
  action?: 'search' | 'add_to_cart' | 'navigate' | 'filter' | 'compare' | 'checkout';
  data?: any;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
}

export default function VoiceShoppingPage() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentCommand, setCurrentCommand] = useState('');
  const [voiceHistory, setVoiceHistory] = useState<VoiceCommand[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [confidence, setConfidence] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [currentContext, setCurrentContext] = useState<string>('home');
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);

  // Mock products for demo
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      price: 999,
      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300',
      category: 'Electronics',
      rating: 4.8,
      inStock: true
    },
    {
      id: '2',
      name: 'MacBook Air M2',
      price: 1199,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300',
      category: 'Computers',
      rating: 4.9,
      inStock: true
    },
    {
      id: '3',
      name: 'AirPods Pro',
      price: 249,
      image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300',
      category: 'Audio',
      rating: 4.7,
      inStock: true
    }
  ];

  const voiceSuggestions = [
    "Find iPhone 15 Pro in blue",
    "Add MacBook to cart",
    "Show me wireless headphones under $200",
    "What's on sale today?",
    "Compare iPhone 15 and iPhone 14",
    "Check my cart total",
    "Find gaming laptops",
    "Show me 5-star rated products",
    "What's the delivery time for MacBook?",
    "Find gift ideas under $100"
  ];

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentCommand(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript, confidence || 0.8);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }

    // Set random suggestions
    setSuggestions(voiceSuggestions.sort(() => 0.5 - Math.random()).slice(0, 3));
  }, []);

  const processVoiceCommand = (command: string, confidence: number) => {
    const lowerCommand = command.toLowerCase();
    let intent = 'unknown';
    let response = '';
    let action: VoiceCommand['action'] = undefined;
    let data: any = {};

    // Intent recognition
    if (lowerCommand.includes('find') || lowerCommand.includes('search') || lowerCommand.includes('show me')) {
      intent = 'search';
      action = 'search';
      
      // Extract product keywords
      const keywords = extractProductKeywords(lowerCommand);
      const results = mockProducts.filter(product => 
        keywords.some(keyword => 
          product.name.toLowerCase().includes(keyword) || 
          product.category.toLowerCase().includes(keyword)
        )
      );
      
      setSearchResults(results);
      data = { keywords, results };
      
      if (results.length > 0) {
        response = `Found ${results.length} product${results.length > 1 ? 's' : ''} matching your search. ${results[0].name} is available for ${formatPrice(results[0].price)}.`;
      } else {
        response = "I couldn't find any products matching your search. Try being more specific or browse our categories.";
      }
    } 
    else if (lowerCommand.includes('add') && lowerCommand.includes('cart')) {
      intent = 'add_to_cart';
      action = 'add_to_cart';
      
      const productName = extractProductName(lowerCommand);
      const product = mockProducts.find(p => 
        p.name.toLowerCase().includes(productName.toLowerCase())
      );
      
      if (product) {
        setCartItems(prev => [...prev, product]);
        data = { product };
        response = `Added ${product.name} to your cart for ${formatPrice(product.price)}. Your cart now has ${cartItems.length + 1} item${cartItems.length + 1 > 1 ? 's' : ''}.`;
      } else {
        response = "I couldn't find that product. Please try again with the exact product name.";
      }
    }
    else if (lowerCommand.includes('cart') && (lowerCommand.includes('total') || lowerCommand.includes('check'))) {
      intent = 'check_cart';
      const total = cartItems.reduce((sum, item) => sum + item.price, 0);
      response = `Your cart has ${cartItems.length} item${cartItems.length > 1 ? 's' : ''} with a total of ${formatPrice(total)}.`;
      data = { cartItems, total };
    }
    else if (lowerCommand.includes('sale') || lowerCommand.includes('deals')) {
      intent = 'find_deals';
      response = "Here are today's hot deals: iPhone 15 Pro is 10% off, MacBook Air has free shipping, and AirPods Pro come with a free case!";
    }
    else if (lowerCommand.includes('compare')) {
      intent = 'compare';
      action = 'compare';
      response = "I can help you compare products. What specific items would you like me to compare?";
    }
    else {
      response = "I didn't quite understand that. You can ask me to find products, add items to cart, check deals, or get product information.";
    }

    const voiceCommand: VoiceCommand = {
      id: Date.now().toString(),
      command,
      intent,
      confidence,
      timestamp: new Date(),
      response,
      action,
      data
    };

    setVoiceHistory(prev => [voiceCommand, ...prev]);
    speakResponse(response);
  };

  const extractProductKeywords = (command: string): string[] => {
    const keywords = ['iphone', 'macbook', 'airpods', 'laptop', 'phone', 'headphones', 'computer', 'gaming', 'wireless'];
    return keywords.filter(keyword => command.toLowerCase().includes(keyword));
  };

  const extractProductName = (command: string): string => {
    const words = command.split(' ');
    const addIndex = words.findIndex(word => word.toLowerCase() === 'add');
    const toIndex = words.findIndex(word => word.toLowerCase() === 'to');
    
    if (addIndex !== -1 && toIndex !== -1) {
      return words.slice(addIndex + 1, toIndex).join(' ');
    }
    return '';
  };

  const speakResponse = (text: string) => {
    if (synthesisRef.current && isEnabled) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      synthesisRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && isEnabled) {
      setCurrentCommand('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentCommand(suggestion);
    processVoiceCommand(suggestion, 1.0);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'search': return <Search className="h-4 w-4" />;
      case 'add_to_cart': return <ShoppingCart className="h-4 w-4" />;
      case 'check_cart': return <Package className="h-4 w-4" />;
      case 'find_deals': return <TrendingUp className="h-4 w-4" />;
      case 'compare': return <Filter className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Voice Shopping Assistant
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            Shop hands-free with AI-powered voice commands
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsEnabled(!isEnabled)}
              className={isEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
            >
              {isEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
              Voice {isEnabled ? 'Enabled' : 'Disabled'}
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voice Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Voice Interface */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center">
                {/* Voice Visualization */}
                <div className="relative mb-6">
                  <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isListening 
                      ? 'bg-gradient-to-r from-green-400 to-blue-500 animate-pulse scale-110' 
                      : isSpeaking
                      ? 'bg-gradient-to-r from-purple-400 to-pink-500 animate-pulse scale-105'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}>
                    {isListening ? (
                      <Mic className="h-12 w-12 text-white" />
                    ) : isSpeaking ? (
                      <Volume2 className="h-12 w-12 text-white animate-bounce" />
                    ) : (
                      <MicOff className="h-12 w-12 text-white" />
                    )}
                  </div>
                  
                  {/* Voice waves animation */}
                  {(isListening || isSpeaking) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-40 border-4 border-blue-300 rounded-full animate-ping opacity-30"></div>
                      <div className="absolute w-48 h-48 border-4 border-purple-300 rounded-full animate-ping opacity-20 animation-delay-75"></div>
                    </div>
                  )}
                </div>

                {/* Status Display */}
                <div className="mb-6">
                  {isListening && (
                    <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Listening...</span>
                    </div>
                  )}
                  
                  {isSpeaking && (
                    <div className="flex items-center justify-center space-x-2 text-purple-600 mb-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Speaking...</span>
                    </div>
                  )}

                  {currentCommand && (
                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-1">Current Command:</p>
                      <p className="font-medium text-gray-900">{currentCommand}</p>
                      {confidence > 0 && (
                        <div className="flex items-center justify-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500">Confidence:</span>
                          <span className={`text-xs font-semibold ${getConfidenceColor(confidence)}`}>
                            {Math.round(confidence * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Button
                    size="lg"
                    onClick={toggleListening}
                    disabled={!isEnabled}
                    className={`px-8 py-4 ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-5 w-5 mr-2" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="h-5 w-5 mr-2" />
                        Start Voice Command
                      </>
                    )}
                  </Button>
                  
                  {isSpeaking && (
                    <Button
                      variant="outline"
                      onClick={stopSpeaking}
                      className="px-6 py-4"
                    >
                      <VolumeX className="h-5 w-5 mr-2" />
                      Stop Speaking
                    </Button>
                  )}
                </div>

                {/* Quick Suggestions */}
                <div>
                  <p className="text-sm text-gray-600 mb-3">Try saying:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        "{suggestion}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(product.rating) 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">({product.rating})</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                            <Button size="sm" onClick={() => handleSuggestionClick(`Add ${product.name} to cart`)}>
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Voice History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Voice Command History</h3>
                <Button variant="outline" size="sm" onClick={() => setVoiceHistory([])}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="space-y-4">
                {voiceHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No voice commands yet. Try saying "Find iPhone" to get started!</p>
                ) : (
                  voiceHistory.slice(0, 5).map((cmd) => (
                    <div key={cmd.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getIntentIcon(cmd.intent)}
                          <span className="text-sm font-medium text-gray-900">{cmd.intent}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(cmd.confidence)} bg-gray-100`}>
                            {Math.round(cmd.confidence * 100)}%
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {cmd.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">You said:</p>
                        <p className="font-medium text-gray-900">"{cmd.command}"</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Assistant response:</p>
                        <p className="text-sm text-gray-800">{cmd.response}</p>
                      </div>
                      {cmd.action && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Action: {cmd.action.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cart Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Your Cart ({cartItems.length})
              </h3>
              
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Your cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatPrice(cartItems.reduce((sum, item) => sum + item.price, 0))}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-3">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Checkout
                  </Button>
                </div>
              )}
            </div>

            {/* Voice Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Features</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Search className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Smart Search</p>
                    <p className="text-xs text-gray-600">Find products with natural language</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ShoppingCart className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Voice Shopping</p>
                    <p className="text-xs text-gray-600">Add items to cart hands-free</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Quick Actions</p>
                    <p className="text-xs text-gray-600">Check cart, find deals, compare</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">AI Understanding</p>
                    <p className="text-xs text-gray-600">Powered by advanced NLP</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                Voice Tips
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Speak clearly and at normal pace</p>
                <p>• Use specific product names for best results</p>
                <p>• Try "Show me..." or "Find..." to start searches</p>
                <p>• Say "Add [product] to cart" to shop</p>
                <p>• Ask "What's on sale?" for current deals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
