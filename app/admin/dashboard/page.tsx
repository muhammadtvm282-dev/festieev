'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ListChecks,
  Users,
  Tags,
  Radio,
  Trophy,
  ArrowRight,
  CalendarClock,
  Siren,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

type Stats = {
  programs: number;
  participants: number;
  categories: number;
  publishedResults: number;
  live: { is_live: boolean; program_name: string | null; stage_number: string | null } | null;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const [p, part, cat, res, live] = await Promise.all([
        supabase.from('programs').select('*', { count: 'exact', head: true }),
        supabase.from('participants').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('results').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('live_status').select('*').eq('id', 1).maybeSingle(),
      ]);
      setStats({
        programs: p.count ?? 0,
        participants: part.count ?? 0,
        categories: cat.count ?? 0,
        publishedResults: res.count ?? 0,
        live: live.data as Stats['live'],
      });
    })();
  }, []);

  const cards = [
    { label: 'Total Programs', value: stats?.programs, icon: ListChecks, href: '/admin/programs', color: 'from-emerald-500 to-emerald-700' },
    { label: 'Total Participants', value: stats?.participants, icon: Users, href: '/admin/participants', color: 'from-teal-500 to-teal-700' },
    { label: 'Total Categories', value: stats?.categories, icon: Tags, href: '/admin/categories', color: 'from-sky-500 to-sky-700' },
    { label: 'Published Results', value: stats?.publishedResults, icon: Trophy, href: '/admin/results', color: 'from-amber-500 to-amber-700' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of the Madrasa Annual Program.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Link key={c.label} href={c.href} className="group block animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-md`}>
                  <c.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {c.value === undefined ? '…' : c.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{c.label}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Live status card */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Radio className="h-5 w-5" /> Live Program Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.live?.is_live ? (
            <div className="flex flex-wrap items-center gap-4">
              <Badge className="bg-rose-600 text-white animate-pulse-live">LIVE</Badge>
              <div>
                <div className="font-semibold text-primary">{stats.live.program_name ?? '—'}</div>
                <div className="text-sm text-muted-foreground">Stage: {stats.live.stage_number ?? '—'}</div>
              </div>
              <Button asChild variant="outline" size="sm" className="ml-auto">
                <Link href="/admin/live">Manage Live <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Badge variant="secondary">OFFLINE</Badge>
              <span className="text-sm text-muted-foreground">No program is currently live.</span>
              <Button asChild variant="outline" size="sm" className="ml-auto">
                <Link href="/admin/live">Start Live <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-primary">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Manage Schedule', desc: 'Add or edit schedule entries', icon: CalendarClock, href: '/admin/schedule' },
            { label: 'Manage Results', desc: 'Publish or hide results', icon: Trophy, href: '/admin/results' },
            { label: 'Emergency Contacts', desc: 'Update emergency contacts', icon: Siren, href: '/admin/emergency' },
          ].map((q) => (
            <Link key={q.href} href={q.href} className="group block">
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <q.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-primary">{q.label}</div>
                    <div className="text-xs text-muted-foreground">{q.desc}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
