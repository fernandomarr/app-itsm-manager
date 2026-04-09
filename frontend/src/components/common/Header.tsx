'use client';

import React from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onCreate?: () => void;
  createLabel?: string;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, onCreate, createLabel = 'New', onSearch, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        {/* Search */}
        {onSearch && (
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="input pl-9 h-9 text-sm"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}

        {/* Custom actions */}
        {actions}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onCreate && (
            <Button onClick={onCreate} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              {createLabel}
            </Button>
          )}

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
