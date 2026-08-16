'use client';

import { useEffect, useState } from 'react';
import { Radio, Play, Square, CircleDot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase, type LiveStatus } from '@/lib/supabase';

export default function AdminLivePage() {
  const { toast } = useToast();
  const [live, setLive] = useState<LiveStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ stage_number: '', program_name: '', category: '' });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('live_status').select('*').eq('id', 1).maybeSingle();
    setLive(data);
    if (data) {
      setForm({
        stage_number: data.stage_number ?? '',
        program_name: data.program_name ?? '',
        category: data.category ?? '',
      });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startLive = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('live_status')
      .update({
        is_live: true,
        status: 'LIVE',
        stage_number: form.stage_number.trim() || null,
        program_name: form.program_name.trim() || null,
        category: form.category.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);
    setSaving(false);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Live started — public page updated' });
    load();
  };

  const stopLive = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('live_status')
      .update({
        is_live: false,
        status: 'OFFLINE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);
    setSaving(false);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Live stopped' });
    load();
  };

  if (loading) {
    return <div className="h-64 rounded-2xl animate-shimmer" />;
  }

  const isLive = live?.is_live && live.status === 'LIVE';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Live Control</h1>
        <p className="mt-1 text-muted-foreground">Start or stop the live broadcast. The public Live page updates instantly.</p>
      </div>

      <Card className={isLive ? 'border-rose-200' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="h-5 w-5 text-primary" /> Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {isLive ? (
              <>
                <Badge className="bg-rose-600 text-white animate-pulse-live">LIVE</Badge>
                <span className="font-medium text-primary">{live?.program_name ?? '—'}</span>
                <span className="text-sm text-muted-foreground">Stage {live?.stage_number ?? '—'}</span>
              </>
            ) : (
              <>
                <Badge variant="secondary">OFFLINE</Badge>
                <span className="text-sm text-muted-foreground">No program is currently live.</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Live Program Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Stage Number</Label>
              <Input value={form.stage_number} onChange={(e) => setForm({ ...form, stage_number: e.target.value })} placeholder="Main Stage" />
            </div>
            <div className="space-y-2">
              <Label>Program Name</Label>
              <Input value={form.program_name} onChange={(e) => setForm({ ...form, program_name: e.target.value })} placeholder="Quran Recitation" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Senior" />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button onClick={startLive} disabled={saving || isLive} className="bg-rose-600 hover:bg-rose-700">
              <Play className="mr-2 h-4 w-4" /> Start Live
            </Button>
            <Button onClick={stopLive} disabled={saving || !isLive} variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">
              <Square className="mr-2 h-4 w-4" /> Stop Live
            </Button>
          </div>

          {isLive && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <CircleDot className="h-4 w-4 animate-pulse-live" />
              Broadcasting now. The public Live page is showing this program in real time.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
