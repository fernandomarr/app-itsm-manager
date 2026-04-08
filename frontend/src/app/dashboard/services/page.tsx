'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { servicesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Search, Book } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  icon?: string;
  isFeatured: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const [allRes, featuredRes] = await Promise.all([
        servicesApi.getAll(),
        servicesApi.getFeatured(),
      ]);
      setServices(allRes.data);
      setFeaturedServices(featuredRes.data);
    } catch (error) {
      console.error('Failed to load services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = searchQuery
    ? services.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : services;

  return (
    <div>
      <Header
        title="Service Catalog"
        onSearch={setSearchQuery}
      />

      <div className="p-6 space-y-6">
        {/* Featured Services */}
        {!searchQuery && featuredServices.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Featured Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Book className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{service.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {service.shortDescription || service.description.slice(0, 100)}
                    </p>
                    <Button className="w-full mt-4" variant="outline" size="sm">
                      Request Service
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Services */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {searchQuery ? `Search Results (${filteredServices.length})` : 'All Services'}
          </h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No services found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Book className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{service.name}</CardTitle>
                        {service.isFeatured && (
                          <Badge className="mt-1">Featured</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                    <Button className="w-full mt-4" variant="outline" size="sm">
                      Request Service
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add Badge import
import { Badge } from '@/components/common/Badge';
