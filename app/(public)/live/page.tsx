'use client';

import { useEffect, useState } from 'react';
import { Radio, MapPin, Clock, Tag, CircleDot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, type LiveStatus } from '@/lib/supabase';

export default function LivePage() {
  const [live, setLive] = useState<LiveStatus | null>(null);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('live_status')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        setLive(data);
        setLoading(false);
      });

    const channel = supabase
      .channel('live_status_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_status' }, (payload) => {
        setLive(payload.new as LiveStatus);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const isLive = live?.is_live && live.status === 'LIVE';

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-primary sm:text-4xl">Live Program</h1>
        <p className="mt-2 text-muted-foreground">Real-time updates from the stage.</p>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl animate-shimmer" />
      ) : isLive ? (
        <Card className="overflow-hidden border-rose-200 shadow-lg animate-scale-in">
          <div className="bg-gradient-to-r from-rose-600 to-red-700 px-6 py-4 text-white">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
              </span>
              <span className="text-lg font-bold uppercase tracking-wider">Live Now</span>
            </div>
          </div>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <InfoRow icon={MapPin} label="Stage Number" value={live?.stage_number ?? '—'} />
            <InfoRow icon={Tag} label="Category" value={live?.category ?? '—'} />
            <InfoRow icon={Radio} label="Program Name" value={live?.program_name ?? '—'} />
            <InfoRow icon={Clock} label="Current Time" value={now.toLocaleTimeString()} />
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3">
                <CircleDot className="h-5 w-5 animate-pulse-live text-rose-600" />
                <Badge className="bg-rose-600 text-white">LIVE</Badge>
                <span className="text-sm font-medium text-rose-700">Currently broadcasting</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Radio className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-primary">No Live Program Right Now</h2>
            <p className="mt-2 max-w-sm text-muted-foreground">
              The live broadcast will appear here automatically when the admin starts a program.
              Please check back soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-semibold text-primary">{value}</div>
      </div>
    </div>
  );
}
