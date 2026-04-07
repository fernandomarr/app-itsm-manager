'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { TicketDetail } from '@/components/tickets/TicketDetail';
import { ticketsApi } from '@/lib/api';
import { Ticket, TicketComment, TicketStatus } from '@/types';
import toast from 'react-hot-toast';

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTicket();
  }, [resolvedParams.id]);

  const loadTicket = async () => {
    setIsLoading(true);
    try {
      const [ticketResponse, commentsResponse] = await Promise.all([
        ticketsApi.getById(resolvedParams.id),
        ticketsApi.getComments(resolvedParams.id),
      ]);
      setTicket(ticketResponse.data);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error('Failed to load ticket:', error);
      toast.error('Failed to load ticket');
      router.push('/dashboard/tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransition = async (status: TicketStatus) => {
    try {
      await ticketsApi.transition(resolvedParams.id, status);
      toast.success(`Ticket transitioned to ${status}`);
      loadTicket();
    } catch (error) {
      console.error('Failed to transition ticket:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const handleAddComment = async (content: string, visibility: 'public' | 'internal') => {
    try {
      await ticketsApi.addComment(resolvedParams.id, { content, visibility });
      toast.success('Comment added');
      loadTicket();
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  if (isLoading || !ticket) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading ticket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <TicketDetail
        ticket={ticket}
        comments={comments}
        onBack={() => router.push('/dashboard/tickets')}
        onTransition={handleTransition}
        onAddComment={handleAddComment}
      />
    </div>
  );
}
