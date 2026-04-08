'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { problemsApi } from '@/lib/api';
import { cn, formatDate, getPriorityBadgeColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Search } from 'lucide-react';

interface Problem {
  id: string;
  problemNumber: string;
  title: string;
  status: string;
  priority: string;
  assignee?: { fullName: string };
  createdAt: string;
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    setIsLoading(true);
    try {
      const response = await problemsApi.getAll();
      setProblems(response.data);
    } catch (error) {
      console.error('Failed to load problems:', error);
      toast.error('Failed to load problems');
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    investigating: 'bg-yellow-100 text-yellow-800',
    known_error: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div>
      <Header title="Problems" />

      <div className="p-6 space-y-6">
        {/* KEDB Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Known Errors Database (KEDB)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search known errors..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                />
              </div>
              <Button>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Problems List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Problems</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Problem
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              </div>
            ) : problems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No problems found
              </div>
            ) : (
              <div className="space-y-2">
                {problems.map((problem) => (
                  <Link
                    key={problem.id}
                    href={`/dashboard/problems/${problem.id}`}
                    className="block p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">
                            {problem.problemNumber}
                          </span>
                          <Badge className={getPriorityBadgeColor(problem.priority)}>
                            {problem.priority}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{problem.title}</h3>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={cn(statusColors[problem.status] || statusColors.new)}>
                          {problem.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(problem.createdAt)}
                        </span>
                      </div>
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
