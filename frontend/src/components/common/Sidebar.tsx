'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Ticket,
  AlertCircle,
  ClipboardList,
  GitBranch,
  Settings,
  Workflow,
  Bell,
  Plug,
  Book,
  Users,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'All Tickets', href: '/dashboard/tickets', icon: Ticket },
  { name: 'Incidents', href: '/dashboard/incidents', icon: AlertCircle },
  { name: 'Requests', href: '/dashboard/requests', icon: ClipboardList },
  { name: 'Problems', href: '/dashboard/problems', icon: GitBranch },
  { name: 'Changes', href: '/dashboard/changes', icon: Settings },
  { name: 'Service Catalog', href: '/dashboard/services', icon: Book },
  { name: 'Workflows', href: '/dashboard/workflows', icon: Workflow },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Plug },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-64 border-r bg-card">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">ITSM Platform</h1>
        <p className="text-xs text-muted-foreground mt-1">Service Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">User</p>
            <p className="text-xs text-muted-foreground truncate">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
