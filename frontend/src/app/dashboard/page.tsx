'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { TicketList } from '@/components/tickets/TicketList';
import { CreateTicketDialog } from '@/components/tickets/CreateTicketDialog';
import { ticketsApi, incidentsApi, requestsApi } from '@/lib/api';
import { Ticket, TicketStats } from '@/types';
import { AlertCircle, ClipboardList, GitBranch, Settings, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const statCards = [
  { name: 'Open Tickets', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Overdue', icon: Clock, color: 'text-red-500', bg: 'bg-red-500/10' },
  { name: 'Resolved Today', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  { name: 'Pending Approval', icon: Settings, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsResponse, ticketsResponse] = await Promise.all([
        ticketsApi.getStats(),
        ticketsApi.getAll({ limit: 10 }),
      ]);
      setStats(statsResponse.data);
      setRecentTickets(ticketsResponse.data.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (data: any) => {
    await ticketsApi.create(data);
    toast.success('Ticket created successfully');
    loadDashboardData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Dashboard"
        onCreate={() => setShowCreateDialog(true)}
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                    <p className="text-2xl font-bold mt-1">
                      {stat.name === 'Open Tickets' ? stats?.total || 0 :
                       stat.name === 'Overdue' ? stats?.overdue || 0 : '0'}
                    </p>
                  </div>
                  <div className={cn('h-12 w-12 rounded-full flex items-center justify-center', stat.bg)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Type Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/dashboard/incidents">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-incident/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-incident" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Incidents</p>
                  <p className="text-lg font-semibold">
                    {stats?.byStatus?.new || 0} open
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/requests">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-request/10 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-request" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requests</p>
                  <p className="text-lg font-semibold">
                    {stats?.byPriority?.low || 0} pending
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/problems">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-problem/10 flex items-center justify-center">
                  <GitBranch className="h-6 w-6 text-problem" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Problems</p>
                  <p className="text-lg font-semibold">Active</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/changes">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-change/10 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-change" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Changes</p>
                  <p className="text-lg font-semibold">Scheduled</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Tickets</CardTitle>
              <Link href="/dashboard/tickets" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <TicketList tickets={recentTickets} />
          </CardContent>
        </Card>
      </div>

      <CreateTicketDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}
