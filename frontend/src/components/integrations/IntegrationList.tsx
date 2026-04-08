'use client';

import React from 'react';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Plug, Trash2, Edit, TestTube } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  lastSyncAt?: string;
}

interface IntegrationListProps {
  integrations: Integration[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTest?: (id: string) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  webhook: <Plug className="h-5 w-5" />,
  rest_api: <Plug className="h-5 w-5" />,
  oauth: <Plug className="h-5 w-5" />,
  custom: <Plug className="h-5 w-5" />,
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800',
};

export function IntegrationList({
  integrations,
  onEdit,
  onDelete,
  onTest,
}: IntegrationListProps) {
  if (integrations.length === 0) {
    return (
      <div className="text-center py-12">
        <Plug className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-semibold">No integrations</h3>
        <p className="text-muted-foreground">Connect external systems to extend functionality</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {typeIcons[integration.type] || <Plug className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-semibold">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {integration.type.replace('_', ' ')}
                  </p>
                  {integration.lastSyncAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={statusColors[integration.status] || statusColors.inactive}>
                  {integration.status}
                </Badge>

                {onTest && (
                  <Button variant="ghost" size="icon" onClick={() => onTest(integration.id)}>
                    <TestTube className="h-4 w-4" />
                  </Button>
                )}

                {onEdit && (
                  <Button variant="ghost" size="icon" onClick={() => onEdit(integration.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(integration.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
