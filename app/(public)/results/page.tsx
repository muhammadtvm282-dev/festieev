'use client';

import { useEffect, useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Users,
} from 'lucide-react';

import {
  Card,
  CardContent,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import {
  supabase,
  type Result,
} from '@/lib/supabase';

type TeamPrize = {
  type: 'team';
  teamName: string;
  members: string[];
};

type PrizeValue = {
  isTeam: boolean;
  teamName?: string;
  members?: string[];
  value: string | null;
};

function parsePrize(
  value: string | null
): PrizeValue {
  if (!value) {
    return {
      isTeam: false,
      value: null,
    };
  }

  try {
    const parsed = JSON.parse(value);

    if (
      parsed?.type === 'team' &&
      typeof parsed.teamName === 'string' &&
      Array.isArray(parsed.members)
    ) {
      const team: TeamPrize = {
        type: 'team',
        teamName: parsed.teamName,
        members: parsed.members.filter(
          (member: unknown): member is string =>
            typeof member === 'string'
        ),
      };

      return {
        isTeam: true,
        teamName: team.teamName,
        members: team.members,
        value: null,
      };
    }
  } catch {
    // Existing individual result.
  }

  return {
    isTeam: false,
    value,
  };
}

export default function ResultsPage() {
  const [results, setResults] =
    useState<Result[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadResults() {
      const { data, error } =
        await supabase
          .from('results')
          .select('*')
          .eq('published', true)
          .order('program_number');

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          'Failed to load results:',
          error
        );

        setResults([]);
      } else {
        setResults(data ?? []);
      }

      setLoading(false);
    }

    loadResults();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">

      {/* PAGE HEADER */}

      <div className="mb-8 text-center animate-fade-in">

        <h1 className="text-3xl font-bold text-primary sm:text-4xl">
          Results
        </h1>

        <p className="mt-2 text-muted-foreground">
          Winners of each program.
        </p>

      </div>

      {/* LOADING */}

      {loading ? (

        <div className="space-y-4">

          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="h-24 rounded-2xl animate-shimmer"
              />
            )
          )}

        </div>

      ) : results.length === 0 ? (

        /* EMPTY */

        <Card>

          <CardContent className="flex flex-col items-center justify-center py-20 text-center">

            <Trophy className="h-12 w-12 text-muted-foreground/40" />

            <p className="mt-4 text-muted-foreground">
              No results published yet.
              Please check back after the
              competitions.
            </p>

          </CardContent>

        </Card>

      ) : (

        <>
          {/* DESKTOP */}

          <Card className="hidden overflow-hidden sm:block">

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-primary text-white">

                  <tr>

                    <th className="px-4 py-3 text-left font-semibold">
                      Program No
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Program Name
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Category
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" />
                        First
                      </span>
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Medal className="h-3.5 w-3.5" />
                        Second
                      </span>
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        Third
                      </span>
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-border">

                  {results.map(
                    (result) => {

                      const first =
                        parsePrize(
                          result.first_prize
                        );

                      const second =
                        parsePrize(
                          result.second_prize
                        );

                      const third =
                        parsePrize(
                          result.third_prize
                        );

                      return (

                        <tr
                          key={result.id}
                          className="transition-colors hover:bg-secondary/40"
                        >

                          <td className="px-4 py-3 font-medium text-primary">
                            {result.program_number}
                          </td>

                          <td className="px-4 py-3 font-medium">
                            {result.program_name}
                          </td>

                          <td className="px-4 py-3">

                            {result.category && (
                              <Badge variant="secondary">
                                {result.category}
                              </Badge>
                            )}

                          </td>

                          {/* FIRST */}

                          <td className="px-4 py-3 align-top">

                            <DesktopPrize
                              prize={first}
                              position="first"
                            />

                          </td>

                          {/* SECOND */}

                          <td className="px-4 py-3 align-top">

                            <DesktopPrize
                              prize={second}
                              position="second"
                            />

                          </td>

                          {/* THIRD */}

                          <td className="px-4 py-3 align-top">

                            <DesktopPrize
                              prize={third}
                              position="third"
                            />

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </Card>

          {/* MOBILE */}

          <div className="space-y-4 sm:hidden">

            {results.map(
              (result) => (

                <Card
                  key={result.id}
                  className="animate-fade-up"
                >

                  <CardContent className="p-4">

                    <div className="flex items-center justify-between">

                      <Badge
                        variant="outline"
                        className="font-mono"
                      >
                        #{result.program_number}
                      </Badge>

                      {result.category && (
                        <Badge variant="secondary">
                          {result.category}
                        </Badge>
                      )}

                    </div>

                    <h3 className="mt-2 font-bold text-primary">
                      {result.program_name}
                    </h3>

                    <div className="mt-3 space-y-2">

                      <PrizeRow
                        icon={Trophy}
                        color="text-amber-600"
                        label="First"
                        value={
                          result.first_prize
                        }
                      />

                      <PrizeRow
                        icon={Medal}
                        color="text-slate-500"
                        label="Second"
                        value={
                          result.second_prize
                        }
                      />

                      <PrizeRow
                        icon={Award}
                        color="text-orange-600"
                        label="Third"
                        value={
                          result.third_prize
                        }
                      />

                    </div>

                  </CardContent>

                </Card>

              )
            )}

          </div>

        </>

      )}

    </div>
  );
}

/* =========================================================
   DESKTOP PRIZE
========================================================= */

function DesktopPrize({
  prize,
  position,
}: {
  prize: PrizeValue;
  position:
    | 'first'
    | 'second'
    | 'third';
}) {

  if (!prize.isTeam) {

    return (
      <span
        className={
          position === 'first'
            ? 'font-semibold text-amber-700'
            : 'text-muted-foreground'
        }
      >
        {prize.value ?? '—'}
      </span>
    );
  }

  return (
    <div className="min-w-[170px] space-y-2">

      <div className="flex items-center gap-1.5">

        <Users className="h-4 w-4 text-primary" />

        <span className="font-semibold text-primary">
          {prize.teamName}
        </span>

      </div>

      <div className="space-y-1">

        {prize.members?.map(
          (member, index) => (

            <div
              key={`${member}-${index}`}
              className="rounded-md bg-secondary/50 px-2 py-1 text-xs"
            >
              {member}
            </div>

          )
        )}

      </div>

    </div>
  );
}

/* =========================================================
   MOBILE PRIZE
========================================================= */

function PrizeRow({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: React.ElementType;
  color: string;
  label: string;
  value: string | null;
}) {

  const prize =
    parsePrize(value);

  return (
    <div className="rounded-lg bg-secondary/40 px-3 py-2">

      <div className="flex items-center gap-2">

        <Icon
          className={`h-4 w-4 ${color}`}
        />

        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>

        {!prize.isTeam && (
          <span className="ml-auto text-sm font-medium text-primary">
            {prize.value ?? '—'}
          </span>
        )}

      </div>

      {prize.isTeam && (

        <div className="mt-2 ml-6">

          <div className="flex items-center gap-1.5">

            <Users className="h-4 w-4 text-primary" />

            <span className="font-semibold text-primary">
              {prize.teamName}
            </span>

          </div>

          <div className="mt-2 space-y-1">

            {prize.members?.map(
              (member, index) => (

                <div
                  key={`${member}-${index}`}
                  className="rounded-md bg-background px-2 py-1.5 text-sm"
                >
                  {member}
                </div>

              )
            )}

          </div>

        </div>

      )}

    </div>
  );
}