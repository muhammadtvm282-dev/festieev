'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase, type ScheduleEntry } from '@/lib/supabase';

export default function AdminSchedulePage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleEntry | null>(null);
  const [form, setForm] = useState({ sl_no: '', start_time: '', end_time: '', program: '', category: '', stage: '', notes: '' });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('schedule').select('*').order('sl_no');
    setEntries(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ sl_no: String(entries.length + 1), start_time: '', end_time: '', program: '', category: '', stage: '', notes: '' });
    setOpen(true);
  };

  const openEdit = (e: ScheduleEntry) => {
    setEditing(e);
    setForm({
      sl_no: String(e.sl_no),
      start_time: e.start_time,
      end_time: e.end_time ?? '',
      program: e.program,
      category: e.category ?? '',
      stage: e.stage ?? '',
      notes: e.notes ?? '',
    });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      sl_no: parseInt(form.sl_no, 10) || 0,
      start_time: form.start_time.trim(),
      end_time: form.end_time.trim() || null,
      program: form.program.trim(),
      category: form.category.trim() || null,
      stage: form.stage.trim() || null,
      notes: form.notes.trim() || null,
    };
    if (!payload.program || !payload.start_time) {
      toast({ title: 'Program and start time are required', variant: 'destructive' });
      return;
    }
    if (editing) {
      const { error } = await supabase.from('schedule').update(payload).eq('id', editing.id);
      if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Schedule entry updated' });
    } else {
      const { error } = await supabase.from('schedule').insert(payload);
      if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Schedule entry added' });
    }
    setOpen(false);
    load();
  };

  const remove = async (e: ScheduleEntry) => {
    if (!confirm(`Delete "${e.program}"?`)) return;
    const { error } = await supabase.from('schedule').delete().eq('id', e.id);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Entry deleted' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Schedule</h1>
          <p className="mt-1 text-muted-foreground">Manage the event timetable.</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-1.5 h-4 w-4" /> Add Entry</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CalendarClock className="h-5 w-5 text-primary" /> All Entries ({entries.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 rounded-lg animate-shimmer" />)}</div>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No schedule entries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">SL</th>
                    <th className="px-3 py-2 font-medium">Time</th>
                    <th className="px-3 py-2 font-medium">Program</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Stage</th>
                    <th className="px-3 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((e) => (
                    <tr key={e.id} className="transition-colors hover:bg-secondary/40">
                      <td className="px-3 py-2.5 font-medium text-primary">{e.sl_no}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{e.start_time}{e.end_time ? ` – ${e.end_time}` : ''}</td>
                      <td className="px-3 py-2.5 font-medium">{e.program}</td>
                      <td className="px-3 py-2.5">{e.category && <Badge variant="secondary">{e.category}</Badge>}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{e.stage ?? '—'}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => remove(e)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Entry' : 'Add Entry'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SL No</Label>
                <Input type="number" value={form.sl_no} onChange={(e) => setForm({ ...form, sl_no: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Input value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} placeholder="Main Stage" />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} placeholder="09:00" />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} placeholder="10:00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Program</Label>
              <Input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Senior" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={save}>{editing ? 'Save Changes' : 'Add Entry'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
