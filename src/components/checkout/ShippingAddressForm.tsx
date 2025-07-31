'use client';

import React, { useState } from 'react';
import { User, Phone, MapPin, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCheckout, ShippingAddress } from '@/contexts/CheckoutContext';

export function ShippingAddressForm() {
  const { state, setShippingAddress, setStep } = useCheckout();
  const [formData, setFormData] = useState<ShippingAddress>(
    state.shippingAddress || {
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      phone: '',
    }
  );

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ShippingAddress]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShippingAddress(formData);
      setStep('payment');
    }
  };

  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-tfm-navy rounded-full flex items-center justify-center">
          <MapPin className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                placeholder="John"
                required
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={`pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                placeholder="Doe"
                required
              />
            </div>
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Street Address */}
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <Input
            id="street"
            name="street"
            type="text"
            value={formData.street}
            onChange={handleChange}
            className={errors.street ? 'border-red-500' : ''}
            placeholder="123 Main Street, Apt 4B"
            required
          />
          {errors.street && (
            <p className="mt-1 text-sm text-red-600">{errors.street}</p>
          )}
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <Input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              className={errors.city ? 'border-red-500' : ''}
              placeholder="New York"
              required
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tfm-navy focus:border-tfm-navy ${
                errors.state ? 'border-red-500' : ''
              }`}
              required
            >
              <option value="">Select State</option>
              {usStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code *
            </label>
            <Input
              id="zipCode"
              name="zipCode"
              type="text"
              value={formData.zipCode}
              onChange={handleChange}
              className={errors.zipCode ? 'border-red-500' : ''}
              placeholder="12345"
              required
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
            )}
          </div>
        </div>

        {/* Country and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <div className="relative">
              <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tfm-navy focus:border-tfm-navy ${
                  errors.country ? 'border-red-500' : ''
                }`}
                required
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="MX">Mexico</option>
              </select>
            </div>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="px-8 py-3 bg-tfm-navy hover:bg-tfm-navy-dark"
          >
            Continue to Payment
          </Button>
        </div>
      </form>
    </div>
  );
}
