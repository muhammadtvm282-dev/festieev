'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Camera, Image as ImageIcon, Save, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { WEBSITE_SETTINGS_STORAGE_KEY } from '@/hooks/use-website-settings';
import { supabase, type Settings } from '@/lib/supabase';

const DEFAULT_SETTINGS: Settings = {
  id: 1,
  madrasa_name: 'Darul Huda Madrasa',
  madrasa_logo: null,
  logo_url: null,
  banner_url: null,
  program_name: 'Annual Program 2026',
  program_subtitle: 'Annual Program & Competition',
  event_date: null,
  venue: 'Madrasa Auditorium',
  address: 'Madrasa Campus, Calicut, Kerala, India',
  contact_phone: '+91 98765 43210',
  contact_email: 'info@darulhuda.example',
  footer_text: 'Nurturing minds and hearts with the light of Islamic knowledge.',
  copyright: '© 2026 Darul Huda Madrasa. All rights reserved.',
  facebook_url: null,
  instagram_url: null,
  youtube_url: null,
  whatsapp_group_url: null,
  primary_color: '#164b36',
  secondary_color: '#e8f3ed',
  accent_color: '#d6a928',
  header_background: '#ffffff',
  header_text_color: '#164b36',
  search_background: '#f3f7f5',
  page_background: '#ffffff',
};

function createImagePreviewUrl(file: File) {
  return URL.createObjectURL(file);
}

export default function WebsiteSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);

    // Hydrate from the browser immediately so the editor does not briefly
    // show defaults/old DB values while the remote request is in flight.
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(WEBSITE_SETTINGS_STORAGE_KEY);
        if (raw) {
          const local = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as Settings;
          setSettings(local);
          applyThemePreview(local);
        }
      } catch {
        // Ignore malformed local settings and continue with Supabase.
      }
    }

    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
    if (!error && data) {
      // Keep a locally saved configuration when present. This avoids an
      // older remote row replacing the just-saved settings in local dev.
      if (typeof window !== 'undefined' && window.localStorage.getItem(WEBSITE_SETTINGS_STORAGE_KEY)) {
        setLoading(false);
        return;
      }
      setSettings({ ...DEFAULT_SETTINGS, ...data } as Settings);
    } else if (!error) {
      const { data: created, error: insertError } = await supabase.from('settings').insert(DEFAULT_SETTINGS).select('*').single();
      if (!insertError && created) {
        setSettings({ ...DEFAULT_SETTINGS, ...created } as Settings);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const applyThemePreview = (next: Settings) => {
    if (typeof document === 'undefined') return;
    const hexToHsl = (hex: string | null | undefined) => {
      if (!hex) return null;
      const value = hex.replace('#', '').trim();
      if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
      const r = parseInt(value.slice(0, 2), 16) / 255;
      const g = parseInt(value.slice(2, 4), 16) / 255;
      const b = parseInt(value.slice(4, 6), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h /= 6;
      }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };
    document.documentElement.style.setProperty('--primary', hexToHsl(next.primary_color) || '152 56% 22%');
    document.documentElement.style.setProperty('--secondary', hexToHsl(next.secondary_color) || '152 40% 92%');
    document.documentElement.style.setProperty('--accent', hexToHsl(next.accent_color) || '43 74% 49%');
    document.documentElement.style.setProperty('--background', hexToHsl(next.page_background) || '0 0% 100%');
    document.documentElement.style.setProperty('--site-header-bg', next.header_background || '#ffffff');
    document.documentElement.style.setProperty('--site-header-text', next.header_text_color || '#164b36');
    document.documentElement.style.setProperty('--site-search-bg', next.search_background || '#f3f7f5');
  };

  const onFieldChange = <K extends keyof Settings>(field: K, value: Settings[K]) => {
    setSettings((prev) => { const next = { ...prev, [field]: value }; applyThemePreview(next); return next; });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        madrasa_name: settings.madrasa_name?.trim() || DEFAULT_SETTINGS.madrasa_name,
        program_name: settings.program_name?.trim() || DEFAULT_SETTINGS.program_name,
        program_subtitle: settings.program_subtitle?.trim() || DEFAULT_SETTINGS.program_subtitle,
        logo_url: settings.logo_url || null,
        banner_url: settings.banner_url || null,
        event_date: settings.event_date || null,
        venue: settings.venue?.trim() || null,
        address: settings.address?.trim() || null,
        contact_phone: settings.contact_phone?.trim() || null,
        contact_email: settings.contact_email?.trim() || null,
        footer_text: settings.footer_text?.trim() || null,
        copyright: settings.copyright?.trim() || null,
        facebook_url: settings.facebook_url?.trim() || null,
        instagram_url: settings.instagram_url?.trim() || null,
        youtube_url: settings.youtube_url?.trim() || null,
        whatsapp_group_url: settings.whatsapp_group_url?.trim() || null,
        primary_color: settings.primary_color || DEFAULT_SETTINGS.primary_color,
        secondary_color: settings.secondary_color || DEFAULT_SETTINGS.secondary_color,
        accent_color: settings.accent_color || DEFAULT_SETTINGS.accent_color,
        header_background: settings.header_background || DEFAULT_SETTINGS.header_background,
        header_text_color: settings.header_text_color || DEFAULT_SETTINGS.header_text_color,
        search_background: settings.search_background || DEFAULT_SETTINGS.search_background,
        page_background: settings.page_background || DEFAULT_SETTINGS.page_background,
      };

      const { error } = await supabase.from('settings').update(payload).eq('id', 1);

      if (error) {
        throw error;
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(WEBSITE_SETTINGS_STORAGE_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ...payload }));
      }

      applyThemePreview({ ...settings, ...payload } as Settings);
      if (typeof document !== 'undefined') document.title = `${payload.madrasa_name}${payload.program_name ? ` — ${payload.program_name}` : ''}`;
      toast({ title: 'Website settings updated' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(WEBSITE_SETTINGS_STORAGE_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ...settings }));
      }
      toast({ title: 'Saved locally for this browser', description: message, variant: 'default' });
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File, kind: 'logo' | 'banner') => {
    const bucket = 'website-assets';
    const fileName = `${kind}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>, kind: 'logo' | 'banner') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (kind === 'logo') {
      setUploadingLogo(true);
      setLogoPreview(createImagePreviewUrl(file));
    } else {
      setUploadingBanner(true);
      setBannerPreview(createImagePreviewUrl(file));
    }

    try {
      const publicUrl = await uploadFile(file, kind);
      if (kind === 'logo') {
        onFieldChange('logo_url', publicUrl);
        onFieldChange('madrasa_logo', publicUrl);
      } else {
        onFieldChange('banner_url', publicUrl);
      }
      await handleSave();
      toast({ title: `${kind === 'logo' ? 'Logo' : 'Hero banner'} uploaded` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      toast({ title: 'Upload failed', description: message, variant: 'destructive' });
    } finally {
      if (kind === 'logo') {
        setUploadingLogo(false);
      } else {
        setUploadingBanner(false);
      }
      event.target.value = '';
    }
  };

  const previewLogo = useMemo(() => settings.logo_url || settings.madrasa_logo || logoPreview, [logoPreview, settings.logo_url, settings.madrasa_logo]);
  const previewBanner = useMemo(() => settings.banner_url || bannerPreview, [bannerPreview, settings.banner_url]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Website Settings</h1>
          <p className="mt-1 text-muted-foreground">Manage the homepage content, media, and footer details from one place.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-1.5 h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Madrasa Name</Label>
                <Input value={settings.madrasa_name ?? ''} onChange={(e) => onFieldChange('madrasa_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Program Name</Label>
                <Input value={settings.program_name ?? ''} onChange={(e) => onFieldChange('program_name', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Program Subtitle</Label>
              <Input value={settings.program_subtitle ?? ''} onChange={(e) => onFieldChange('program_subtitle', e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Event Date</Label>
                <Input type="date" value={settings.event_date ?? ''} onChange={(e) => onFieldChange('event_date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Venue</Label>
                <Input value={settings.venue ?? ''} onChange={(e) => onFieldChange('venue', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea value={settings.address ?? ''} onChange={(e) => onFieldChange('address', e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input value={settings.contact_phone ?? ''} onChange={(e) => onFieldChange('contact_phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input type="email" value={settings.contact_email ?? ''} onChange={(e) => onFieldChange('contact_email', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme & Header</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground">Change the public website colours without editing code. These settings apply to the header, hero, buttons, cards and page background.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['primary_color', 'Primary Color'],
                ['secondary_color', 'Secondary Color'],
                ['accent_color', 'Accent Color'],
                ['page_background', 'Page Background'],
                ['header_background', 'Header Background'],
                ['header_text_color', 'Header Text'],
                ['search_background', 'Search Background'],
              ].map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <Label>{label}</Label>
                  <div className="flex items-center gap-2 rounded-lg border p-2">
                    <input type="color" value={(settings[field as keyof Settings] as string) || '#ffffff'} onChange={(e) => onFieldChange(field as keyof Settings, e.target.value as never)} className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0" />
                    <Input value={(settings[field as keyof Settings] as string) || ''} onChange={(e) => onFieldChange(field as keyof Settings, e.target.value as never)} className="font-mono text-xs" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media & Footer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
                {previewLogo ? (
                  <img src={previewLogo} alt="Logo preview" className="h-16 w-16 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <ImageIcon className="h-7 w-7" />
                  </div>
                )}
                <label className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">
                  <Upload className="mr-2 h-4 w-4" /> {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Hero Banner</Label>
              <div className="rounded-lg border border-dashed p-3">
                {previewBanner ? (
                  <img src={previewBanner} alt="Banner preview" className="h-32 w-full rounded-lg object-cover" />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <Camera className="mr-2 h-5 w-5" /> No banner uploaded yet
                  </div>
                )}
                <label className="mt-3 flex cursor-pointer items-center justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">
                  <Upload className="mr-2 h-4 w-4" /> {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'banner')} />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Footer Text</Label>
              <Textarea value={settings.footer_text ?? ''} onChange={(e) => onFieldChange('footer_text', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Copyright Text</Label>
              <Input value={settings.copyright ?? ''} onChange={(e) => onFieldChange('copyright', e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Facebook URL</Label>
                <Input value={settings.facebook_url ?? ''} onChange={(e) => onFieldChange('facebook_url', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Instagram URL</Label>
                <Input value={settings.instagram_url ?? ''} onChange={(e) => onFieldChange('instagram_url', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>YouTube URL</Label>
                <Input value={settings.youtube_url ?? ''} onChange={(e) => onFieldChange('youtube_url', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Group Link</Label>
                <Input value={settings.whatsapp_group_url ?? ''} onChange={(e) => onFieldChange('whatsapp_group_url', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
