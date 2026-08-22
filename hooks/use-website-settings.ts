'use client';

import { useEffect, useState } from 'react';
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
  footer_text:
    'Nurturing minds and hearts with the light of Islamic knowledge.',
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

function hexToHsl(hex: string | null | undefined) {
  if (!hex) return null;

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

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;

      case g:
        h = (b - r) / d + 2;
        break;

      default:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(
    s * 100
  )}% ${Math.round(l * 100)}%`;
}

function applyWebsiteTheme(settings: Settings) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  root.style.setProperty(
    '--primary',
    hexToHsl(settings.primary_color) ??
      '152 56% 22%'
  );

  root.style.setProperty(
    '--secondary',
    hexToHsl(settings.secondary_color) ??
      '152 40% 92%'
  );

  root.style.setProperty(
    '--accent',
    hexToHsl(settings.accent_color) ??
      '43 74% 49%'
  );

  root.style.setProperty(
    '--background',
    hexToHsl(settings.page_background) ??
      '0 0% 100%'
  );

  root.style.setProperty(
    '--card',
    hexToHsl(settings.page_background) ??
      '0 0% 100%'
  );

  root.style.setProperty(
    '--site-header-bg',
    settings.header_background ||
      '#ffffff'
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

  document.title =
    `${settings.madrasa_name || 'Madrasa'}` +
    `${
      settings.program_name
        ? ` — ${settings.program_name}`
        : ''
    }`;
}

export function useWebsiteSettings() {
  const [settings, setSettings] =
    useState<Settings>(DEFAULT_SETTINGS);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const {
          data,
          error,
        } = await supabase
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

          setSettings(DEFAULT_SETTINGS);
          applyWebsiteTheme(DEFAULT_SETTINGS);

          return;
        }

        if (data) {
          const remoteSettings = {
            ...DEFAULT_SETTINGS,
            ...data,
          } as Settings;

          setSettings(remoteSettings);
          applyWebsiteTheme(remoteSettings);
        } else {
          setSettings(DEFAULT_SETTINGS);
          applyWebsiteTheme(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error(
          'Failed to load website settings:',
          error
        );

        if (!cancelled) {
          setSettings(DEFAULT_SETTINGS);
          applyWebsiteTheme(DEFAULT_SETTINGS);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    settings,
    loading,
  };
}