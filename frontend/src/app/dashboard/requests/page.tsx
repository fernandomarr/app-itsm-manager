'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/common/Header';
import { TicketList } from '@/components/tickets/TicketList';
import { requestsApi, ticketsApi } from '@/lib/api';
import { Ticket } from '@/types';
import toast from 'react-hot-toast';

export default function RequestsPage() {
  const [requests, setRequests] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [requestsRes, statsRes] = await Promise.all([
        ticketsApi.getAll({ type: 'request', limit: 50 }),
        requestsApi.getStats(),
      ]);
      setRequests(requestsRes.data.data);
    } catch (error) {
      console.error('Failed to load requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async (data: any) => {
    await requestsApi.create(data);
    toast.success('Request created successfully');
    loadData();
  };

  return (
    <div>
      <Header title="Service Requests" />

      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading requests...</p>
          </div>
        ) : (
          <TicketList tickets={requests} selectedType="request" />
        )}
      </div>
    </div>
  );
}
