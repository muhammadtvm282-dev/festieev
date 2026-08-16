'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';
import { useWebsiteSettings } from '@/hooks/use-website-settings';

export function SiteFooter() {
  const { settings } = useWebsiteSettings();

  return (
    <footer className="mt-20 bg-islamic-pattern text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-accent/20 text-accent ring-1 ring-accent/20">
                {(settings?.logo_url || settings?.madrasa_logo) ? <img src={settings.logo_url || settings.madrasa_logo || ''} alt="Logo" className="h-full w-full object-cover" /> : <span className="text-lg font-bold">DH</span>}
              </div>
              <div>
                <p className="font-arabic text-lg font-bold">{settings?.madrasa_name ?? 'Madrasa'}</p>
                <p className="text-sm text-white/70">{settings?.program_name ?? 'Program'}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              {settings?.footer_text ?? ''}
            </p>
            <div className="flex items-center gap-3">
              {settings?.facebook_url ? (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="text-white/70 transition-colors hover:text-accent"><Facebook className="h-4 w-4" /></a>
              ) : null}
              {settings?.instagram_url ? (
                <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="text-white/70 transition-colors hover:text-accent"><Instagram className="h-4 w-4" /></a>
              ) : null}
              {settings?.youtube_url ? (
                <a href={settings.youtube_url} target="_blank" rel="noreferrer" className="text-white/70 transition-colors hover:text-accent"><Youtube className="h-4 w-4" /></a>
              ) : null}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Programs', '/programs'],
                ['Schedule', '/schedule'],
                ['Participants', '/participants'],
                ['Results', '/results'],
                ['Live', '/live'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-white/70 transition-colors hover:text-accent">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{settings?.address ?? 'Madrasa Campus, Calicut, Kerala, India'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <span>{settings?.contact_phone ?? '+91 98765 43210'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <span>{settings?.contact_email ?? 'info@darulhuda.example'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/60">
          {settings?.copyright ?? ''}
        </div>
      </div>
    </footer>
  );
}
