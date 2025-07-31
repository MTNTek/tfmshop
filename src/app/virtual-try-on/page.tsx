'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Camera,
  Scan,
  Smartphone,
  Monitor,
  Glasses,
  Shirt,
  Watch,
  Palette,
  Ruler,
  RotateCcw,
  Download,
  Share2,
  ShoppingCart,
  Heart,
  Star,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Zap,
  Sparkles,
  Target,
  Eye,
  User,
  Layers,
  Move3D,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Filter,
  Sliders,
  Sun,
  Moon,
  Lightbulb,
  RefreshCw,
  CheckCircle,
  X,
  Info,
  Grid,
  Box
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ARProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: 'glasses' | 'clothing' | 'watches' | 'shoes' | 'accessories' | 'furniture';
  image: string;
  model3D?: string;
  colors: Array<{
    name: string;
    value: string;
    image: string;
  }>;
  sizes: string[];
  rating: number;
  reviews: number;
  arFeatures: {
    virtualTryOn: boolean;
    roomPlacement: boolean;
    sizeGuide: boolean;
    colorChange: boolean;
  };
  compatibility: {
    mobile: boolean;
    desktop: boolean;
    webAR: boolean;
    app: boolean;
  };
}

interface TryOnSession {
  id: string;
  product: ARProduct;
  selectedColor: string;
  selectedSize: string;
  timestamp: Date;
  photos: string[];
  feedback?: {
    fit: 'too-small' | 'perfect' | 'too-large';
    style: number; // 1-5 rating
    comfort: number; // 1-5 rating
  };
}

interface AREnvironment {
  id: string;
  name: string;
  type: 'room' | 'outdoor' | 'lighting';
  preview: string;
  description: string;
}

const mockProducts: ARProduct[] = [
  {
    id: '1',
    name: 'Ray-Ban Wayfarer Classic',
    brand: 'Ray-Ban',
    price: 154.99,
    category: 'glasses',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300',
    colors: [
      { name: 'Black', value: '#000000', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100' },
      { name: 'Tortoise', value: '#8B4513', image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=100' },
      { name: 'Clear', value: '#F5F5DC', image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=100' }
    ],
    sizes: ['S', 'M', 'L'],
    rating: 4.8,
    reviews: 2156,
    arFeatures: {
      virtualTryOn: true,
      roomPlacement: false,
      sizeGuide: true,
      colorChange: true
    },
    compatibility: {
      mobile: true,
      desktop: true,
      webAR: true,
      app: true
    }
  },
  {
    id: '2',
    name: 'Nike Air Max 270',
    brand: 'Nike',
    price: 150.00,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
    colors: [
      { name: 'White/Black', value: '#FFFFFF', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100' },
      { name: 'Triple Black', value: '#000000', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=100' },
      { name: 'Blue/White', value: '#0066CC', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=100' }
    ],
    sizes: ['7', '8', '9', '10', '11', '12'],
    rating: 4.6,
    reviews: 1843,
    arFeatures: {
      virtualTryOn: true,
      roomPlacement: false,
      sizeGuide: true,
      colorChange: true
    },
    compatibility: {
      mobile: true,
      desktop: false,
      webAR: true,
      app: true
    }
  },
  {
    id: '3',
    name: 'Modern Leather Sofa',
    brand: 'ComfortCo',
    price: 1299.99,
    category: 'furniture',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300',
    colors: [
      { name: 'Brown Leather', value: '#8B4513', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100' },
      { name: 'Black Leather', value: '#000000', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=100' },
      { name: 'Cream Fabric', value: '#F5F5DC', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=100' }
    ],
    sizes: ['2-Seater', '3-Seater', 'L-Shape'],
    rating: 4.7,
    reviews: 567,
    arFeatures: {
      virtualTryOn: false,
      roomPlacement: true,
      sizeGuide: true,
      colorChange: true
    },
    compatibility: {
      mobile: true,
      desktop: true,
      webAR: true,
      app: true
    }
  },
  {
    id: '4',
    name: 'Apple Watch Series 9',
    brand: 'Apple',
    price: 399.99,
    category: 'watches',
    image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=300',
    colors: [
      { name: 'Silver', value: '#C0C0C0', image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=100' },
      { name: 'Space Gray', value: '#36454F', image: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=100' },
      { name: 'Gold', value: '#FFD700', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100' }
    ],
    sizes: ['41mm', '45mm'],
    rating: 4.9,
    reviews: 3421,
    arFeatures: {
      virtualTryOn: true,
      roomPlacement: false,
      sizeGuide: true,
      colorChange: true
    },
    compatibility: {
      mobile: true,
      desktop: true,
      webAR: true,
      app: true
    }
  }
];

const arEnvironments: AREnvironment[] = [
  {
    id: '1',
    name: 'Living Room',
    type: 'room',
    preview: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200',
    description: 'Modern living room with natural lighting'
  },
  {
    id: '2',
    name: 'Bedroom',
    type: 'room',
    preview: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200',
    description: 'Cozy bedroom environment'
  },
  {
    id: '3',
    name: 'Office',
    type: 'room',
    preview: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200',
    description: 'Professional office space'
  },
  {
    id: '4',
    name: 'Natural Light',
    type: 'lighting',
    preview: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200',
    description: 'Bright daylight simulation'
  },
  {
    id: '5',
    name: 'Studio Light',
    type: 'lighting',
    preview: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200',
    description: 'Professional studio lighting'
  }
];

export default function VirtualTryOnPage() {
  const [selectedProduct, setSelectedProduct] = useState<ARProduct | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [arMode, setArMode] = useState<'try-on' | 'room-placement' | 'size-guide'>('try-on');
  const [isARActive, setIsARActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState(arEnvironments[0]);
  const [arSettings, setArSettings] = useState({
    lighting: 50,
    contrast: 50,
    rotation: 0,
    scale: 100,
    position: { x: 0, y: 0, z: 0 }
  });
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [tryOnSessions, setTryOnSessions] = useState<TryOnSession[]>([]);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [deviceSupport, setDeviceSupport] = useState({
    webAR: true,
    camera: true,
    gyroscope: false,
    webGL: true
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check device capabilities
    const checkDeviceSupport = () => {
      setDeviceSupport({
        webAR: 'navigator' in window && 'xr' in navigator,
        camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
        gyroscope: 'DeviceOrientationEvent' in window,
        webGL: !!document.createElement('canvas').getContext('webgl')
      });
    };

    checkDeviceSupport();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg');
        setCapturedPhotos(prev => [...prev, dataURL]);
      }
    }
  };

  const startARExperience = () => {
    if (!selectedProduct) return;
    
    setIsARActive(true);
    if (selectedProduct.arFeatures.virtualTryOn && (arMode === 'try-on')) {
      startCamera();
    }
    
    // Create new try-on session
    const newSession: TryOnSession = {
      id: Date.now().toString(),
      product: selectedProduct,
      selectedColor,
      selectedSize,
      timestamp: new Date(),
      photos: []
    };
    
    setTryOnSessions(prev => [...prev, newSession]);
  };

  const stopARExperience = () => {
    setIsARActive(false);
    stopCamera();
  };

  const handleProductSelect = (product: ARProduct) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors[0]?.name || '');
    setSelectedSize(product.sizes[0] || '');
  };

  const resetARSettings = () => {
    setArSettings({
      lighting: 50,
      contrast: 50,
      rotation: 0,
      scale: 100,
      position: { x: 0, y: 0, z: 0 }
    });
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const getCompatibilityIcon = (feature: string) => {
    switch (feature) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
      case 'webAR': return <Scan className="h-4 w-4" />;
      case 'app': return <Box className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Virtual Try-On & AR Shopping</h1>
              <p className="text-gray-600">Experience products in augmented reality before you buy</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                {Object.entries(deviceSupport).map(([feature, supported]) => (
                  <div key={feature} className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                    supported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {getCompatibilityIcon(feature)}
                    <span className="capitalize">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                AR Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Product Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AR-Ready Products</h3>
              
              <div className="space-y-4">
                {mockProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`cursor-pointer border rounded-lg p-3 transition-all ${
                      selectedProduct?.id === product.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900">{product.name}</h4>
                        <p className="text-xs text-gray-600">{product.brand}</p>
                        <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.arFeatures.virtualTryOn && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                          <Eye className="h-3 w-3 mr-1" />
                          Try-On
                        </span>
                      )}
                      {product.arFeatures.roomPlacement && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                          <Grid className="h-3 w-3 mr-1" />
                          Room AR
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main AR Experience */}
          <div className="lg:col-span-3">
            {selectedProduct ? (
              <div className="space-y-6">
                {/* Product Details & Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-4">
                      <Image
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        width={100}
                        height={100}
                        className="rounded-lg object-cover"
                      />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedProduct.name}</h2>
                        <p className="text-gray-600 mb-2">{selectedProduct.brand}</p>
                        <div className="flex items-center space-x-3 mb-3">
                          {renderStars(selectedProduct.rating)}
                          <span className="text-sm text-gray-600">({selectedProduct.reviews} reviews)</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(selectedProduct.price)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* AR Mode Selection */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">AR Experience</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedProduct.arFeatures.virtualTryOn && (
                        <button
                          onClick={() => setArMode('try-on')}
                          className={`p-4 border rounded-lg text-center transition-all ${
                            arMode === 'try-on'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <User className="h-6 w-6 mx-auto mb-2" />
                          <p className="font-medium">Virtual Try-On</p>
                          <p className="text-xs text-gray-600">See how it looks on you</p>
                        </button>
                      )}
                      
                      {selectedProduct.arFeatures.roomPlacement && (
                        <button
                          onClick={() => setArMode('room-placement')}
                          className={`p-4 border rounded-lg text-center transition-all ${
                            arMode === 'room-placement'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Grid className="h-6 w-6 mx-auto mb-2" />
                          <p className="font-medium">Room Placement</p>
                          <p className="text-xs text-gray-600">Place in your space</p>
                        </button>
                      )}
                      
                      {selectedProduct.arFeatures.sizeGuide && (
                        <button
                          onClick={() => setArMode('size-guide')}
                          className={`p-4 border rounded-lg text-center transition-all ${
                            arMode === 'size-guide'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Ruler className="h-6 w-6 mx-auto mb-2" />
                          <p className="font-medium">Size Guide</p>
                          <p className="text-xs text-gray-600">Find perfect fit</p>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Color & Size Selection */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Color</h4>
                      <div className="flex space-x-2">
                        {selectedProduct.colors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(color.name)}
                            className={`relative w-12 h-12 rounded-lg border-2 transition-all ${
                              selectedColor === color.name
                                ? 'border-blue-500 scale-110'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <Image
                              src={color.image}
                              alt={color.name}
                              fill
                              className="rounded-lg object-cover"
                            />
                            {selectedColor === color.name && (
                              <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{selectedColor}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Size</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedProduct.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
                              selectedSize === size
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setShowSizeGuide(true)}
                      >
                        <Ruler className="h-4 w-4 mr-1" />
                        Size Guide
                      </Button>
                    </div>
                  </div>

                  {/* AR Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {!isARActive ? (
                        <Button
                          onClick={startARExperience}
                          disabled={!selectedColor || !selectedSize}
                          className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                        >
                          <Scan className="h-4 w-4 mr-2" />
                          Start AR Experience
                        </Button>
                      ) : (
                        <Button
                          onClick={stopARExperience}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Stop AR
                        </Button>
                      )}
                      
                      {isARActive && isCameraActive && (
                        <Button onClick={capturePhoto} variant="outline">
                          <Camera className="h-4 w-4 mr-2" />
                          Capture
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>

                {/* AR Viewport */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="aspect-video relative bg-gray-900">
                    {isARActive ? (
                      <div className="relative w-full h-full">
                        {/* Camera Feed */}
                        {isCameraActive && arMode === 'try-on' && (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform scale-x-[-1]"
                          />
                        )}
                        
                        {/* Room Environment */}
                        {arMode === 'room-placement' && (
                          <div className="w-full h-full relative">
                            <Image
                              src={selectedEnvironment.preview}
                              alt={selectedEnvironment.name}
                              fill
                              className="object-cover"
                            />
                            {/* 3D Product Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div 
                                className="relative transform transition-all duration-300"
                                style={{ 
                                  transform: `rotate(${arSettings.rotation}deg) scale(${arSettings.scale / 100})`,
                                  filter: `brightness(${arSettings.lighting}%) contrast(${arSettings.contrast}%)`
                                }}
                              >
                                <Image
                                  src={selectedProduct.image}
                                  alt={selectedProduct.name}
                                  width={200}
                                  height={200}
                                  className="object-contain drop-shadow-lg"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Size Guide Overlay */}
                        {arMode === 'size-guide' && (
                          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Ruler className="h-16 w-16 mx-auto mb-4" />
                              <h3 className="text-2xl font-bold mb-2">Interactive Size Guide</h3>
                              <p className="text-blue-200 mb-4">Use your camera to measure and find the perfect fit</p>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                  <p className="font-medium">Selected Size: {selectedSize}</p>
                                  <p className="text-blue-200">Recommended for you</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                  <p className="font-medium">Fit: Perfect</p>
                                  <p className="text-green-200">95% confidence</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* AR UI Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Corner indicators */}
                          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/50"></div>
                          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/50"></div>
                          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/50"></div>
                          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/50"></div>
                          
                          {/* Center crosshair */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-6 h-6 border-2 border-white/70 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          
                          {/* Info overlay */}
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                            <div className="flex items-center space-x-2">
                              <Sparkles className="h-4 w-4" />
                              <span>AR Active - {arMode.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <Scan className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-xl font-semibold mb-2 text-gray-300">AR Experience Ready</h3>
                          <p className="text-gray-400 mb-4">Click "Start AR Experience" to begin</p>
                          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-4 w-4" />
                              <span>Camera Access</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-4 w-4" />
                              <span>WebAR Supported</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* AR Controls Panel */}
                  {isARActive && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {arMode === 'room-placement' && (
                          <>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Lighting</label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={arSettings.lighting}
                                onChange={(e) => setArSettings(prev => ({ ...prev, lighting: parseInt(e.target.value) }))}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Rotation</label>
                              <input
                                type="range"
                                min="0"
                                max="360"
                                value={arSettings.rotation}
                                onChange={(e) => setArSettings(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Scale</label>
                              <input
                                type="range"
                                min="50"
                                max="150"
                                value={arSettings.scale}
                                onChange={(e) => setArSettings(prev => ({ ...prev, scale: parseInt(e.target.value) }))}
                                className="w-full"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button variant="outline" size="sm" onClick={resetARSettings} className="w-full">
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Reset
                              </Button>
                            </div>
                          </>
                        )}
                        
                        {arMode === 'try-on' && (
                          <>
                            <div className="flex items-center space-x-2">
                              <Camera className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Front Camera Active</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Eye className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-700">Face Detection: ON</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-gray-700">Tracking: Active</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-500">Confidence: 94%</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Environment Selection (for room placement) */}
                {arMode === 'room-placement' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Environment</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {arEnvironments.map((env) => (
                        <button
                          key={env.id}
                          onClick={() => setSelectedEnvironment(env)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selectedEnvironment.id === env.id
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Image
                            src={env.preview}
                            alt={env.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                            <div className="p-2 text-white">
                              <p className="font-medium text-sm">{env.name}</p>
                            </div>
                          </div>
                          {selectedEnvironment.id === env.id && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="h-5 w-5 text-blue-500 bg-white rounded-full" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Captured Photos */}
                {capturedPhotos.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Captured Photos</h3>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download All
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {capturedPhotos.map((photo, index) => (
                        <div key={index} className="aspect-square relative rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={photo}
                            alt={`Captured ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                            <div className="flex space-x-2">
                              <button className="p-1 bg-white/80 rounded-full">
                                <Download className="h-4 w-4" />
                              </button>
                              <button className="p-1 bg-white/80 rounded-full">
                                <Share2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <Scan className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Product to Begin</h3>
                  <p className="text-gray-600 mb-6">Choose an AR-ready product from the sidebar to start your virtual try-on experience</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <Eye className="h-5 w-5 text-blue-500" />
                      <span>Virtual Try-On</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Grid className="h-5 w-5 text-green-500" />
                      <span>Room Placement</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Ruler className="h-5 w-5 text-purple-500" />
                      <span>Size Guide AR</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Size Guide Modal */}
        {showSizeGuide && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Size Guide - {selectedProduct.name}</h3>
                  <button onClick={() => setShowSizeGuide(false)}>
                    <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">How to Measure</h4>
                    <p className="text-blue-700 text-sm">Use our AR measurement tool for the most accurate sizing, or follow the manual guide below.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Size Chart</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left">Size</th>
                              <th className="px-3 py-2 text-left">Measurement</th>
                              <th className="px-3 py-2 text-left">Fit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedProduct.sizes.map((size, index) => (
                              <tr key={size} className={`border-t ${selectedSize === size ? 'bg-blue-50' : ''}`}>
                                <td className="px-3 py-2 font-medium">{size}</td>
                                <td className="px-3 py-2">
                                  {selectedProduct.category === 'glasses' ? `${52 + index * 2}mm` :
                                   selectedProduct.category === 'shoes' ? `US ${size}` :
                                   selectedProduct.category === 'watches' ? size :
                                   `${30 + index * 4}"L`}
                                </td>
                                <td className="px-3 py-2">
                                  {index === 0 ? 'Snug' : index === selectedProduct.sizes.length - 1 ? 'Loose' : 'Regular'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Measurement Guide</h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        {selectedProduct.category === 'glasses' && (
                          <>
                            <p>• Measure across your face from temple to temple</p>
                            <p>• Consider your nose bridge width</p>
                            <p>• Check temple length for comfort behind ears</p>
                          </>
                        )}
                        {selectedProduct.category === 'shoes' && (
                          <>
                            <p>• Measure foot length from heel to longest toe</p>
                            <p>• Measure foot width at the widest point</p>
                            <p>• Consider thickness of socks you'll wear</p>
                          </>
                        )}
                        {selectedProduct.category === 'watches' && (
                          <>
                            <p>• Measure wrist circumference with tape measure</p>
                            <p>• Add 0.5-1 inch for comfortable fit</p>
                            <p>• Consider watch case size proportion to wrist</p>
                          </>
                        )}
                        {selectedProduct.category === 'furniture' && (
                          <>
                            <p>• Measure available space dimensions</p>
                            <p>• Consider doorway and stairway clearance</p>
                            <p>• Account for movement space around furniture</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setShowSizeGuide(false)}>
                      Close Guide
                    </Button>
                    <Button onClick={() => { setShowSizeGuide(false); setArMode('size-guide'); startARExperience(); }}>
                      <Scan className="h-4 w-4 mr-2" />
                      Use AR Measurement
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
