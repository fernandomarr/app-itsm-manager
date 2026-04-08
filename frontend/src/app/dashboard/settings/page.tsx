'use client';

import React, { useState } from 'react';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { authStore } from '@/store/auth.store';
import { usersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Building, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  const user = authStore((state) => state.user);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await usersApi.updateMe({ fullName: formData.fullName });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const settingsSections = [
    {
      icon: User,
      title: 'Profile Settings',
      description: 'Manage your personal information',
      content: (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      ),
    },
    {
      icon: Building,
      title: 'Organization Settings',
      description: 'Manage your organization settings',
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Organization settings will be available soon.
            </p>
          </div>
          <Button variant="outline" disabled>
            Manage Organization
          </Button>
        </div>
      ),
    },
    {
      icon: Bell,
      title: 'Notification Settings',
      description: 'Configure how you receive notifications',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Ticket Assignments</p>
              <p className="text-sm text-muted-foreground">
                Get notified when assigned to a ticket
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SLA Breaches</p>
              <p className="text-sm text-muted-foreground">
                Get alerted when SLA is about to breach
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>
        </div>
      ),
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Manage your security settings',
      content: (
        <div className="space-y-4">
          <Button variant="outline">
            Change Password
          </Button>
          <Button variant="outline">
            Enable Two-Factor Authentication
          </Button>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Active Sessions
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Current Session</span>
                <span className="text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customize the look and feel',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                Toggle dark theme
              </p>
            </div>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compact View</p>
              <p className="text-sm text-muted-foreground">
                Show more items on screen
              </p>
            </div>
            <input type="checkbox" className="h-4 w-4" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header title="Settings" />

      <div className="p-6 space-y-6">
        {settingsSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {section.content}
            </CardContent>
          </Card>
        ))}

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions related to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">
              Delete Account
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
