'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, LogIn, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';

export default function AdminLoginPage() {
  const { session, loading, signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace('/admin/dashboard');
    }
  }, [loading, session, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      setError(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-islamic-pattern px-4">
      <div className="absolute inset-0 bg-pattern-subtle opacity-20" />
      <Card className="relative w-full max-w-md animate-scale-in shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Moon className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl text-primary">Admin Login</CardTitle>
          <CardDescription>Sign in to manage the Madrasa Annual Program.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@madrasa.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 rounded-lg bg-secondary/60 px-4 py-3 text-center text-xs text-muted-foreground">
            Admin accounts are created in Supabase. Use your authorized email and password to sign in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
