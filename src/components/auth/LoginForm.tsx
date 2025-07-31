'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectPath?: string;
}

export function LoginForm({ onSuccess, redirectPath }: LoginFormProps) {
  const { state, login, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData.email, formData.password);
      onSuccess?.();
      
      if (redirectPath) {
        window.location.href = redirectPath;
      }
    } catch (error) {
      // Error is handled by the context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isValid = formData.email && formData.password;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600 mt-2">Welcome back to TFMshop</p>
        </div>

        {state.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">{state.error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-tfm-navy focus:ring-tfm-navy"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-tfm-navy hover:text-tfm-navy-dark">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={!isValid || state.isLoading}
            className="w-full bg-tfm-navy hover:bg-tfm-navy-dark disabled:opacity-50"
          >
            {state.isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to TFMshop?</span>
            </div>
          </div>
          
          <Link href="/signup">
            <Button variant="outline" className="w-full mt-4">
              Create Account
            </Button>
          </Link>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials</h3>
          <div className="text-xs text-blue-800 space-y-1">
            <div><strong>Email:</strong> demo@tfmshop.com</div>
            <div><strong>Password:</strong> demo123</div>
            <button
              type="button"
              onClick={() => {
                setFormData({ email: 'demo@tfmshop.com', password: 'demo123' });
              }}
              className="text-blue-600 hover:text-blue-800 underline mt-2"
            >
              Use Demo Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
