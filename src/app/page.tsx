
"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Search as SearchIcon } from 'lucide-react';
import ListingCard, { type Listing } from '@/components/listings/ListingCard';

// Placeholder data for listings
const placeholderListings: Listing[] = [
  {
    id: '1',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'modern villa',
    title: 'Charming Cottage in the Woods',
    location: 'Aspen, Colorado',
    rating: 4.8,
    pricePerNight: 250,
    currency: '$',
  },
  {
    id: '2',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'beach house',
    title: 'Sunny Beachfront Paradise',
    location: 'Malibu, California',
    rating: 4.9,
    pricePerNight: 500,
    currency: '$',
  },
  {
    id: '3',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'city apartment',
    title: 'Modern Loft in City Center',
    location: 'New York, New York',
    rating: 4.7,
    pricePerNight: 350,
    currency: '$',
  },
  {
    id: '4',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'vineyard estate',
    title: 'Vineyard Retreat with Valley Views',
    location: 'Napa, California',
    rating: 4.9,
    pricePerNight: 600,
    currency: '$',
  },
   {
    id: '5',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'tiny home',
    title: 'Cozy Tiny Home Getaway',
    location: 'Portland, Oregon',
    rating: 4.6,
    pricePerNight: 120,
    currency: '$',
  },
  {
    id: '6',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'mountain cabin',
    title: 'Rustic Mountain Cabin Escape',
    location: 'Lake Tahoe, California',
    rating: 4.7,
    pricePerNight: 280,
    currency: '$',
  },
];

const topLevelCategories = [
  { value: "all", label: "All Stays" },
  { value: "homes", label: "Try homes" },
  { value: "vineyards", label: "Vineyards" },
  { value: "tiny_homes", label: "Tiny homes" },
  { value: "cabins", label: "Cabins" },
];


export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredListings = placeholderListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'homes') return matchesSearch && (listing.imageHint?.includes('villa') || listing.imageHint?.includes('house') || listing.imageHint?.includes('apartment'));
    if (activeTab === 'vineyards') return matchesSearch && listing.imageHint?.includes('vineyard');
    if (activeTab === 'tiny_homes') return matchesSearch && listing.imageHint?.includes('tiny home');
    if (activeTab === 'cabins') return matchesSearch && listing.imageHint?.includes('cabin');
    return matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6 space-x-4">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search destinations, experiences..."
              className="w-full rounded-full bg-input pl-10 pr-4 py-2 h-10 text-base shadow-sm focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-full border-2 w-10 h-10 flex-shrink-0">
            <Filter className="h-5 w-5" />
            <span className="sr-only">Filters</span>
          </Button>
        </div>
        <div className="container mx-auto px-4 md:px-6 py-2 overflow-x-auto">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent p-0 space-x-1 h-auto">
                {topLevelCategories.map(cat => (
                  <TabsTrigger 
                    key={cat.value} 
                    value={cat.value}
                    className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted/50 data-[state=inactive]:border data-[state=inactive]:border-border"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6">
        <section>
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">No listings found matching your criteria.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
