'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Siren } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase, type EmergencyContact } from '@/lib/supabase';

export default function AdminEmergencyPage() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [form, setForm] = useState({ role: '', name: '', phone: '', whatsapp: '', sort_order: '' });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('emergency_contacts').select('*').order('sort_order');
    setContacts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ role: '', name: '', phone: '', whatsapp: '', sort_order: String(contacts.length + 1) });
    setOpen(true);
  };

  const openEdit = (c: EmergencyContact) => {
    setEditing(c);
    setForm({ role: c.role, name: c.name, phone: c.phone, whatsapp: c.whatsapp ?? '', sort_order: String(c.sort_order) });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      role: form.role.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim() || null,
      sort_order: parseInt(form.sort_order, 10) || 0,
    };
    if (!payload.role || !payload.name || !payload.phone) {
      toast({ title: 'Role, name, and phone are required', variant: 'destructive' });
      return;
    }
    if (editing) {
      const { error } = await supabase.from('emergency_contacts').update(payload).eq('id', editing.id);
      if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Contact updated' });
    } else {
      const { error } = await supabase.from('emergency_contacts').insert(payload);
      if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Contact added' });
    }
    setOpen(false);
    load();
  };

  const remove = async (c: EmergencyContact) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    const { error } = await supabase.from('emergency_contacts').delete().eq('id', c.id);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Contact deleted' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Emergency Contacts</h1>
          <p className="mt-1 text-muted-foreground">Manage emergency contact persons.</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-1.5 h-4 w-4" /> Add Contact</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Siren className="h-5 w-5 text-primary" /> All Contacts ({contacts.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-lg animate-shimmer" />)}</div>
          ) : contacts.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No contacts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Phone</th>
                    <th className="px-3 py-2 font-medium">WhatsApp</th>
                    <th className="px-3 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contacts.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-secondary/40">
                      <td className="px-3 py-2.5"><Badge variant="outline">{c.role}</Badge></td>
                      <td className="px-3 py-2.5 font-medium text-primary">{c.name}</td>
                      <td className="px-3 py-2.5">{c.phone}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{c.whatsapp ?? '—'}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => remove(c)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit Contact' : 'Add Contact'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Main Usthad" />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={save}>{editing ? 'Save Changes' : 'Add Contact'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
