'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { authStore } from '@/store/auth.store';
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
  ChevronLeft,
  LogOut,
  Moon,
  Sun,
  Headphones,
  ChevronDown,
} from 'lucide-react';

const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'All Tickets', href: '/dashboard/tickets', icon: Ticket },
];

const moduleNav = [
  { name: 'Incidents', href: '/dashboard/incidents', icon: AlertCircle, color: 'text-incident' },
  { name: 'Requests', href: '/dashboard/requests', icon: ClipboardList, color: 'text-request' },
  { name: 'Problems', href: '/dashboard/problems', icon: GitBranch, color: 'text-problem' },
  { name: 'Changes', href: '/dashboard/changes', icon: Settings, color: 'text-change' },
];

const adminNav = [
  { name: 'Service Catalog', href: '/dashboard/services', icon: Book },
  { name: 'Workflows', href: '/dashboard/workflows', icon: Workflow },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Plug },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const user = authStore((s) => s.user);
  const logout = authStore((s) => s.logout);

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('helpops-theme', next ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full border-r border-border bg-card transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[256px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-9 w-9 min-w-[36px] rounded-xl bg-primary flex items-center justify-center">
            <Headphones className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">
              Help<span className="text-primary">Ops</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all',
            collapsed && 'rotate-180'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Main */}
        <NavGroup label="Main" collapsed={collapsed}>
          {mainNav.map((item) => (
            <NavItem key={item.name} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </NavGroup>

        {/* Modules */}
        <NavGroup label="Modules" collapsed={collapsed}>
          {moduleNav.map((item) => (
            <NavItem key={item.name} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </NavGroup>

        {/* Admin */}
        <NavGroup label="Administration" collapsed={collapsed}>
          {adminNav.map((item) => (
            <NavItem key={item.name} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </NavGroup>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all',
            collapsed && 'justify-center'
          )}
        >
          {dark ? <Sun className="h-4 w-4 min-w-[16px]" /> : <Moon className="h-4 w-4 min-w-[16px]" />}
          {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User */}
        <div className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg',
          collapsed && 'justify-center'
        )}>
          <div className="h-8 w-8 min-w-[32px] rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-4 w-4 min-w-[16px]" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}

function NavGroup({ label, collapsed, children }: {
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      {!collapsed && (
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          {label}
        </div>
      )}
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}

function NavItem({ item, pathname, collapsed }: {
  item: { name: string; href: string; icon: any; color?: string };
  pathname: string | null;
  collapsed: boolean;
}) {
  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/dashboard');
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.name : undefined}
      className={cn(
        collapsed ? 'justify-center' : '',
        isActive ? 'sidebar-item-active' : 'sidebar-item'
      )}
    >
      <Icon className={cn('h-[18px] w-[18px] min-w-[18px]', isActive && item.color ? item.color : '')} />
      {!collapsed && <span>{item.name}</span>}
    </Link>
  );
}
