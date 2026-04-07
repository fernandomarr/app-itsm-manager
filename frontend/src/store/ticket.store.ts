import { create } from 'zustand';
import { Ticket, TicketStats, TicketFilters } from '@/types';
import { ticketsApi } from '@/lib/api';

interface TicketState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  stats: TicketStats | null;
  loading: boolean;
  total: number;
  filters: TicketFilters;

  // Actions
  fetchTickets: (filters?: TicketFilters) => Promise<void>;
  fetchTicketById: (id: string) => Promise<void>;
  createTicket: (data: any) => Promise<Ticket>;
  updateTicket: (id: string, data: any) => Promise<Ticket>;
  transitionTicket: (id: string, toStatus: string) => Promise<Ticket>;
  addComment: (id: string, content: string, visibility?: 'public' | 'internal') => Promise<void>;
  fetchStats: (type?: string) => Promise<void>;
  setFilters: (filters: Partial<TicketFilters>) => void;
  clearSelectedTicket: () => void;
}

export const ticketStore = create<TicketState>((set, get) => ({
  tickets: [],
  selectedTicket: null,
  stats: null,
  loading: false,
  total: 0,
  filters: {
    page: 1,
    limit: 20,
  },

  fetchTickets: async (filters) => {
    set({ loading: true });
    try {
      const mergedFilters = { ...get().filters, ...filters };
      const response = await ticketsApi.getAll(mergedFilters);
      set({
        tickets: response.data.data,
        total: response.data.total,
        filters: mergedFilters,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      set({ loading: false });
      throw error;
    }
  },

  fetchTicketById: async (id) => {
    set({ loading: true });
    try {
      const response = await ticketsApi.getById(id);
      set({ selectedTicket: response.data, loading: false });
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      set({ loading: false });
      throw error;
    }
  },

  createTicket: async (data) => {
    const response = await ticketsApi.create(data);
    // Refresh tickets list
    get().fetchTickets();
    return response.data;
  },

  updateTicket: async (id, data) => {
    const response = await ticketsApi.update(id, data);
    // Update selected ticket
    set((state) => ({
      selectedTicket: state.selectedTicket?.id === id ? response.data : state.selectedTicket,
    }));
    // Refresh tickets list
    get().fetchTickets();
    return response.data;
  },

  transitionTicket: async (id, toStatus) => {
    const response = await ticketsApi.transition(id, toStatus);
    // Update selected ticket
    set((state) => ({
      selectedTicket: state.selectedTicket?.id === id ? response.data : state.selectedTicket,
    }));
    // Refresh tickets list
    get().fetchTickets();
    return response.data;
  },

  addComment: async (id, content, visibility) => {
    await ticketsApi.addComment(id, { content, visibility });
    // Refresh selected ticket to get new comment
    get().fetchTicketById(id);
  },

  fetchStats: async (type) => {
    const response = await ticketsApi.getStats(type);
    set({ stats: response.data });
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  clearSelectedTicket: () => {
    set({ selectedTicket: null });
  },
}));
