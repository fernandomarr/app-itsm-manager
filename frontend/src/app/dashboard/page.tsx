'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { TicketList } from '@/components/tickets/TicketList';
import { CreateTicketDialog } from '@/components/tickets/CreateTicketDialog';
import { ticketsApi } from '@/lib/api';
import { Ticket, TicketStats } from '@/types';
import {
  AlertCircle,
  ClipboardList,
  GitBranch,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

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
      <div>
        <Header title="Dashboard" />
        <div className="p-6 space-y-6">
          {/* Skeleton KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-5">
                <div className="skeleton h-4 w-20 mb-3" />
                <div className="skeleton h-8 w-16 mb-2" />
                <div className="skeleton h-3 w-24" />
              </div>
            ))}
          </div>
          {/* Skeleton modules */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="skeleton h-10 w-10 rounded-lg" />
                  <div>
                    <div className="skeleton h-3 w-16 mb-2" />
                    <div className="skeleton h-5 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Skeleton table */}
          <div className="card p-6">
            <div className="skeleton h-5 w-32 mb-6" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      name: 'Open Tickets',
      value: stats?.total || 0,
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
      trend: '+12%',
      trendUp: true,
    },
    {
      name: 'Overdue',
      value: stats?.overdue || 0,
      icon: Clock,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      trend: '-5%',
      trendUp: false,
    },
    {
      name: 'Resolved Today',
      value: stats?.byStatus?.resolved || 0,
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10',
      trend: '+23%',
      trendUp: true,
    },
    {
      name: 'In Progress',
      value: stats?.byStatus?.in_progress || 0,
      icon: AlertTriangle,
      color: 'text-warning',
      bg: 'bg-warning/10',
      trend: '+8%',
      trendUp: true,
    },
  ];

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Overview of your IT service operations"
        onCreate={() => setShowCreateDialog(true)}
        createLabel="New Ticket"
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.name} className={`card p-5 animate-fade-in stagger-${i + 1}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.name}</p>
                    <p className="text-3xl font-bold mt-1 tracking-tight">{kpi.value}</p>
                    <div className={cn(
                      'metric-trend mt-2',
                      kpi.trendUp ? 'metric-trend-up' : 'metric-trend-down'
                    )}>
                      {kpi.trendUp ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      {kpi.trend} vs last week
                    </div>
                  </div>
                  <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center', kpi.bg)}>
                    <Icon className={cn('h-5 w-5', kpi.color)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Module Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/dashboard/incidents">
            <div className="card-hover p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-incident/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-incident" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Incidents</p>
                <p className="text-lg font-semibold">{stats?.byStatus?.new || 0} open</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/requests">
            <div className="card-hover p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-request/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-request" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requests</p>
                <p className="text-lg font-semibold">{stats?.byPriority?.low || 0} pending</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/problems">
            <div className="card-hover p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-problem/10 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-problem" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Problems</p>
                <p className="text-lg font-semibold">Active</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/changes">
            <div className="card-hover p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-change/10 flex items-center justify-center">
                <Settings className="h-5 w-5 text-change" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Changes</p>
                <p className="text-lg font-semibold">Scheduled</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'New Incident', icon: AlertCircle, color: 'text-incident hover:bg-incident/10' },
            { label: 'New Request', icon: ClipboardList, color: 'text-request hover:bg-request/10' },
            { label: 'New Problem', icon: GitBranch, color: 'text-problem hover:bg-problem/10' },
            { label: 'New Change', icon: Settings, color: 'text-change hover:bg-change/10' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => setShowCreateDialog(true)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium transition-all',
                  action.color
                )}
              >
                <Plus className="h-4 w-4" />
                {action.label}
              </button>
            );
          })}
        </div>

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Tickets</CardTitle>
              <Link href="/dashboard/tickets" className="text-sm text-primary hover:underline font-medium">
                View all →
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
