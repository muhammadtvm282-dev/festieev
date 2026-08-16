'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Menu, X, Search, Shield, ArrowRight, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWebsiteSettings } from '@/hooks/use-website-settings';

const navLinks = [
  { href: '/', label: 'Home', keywords: 'home main' },
  { href: '/programs', label: 'Programs', keywords: 'program competition events' },
  { href: '/live', label: 'Live', keywords: 'live stream current' },
  { href: '/schedule', label: 'Schedule', keywords: 'schedule timetable time' },
  { href: '/participants', label: 'Participants', keywords: 'participants students' },
  { href: '/results', label: 'Results', keywords: 'results winners prizes' },
  { href: '/emergency', label: 'Emergency', keywords: 'emergency contacts help' },
  { href: '/queries', label: 'Queries', keywords: 'questions contact' },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { settings } = useWebsiteSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return navLinks.filter((link) => `${link.label} ${link.keywords}`.toLowerCase().includes(query)).slice(0, 5);
  }, [search]);

  const submitSearch = (value = search) => {
    const query = value.trim().toLowerCase();
    if (!query) return;
    const match = navLinks.find((link) => `${link.label} ${link.keywords}`.toLowerCase().includes(query));
    if (match) window.location.href = match.href;
  };

  const logo = settings?.logo_url || settings?.madrasa_logo || null;
  const name = settings?.madrasa_name || 'Madrasa';
  const program = settings?.program_name || 'Program';

  useEffect(() => {
    document.title = `${name}${program ? ` — ${program}` : ''}`;
  }, [name, program]);

  return (
    <header style={{ backgroundColor: 'var(--site-header-bg)', color: 'var(--site-header-text)' }} className={cn('sticky top-0 z-50 w-full border-b transition-all duration-300', scrolled ? 'border-border/80 shadow-sm backdrop-blur-xl' : 'border-border/50 backdrop-blur-lg')}>
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/10">
            {logo ? <img src={logo} alt={`${name} logo`} className="h-full w-full object-cover" /> : <Moon className="h-5 w-5" />}
          </div>
          <div className="hidden min-w-0 leading-tight sm:flex sm:flex-col">
            <span className="truncate font-arabic text-base font-bold" style={{ color: 'var(--site-header-text)' }}>{name}</span>
            <span className="truncate text-[11px] font-medium text-muted-foreground">{program}</span>
          </div>
        </Link>

        <div className="relative mx-auto hidden w-full max-w-sm md:block">
          <div style={{ backgroundColor: 'var(--site-search-bg)' }} className="flex h-10 items-center rounded-xl border border-border px-3 transition focus-within:border-primary/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
              placeholder="Search pages..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" style={{ color: 'var(--site-header-text)' }}
              aria-label="Search website"
            />
          </div>
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-xl">
              {suggestions.map((item) => (
                <button key={item.href} onClick={() => { setSearch(''); submitSearch(item.label); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-secondary">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
          {navLinks.slice(0, 6).map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-2.5 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-secondary hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button asChild size="sm" className="hidden sm:inline-flex rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
            <Link href="/admin"><Shield className="mr-1.5 h-4 w-4" />Admin</Link>
          </Button>
          <button className="inline-flex items-center justify-center rounded-lg p-2 text-primary hover:bg-secondary lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t bg-white/98 shadow-lg backdrop-blur-lg lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <div className="mb-3 flex h-10 items-center rounded-xl border border-border bg-muted/50 px-3 md:hidden">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }} placeholder="Search pages..." className="w-full bg-transparent text-sm outline-none" />
            </div>
            <nav className="grid grid-cols-2 gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-primary">{link.label}</Link>
              ))}
            </nav>
            <Link href="/admin" onClick={() => setOpen(false)} className="mt-2 flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-secondary"><Shield className="mr-2 h-4 w-4" />Admin Panel</Link>
          </div>
        </div>
      )}
    </header>
  );
}
