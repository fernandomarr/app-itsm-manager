'use client';

import React, { useState } from 'react';
import { Ticket, TicketComment, TicketStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { cn, getTicketTypeColor, getTicketStatusColor, getPriorityBadgeColor, formatDate } from '@/lib/utils';
import { ArrowLeft, MessageSquare, Clock, User, Tag } from 'lucide-react';

interface TicketDetailProps {
  ticket: Ticket;
  comments: TicketComment[];
  onBack: () => void;
  onTransition: (status: TicketStatus) => Promise<void>;
  onAddComment: (content: string, visibility: 'public' | 'internal') => Promise<void>;
}

const statusOptions: TicketStatus[] = ['new', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled'];

export function TicketDetail({
  ticket,
  comments,
  onBack,
  onTransition,
  onAddComment,
}: TicketDetailProps) {
  const [commentContent, setCommentContent] = useState('');
  const [commentVisibility, setCommentVisibility] = useState<'public' | 'internal'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!commentContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(commentContent, commentVisibility);
      setCommentContent('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransition = async (status: TicketStatus) => {
    try {
      await onTransition(status);
    } catch (error) {
      console.error('Failed to transition ticket:', error);
    }
  };

  const availableTransitions = statusOptions.filter(
    (status) => status !== ticket.status
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', getTicketTypeColor(ticket.type))}>
                {ticket.type.toUpperCase()}
              </span>
              <span className="text-sm text-muted-foreground">{ticket.ticketNumber}</span>
            </div>
            <h1 className="text-2xl font-bold">{ticket.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn('text-sm', getTicketStatusColor(ticket.status))}>
            {ticket.status.replace('_', ' ')}
          </Badge>
          <Badge className={cn('text-sm', getPriorityBadgeColor(ticket.priority))}>
            {ticket.priority} priority
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Activity ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={cn(
                    'p-4 rounded-lg border',
                    comment.visibility === 'internal' && 'bg-muted'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {comment.author.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{comment.author.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                    {comment.visibility === 'internal' && (
                      <Badge variant="secondary">Internal</Badge>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}

              {/* Add Comment */}
              <div className="border-t pt-4 mt-4">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="mb-2"
                />
                <div className="flex items-center justify-between">
                  <Select
                    value={commentVisibility}
                    onChange={(e) => setCommentVisibility(e.target.value as 'public' | 'internal')}
                    className="w-auto"
                  >
                    <option value="public">Public</option>
                    <option value="internal">Internal</option>
                  </Select>
                  <Button onClick={handleAddComment} disabled={isSubmitting || !commentContent.trim()}>
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Status Transition */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Change Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableTransitions.map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleTransition(status)}
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reporter:</span>
                <span>{ticket.reporter.fullName}</span>
              </div>
              {ticket.assignee && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Assignee:</span>
                  <span>{ticket.assignee.fullName}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(ticket.openedAt)}</span>
              </div>
              {ticket.resolvedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Resolved:</span>
                  <span>{formatDate(ticket.resolvedAt)}</span>
                </div>
              )}
              {ticket.tags && ticket.tags.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {ticket.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
