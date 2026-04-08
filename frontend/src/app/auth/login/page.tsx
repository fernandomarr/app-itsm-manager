'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { authStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { ArrowLeft, Sparkles, Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.signIn(formData);
      authStore.getState().setAuth(response.data.user, response.data.accessToken);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to home</span>
      </Link>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-info mb-4 animate-float shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Welcome back</span>
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue to your ITSM account
          </p>
        </div>

        {/* Form Card */}
        <div className="card-glow p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="label flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  icon={<Mail className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="label flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  icon={<Lock className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign up
            </Link>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link href="/forgot-password" className="hover:text-foreground transition-colors">
            Forgot password?
          </Link>
          <span>•</span>
          <Link href="/help" className="hover:text-foreground transition-colors">
            Need help?
          </Link>
        </div>
      </div>
    </div>
  );
}

// Input component with icon
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

function Input({ icon, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      <input
        className={`input ${icon ? 'pl-11' : ''} ${className || ''}`}
        {...props}
      />
    </div>
  );
}
