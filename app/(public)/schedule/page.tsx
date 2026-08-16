'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Clock, MapPin, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, type ScheduleEntry } from '@/lib/supabase';

export default function SchedulePage() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    supabase
      .from('schedule')
      .select('*')
      .order('sl_no')
      .then(({ data }) => {
        setEntries(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.program.toLowerCase().includes(q) ||
        (e.category ?? '').toLowerCase().includes(q) ||
        (e.stage ?? '').toLowerCase().includes(q) ||
        e.start_time.toLowerCase().includes(q)
    );
  }, [entries, query]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-primary sm:text-4xl">Event Schedule</h1>
        <p className="mt-2 text-muted-foreground">Full timetable of all programs across stages.</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by program, category, stage, or time..."
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No schedule entries match your search.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">SL No</th>
                    <th className="px-4 py-3 text-left font-semibold">Time</th>
                    <th className="px-4 py-3 text-left font-semibold">Program</th>
                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                    <th className="px-4 py-3 text-left font-semibold">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((e) => (
                    <tr key={e.id} className="transition-colors hover:bg-secondary/40">
                      <td className="px-4 py-3 font-medium text-primary">{e.sl_no}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {e.start_time}{e.end_time ? ` – ${e.end_time}` : ''}
                      </td>
                      <td className="px-4 py-3 font-medium">{e.program}</td>
                      <td className="px-4 py-3">
                        {e.category && <Badge variant="secondary">{e.category}</Badge>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{e.stage ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {filtered.map((e) => (
              <Card key={e.id} className="animate-fade-up">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono">#{e.sl_no}</Badge>
                    <div className="flex items-center gap-1 text-sm font-medium text-primary">
                      <Clock className="h-3.5 w-3.5" />
                      {e.start_time}{e.end_time ? ` – ${e.end_time}` : ''}
                    </div>
                  </div>
                  <h3 className="mt-2 font-semibold text-primary">{e.program}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {e.category && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        <Tag className="h-3 w-3" /> {e.category}
                      </span>
                    )}
                    {e.stage && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {e.stage}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
