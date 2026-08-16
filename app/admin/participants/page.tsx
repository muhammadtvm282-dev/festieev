'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Users, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase, type Participant } from '@/lib/supabase';

export default function AdminParticipantsPage() {
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Participant | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', participant_number: '', category: '', class_name: '', program: '', photo_url: '' });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('participants').select('*').order('participant_number');
    setParticipants(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', participant_number: '', category: '', class_name: '', program: '', photo_url: '' });
    setOpen(true);
  };

  const openEdit = (p: Participant) => {
    setEditing(p);
    setForm({
      name: p.name,
      participant_number: p.participant_number,
      category: p.category ?? '',
      class_name: p.class_name ?? '',
      program: p.program ?? '',
      photo_url: p.photo_url ?? '',
    });
    setOpen(true);
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `participants/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('participants').upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('participants').getPublicUrl(path);
      setForm((f) => ({ ...f, photo_url: pub.publicUrl }));
      toast({ title: 'Photo uploaded' });
    } catch (err: any) {
      toast({ title: err.message ?? 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const payload = {
      name: form.name.trim(),
      participant_number: form.participant_number.trim(),
      category: form.category.trim() || null,
      class_name: form.class_name.trim() || null,
      program: form.program.trim() || null,
      photo_url: form.photo_url.trim() || null,
    };
    if (!payload.name || !payload.participant_number) {
      toast({ title: 'Name and participant number are required', variant: 'destructive' });
      return;
    }
    if (editing) {
      const { error } = await supabase.from('participants').update(payload).eq('id', editing.id);
      if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Participant updated' });
    } else {
      const { error } = await supabase.from('participants').insert(payload);
      if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Participant added' });
    }
    setOpen(false);
    load();
  };

  const remove = async (p: Participant) => {
    if (!confirm(`Delete participant "${p.name}"?`)) return;
    const { error } = await supabase.from('participants').delete().eq('id', p.id);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Participant deleted' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Participants</h1>
          <p className="mt-1 text-muted-foreground">Add, edit, and delete participants.</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-1.5 h-4 w-4" /> Add Participant</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-primary" /> All Participants ({participants.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-20 rounded-lg animate-shimmer" />)}</div>
          ) : participants.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No participants yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-secondary/30">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-primary/10">
                    {p.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary"><Users className="h-5 w-5" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-primary">{p.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge variant="outline" className="font-mono">{p.participant_number}</Badge>
                      {p.category && <span>{p.category}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(p)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Participant' : 'Add Participant'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Photo</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-xl border bg-muted">
                  {form.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.photo_url} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground"><Users className="h-6 w-6" /></div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }}
                    />
                  </label>
                  {form.photo_url && (
                    <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, photo_url: '' })}>
                      <X className="mr-1 h-3.5 w-3.5" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Participant Number</Label>
                <Input value={form.participant_number} onChange={(e) => setForm({ ...form, participant_number: e.target.value })} placeholder="P001" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Senior" />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Input value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} placeholder="Class 10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Program</Label>
              <Input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={save}>{editing ? 'Save Changes' : 'Add Participant'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
