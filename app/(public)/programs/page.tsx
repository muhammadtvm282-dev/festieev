'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, GraduationCap, Users, Baby } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, type Category } from '@/lib/supabase';

const iconFor = (slug: string) => {
  if (slug === 'senior') return GraduationCap;
  if (slug === 'junior') return Users;
  return Baby;
};

export default function ProgramsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
      setCategories(cats ?? []);
      const { data: progs } = await supabase.from('programs').select('category_id');
      const map: Record<string, number> = {};
      (progs ?? []).forEach((p) => {
        if (p.category_id) map[p.category_id] = (map[p.category_id] ?? 0) + 1;
      });
      setCounts(map);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-primary sm:text-4xl">Program Categories</h1>
        <p className="mt-2 text-muted-foreground">Three categories of competitions for all age groups.</p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => {
            const Icon = iconFor(cat.slug);
            return (
              <Link
                key={cat.id}
                href={`/programs/${cat.slug}`}
                className="group block animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                  <CardContent className="flex h-full flex-col items-center p-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-primary">{cat.name}</h2>
                    {cat.description && (
                      <p className="mt-1.5 text-sm text-muted-foreground">{cat.description}</p>
                    )}
                    <Badge variant="secondary" className="mt-3">
                      {counts[cat.id] ?? 0} Programs
                    </Badge>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                      View Programs <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
