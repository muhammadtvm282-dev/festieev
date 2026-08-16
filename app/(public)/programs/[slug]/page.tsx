'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Hash, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase, type Program, type Category } from '@/lib/supabase';

export default function CategoryProgramsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [category, setCategory] = useState<Category | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      setCategory(cat);
      if (cat) {
        const { data: progs } = await supabase
          .from('programs')
          .select('*')
          .eq('category_id', cat.id)
          .order('program_number');
        setPrograms(progs ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-8 w-48 rounded animate-shimmer" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-primary">Category not found</h1>
        <Button asChild className="mt-6">
          <Link href="/programs">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Programs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/programs">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> All Categories
        </Link>
      </Button>

      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-bold text-primary sm:text-4xl">{category.name} Programs</h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        )}
      </div>

      {programs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No programs added yet for this category.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p, i) => (
            <Card
              key={p.id}
              className="overflow-hidden animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Hash className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Program #{p.program_number}
                  </div>
                  <h3 className="mt-0.5 text-lg font-semibold text-primary">{p.name}</h3>
                  {p.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
