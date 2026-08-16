'use client';

import { useEffect, useState } from 'react';
import { Phone, MessageCircle, Siren, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase, type EmergencyContact } from '@/lib/supabase';

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('emergency_contacts')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        setContacts(data ?? []);
        setLoading(false);
      });
  }, []);

  const waLink = (num: string | null) => {
    if (!num) return '#';
    const digits = num.replace(/[^\d]/g, '');
    return `https://wa.me/${digits}`;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center animate-fade-in">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Siren className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold text-primary sm:text-4xl">Emergency Contacts</h1>
        <p className="mt-2 text-muted-foreground">Reach out immediately in case of emergency.</p>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl animate-shimmer" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No emergency contacts available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((c, i) => (
            <Card
              key={c.id}
              className="overflow-hidden border-red-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                    {c.role}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-primary">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.phone}</p>
                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    <a href={waLink(c.whatsapp ?? c.phone)} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <a href={`tel:${c.phone}`}>
                      <Phone className="mr-1.5 h-4 w-4" /> Call
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
