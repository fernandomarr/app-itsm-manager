'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/common/Header';
import { TicketList } from '@/components/tickets/TicketList';
import { incidentsApi, ticketsApi } from '@/lib/api';
import { Ticket } from '@/types';
import toast from 'react-hot-toast';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [incidentsRes, statsRes] = await Promise.all([
        ticketsApi.getAll({ type: 'incident', limit: 50 }),
        incidentsApi.getStats(),
      ]);
      setIncidents(incidentsRes.data.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load incidents:', error);
      toast.error('Failed to load incidents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIncident = async (data: any) => {
    await incidentsApi.create(data);
    toast.success('Incident created successfully');
    loadData();
  };

  return (
    <div>
      <Header
        title="Incidents"
        onCreate={() => {/* TODO: Open create dialog */}}
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total || 0}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-bold">{stats.byStatus?.new || 0}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{stats.byStatus?.in_progress || 0}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-red-500">{stats.overdue || 0}</p>
            </div>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading incidents...</p>
          </div>
        ) : (
          <TicketList tickets={incidents} selectedType="incident" />
        )}
      </div>
    </div>
  );
}
