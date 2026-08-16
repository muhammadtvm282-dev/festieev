'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, User, Hash, Tag, GraduationCap, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, type Participant } from '@/lib/supabase';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    supabase
      .from('participants')
      .select('*')
      .order('participant_number')
      .then(({ data }) => {
        setParticipants(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.participant_number.toLowerCase().includes(q)
    );
  }, [participants, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-primary sm:text-4xl">Participants</h1>
        <p className="mt-2 text-muted-foreground">Search and meet our talented participants.</p>
      </div>

      <div className="relative mx-auto mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or participant number..."
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-56 rounded-2xl animate-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No participants found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <Card
              key={p.id}
              className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
            >
              <div className="relative h-40 bg-gradient-to-br from-primary/15 to-accent/10">
                {p.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photo_url}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <User className="h-10 w-10" />
                    </div>
                  </div>
                )}
                <Badge className="absolute right-2 top-2 bg-accent text-accent-foreground shadow">
                  <Hash className="mr-0.5 h-3 w-3" />{p.participant_number}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-primary">{p.name}</h3>
                <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {p.category && (
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" /> {p.category}
                    </div>
                  )}
                  {p.class_name && (
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" /> {p.class_name}
                    </div>
                  )}
                  {p.program && (
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" /> {p.program}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
