'use client';

import React, { useState } from 'react';
import { TicketType } from '@/types';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { Card, CardContent } from '@/components/common/Card';
import { X } from 'lucide-react';

interface CreateTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTicketFormData) => Promise<void>;
}

interface CreateTicketFormData {
  type: TicketType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  assigneeId?: string;
}

const typeOptions = [
  { value: 'incident', label: 'Incident', description: 'An unplanned interruption or reduction in quality' },
  { value: 'request', label: 'Request', description: 'A request for information, advice, or access' },
  { value: 'problem', label: 'Problem', description: 'The cause of one or more incidents' },
  { value: 'change', label: 'Change', labelShort: 'Change', description: 'Addition, modification, or removal of anything' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const impactOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const urgencyOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function CreateTicketDialog({ isOpen, onClose, onSubmit }: CreateTicketDialogProps) {
  const [formData, setFormData] = useState<CreateTicketFormData>({
    type: 'incident',
    title: '',
    description: '',
    priority: 'medium',
    impact: 'medium',
    urgency: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        type: 'incident',
        title: '',
        description: '',
        priority: 'medium',
        impact: 'medium',
        urgency: 'medium',
      });
    } catch (error) {
      console.error('Failed to create ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Ticket</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            {/* Ticket Type */}
            <div className="grid grid-cols-2 gap-3">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: option.value as TicketType })}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    formData.type === option.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent'
                  }`}
                >
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                </button>
              ))}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief summary of the issue"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about the issue..."
                rows={5}
                required
              />
            </div>

            {/* Priority, Impact, Urgency */}
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>

              <Select
                label="Impact"
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value as any })}
              >
                {impactOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>

              <Select
                label="Urgency"
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
              >
                {urgencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>
          </CardContent>

          <div className="flex justify-end gap-3 p-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.title || !formData.description}>
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
