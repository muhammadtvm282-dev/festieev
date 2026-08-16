'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ListChecks } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase, type Program, type Category } from '@/lib/supabase';

export default function AdminProgramsPage() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [form, setForm] = useState({ program_number: '', name: '', category_id: '', description: '' });

  const load = async () => {
    setLoading(true);
    const [{ data: progs }, { data: cats }] = await Promise.all([
      supabase.from('programs').select('*').order('program_number'),
      supabase.from('categories').select('*').order('sort_order'),
    ]);
    setPrograms(progs ?? []);
    setCategories(cats ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ program_number: '', name: '', category_id: '', description: '' });
    setOpen(true);
  };

  const openEdit = (p: Program) => {
    setEditing(p);
    setForm({
      program_number: String(p.program_number),
      name: p.name,
      category_id: p.category_id ?? '',
      description: p.description ?? '',
    });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      program_number: parseInt(form.program_number, 10) || 0,
      name: form.name.trim(),
      category_id: form.category_id || null,
      description: form.description.trim() || null,
      sort_order: parseInt(form.program_number, 10) || 0,
    };
    if (!payload.name) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    if (editing) {
      const { error } = await supabase.from('programs').update(payload).eq('id', editing.id);
      if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Program updated' });
    } else {
      const { error } = await supabase.from('programs').insert(payload);
      if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Program added' });
    }
    setOpen(false);
    load();
  };

  const remove = async (p: Program) => {
    if (!confirm(`Delete program "${p.name}"?`)) return;
    const { error } = await supabase.from('programs').delete().eq('id', p.id);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Program deleted' });
    load();
  };

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Programs</h1>
          <p className="mt-1 text-muted-foreground">Add, edit, and delete competition programs.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Program
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><ListChecks className="h-5 w-5 text-primary" /> All Programs ({programs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 rounded-lg animate-shimmer" />)}
            </div>
          ) : programs.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No programs yet. Click "Add Program" to create one.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">No</th>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {programs.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-secondary/40">
                      <td className="px-3 py-2.5 font-medium text-primary">{p.program_number}</td>
                      <td className="px-3 py-2.5 font-medium">{p.name}</td>
                      <td className="px-3 py-2.5"><Badge variant="secondary">{catName(p.category_id)}</Badge></td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => remove(p)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Program' : 'Add Program'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Program Number</Label>
              <Input type="number" value={form.program_number} onChange={(e) => setForm({ ...form, program_number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Program Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={save}>{editing ? 'Save Changes' : 'Add Program'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
