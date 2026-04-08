import { useEffect, useState, useCallback } from 'react';
import { ticketsApi } from '@/lib/api';
import { Ticket, TicketFilters, TicketStats } from '@/types';
import toast from 'react-hot-toast';

interface UseTicketsResult {
  tickets: Ticket[];
  stats: TicketStats | null;
  loading: boolean;
  total: number;
  filters: TicketFilters;
  refresh: () => Promise<void>;
  setFilters: (filters: Partial<TicketFilters>) => void;
  createTicket: (data: any) => Promise<void>;
  updateTicket: (id: string, data: any) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
}

export function useTickets(initialFilters?: TicketFilters): UseTicketsResult {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFiltersState] = useState<TicketFilters>(initialFilters || {
    page: 1,
    limit: 20,
  });

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        ticketsApi.getAll(filters),
        ticketsApi.getStats(filters.type),
      ]);
      setTickets(ticketsRes.data.data);
      setTotal(ticketsRes.data.total);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const setFilters = (newFilters: Partial<TicketFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const createTicket = async (data: any) => {
    await ticketsApi.create(data);
    await loadTickets();
  };

  const updateTicket = async (id: string, data: any) => {
    await ticketsApi.update(id, data);
    await loadTickets();
  };

  const deleteTicket = async (id: string) => {
    // TODO: Implement delete endpoint
    await loadTickets();
  };

  return {
    tickets,
    stats,
    loading,
    total,
    filters,
    refresh: loadTickets,
    setFilters,
    createTicket,
    updateTicket,
    deleteTicket,
  };
}
