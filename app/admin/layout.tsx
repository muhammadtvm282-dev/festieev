'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ListChecks,
  Tags,
  CalendarClock,
  Users,
  Radio,
  Trophy,
  Siren,
  HelpCircle,
  Database,
  LogOut,
  Menu,
  X,
  Moon,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWebsiteSettings } from '@/hooks/use-website-settings';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/programs', label: 'Programs', icon: ListChecks },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/schedule', label: 'Schedule', icon: CalendarClock },
  { href: '/admin/participants', label: 'Participants', icon: Users },
  { href: '/admin/live', label: 'Live Control', icon: Radio },
  { href: '/admin/results', label: 'Results', icon: Trophy },
  { href: '/admin/emergency', label: 'Emergency', icon: Siren },
  { href: '/admin/queries', label: 'Queries', icon: HelpCircle },

  // Event backup / import / export
  {
    href: '/admin/data-management',
    label: 'Data Management',
    icon: Database,
  },

  { href: '/admin/website-settings', label: 'Website Settings', icon: Moon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { settings } = useWebsiteSettings();

  const logo =
    settings?.logo_url ||
    settings?.madrasa_logo ||
    null;

  const brandName =
    settings?.madrasa_name ||
    'Darul Huda Madrasa';

  useEffect(() => {
    if (
      !loading &&
      !session &&
      pathname !== '/admin'
    ) {
      router.replace('/admin');
    }
  }, [
    loading,
    session,
    pathname,
    router,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pattern-subtle">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!session && pathname !== '/admin') {
    return null;
  }

  if (!session) {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace('/admin');
  };

  return (
    <div className="min-h-screen bg-pattern-subtle">

      {/* Mobile top bar */}

      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">

        <div className="flex items-center gap-2">

          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground">

            {logo ? (
              <img
                src={logo}
                alt="Logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <Moon className="h-4 w-4" />
            )}

          </div>

          <span className="max-w-[180px] truncate font-bold text-primary">
            {brandName}
          </span>

        </div>

        <button
          onClick={() =>
            setSidebarOpen((value) => !value)
          }
          className="rounded-lg p-2 text-primary"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

      </div>

      <div className="flex">

        {/* Sidebar */}

        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 w-64 transform bg-islamic-pattern text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          )}
        >

          <div className="flex h-full flex-col">

            {/* Brand */}

            <div className="flex items-center gap-2.5 px-5 py-5">

              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-accent/20 text-accent">

                {logo ? (
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Moon className="h-5 w-5" />
                )}

              </div>

              <div className="min-w-0">

                <p className="truncate font-arabic text-base font-bold">
                  {brandName}
                </p>

                <p className="text-xs text-white/60">
                  Admin Panel
                </p>

              </div>

            </div>

            {/* Navigation */}

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">

              {navItems.map((item) => {

                const active =
                  pathname === item.href ||
                  (
                    item.href !== '/admin' &&
                    pathname.startsWith(
                      item.href
                    )
                  );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setSidebarOpen(false)
                    }
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',

                      active
                        ? 'bg-accent/20 text-accent'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )}
                  >

                    <item.icon className="h-4 w-4 shrink-0" />

                    {item.label}

                  </Link>
                );
              })}

            </nav>

            {/* Bottom actions */}

            <div className="space-y-1 border-t border-white/10 p-3">

              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
                View Public Site
              </Link>

              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>

            </div>

          </div>

        </aside>

        {/* Mobile overlay */}

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() =>
              setSidebarOpen(false)
            }
          />
        )}

        {/* Main content */}

        <main className="min-h-screen flex-1 lg:ml-0">

          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>

        </main>

      </div>

    </div>
  );
}