'use client';

import React, { useState } from 'react';
import { CreditCard, Lock, Calendar, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCheckout, PaymentMethod } from '@/contexts/CheckoutContext';

export function PaymentMethodForm() {
  const { state, setPaymentMethod, setStep, setUseSameAddress } = useCheckout();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [useSameForBilling, setUseSameForBilling] = useState(state.useSameAddress);
  
  const [newCardData, setNewCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
  });

  const [errors, setErrors] = useState<Partial<typeof newCardData>>({});

  // Mock saved payment methods
  const savedMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'credit_card',
      cardNumber: '•••• •••• •••• 1234',
      expiryMonth: '12',
      expiryYear: '2026',
      cvv: '***',
      cardholderName: 'John Doe',
      isDefault: true,
    },
    {
      id: '2',
      type: 'credit_card',
      cardNumber: '•••• •••• •••• 5678',
      expiryMonth: '08',
      expiryYear: '2027',
      cvv: '***',
      cardholderName: 'John Doe',
      isDefault: false,
    },
  ];

  const handleCardDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
    }

    // Format expiry inputs
    if (name === 'expiryMonth' || name === 'expiryYear') {
      formattedValue = value.replace(/\D/g, '');
    }

    // Format CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setNewCardData(prev => ({ ...prev, [name]: formattedValue }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof newCardData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateNewCard = (): boolean => {
    const newErrors: Partial<typeof newCardData> = {};

    if (!newCardData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (newCardData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!newCardData.expiryMonth) {
      newErrors.expiryMonth = 'Month is required';
    } else if (parseInt(newCardData.expiryMonth) < 1 || parseInt(newCardData.expiryMonth) > 12) {
      newErrors.expiryMonth = 'Invalid month';
    }

    if (!newCardData.expiryYear) {
      newErrors.expiryYear = 'Year is required';
    } else if (parseInt(newCardData.expiryYear) < new Date().getFullYear()) {
      newErrors.expiryYear = 'Card has expired';
    }

    if (!newCardData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (newCardData.cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }

    if (!newCardData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let paymentMethod: PaymentMethod;

    if (showNewCardForm) {
      if (!validateNewCard()) return;

      paymentMethod = {
        id: Date.now().toString(),
        type: 'credit_card',
        cardNumber: newCardData.cardNumber,
        expiryMonth: newCardData.expiryMonth,
        expiryYear: newCardData.expiryYear,
        cvv: newCardData.cvv,
        cardholderName: newCardData.cardholderName,
        isDefault: false,
      };
    } else {
      if (!selectedMethod) {
        alert('Please select a payment method');
        return;
      }
      
      const selected = savedMethods.find(method => method.id === selectedMethod);
      if (!selected) return;
      
      paymentMethod = selected;
    }

    setPaymentMethod(paymentMethod);
    setUseSameAddress(useSameForBilling);
    setStep('review');
  };

  const getCardType = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    return 'Credit Card';
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-tfm-navy rounded-full flex items-center justify-center">
          <CreditCard className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Saved Payment Methods */}
        {!showNewCardForm && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Saved Payment Methods</h3>
            
            {savedMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === method.id
                    ? 'border-tfm-navy bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="text-tfm-navy focus:ring-tfm-navy"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {getCardType(method.cardNumber)} {method.cardNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </label>
            ))}

            <button
              type="button"
              onClick={() => setShowNewCardForm(true)}
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Payment Method
            </button>
          </div>
        )}

        {/* New Card Form */}
        {showNewCardForm && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Add New Card</h3>
              <button
                type="button"
                onClick={() => setShowNewCardForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Use Saved Method
              </button>
            </div>

            {/* Card Number */}
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Card Number *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  type="text"
                  value={newCardData.cardNumber}
                  onChange={handleCardDataChange}
                  className={`pl-10 ${errors.cardNumber ? 'border-red-500' : ''}`}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
              )}
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-2">
                  Month *
                </label>
                <select
                  id="expiryMonth"
                  name="expiryMonth"
                  value={newCardData.expiryMonth}
                  onChange={(e) => handleCardDataChange(e as any)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tfm-navy focus:border-tfm-navy ${
                    errors.expiryMonth ? 'border-red-500' : ''
                  }`}
                  required
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                {errors.expiryMonth && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiryMonth}</p>
                )}
              </div>

              <div>
                <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  id="expiryYear"
                  name="expiryYear"
                  value={newCardData.expiryYear}
                  onChange={(e) => handleCardDataChange(e as any)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tfm-navy focus:border-tfm-navy ${
                    errors.expiryYear ? 'border-red-500' : ''
                  }`}
                  required
                >
                  <option value="">YYYY</option>
                  {years.map(year => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.expiryYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiryYear}</p>
                )}
              </div>

              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                  CVV *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="cvv"
                    name="cvv"
                    type="text"
                    value={newCardData.cvv}
                    onChange={handleCardDataChange}
                    className={`pl-9 ${errors.cvv ? 'border-red-500' : ''}`}
                    placeholder="123"
                    required
                  />
                </div>
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="cardholderName"
                  name="cardholderName"
                  type="text"
                  value={newCardData.cardholderName}
                  onChange={handleCardDataChange}
                  className={`pl-10 ${errors.cardholderName ? 'border-red-500' : ''}`}
                  placeholder="John Doe"
                  required
                />
              </div>
              {errors.cardholderName && (
                <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
              )}
            </div>
          </div>
        )}

        {/* Billing Address */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useSameForBilling}
              onChange={(e) => setUseSameForBilling(e.target.checked)}
              className="rounded border-gray-300 text-tfm-navy focus:ring-tfm-navy"
            />
            <span className="ml-2 text-sm text-gray-700">
              Same as shipping address
            </span>
          </label>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep('shipping')}
          >
            Back to Shipping
          </Button>
          <Button
            type="submit"
            className="px-8 py-3 bg-tfm-navy hover:bg-tfm-navy-dark"
          >
            Review Order
          </Button>
        </div>
      </form>
    </div>
  );
}
