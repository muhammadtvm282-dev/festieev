'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, type Result } from '@/lib/supabase';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('results')
      .select('*')
      .eq('published', true)
      .order('program_number')
      .then(({ data }) => {
        setResults(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-primary sm:text-4xl">Results</h1>
        <p className="mt-2 text-muted-foreground">Winners of each program.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl animate-shimmer" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">
              No results published yet. Please check back after the competitions.
            </p>
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
                    <th className="px-4 py-3 text-left font-semibold">Program No</th>
                    <th className="px-4 py-3 text-left font-semibold">Program Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      <span className="inline-flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> First</span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      <span className="inline-flex items-center gap-1"><Medal className="h-3.5 w-3.5" /> Second</span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      <span className="inline-flex items-center gap-1"><Award className="h-3.5 w-3.5" /> Third</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-secondary/40">
                      <td className="px-4 py-3 font-medium text-primary">{r.program_number}</td>
                      <td className="px-4 py-3 font-medium">{r.program_name}</td>
                      <td className="px-4 py-3">
                        {r.category && <Badge variant="secondary">{r.category}</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-amber-700">{r.first_prize ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{r.second_prize ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.third_prize ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-4 sm:hidden">
            {results.map((r) => (
              <Card key={r.id} className="animate-fade-up">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono">#{r.program_number}</Badge>
                    {r.category && <Badge variant="secondary">{r.category}</Badge>}
                  </div>
                  <h3 className="mt-2 font-bold text-primary">{r.program_name}</h3>
                  <div className="mt-3 space-y-2">
                    <PrizeRow icon={Trophy} color="text-amber-600" label="First" value={r.first_prize} />
                    <PrizeRow icon={Medal} color="text-slate-500" label="Second" value={r.second_prize} />
                    <PrizeRow icon={Award} color="text-orange-600" label="Third" value={r.third_prize} />
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

function PrizeRow({ icon: Icon, color, label, value }: { icon: React.ElementType; color: string; label: string; value: string | null }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="ml-auto text-sm font-medium text-primary">{value ?? '—'}</span>
    </div>
  );
}
