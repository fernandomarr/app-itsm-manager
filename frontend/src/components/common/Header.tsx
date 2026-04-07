'use client';

import React from 'react';
import { Bell, Search, Plus, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';

interface HeaderProps {
  title: string;
  onCreate?: () => void;
  onSearch?: (query: string) => void;
}

export function Header({ title, onCreate, onSearch }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <h1 className="text-lg font-semibold">{title}</h1>

        <div className="flex-1" />

        {/* Search */}
        {onSearch && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onCreate && (
            <Button onClick={onCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          )}

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              3
            </Badge>
          </Button>

          <Button variant="ghost" size="icon">
            <Moon className="h-5 w-5 dark:hidden" />
            <Sun className="h-5 w-5 hidden dark:block" />
          </Button>
        </div>
      </div>
    </header>
  );
}
