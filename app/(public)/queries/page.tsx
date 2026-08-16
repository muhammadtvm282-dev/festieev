'use client';

import { useEffect, useState } from 'react';
import { Phone, MessageCircle, HelpCircle, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase, type QueriesContact } from '@/lib/supabase';

export default function QueriesPage() {
  const [contact, setContact] = useState<QueriesContact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('queries_contact')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        setContact(data);
        setLoading(false);
      });
  }, []);

  const waLink = (num: string | null) => {
    if (!num) return '#';
    const digits = num.replace(/[^\d]/g, '');
    return `https://wa.me/${digits}`;
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center animate-fade-in">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <HelpCircle className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold text-primary sm:text-4xl">Queries</h1>
        <p className="mt-2 text-muted-foreground">Have a question? Contact our queries desk.</p>
      </div>

      {loading ? (
        <div className="h-48 rounded-2xl animate-shimmer" />
      ) : !contact ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No queries contact configured.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden animate-scale-in">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-primary">{contact.name}</h2>
            <p className="mt-1 text-muted-foreground">{contact.phone}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href={waLink(contact.whatsapp ?? contact.phone)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={`tel:${contact.phone}`}>
                  <Phone className="mr-2 h-4 w-4" /> Call
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
