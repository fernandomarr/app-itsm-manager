'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket, TicketType } from '@/types';
import { Badge } from '@/components/common/Badge';
import { cn, getTicketTypeColor, getTicketStatusColor, getPriorityBadgeColor, formatDate, formatRelativeTime } from '@/lib/utils';
import { MessageSquare, AlertCircle, ClipboardList, GitBranch, Settings, ChevronRight } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  selectedType?: TicketType;
}

const typeIcons: Record<TicketType, React.ReactNode> = {
  incident: <AlertCircle className="h-3.5 w-3.5" />,
  request: <ClipboardList className="h-3.5 w-3.5" />,
  problem: <GitBranch className="h-3.5 w-3.5" />,
  change: <Settings className="h-3.5 w-3.5" />,
};

const typeLabels: Record<TicketType, string> = {
  incident: 'Incident',
  request: 'Request',
  problem: 'Problem',
  change: 'Change',
};

const typeColorMap: Record<TicketType, string> = {
  incident: 'bg-incident/10 text-incident border-incident/20',
  request: 'bg-request/10 text-request border-request/20',
  problem: 'bg-problem/10 text-problem border-problem/20',
  change: 'bg-change/10 text-change border-change/20',
};

export function TicketList({ tickets, selectedType }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-1">No tickets yet</h3>
        <p className="text-sm text-muted-foreground">Create your first ticket to get started</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {tickets.map((ticket, i) => (
        <Link
          key={ticket.id}
          href={`/dashboard/tickets/${ticket.id}`}
          className={cn(
            'flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors group',
            selectedType && ticket.type !== selectedType && 'opacity-50'
          )}
        >
          {/* Type indicator */}
          <div className={cn(
            'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
            ticket.type === 'incident' && 'bg-incident/10',
            ticket.type === 'request' && 'bg-request/10',
            ticket.type === 'problem' && 'bg-problem/10',
            ticket.type === 'change' && 'bg-change/10',
          )}>
            <span className={cn(
              ticket.type === 'incident' && 'text-incident',
              ticket.type === 'request' && 'text-request',
              ticket.type === 'problem' && 'text-problem',
              ticket.type === 'change' && 'text-change',
            )}>
              {typeIcons[ticket.type]}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs text-muted-foreground font-mono">
                {ticket.ticket_number || ticket.ticketNumber || '—'}
              </span>
              <Badge className={cn('text-[10px] px-1.5 py-0 h-4', typeColorMap[ticket.type])}>
                {typeLabels[ticket.type]}
              </Badge>
            </div>
            <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {ticket.title}
            </h3>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 shrink-0">
            <Badge className={cn('text-[10px]', getPriorityBadgeColor(ticket.priority))}>
              {ticket.priority}
            </Badge>
            <Badge className={cn('text-[10px]', getTicketStatusColor(ticket.status))}>
              {(ticket.status || '').replace('_', ' ')}
            </Badge>
            <span className="text-xs text-muted-foreground w-16 text-right hidden sm:block">
              {formatRelativeTime(ticket.created_at || ticket.createdAt || ticket.openedAt)}
            </span>
            {ticket.assignee && (
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center" title={ticket.assignee.fullName || ticket.assignee.full_name}>
                <span className="text-[10px] font-bold text-primary">
                  {(ticket.assignee.fullName || ticket.assignee.full_name || '?').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      ))}
    </div>
  );
}
