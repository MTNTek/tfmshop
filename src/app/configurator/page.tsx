'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Palette,
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  Zap,
  Package,
  ShoppingCart,
  RotateCcw,
  Save,
  Share2,
  Download,
  Check,
  X,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Calculator
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ConfigOption {
  id: string;
  name: string;
  value: string;
  price: number;
  image?: string;
  description?: string;
  popular?: boolean;
  recommended?: boolean;
  inStock: boolean;
  specs?: Record<string, string>;
}

interface ConfigSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  required: boolean;
  options: ConfigOption[];
  description: string;
  helpText?: string;
}

interface ProductConfig {
  id: string;
  name: string;
  basePrice: number;
  image: string;
  category: string;
  sections: ConfigSection[];
}

// Mock configuration data for MacBook Pro
const macbookConfig: ProductConfig = {
  id: 'macbook-pro-14',
  name: 'MacBook Pro 14-inch',
  basePrice: 1999.00,
  image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
  category: 'Laptops',
  sections: [
    {
      id: 'chip',
      name: 'Chip',
      icon: <Cpu className="h-5 w-5" />,
      required: true,
      description: 'Choose your processor for optimal performance',
      helpText: 'M3 Pro offers the best balance of performance and battery life for most users',
      options: [
        {
          id: 'm3-pro',
          name: 'Apple M3 Pro',
          value: '11-core CPU, 14-core GPU',
          price: 0,
          description: 'Perfect for professional workflows',
          popular: true,
          recommended: true,
          inStock: true,
          specs: {
            'CPU Cores': '11',
            'GPU Cores': '14',
            'Neural Engine': '16-core',
            'Memory Bandwidth': '150GB/s'
          }
        },
        {
          id: 'm3-max',
          name: 'Apple M3 Max',
          value: '14-core CPU, 30-core GPU',
          price: 500,
          description: 'Ultimate performance for demanding tasks',
          inStock: true,
          specs: {
            'CPU Cores': '14',
            'GPU Cores': '30',
            'Neural Engine': '16-core',
            'Memory Bandwidth': '400GB/s'
          }
        }
      ]
    },
    {
      id: 'memory',
      name: 'Memory',
      icon: <MemoryStick className="h-5 w-5" />,
      required: true,
      description: 'Select your unified memory configuration',
      helpText: '18GB is recommended for professional video editing and development',
      options: [
        {
          id: '18gb',
          name: '18GB Unified Memory',
          value: '18GB',
          price: 0,
          popular: true,
          recommended: true,
          inStock: true,
          specs: {
            'Type': 'LPDDR5',
            'Bandwidth': '150GB/s',
            'Shared': 'CPU & GPU'
          }
        },
        {
          id: '36gb',
          name: '36GB Unified Memory',
          value: '36GB',
          price: 400,
          inStock: true,
          specs: {
            'Type': 'LPDDR5',
            'Bandwidth': '150GB/s',
            'Shared': 'CPU & GPU'
          }
        },
        {
          id: '128gb',
          name: '128GB Unified Memory',
          value: '128GB',
          price: 1600,
          description: 'For extreme workloads',
          inStock: false,
          specs: {
            'Type': 'LPDDR5',
            'Bandwidth': '400GB/s',
            'Shared': 'CPU & GPU'
          }
        }
      ]
    },
    {
      id: 'storage',
      name: 'Storage',
      icon: <HardDrive className="h-5 w-5" />,
      required: true,
      description: 'Choose your SSD storage capacity',
      helpText: '1TB provides ample space for most professional needs',
      options: [
        {
          id: '512gb',
          name: '512GB SSD Storage',
          value: '512GB',
          price: 0,
          inStock: true,
          specs: {
            'Type': 'NVMe SSD',
            'Read Speed': '7.4GB/s',
            'Write Speed': '6.2GB/s'
          }
        },
        {
          id: '1tb',
          name: '1TB SSD Storage',
          value: '1TB',
          price: 200,
          popular: true,
          recommended: true,
          inStock: true,
          specs: {
            'Type': 'NVMe SSD',
            'Read Speed': '7.4GB/s',
            'Write Speed': '6.2GB/s'
          }
        },
        {
          id: '2tb',
          name: '2TB SSD Storage',
          value: '2TB',
          price: 600,
          inStock: true,
          specs: {
            'Type': 'NVMe SSD',
            'Read Speed': '7.4GB/s',
            'Write Speed': '6.2GB/s'
          }
        },
        {
          id: '4tb',
          name: '4TB SSD Storage',
          value: '4TB',
          price: 1400,
          inStock: true,
          specs: {
            'Type': 'NVMe SSD',
            'Read Speed': '7.4GB/s',
            'Write Speed': '6.2GB/s'
          }
        }
      ]
    },
    {
      id: 'color',
      name: 'Color',
      icon: <Palette className="h-5 w-5" />,
      required: true,
      description: 'Choose your finish',
      options: [
        {
          id: 'space-gray',
          name: 'Space Gray',
          value: 'Space Gray',
          price: 0,
          image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100',
          popular: true,
          inStock: true
        },
        {
          id: 'silver',
          name: 'Silver',
          value: 'Silver',
          price: 0,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100',
          inStock: true
        }
      ]
    },
    {
      id: 'accessories',
      name: 'Accessories',
      icon: <Package className="h-5 w-5" />,
      required: false,
      description: 'Add compatible accessories',
      helpText: 'These accessories are specifically designed for your MacBook Pro',
      options: [
        {
          id: 'magic-mouse',
          name: 'Magic Mouse',
          value: 'Magic Mouse - White Multi-Touch Surface',
          price: 79,
          image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100',
          inStock: true,
          specs: {
            'Connectivity': 'Bluetooth',
            'Battery': 'Rechargeable',
            'Compatibility': 'macOS'
          }
        },
        {
          id: 'magic-keyboard',
          name: 'Magic Keyboard',
          value: 'Magic Keyboard with Touch ID',
          price: 149,
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100',
          popular: true,
          inStock: true,
          specs: {
            'Layout': 'US English',
            'Features': 'Touch ID',
            'Connectivity': 'Bluetooth'
          }
        },
        {
          id: 'usb-c-adapter',
          name: 'USB-C Digital AV Multiport Adapter',
          value: 'USB-C to HDMI, USB, and USB-C',
          price: 69,
          inStock: true,
          specs: {
            'Ports': 'HDMI, USB-A, USB-C',
            'Video': '4K at 60Hz',
            'Power': 'Pass-through charging'
          }
        }
      ]
    }
  ]
};

export default function ProductConfiguratorPage() {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [totalPrice, setTotalPrice] = useState(macbookConfig.basePrice);
  const [showSpecs, setShowSpecs] = useState(false);
  const [activeSection, setActiveSection] = useState('chip');
  const [savedConfigs, setSavedConfigs] = useState<Array<{id: string; name: string; config: Record<string, string>; price: number}>>([]);

  useEffect(() => {
    // Calculate total price
    let total = macbookConfig.basePrice;
    macbookConfig.sections.forEach(section => {
      const selectedOptionId = selectedOptions[section.id];
      const option = section.options.find(opt => opt.id === selectedOptionId);
      if (option) {
        total += option.price;
      }
    });
    setTotalPrice(total);
  }, [selectedOptions]);

  const selectOption = (sectionId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [sectionId]: optionId
    }));
  };

  const getSelectedOption = (sectionId: string) => {
    const selectedId = selectedOptions[sectionId];
    const section = macbookConfig.sections.find(s => s.id === sectionId);
    return section?.options.find(opt => opt.id === selectedId);
  };

  const isConfigurationComplete = () => {
    return macbookConfig.sections
      .filter(section => section.required)
      .every(section => selectedOptions[section.id]);
  };

  const saveConfiguration = () => {
    const configName = `MacBook Pro Config ${savedConfigs.length + 1}`;
    const newConfig = {
      id: Date.now().toString(),
      name: configName,
      config: { ...selectedOptions },
      price: totalPrice
    };
    setSavedConfigs(prev => [...prev, newConfig]);
  };

  const resetConfiguration = () => {
    setSelectedOptions({});
  };

  const getEstimatedDelivery = () => {
    const hasCustomOptions = Object.values(selectedOptions).some(optionId => {
      const option = macbookConfig.sections.flatMap(s => s.options).find(o => o.id === optionId);
      return option && option.price > 0;
    });
    
    if (hasCustomOptions) {
      return '2-3 weeks';
    }
    return '3-5 business days';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Configure Your MacBook Pro</h1>
              <p className="text-gray-600">Customize every detail to match your needs perfectly</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setShowSpecs(!showSpecs)}>
                <Monitor className="h-4 w-4 mr-2" />
                {showSpecs ? 'Hide' : 'Show'} Specs
              </Button>
              <Button variant="outline" onClick={resetConfiguration}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" onClick={saveConfiguration} disabled={!isConfigurationComplete()}>
                <Save className="h-4 w-4 mr-2" />
                Save Config
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Sections */}
          <div className="lg:col-span-2 space-y-6">
            {macbookConfig.sections.map((section) => (
              <div
                key={section.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                  activeSection === section.id ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => setActiveSection(activeSection === section.id ? '' : section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${section.required ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {section.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                          <span>{section.name}</span>
                          {section.required && (
                            <span className="text-red-500 text-sm">*</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{section.description}</p>
                        {section.helpText && (
                          <p className="text-xs text-blue-600 mt-1">{section.helpText}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {selectedOptions[section.id] && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Check className="h-4 w-4" />
                          <span className="text-sm font-medium">Selected</span>
                        </div>
                      )}
                      {section.required && !selectedOptions[section.id] && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  {selectedOptions[section.id] && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {getSelectedOption(section.id)?.name}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {getSelectedOption(section.id)?.price === 0 
                            ? 'Included' 
                            : `+${formatPrice(getSelectedOption(section.id)?.price || 0)}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {activeSection === section.id && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="grid grid-cols-1 gap-4 mt-4">
                      {section.options.map((option) => (
                        <div
                          key={option.id}
                          className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedOptions[section.id] === option.id
                              ? 'border-blue-500 bg-blue-50'
                              : option.inStock
                              ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          }`}
                          onClick={() => option.inStock && selectOption(section.id, option.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {option.image && (
                                <Image
                                  src={option.image}
                                  alt={option.name}
                                  width={60}
                                  height={60}
                                  className="rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{option.name}</h4>
                                  {option.popular && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      Popular
                                    </span>
                                  )}
                                  {option.recommended && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      Recommended
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{option.value}</p>
                                {option.description && (
                                  <p className="text-xs text-gray-500 mb-2">{option.description}</p>
                                )}
                                
                                {showSpecs && option.specs && (
                                  <div className="mt-2 grid grid-cols-2 gap-2">
                                    {Object.entries(option.specs).map(([key, value]) => (
                                      <div key={key} className="text-xs">
                                        <span className="text-gray-500">{key}:</span>
                                        <span className="ml-1 font-medium">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                {option.price === 0 ? 'Included' : `+${formatPrice(option.price)}`}
                              </div>
                              {!option.inStock && (
                                <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                              )}
                            </div>
                          </div>
                          
                          {selectedOptions[section.id] === option.id && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Configuration Summary */}
          <div className="space-y-6">
            {/* Product Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="relative mx-auto mb-4" style={{ width: '200px', height: '150px' }}>
                  <Image
                    src={getSelectedOption('color')?.image || macbookConfig.image}
                    alt="MacBook Pro"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{macbookConfig.name}</h3>
                <p className="text-sm text-gray-600">{getSelectedOption('color')?.name || 'Choose a color'}</p>
              </div>

              {/* Configuration Summary */}
              <div className="space-y-3 mb-6">
                {macbookConfig.sections.map((section) => {
                  const selectedOption = getSelectedOption(section.id);
                  return (
                    <div key={section.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{section.name}:</span>
                      <span className="font-medium text-gray-900 text-right">
                        {selectedOption ? selectedOption.value : 'Not selected'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Base price:</span>
                    <span className="font-medium">{formatPrice(macbookConfig.basePrice)}</span>
                  </div>
                  {macbookConfig.sections.map((section) => {
                    const selectedOption = getSelectedOption(section.id);
                    if (!selectedOption || selectedOption.price === 0) return null;
                    return (
                      <div key={section.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{section.name}:</span>
                        <span className="font-medium">+{formatPrice(selectedOption.price)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Estimated Delivery</span>
                </div>
                <p className="text-sm text-blue-700">{getEstimatedDelivery()}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!isConfigurationComplete()}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart - {formatPrice(totalPrice)}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Configuration Progress */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Configuration Progress</span>
                  <span className="font-medium">
                    {Object.keys(selectedOptions).filter(key => 
                      macbookConfig.sections.find(s => s.id === key)?.required
                    ).length} / {macbookConfig.sections.filter(s => s.required).length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(Object.keys(selectedOptions).filter(key => 
                        macbookConfig.sections.find(s => s.id === key)?.required
                      ).length / macbookConfig.sections.filter(s => s.required).length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Saved Configurations */}
            {savedConfigs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Configurations</h3>
                <div className="space-y-3">
                  {savedConfigs.map((config) => (
                    <div key={config.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{config.name}</span>
                        <span className="text-sm font-semibold">{formatPrice(config.price)}</span>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="outline" className="text-xs">Load</Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
