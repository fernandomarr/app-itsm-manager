'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { authStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { ArrowLeft, Sparkles, Mail, Lock, User, Building2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    tenantSlug: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.signUp(formData);
      authStore.getState().setAuth(response.data.user, response.data.accessToken);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create account');
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-info mb-4 animate-float shadow-lg" style={{ '--tw-shadow': '0 0 40px hsl(263 70% 60% / 0.5)' } as React.CSSProperties}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Create an account</span>
          </h1>
          <p className="text-muted-foreground">
            Start your journey with our ITSM Platform
          </p>
        </div>

        {/* Form Card */}
        <div className="card-glow p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="label flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Full Name
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  required
                  icon={<User className="w-4 h-4" />}
                />
              </div>
            </div>

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
                  minLength={8}
                  required
                  icon={<Lock className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Organization Slug */}
            <div className="space-y-2">
              <label className="label flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Organization Slug
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.tenantSlug}
                  onChange={(e) => setFormData({ ...formData, tenantSlug: e.target.value })}
                  placeholder="my-company"
                  required
                  icon={<Building2 className="w-4 h-4" />}
                />
              </div>
              <p className="text-xs text-muted-foreground/70">
                A unique identifier for your organization
              </p>
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
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
