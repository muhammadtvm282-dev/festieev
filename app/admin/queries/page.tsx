'use client';

import { useEffect, useState } from 'react';
import { HelpCircle, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase, type QueriesContact } from '@/lib/supabase';

export default function AdminQueriesPage() {
  const { toast } = useToast();
  const [contact, setContact] = useState<QueriesContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '' });

  useEffect(() => {
    supabase.from('queries_contact').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      setContact(data);
      if (data) setForm({ name: data.name, phone: data.phone, whatsapp: data.whatsapp ?? '' });
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim() || null,
    };
    if (!payload.name || !payload.phone) {
      toast({ title: 'Name and phone are required', variant: 'destructive' });
      setSaving(false);
      return;
    }
    const { error } = await supabase.from('queries_contact').update(payload).eq('id', 1);
    setSaving(false);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Queries contact updated' });
    setContact({ ...contact!, ...payload });
  };

  if (loading) return <div className="h-64 rounded-2xl animate-shimmer" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Queries Contact</h1>
        <p className="mt-1 text-muted-foreground">Edit the contact person shown on the public Queries page.</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><HelpCircle className="h-5 w-5 text-primary" /> Contact Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp Number</Label>
            <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
