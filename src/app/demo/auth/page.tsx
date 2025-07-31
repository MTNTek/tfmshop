'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { UserMenu } from '@/components/auth/UserMenu';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, Crown, Settings } from 'lucide-react';

export default function AuthDemoPage() {
  const { state, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'login' | 'signup'>('login');

  if (state.user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Authentication Demo</h1>
            <p className="text-lg text-gray-600">Authentication system is working! You are logged in.</p>
          </div>

          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-20 h-20 bg-tfm-navy rounded-full flex items-center justify-center">
                {state.user.avatar ? (
                  <img 
                    src={state.user.avatar} 
                    alt={state.user.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{state.user.name}</h2>
                <div className="flex items-center space-x-2 text-gray-600 mt-1">
                  <Mail className="h-4 w-4" />
                  <span>{state.user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {state.user.joinDate}</span>
                </div>
              </div>
              {state.user.isPrime && (
                <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm font-medium">Prime Member</span>
                </div>
              )}
            </div>

            {/* User Preferences */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                User Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Currency</div>
                  <div className="font-medium">{state.user.preferences.currency}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Language</div>
                  <div className="font-medium">{state.user.preferences.language}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Notifications</div>
                  <div className="font-medium">
                    {state.user.preferences.notifications ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <Button
                onClick={logout}
                variant="outline"
                className="flex-1"
              >
                Sign Out
              </Button>
              <Button className="flex-1 bg-tfm-navy hover:bg-tfm-navy-dark">
                Update Profile
              </Button>
            </div>
          </div>

          {/* Demo UserMenu Component */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">UserMenu Component Demo</h3>
            <p className="text-gray-600 mb-6">
              This is how the UserMenu component appears in the header when you're logged in:
            </p>
            <div className="bg-tfm-navy p-4 rounded-lg inline-block">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Authentication Demo</h1>
          <p className="text-lg text-gray-600">Test the login and signup functionality</p>
        </div>

        {/* Auth Forms */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'login'
                  ? 'border-b-2 border-tfm-navy text-tfm-navy bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'border-b-2 border-tfm-navy text-tfm-navy bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {activeTab === 'login' ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In to Your Account</h2>
                  <p className="text-gray-600">Enter your credentials to access your account</p>
                </div>
                <LoginForm />
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Account</h2>
                  <p className="text-gray-600">Join TFMshop and start shopping today</p>
                </div>
                <SignupForm />
              </div>
            )}
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Demo Instructions</h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>Login with demo account:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Email: demo@tfmshop.com</li>
              <li>Password: demo123</li>
            </ul>
            <p className="mt-4"><strong>Or create a new account:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Fill out the signup form with your details</li>
              <li>Account will be created instantly (demo mode)</li>
              <li>You'll be automatically logged in after signup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
