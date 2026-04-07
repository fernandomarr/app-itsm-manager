'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/common/Header';
import { TicketList } from '@/components/tickets/TicketList';
import { CreateTicketDialog } from '@/components/tickets/CreateTicketDialog';
import { ticketsApi } from '@/lib/api';
import { Ticket, TicketType } from '@/types';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Input } from '@/components/common/Input';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const typeTabs = [
  { value: 'all', label: 'All' },
  { value: 'incident', label: 'Incidents' },
  { value: 'request', label: 'Requests' },
  { value: 'problem', label: 'Problems' },
  { value: 'change', label: 'Changes' },
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [selectedType]);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 50 };
      if (selectedType !== 'all') {
        params.type = selectedType;
      }
      const response = await ticketsApi.getAll(params);
      setTickets(response.data.data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (data: any) => {
    await ticketsApi.create(data);
    toast.success('Ticket created successfully');
    loadTickets();
  };

  const filteredTickets = searchQuery
    ? tickets.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tickets;

  return (
    <div>
      <Header
        title="Tickets"
        onCreate={() => setShowCreateDialog(true)}
        onSearch={setSearchQuery}
      />

      <div className="p-6 space-y-6">
        {/* Type Tabs */}
        <div className="flex items-center gap-2 border-b">
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                selectedType === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select className="w-40">
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </Select>

          <Select className="w-40">
            <option value="">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>

          <div className="flex-1" />
        </div>

        {/* Ticket List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading tickets...</p>
          </div>
        ) : (
          <TicketList tickets={filteredTickets} selectedType={selectedType as TicketType} />
        )}
      </div>

      <CreateTicketDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}
