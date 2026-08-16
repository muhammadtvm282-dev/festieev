'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Trophy, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase, type Result } from '@/lib/supabase';

export default function AdminResultsPage() {
  const { toast } = useToast();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Result | null>(null);
  const [participants, setParticipants] = useState<{ participant_number: string; name: string }[]>([]);
  const [form, setForm] = useState({
    program_number: '',
    program_name: '',
    category: '',
    first_prize: '',
    second_prize: '',
    third_prize: '',
    published: false,
  });
  const [prizeNames, setPrizeNames] = useState({ first: '', second: '', third: '' });


  const load = async () => {
    setLoading(true);
    const [{ data: resultData }, { data: participantData }] = await Promise.all([
      supabase.from('results').select('*').order('program_number'),
      supabase.from('participants').select('participant_number, name').order('participant_number'),
    ]);
    setResults(resultData ?? []);
    setParticipants(participantData ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ program_number: '', program_name: '', category: '', first_prize: '', second_prize: '', third_prize: '', published: false });
    setPrizeNames({ first: '', second: '', third: '' });
    setOpen(true);
  };

  const openEdit = (r: Result) => {
    setEditing(r);
    const parsePrize = (value?: string | null) => {
      const raw = value ?? '';
      const separator = raw.indexOf(' - ');
      return separator >= 0
        ? { chest: raw.slice(0, separator).trim(), name: raw.slice(separator + 3).trim() }
        : { chest: raw.trim(), name: '' };
    };
    const first = parsePrize(r.first_prize);
    const second = parsePrize(r.second_prize);
    const third = parsePrize(r.third_prize);
    setForm({
      program_number: String(r.program_number),
      program_name: r.program_name,
      category: r.category ?? '',
      first_prize: first.chest,
      second_prize: second.chest,
      third_prize: third.chest,
      published: r.published,
    });
    setPrizeNames({ first: first.name, second: second.name, third: third.name });
    setOpen(true);
  };

  const findParticipant = (chestNumber: string) => {
    const value = chestNumber.trim().toLowerCase();
    if (!value) return '';
    return participants.find((p) => p.participant_number.trim().toLowerCase() === value)?.name ?? '';
  };

  const save = async () => {
    const payload = {
      program_number: parseInt(form.program_number, 10) || 0,
      program_name: form.program_name.trim(),
      category: form.category.trim() || null,
      first_prize: form.first_prize.trim()
        ? `${form.first_prize.trim()} - ${prizeNames.first || 'Unknown participant'}`
        : null,
      second_prize: form.second_prize.trim()
        ? `${form.second_prize.trim()} - ${prizeNames.second || 'Unknown participant'}`
        : null,
      third_prize: form.third_prize.trim()
        ? `${form.third_prize.trim()} - ${prizeNames.third || 'Unknown participant'}`
        : null,
      published: form.published,
    };
    if (!payload.program_name) { toast({ title: 'Program name is required', variant: 'destructive' }); return; }
    const prizeInputs = [
      ['First Prize', form.first_prize, prizeNames.first],
      ['Second Prize', form.second_prize, prizeNames.second],
      ['Third Prize', form.third_prize, prizeNames.third],
    ] as const;
    const invalidPrize = prizeInputs.find(([, chest, name]) => chest.trim() && !name);
    if (invalidPrize) {
      toast({ title: `Chest number not found for ${invalidPrize[0]}`, description: 'Add the student first, then enter their chest number.', variant: 'destructive' });
      return;
    }
    if (editing) {
      const { error } = await supabase.from('results').update(payload).eq('id', editing.id);
      if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Result updated' });
    } else {
      const { error } = await supabase.from('results').insert(payload);
      if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Result added' });
    }
    setOpen(false);
    load();
  };

  const togglePublish = async (r: Result) => {
    const { error } = await supabase.from('results').update({ published: !r.published }).eq('id', r.id);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    toast({ title: r.published ? 'Result hidden' : 'Result published' });
    load();
  };

  const remove = async (r: Result) => {
    if (!confirm(`Delete result for "${r.program_name}"?`)) return;
    const { error } = await supabase.from('results').delete().eq('id', r.id);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Result deleted' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Results</h1>
          <p className="mt-1 text-muted-foreground">Add, edit, publish, and hide results.</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-1.5 h-4 w-4" /> Add Result</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Trophy className="h-5 w-5 text-primary" /> All Results ({results.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 rounded-lg animate-shimmer" />)}</div>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No results yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">No</th>
                    <th className="px-3 py-2 font-medium">Program</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-secondary/40">
                      <td className="px-3 py-2.5 font-medium text-primary">{r.program_number}</td>
                      <td className="px-3 py-2.5 font-medium">{r.program_name}</td>
                      <td className="px-3 py-2.5">{r.category && <Badge variant="secondary">{r.category}</Badge>}</td>
                      <td className="px-3 py-2.5">
                        {r.published ? (
                          <Badge className="bg-green-600 text-white"><Eye className="mr-1 h-3 w-3" /> Published</Badge>
                        ) : (
                          <Badge variant="outline"><EyeOff className="mr-1 h-3 w-3" /> Hidden</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => togglePublish(r)} title={r.published ? 'Hide' : 'Publish'}>
                            {r.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => remove(r)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit Result' : 'Add Result'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Program Number</Label>
                <Input type="number" value={form.program_number} onChange={(e) => setForm({ ...form, program_number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Senior" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Program Name</Label>
              <Input value={form.program_name} onChange={(e) => setForm({ ...form, program_name: e.target.value })} />
            </div>
            {([
              ['first_prize', 'first', 'First Prize'],
              ['second_prize', 'second', 'Second Prize'],
              ['third_prize', 'third', 'Third Prize'],
            ] as const).map(([field, key, label]) => {
              const name = prizeNames[key] || findParticipant(form[field]);
              return (
                <div key={field} className="space-y-2">
                  <Label>{label} — Chest Number</Label>
                  <Input
                    value={form[field]}
                    onChange={(e) => {
                      const chest = e.target.value;
                      setForm({ ...form, [field]: chest });
                      setPrizeNames({ ...prizeNames, [key]: findParticipant(chest) });
                    }}
                    placeholder="Enter chest number (e.g. C001)"
                    list="participant-chest-numbers"
                  />
                  <Input value={name} readOnly placeholder="Participant name appears automatically" className="bg-muted/40" />
                </div>
              );
            })}
            <datalist id="participant-chest-numbers">
              {participants.map((p) => (
                <option key={p.participant_number} value={p.participant_number}>{p.name}</option>
              ))}
            </datalist>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="cursor-pointer">Publish immediately</Label>
                <p className="text-xs text-muted-foreground">If off, the result stays hidden from the public.</p>
              </div>
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={save}>{editing ? 'Save Changes' : 'Add Result'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
