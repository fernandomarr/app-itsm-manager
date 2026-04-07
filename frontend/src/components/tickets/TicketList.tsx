'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket, TicketType, TicketPriority } from '@/types';
import { Badge } from '@/components/common/Badge';
import { cn, getTicketTypeColor, getTicketStatusColor, getPriorityBadgeColor, formatDate } from '@/lib/utils';
import { MessageSquare, AlertCircle, ClipboardList, GitBranch, Settings } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  selectedType?: TicketType;
}

const typeIcons: Record<TicketType, React.ReactNode> = {
  incident: <AlertCircle className="h-4 w-4" />,
  request: <ClipboardList className="h-4 w-4" />,
  problem: <GitBranch className="h-4 w-4" />,
  change: <Settings className="h-4 w-4" />,
};

const typeLabels: Record<TicketType, string> = {
  incident: 'Incident',
  request: 'Request',
  problem: 'Problem',
  change: 'Change',
};

export function TicketList({ tickets, selectedType }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-semibold">No tickets found</h3>
        <p className="text-muted-foreground">Create a new ticket to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tickets.map((ticket) => (
        <Link
          key={ticket.id}
          href={`/dashboard/tickets/${ticket.id}`}
          className={cn(
            'block p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
            selectedType && ticket.type !== selectedType && 'opacity-60'
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', getTicketTypeColor(ticket.type))}>
                  {typeIcons[ticket.type]}
                  {typeLabels[ticket.type]}
                </span>
                <span className="text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                <Badge className={getPriorityBadgeColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </div>
              <h3 className="font-semibold truncate">{ticket.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {ticket.description}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 min-w-fit">
              <Badge className={getTicketStatusColor(ticket.status)}>
                {ticket.status.replace('_', ' ')}
              </Badge>
              <div className="text-xs text-muted-foreground">
                {formatDate(ticket.openedAt)}
              </div>
              {ticket.assignee && (
                <div className="flex items-center gap-1 text-xs">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {ticket.assignee.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
