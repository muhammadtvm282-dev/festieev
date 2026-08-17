'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  CalendarDays,
  MapPin,
  LayoutGrid,
  Radio,
  Clock,
  Users,
  Trophy,
  Siren,
  HelpCircle,
  ChevronRight,
  Moon,
  Sparkles,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { useWebsiteSettings } from '@/hooks/use-website-settings';

const navCards = [
  {
    href: '/programs',
    label: 'Programs',
    desc: 'Browse all competition programs',
    icon: LayoutGrid,
    color: 'from-emerald-500 to-emerald-700',
  },
  {
    href: '/live',
    label: 'Live',
    desc: 'View the current live program',
    icon: Radio,
    color: 'from-rose-500 to-rose-700',
  },
  {
    href: '/schedule',
    label: 'Schedule',
    desc: 'Full event timetable',
    icon: Clock,
    color: 'from-amber-500 to-amber-700',
  },
  {
    href: '/participants',
    label: 'Participants',
    desc: 'Meet our participants',
    icon: Users,
    color: 'from-teal-500 to-teal-700',
  },
  {
    href: '/results',
    label: 'Results',
    desc: 'Winners and prizes',
    icon: Trophy,
    color: 'from-yellow-500 to-amber-600',
  },
  {
    href: '/emergency',
    label: 'Emergency',
    desc: 'Emergency contacts',
    icon: Siren,
    color: 'from-red-500 to-red-700',
  },
  {
    href: '/queries',
    label: 'Queries',
    desc: 'Get your questions answered',
    icon: HelpCircle,
    color: 'from-sky-500 to-sky-700',
  },
];

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function useCountdown(target: string | null) {
  const [remaining, setRemaining] =
    useState<Countdown | null>(null);

  useEffect(() => {
    if (!target) {
      setRemaining(null);
      return;
    }

    const targetDate = new Date(
      `${target}T00:00:00`
    ).getTime();

    if (Number.isNaN(targetDate)) {
      setRemaining(null);
      return;
    }

    const tick = () => {
      const diff = targetDate - Date.now();

      if (diff <= 0) {
        setRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      setRemaining({
        days: Math.floor(diff / 86400000),

        hours: Math.floor(
          (diff % 86400000) / 3600000
        ),

        minutes: Math.floor(
          (diff % 3600000) / 60000
        ),

        seconds: Math.floor(
          (diff % 60000) / 1000
        ),
      });
    };

    tick();

    const intervalId = window.setInterval(
      tick,
      1000
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [target]);

  return remaining;
}

export default function HomePage() {
  const { settings, loading } =
    useWebsiteSettings();

  /*
   * IMPORTANT:
   * This hook MUST be called on every render.
   *
   * Do NOT put it after:
   *
   * if (loading) return ...
   *
   * Otherwise React hook order changes and
   * causes Minified React error #310.
   */
  const countdown = useCountdown(
    settings?.event_date ?? null
  );

  /*
   * Loading screen.
   *
   * This happens AFTER all hooks have been called.
   */
  if (loading || !settings) {
    return (
      <div
        className="min-h-screen bg-background"
        aria-busy="true"
        aria-label="Loading website"
      />
    );
  }

  const eventDate = settings.event_date
    ? new Date(
        `${settings.event_date}T00:00:00`
      ).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const heroBackground =
    settings.banner_url || null;

  const heroLogo =
    settings.logo_url ||
    settings.madrasa_logo ||
    null;

  const headline =
    settings.program_name ||
    'Annual Program 2026';

  const subtitle =
    settings.program_subtitle ||
    'Annual Program & Competition';

  const venue =
    settings.venue ||
    'Madrasa Auditorium';

  const title =
    settings.madrasa_name ||
    'Darul Huda Madrasa';

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-islamic-pattern text-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />

        <div className="absolute inset-0 bg-pattern-subtle opacity-30" />

        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        {heroBackground ? (
          <div className="absolute inset-0">
            <img
              src={heroBackground}
              alt="Hero banner"
              className="h-full w-full object-cover opacity-25"
            />
          </div>
        ) : null}

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-6 border-accent/40 bg-accent/10 text-accent backdrop-blur-sm"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />

              {headline}
            </Badge>

            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-accent/15 text-accent shadow-lg ring-1 ring-accent/20">
                {heroLogo ? (
                  <img
                    src={heroLogo}
                    alt="Madrasa logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Moon className="h-10 w-10" />
                )}
              </div>
            </div>

            <h1 className="font-arabic text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {title}
            </h1>

            <p className="mt-3 text-lg text-white/80 sm:text-xl">
              {subtitle}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
              <div className="flex items-center gap-2.5 text-white/90">
                <CalendarDays className="h-5 w-5 text-accent" />

                <span className="text-sm font-medium sm:text-base">
                  {eventDate ||
                    'Date to be announced'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-white/90">
                <MapPin className="h-5 w-5 text-accent" />

                <span className="text-sm font-medium sm:text-base">
                  {venue}
                </span>
              </div>
            </div>

            {countdown ? (
              <div className="mt-10 grid grid-cols-4 gap-3 sm:gap-4">
                {[
                  {
                    label: 'Days',
                    value: countdown.days,
                  },
                  {
                    label: 'Hours',
                    value: countdown.hours,
                  },
                  {
                    label: 'Minutes',
                    value: countdown.minutes,
                  },
                  {
                    label: 'Seconds',
                    value: countdown.seconds,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/15"
                  >
                    <div className="text-2xl font-bold text-accent sm:text-4xl">
                      {String(item.value).padStart(
                        2,
                        '0'
                      )}
                    </div>

                    <div className="mt-1 text-xs uppercase tracking-wider text-white/60 sm:text-sm">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link href="/programs">
                  Explore Programs

                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>

              {settings.whatsapp_group_url ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <a
                    href={
                      settings.whatsapp_group_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="mr-2 inline h-4 w-4"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M20.52 3.48A11.94 11.94 0 0012.01 0C5.37 0 .08 5.29.08 11.93c0 2.1.55 4.15 1.6 5.95L0 24l6.4-1.66a11.9 11.9 0 005.6 1.42h.01c6.64 0 11.94-5.29 11.94-11.94 0-3.19-1.24-6.19-3.43-8.34zM12 21.5h-.01c-1.76 0-3.5-.46-5.02-1.33l-.36-.21-3.8.99.99-3.7-.24-.38A9.58 9.58 0 012.5 11.93c0-5.23 4.26-9.49 9.51-9.49 2.54 0 4.92.99 6.72 2.78a9.44 9.44 0 012.78 6.71c0 5.25-4.25 9.51-9.49 9.51z" />

                      <path d="M17.6 14.1c-.3-.1-1.77-.87-2.05-.97-.28-.1-.48-.15-.69.1-.2.24-.77.97-.95 1.17-.18.2-.35.24-.65.08-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.48-1.77-1.65-2.07-.18-.3-.02-.46.13-.61.13-.12.3-.32.45-.48.15-.16.2-.27.3-.45.1-.18.05-.34-.02-.48-.07-.13-.69-1.66-.95-2.28-.25-.59-.51-.51-.7-.51-.18 0-.39-.02-.6-.02-.2 0-.52.07-.8.36-.28.28-1.06 1.04-1.06 2.52 0 1.47 1.09 2.89 1.24 3.09.15.2 2.13 3.34 5.16 4.68 3.03 1.34 3.03.89 3.57.83.54-.06 1.76-.72 2.01-1.41.25-.69.25-1.28.18-1.41-.07-.13-.25-.2-.55-.31z" />
                    </svg>

                    Join WhatsApp Group
                  </a>
                </Button>
              ) : null}

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 text-white hover:bg-white/10"
              >
                <Link href="/live">
                  <Radio className="mr-1.5 h-4 w-4" />

                  Watch Live
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Quick Access
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Explore the Program
          </h2>

          <p className="mt-2 text-muted-foreground">
            Everything you need for the annual
            program, in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {navCards.map((card, i) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.href}
                href={card.href}
                className="group block animate-fade-up"
                style={{
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <Card className="h-full overflow-hidden border-border/60 bg-white/90 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                  <CardContent className="flex h-full flex-col items-start gap-3 p-5">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary">
                        {card.label}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {card.desc}
                      </p>
                    </div>

                    <div className="mt-1 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Open

                      <ChevronRight className="ml-0.5 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}