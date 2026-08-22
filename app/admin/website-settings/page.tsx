'use client';

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Camera,
  Image as ImageIcon,
  Save,
  Upload,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { useToast } from '@/hooks/use-toast';

import {
  supabase,
  type Settings,
} from '@/lib/supabase';

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
  footer_text:
    'Nurturing minds and hearts with the light of Islamic knowledge.',
  copyright:
    '© 2026 Darul Huda Madrasa. All rights reserved.',
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

function hexToHsl(hex: string | null | undefined) {
  if (!hex) {
    return null;
  }

  const value = hex.replace('#', '').trim();

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    return null;
  }

  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;

  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;

    s =
      l > 0.5
        ? d / (2 - max - min)
        : d / (max + min);

    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }

    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(
    s * 100
  )}% ${Math.round(l * 100)}%`;
}

function applyTheme(settings: Settings) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  root.style.setProperty(
    '--primary',
    hexToHsl(settings.primary_color) ||
      '152 56% 22%'
  );

  root.style.setProperty(
    '--secondary',
    hexToHsl(settings.secondary_color) ||
      '152 40% 92%'
  );

  root.style.setProperty(
    '--accent',
    hexToHsl(settings.accent_color) ||
      '43 74% 49%'
  );

  root.style.setProperty(
    '--background',
    hexToHsl(settings.page_background) ||
      '0 0% 100%'
  );

  root.style.setProperty(
    '--card',
    hexToHsl(settings.page_background) ||
      '0 0% 100%'
  );

  root.style.setProperty(
    '--site-header-bg',
    settings.header_background || '#ffffff'
  );

  root.style.setProperty(
    '--site-header-text',
    settings.header_text_color ||
      settings.primary_color ||
      '#164b36'
  );

  root.style.setProperty(
    '--site-search-bg',
    settings.search_background ||
      '#f3f7f5'
  );

  if (settings.madrasa_name || settings.program_name) {
    document.title =
      `${settings.madrasa_name || 'Madrasa'}` +
      `${
        settings.program_name
          ? ` — ${settings.program_name}`
          : ''
      }`;
  }
}

export default function WebsiteSettingsPage() {
  const { toast } = useToast();

  const [settings, setSettings] =
    useState<Settings>(DEFAULT_SETTINGS);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingLogo, setUploadingLogo] =
    useState(false);

  const [uploadingBanner, setUploadingBanner] =
    useState(false);

  const [logoPreview, setLogoPreview] =
    useState<string | null>(null);

  const [bannerPreview, setBannerPreview] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);

      try {
        const { data, error } =
          await supabase
            .from('settings')
            .select('*')
            .eq('id', 1)
            .maybeSingle();

        if (cancelled) {
          return;
        }

        if (error) {
          console.error(
            'Failed to load website settings:',
            error
          );

          toast({
            title: 'Failed to load settings',
            description: error.message,
            variant: 'destructive',
          });

          setSettings(DEFAULT_SETTINGS);
          applyTheme(DEFAULT_SETTINGS);

          return;
        }

        if (data) {
          const next = {
            ...DEFAULT_SETTINGS,
            ...data,
          } as Settings;

          setSettings(next);
          applyTheme(next);
        } else {
          setSettings(DEFAULT_SETTINGS);
          applyTheme(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error(
          'Failed to load website settings:',
          error
        );

        if (!cancelled) {
          setSettings(DEFAULT_SETTINGS);
          applyTheme(DEFAULT_SETTINGS);

          toast({
            title: 'Failed to load settings',
            description:
              'Using default website settings.',
            variant: 'destructive',
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  const onFieldChange = <
    K extends keyof Settings
  >(
    field: K,
    value: Settings[K]
  ) => {
    setSettings((previous) => {
      const next = {
        ...previous,
        [field]: value,
      };

      applyTheme(next);

      return next;
    });
  };

  const handleSave = async (
    values: Settings = settings
  ) => {
    setSaving(true);

    try {
      const payload = {
        madrasa_name:
          values.madrasa_name?.trim() ||
          DEFAULT_SETTINGS.madrasa_name,

        program_name:
          values.program_name?.trim() ||
          DEFAULT_SETTINGS.program_name,

        program_subtitle:
          values.program_subtitle?.trim() ||
          DEFAULT_SETTINGS.program_subtitle,

        logo_url:
          values.logo_url || null,

        banner_url:
          values.banner_url || null,

        event_date:
          values.event_date || null,

        venue:
          values.venue?.trim() || null,

        address:
          values.address?.trim() || null,

        contact_phone:
          values.contact_phone?.trim() || null,

        contact_email:
          values.contact_email?.trim() || null,

        footer_text:
          values.footer_text?.trim() || null,

        copyright:
          values.copyright?.trim() || null,

        facebook_url:
          values.facebook_url?.trim() || null,

        instagram_url:
          values.instagram_url?.trim() || null,

        youtube_url:
          values.youtube_url?.trim() || null,

        whatsapp_group_url:
          values.whatsapp_group_url?.trim() ||
          null,

        primary_color:
          values.primary_color ||
          DEFAULT_SETTINGS.primary_color,

        secondary_color:
          values.secondary_color ||
          DEFAULT_SETTINGS.secondary_color,

        accent_color:
          values.accent_color ||
          DEFAULT_SETTINGS.accent_color,

        header_background:
          values.header_background ||
          DEFAULT_SETTINGS.header_background,

        header_text_color:
          values.header_text_color ||
          DEFAULT_SETTINGS.header_text_color,

        search_background:
          values.search_background ||
          DEFAULT_SETTINGS.search_background,

        page_background:
          values.page_background ||
          DEFAULT_SETTINGS.page_background,
      };

      const { data, error } =
        await supabase
          .from('settings')
          .update(payload)
          .eq('id', 1)
          .select('*')
          .single();

      if (error) {
        throw error;
      }

      const saved = {
        ...DEFAULT_SETTINGS,
        ...data,
      } as Settings;

      setSettings(saved);
      applyTheme(saved);

      toast({
        title: 'Website settings updated',
        description:
          'Changes saved successfully.',
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to save settings';

      console.error(
        'Failed to save website settings:',
        error
      );

      toast({
        title: 'Save failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (
    file: File,
    type: 'logo' | 'banner'
  ) => {
    const safeName = file.name
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '');

    const fileName =
      `${type}/${Date.now()}-${safeName}`;

    const { error } =
      await supabase.storage
        .from('website-assets')
        .upload(
          fileName,
          file,
          {
            cacheControl: '3600',
            upsert: true,
          }
        );

    if (error) {
      throw error;
    }

    const { data } =
      supabase.storage
        .from('website-assets')
        .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (type === 'logo') {
      setUploadingLogo(true);

      setLogoPreview(
        URL.createObjectURL(file)
      );
    } else {
      setUploadingBanner(true);

      setBannerPreview(
        URL.createObjectURL(file)
      );
    }

    try {
      const url =
        await uploadFile(file, type);

      const next: Settings = {
        ...settings,

        ...(type === 'logo'
          ? {
              logo_url: url,
              madrasa_logo: url,
            }
          : {
              banner_url: url,
            }),
      };

      setSettings(next);

      await handleSave(next);

      toast({
        title:
          type === 'logo'
            ? 'Logo uploaded'
            : 'Banner uploaded',
        description:
          'The image has been uploaded successfully.',
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Upload failed';

      console.error(
        `Failed to upload ${type}:`,
        error
      );

      toast({
        title: 'Upload failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else {
        setUploadingBanner(false);
      }

      event.target.value = '';
    }
  };

  const previewLogo = useMemo(
    () =>
      settings.logo_url ||
      settings.madrasa_logo ||
      logoPreview,
    [
      settings.logo_url,
      settings.madrasa_logo,
      logoPreview,
    ]
  );

  const previewBanner = useMemo(
    () =>
      settings.banner_url ||
      bannerPreview,
    [
      settings.banner_url,
      bannerPreview,
    ]
  );

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">
            Website Settings
          </h1>

          <p className="mt-1 text-muted-foreground">
            Manage website content, media,
            theme and footer details.
          </p>
        </div>

        <Button
          onClick={() => handleSave()}
          disabled={saving || loading}
        >
          <Save className="mr-2 h-4 w-4" />

          {saving
            ? 'Saving...'
            : 'Save Changes'}
        </Button>

      </div>

      {/* MAIN GRID */}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

        {/* BASIC INFORMATION */}

        <Card>

          <CardHeader>
            <CardTitle>
              Basic Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="grid gap-4 md:grid-cols-2">

              <div className="space-y-2">

                <Label>
                  Madrasa Name
                </Label>

                <Input
                  value={
                    settings.madrasa_name || ''
                  }
                  onChange={(event) =>
                    onFieldChange(
                      'madrasa_name',
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>
                  Program Name
                </Label>

                <Input
                  value={
                    settings.program_name || ''
                  }
                  onChange={(event) =>
                    onFieldChange(
                      'program_name',
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="space-y-2">

              <Label>
                Program Subtitle
              </Label>

              <Input
                value={
                  settings.program_subtitle || ''
                }
                onChange={(event) =>
                  onFieldChange(
                    'program_subtitle',
                    event.target.value
                  )
                }
              />

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <div className="space-y-2">

                <Label>
                  Event Date
                </Label>

                <Input
                  type="date"
                  value={
                    settings.event_date || ''
                  }
                  onChange={(event) =>
                    onFieldChange(
                      'event_date',
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>
                  Venue
                </Label>

                <Input
                  value={
                    settings.venue || ''
                  }
                  onChange={(event) =>
                    onFieldChange(
                      'venue',
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="space-y-2">

              <Label>
                Address
              </Label>

              <Textarea
                value={
                  settings.address || ''
                }
                onChange={(event) =>
                  onFieldChange(
                    'address',
                    event.target.value
                  )
                }
              />

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <div className="space-y-2">

                <Label>
                  Contact Phone
                </Label>

                <Input
                  value={
                    settings.contact_phone || ''
                  }
                  onChange={(event) =>
                    onFieldChange(
                      'contact_phone',
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>
                  Contact Email
                </Label>

                <Input
                  type="email"
                  value={
                    settings.contact_email || ''
                  }
                  onChange={(event) =>
                    onFieldChange(
                      'contact_email',
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

          </CardContent>

        </Card>

        {/* THEME */}

        <Card>

          <CardHeader>
            <CardTitle>
              Theme & Header
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <p className="text-sm text-muted-foreground">
              Change the public website
              colours from the admin panel.
            </p>

            {[
              [
                'primary_color',
                'Primary Color',
              ],
              [
                'secondary_color',
                'Secondary Color',
              ],
              [
                'accent_color',
                'Accent Color',
              ],
              [
                'page_background',
                'Page Background',
              ],
              [
                'header_background',
                'Header Background',
              ],
              [
                'header_text_color',
                'Header Text',
              ],
              [
                'search_background',
                'Search Background',
              ],
            ].map(([field, label]) => (

              <div
                key={field}
                className="space-y-2"
              >

                <Label>
                  {label}
                </Label>

                <div className="flex items-center gap-2 rounded-lg border p-2">

                  <input
                    type="color"
                    value={
                      (settings[
                        field as keyof Settings
                      ] as string) ||
                      '#ffffff'
                    }
                    onChange={(event) =>
                      onFieldChange(
                        field as keyof Settings,
                        event.target.value as never
                      )
                    }
                    className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                  />

                  <Input
                    value={
                      (settings[
                        field as keyof Settings
                      ] as string) || ''
                    }
                    onChange={(event) =>
                      onFieldChange(
                        field as keyof Settings,
                        event.target.value as never
                      )
                    }
                    className="font-mono text-xs"
                  />

                </div>

              </div>

            ))}

          </CardContent>

        </Card>

        {/* MEDIA + FOOTER */}

        <Card>

          <CardHeader>
            <CardTitle>
              Media & Footer
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* LOGO */}

            <div className="space-y-2">

              <Label>
                Logo
              </Label>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">

                {previewLogo ? (

                  <img
                    src={previewLogo}
                    alt="Website logo preview"
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                ) : (

                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary text-muted-foreground">

                    <ImageIcon className="h-7 w-7" />

                  </div>

                )}

                <label className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-secondary">

                  <Upload className="mr-2 h-4 w-4" />

                  {uploadingLogo
                    ? 'Uploading...'
                    : 'Upload Logo'}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingLogo}
                    onChange={(event) =>
                      handleImageUpload(
                        event,
                        'logo'
                      )
                    }
                  />

                </label>

              </div>

            </div>

            {/* BANNER */}

            <div className="space-y-2">

              <Label>
                Hero Banner
              </Label>

              <div className="rounded-lg border border-dashed p-3">

                {previewBanner ? (

                  <img
                    src={previewBanner}
                    alt="Website banner preview"
                    className="h-32 w-full rounded-lg object-cover"
                  />

                ) : (

                  <div className="flex h-32 w-full items-center justify-center rounded-lg bg-secondary text-muted-foreground">

                    <Camera className="mr-2 h-5 w-5" />

                    No banner uploaded

                  </div>

                )}

                <label className="mt-3 flex cursor-pointer items-center justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-secondary">

                  <Upload className="mr-2 h-4 w-4" />

                  {uploadingBanner
                    ? 'Uploading...'
                    : 'Upload Banner'}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingBanner}
                    onChange={(event) =>
                      handleImageUpload(
                        event,
                        'banner'
                      )
                    }
                  />

                </label>

              </div>

            </div>

            {/* FOOTER TEXT */}

            <div className="space-y-2">

              <Label>
                Footer Text
              </Label>

              <Textarea
                value={
                  settings.footer_text || ''
                }
                onChange={(event) =>
                  onFieldChange(
                    'footer_text',
                    event.target.value
                  )
                }
              />

            </div>

            {/* COPYRIGHT */}

            <div className="space-y-2">

              <Label>
                Copyright Text
              </Label>

              <Input
                value={
                  settings.copyright || ''
                }
                onChange={(event) =>
                  onFieldChange(
                    'copyright',
                    event.target.value
                  )
                }
              />

            </div>

            {/* SOCIAL LINKS */}

            <div className="grid gap-4 md:grid-cols-2">

              <div className="space-y-2">

                <Label>
                  Facebook URL
                </Label>

                <Input
                  placeholder="https://facebook.com/..."
                  value={
                    settings.facebook_url || ''
                  }
                  onChange={(event) =>
                    onFieldChange(
                      'facebook_url',
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>
                  Instagram URL
                </Label>

                <Input
                  placeholder="https://instagram.com/..."
                  value={
                    settings.instagram_url || ''
                  }
                  onChange={(event) =>
                    onFieldChange(
                      'instagram_url',
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>
                  YouTube URL
                </Label>

                <Input
                  placeholder="https://youtube.com/..."
                  value={
                    settings.youtube_url || ''
                  }
                  onChange={(event) =>
                    onFieldChange(
                      'youtube_url',
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>
                  WhatsApp Group Link
                </Label>

                <Input
                  placeholder="https://chat.whatsapp.com/..."
                  value={
                    settings.whatsapp_group_url || ''
                  }
                  onChange={(event) =>
                    onFieldChange(
                      'whatsapp_group_url',
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}