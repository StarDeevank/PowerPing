
"use client";
// This component is not used in the WattWatcher AI application.
// It was part of the previous Airbnb-style UI.

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Star } from 'lucide-react';

export interface Listing {
  id: string;
  imageUrl: string;
  imageHint?: string; 
  title: string;
  location: string;
  rating: number;
  pricePerNight: number;
  currency: string;
}

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
      <CardHeader className="p-0 relative">
        <Image
          src={listing.imageUrl}
          alt={listing.title}
          width={400}
          height={300}
          className="aspect-[4/3] w-full object-cover"
          data-ai-hint={listing.imageHint || "modern house"}
        />
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full">
          <Heart className="h-5 w-5 text-foreground/70" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-1">
        <CardTitle className="text-lg font-semibold truncate">{listing.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{listing.location}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-md font-semibold">
            {listing.currency}
            {listing.pricePerNight}{' '}
            <span className="text-sm font-normal text-muted-foreground">/ night</span>
          </p>
          {listing.rating > 0 && (
            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
              <span>{listing.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
