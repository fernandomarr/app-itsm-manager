'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { changesApi } from '@/lib/api';
import { cn, formatDate, getChangeTypeColor, getChangeStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Calendar } from 'lucide-react';

interface Change {
  id: string;
  changeNumber: string;
  title: string;
  type: string;
  status: string;
  risk: string;
  plannedStartAt?: string;
  assignee?: { fullName: string };
  createdAt: string;
}

export default function ChangesPage() {
  const [changes, setChanges] = useState<Change[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChanges();
  }, []);

  const loadChanges = async () => {
    setIsLoading(true);
    try {
      const response = await changesApi.getAll();
      setChanges(response.data);
    } catch (error) {
      console.error('Failed to load changes:', error);
      toast.error('Failed to load changes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header title="Change Management" />

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Total Changes</p>
            <p className="text-2xl font-bold">{changes.length}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Scheduled</p>
            <p className="text-2xl font-bold">
              {changes.filter((c) => c.status === 'scheduled').length}
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold">
              {changes.filter((c) => c.status === 'implementing').length}
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Pending CAB</p>
            <p className="text-2xl font-bold">
              {changes.filter((c) => c.status === 'assessing').length}
            </p>
          </div>
        </div>

        {/* Calendar Link */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Change Calendar</CardTitle>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Changes List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Changes</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Change
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              </div>
            ) : changes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No changes found
              </div>
            ) : (
              <div className="space-y-2">
                {changes.map((change) => (
                  <Link
                    key={change.id}
                    href={`/dashboard/changes/${change.id}`}
                    className="block p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">
                            {change.changeNumber}
                          </span>
                          <Badge className={cn('text-xs', getChangeTypeColor(change.type))}>
                            {change.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {change.risk} risk
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{change.title}</h3>
                        {change.plannedStartAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Planned: {formatDate(change.plannedStartAt)}
                          </p>
                        )}
                      </div>
                      <Badge className={cn('text-sm', getChangeStatusColor(change.status))}>
                        {change.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
