'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Trophy,
  Eye,
  EyeOff,
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

import {
  supabase,
  type Result,
} from '@/lib/supabase';

type ResultMode = 'individual' | 'team';

type PrizeKey =
  | 'first'
  | 'second'
  | 'third';

type TeamPrize = {
  type: 'team';
  teamName: string;
  members: string[];
};

function parseTeamPrize(
  value: string | null
): TeamPrize | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);

    if (
      parsed?.type === 'team' &&
      typeof parsed.teamName === 'string' &&
      Array.isArray(parsed.members)
    ) {
      return {
        type: 'team',
        teamName: parsed.teamName,
        members: parsed.members.filter(
          (member: unknown): member is string =>
            typeof member === 'string'
        ),
      };
    }
  } catch {
    // Existing individual result.
  }

  return null;
}

function makeTeamPrize(
  teamName: string,
  membersText: string
) {
  const members = membersText
    .split('\n')
    .map((member) => member.trim())
    .filter(Boolean);

  return JSON.stringify({
    type: 'team',
    teamName: teamName.trim(),
    members,
  });
}

export default function AdminResultsPage() {
  const { toast } = useToast();

  const [results, setResults] =
    useState<Result[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [open, setOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<Result | null>(null);

  const [mode, setMode] =
    useState<ResultMode>('individual');

  const [participants, setParticipants] =
    useState<
      {
        participant_number: string;
        name: string;
      }[]
    >([]);

  const [form, setForm] = useState({
    program_number: '',
    program_name: '',
    category: '',
    first_prize: '',
    second_prize: '',
    third_prize: '',
    published: false,
  });

  const [prizeNames, setPrizeNames] =
    useState({
      first: '',
      second: '',
      third: '',
    });

  const [teamNames, setTeamNames] =
    useState({
      first: '',
      second: '',
      third: '',
    });

  const [teamMembers, setTeamMembers] =
    useState({
      first: '',
      second: '',
      third: '',
    });

  const load = async () => {
    setLoading(true);

    const [
      { data: resultData, error: resultError },
      { data: participantData, error: participantError },
    ] = await Promise.all([
      supabase
        .from('results')
        .select('*')
        .order('program_number'),

      supabase
        .from('participants')
        .select(
          'participant_number, name'
        )
        .order('participant_number'),
    ]);

    if (resultError) {
      console.error(resultError);

      toast({
        title: 'Failed to load results',
        description: resultError.message,
        variant: 'destructive',
      });
    }

    if (participantError) {
      console.error(participantError);
    }

    setResults(resultData ?? []);
    setParticipants(participantData ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setMode('individual');

    setForm({
      program_number: '',
      program_name: '',
      category: '',
      first_prize: '',
      second_prize: '',
      third_prize: '',
      published: false,
    });

    setPrizeNames({
      first: '',
      second: '',
      third: '',
    });

    setTeamNames({
      first: '',
      second: '',
      third: '',
    });

    setTeamMembers({
      first: '',
      second: '',
      third: '',
    });
  };

  const openNew = () => {
    setEditing(null);
    resetForm();
    setOpen(true);
  };

  const parseIndividualPrize = (
    value: string | null
  ) => {
    const raw = value ?? '';

    const separator =
      raw.indexOf(' - ');

    if (separator >= 0) {
      return {
        chest: raw
          .slice(0, separator)
          .trim(),

        name: raw
          .slice(separator + 3)
          .trim(),
      };
    }

    return {
      chest: raw.trim(),
      name: '',
    };
  };

  const openEdit = (result: Result) => {
    setEditing(result);

    const teams = {
      first: parseTeamPrize(
        result.first_prize
      ),

      second: parseTeamPrize(
        result.second_prize
      ),

      third: parseTeamPrize(
        result.third_prize
      ),
    };

    const isTeam = Boolean(
      teams.first ||
        teams.second ||
        teams.third
    );

    setMode(
      isTeam
        ? 'team'
        : 'individual'
    );

    const first =
      parseIndividualPrize(
        result.first_prize
      );

    const second =
      parseIndividualPrize(
        result.second_prize
      );

    const third =
      parseIndividualPrize(
        result.third_prize
      );

    setForm({
      program_number:
        String(result.program_number),

      program_name:
        result.program_name,

      category:
        result.category ?? '',

      first_prize:
        isTeam
          ? ''
          : first.chest,

      second_prize:
        isTeam
          ? ''
          : second.chest,

      third_prize:
        isTeam
          ? ''
          : third.chest,

      published:
        result.published,
    });

    setPrizeNames({
      first: first.name,
      second: second.name,
      third: third.name,
    });

    setTeamNames({
      first:
        teams.first?.teamName ?? '',

      second:
        teams.second?.teamName ?? '',

      third:
        teams.third?.teamName ?? '',
    });

    setTeamMembers({
      first:
        teams.first?.members.join(
          '\n'
        ) ?? '',

      second:
        teams.second?.members.join(
          '\n'
        ) ?? '',

      third:
        teams.third?.members.join(
          '\n'
        ) ?? '',
    });

    setOpen(true);
  };

  const findParticipant = (
    chestNumber: string
  ) => {
    const value =
      chestNumber
        .trim()
        .toLowerCase();

    if (!value) {
      return '';
    }

    return (
      participants.find(
        (participant) =>
          participant.participant_number
            .trim()
            .toLowerCase() === value
      )?.name ?? ''
    );
  };

  const save = async () => {
    if (!form.program_name.trim()) {
      toast({
        title:
          'Program name is required',
        variant: 'destructive',
      });

      return;
    }

    const basePayload = {
      program_number:
        parseInt(
          form.program_number,
          10
        ) || 0,

      program_name:
        form.program_name.trim(),

      category:
        form.category.trim() || null,

      published:
        form.published,
    };

    let payload:
      Record<string, unknown>;

    if (mode === 'team') {
      const prizes: Record<
        PrizeKey,
        string | null
      > = {
        first:
          teamNames.first.trim()
            ? makeTeamPrize(
                teamNames.first,
                teamMembers.first
              )
            : null,

        second:
          teamNames.second.trim()
            ? makeTeamPrize(
                teamNames.second,
                teamMembers.second
              )
            : null,

        third:
          teamNames.third.trim()
            ? makeTeamPrize(
                teamNames.third,
                teamMembers.third
              )
            : null,
      };

      const keys: PrizeKey[] = [
        'first',
        'second',
        'third',
      ];

      for (const key of keys) {
        const members =
          teamMembers[key]
            .split('\n')
            .map((member) =>
              member.trim()
            )
            .filter(Boolean);

        if (
          teamNames[key].trim() &&
          members.length === 0
        ) {
          toast({
            title: `Add members for ${key} prize`,
            variant: 'destructive',
          });

          return;
        }
      }

      payload = {
        ...basePayload,

        first_prize:
          prizes.first,

        second_prize:
          prizes.second,

        third_prize:
          prizes.third,
      };
    } else {
      const prizes = [
        [
          'First Prize',
          form.first_prize,
          prizeNames.first,
        ],

        [
          'Second Prize',
          form.second_prize,
          prizeNames.second,
        ],

        [
          'Third Prize',
          form.third_prize,
          prizeNames.third,
        ],
      ] as const;

      const invalid =
        prizes.find(
          ([, chest, name]) =>
            chest.trim() &&
            !name
        );

      if (invalid) {
        toast({
          title:
            `Chest number not found for ${invalid[0]}`,

          description:
            'Add the participant first.',

          variant: 'destructive',
        });

        return;
      }

      payload = {
        ...basePayload,

        first_prize:
          form.first_prize.trim()
            ? `${form.first_prize.trim()} - ${prizeNames.first}`
            : null,

        second_prize:
          form.second_prize.trim()
            ? `${form.second_prize.trim()} - ${prizeNames.second}`
            : null,

        third_prize:
          form.third_prize.trim()
            ? `${form.third_prize.trim()} - ${prizeNames.third}`
            : null,
      };
    }

    const query = editing
      ? supabase
          .from('results')
          .update(payload)
          .eq('id', editing.id)
      : supabase
          .from('results')
          .insert(payload);

    const { error } =
      await query;

    if (error) {
      console.error(error);

      toast({
        title: 'Failed to save result',
        description:
          error.message,
        variant: 'destructive',
      });

      return;
    }

    toast({
      title: editing
        ? 'Result updated'
        : 'Result added',
    });

    setOpen(false);

    await load();
  };

  const togglePublish = async (
    result: Result
  ) => {
    const { error } =
      await supabase
        .from('results')
        .update({
          published:
            !result.published,
        })
        .eq(
          'id',
          result.id
        );

    if (error) {
      toast({
        title:
          'Failed to update result',
        description:
          error.message,
        variant: 'destructive',
      });

      return;
    }

    toast({
      title:
        result.published
          ? 'Result hidden'
          : 'Result published',
    });

    await load();
  };

  const remove = async (
    result: Result
  ) => {
    if (
      !confirm(
        `Delete result for "${result.program_name}"?`
      )
    ) {
      return;
    }

    const { error } =
      await supabase
        .from('results')
        .delete()
        .eq(
          'id',
          result.id
        );

    if (error) {
      toast({
        title:
          'Failed to delete result',
        description:
          error.message,
        variant: 'destructive',
      });

      return;
    }

    toast({
      title:
        'Result deleted',
    });

    await load();
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">
            Results
          </h1>

          <p className="mt-1 text-muted-foreground">
            Add individual or team/group results.
          </p>
        </div>

        <Button
          onClick={openNew}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Result
        </Button>

      </div>

      {/* RESULTS TABLE */}

      <Card>

        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">

            <Trophy className="h-5 w-5 text-primary" />

            All Results ({results.length})

          </CardTitle>
        </CardHeader>

        <CardContent>

          {loading ? (

            <div className="py-8 text-center text-muted-foreground">
              Loading...
            </div>

          ) : results.length === 0 ? (

            <p className="py-8 text-center text-muted-foreground">
              No results yet.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="border-b text-left text-muted-foreground">

                  <tr>

                    <th className="px-3 py-2">
                      No
                    </th>

                    <th className="px-3 py-2">
                      Program
                    </th>

                    <th className="px-3 py-2">
                      Category
                    </th>

                    <th className="px-3 py-2">
                      Status
                    </th>

                    <th className="px-3 py-2 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-border">

                  {results.map(
                    (result) => (

                      <tr
                        key={result.id}
                        className="hover:bg-secondary/40"
                      >

                        <td className="px-3 py-2.5 font-medium text-primary">
                          {result.program_number}
                        </td>

                        <td className="px-3 py-2.5 font-medium">
                          {result.program_name}
                        </td>

                        <td className="px-3 py-2.5">

                          {result.category && (
                            <Badge variant="secondary">
                              {result.category}
                            </Badge>
                          )}

                        </td>

                        <td className="px-3 py-2.5">

                          {result.published ? (

                            <Badge className="bg-green-600 text-white">

                              <Eye className="mr-1 h-3 w-3" />

                              Published

                            </Badge>

                          ) : (

                            <Badge variant="outline">

                              <EyeOff className="mr-1 h-3 w-3" />

                              Hidden

                            </Badge>

                          )}

                        </td>

                        <td className="px-3 py-2.5">

                          <div className="flex justify-end gap-1">

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                togglePublish(
                                  result
                                )
                              }
                            >
                              {result.published ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                openEdit(
                                  result
                                )
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                remove(
                                  result
                                )
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </CardContent>

      </Card>

      {/* ADD / EDIT DIALOG */}

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >

        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">

          <DialogHeader>

            <DialogTitle>
              {editing
                ? 'Edit Result'
                : 'Add Result'}
            </DialogTitle>

          </DialogHeader>

          <div className="space-y-4 py-2">

            {/* PROGRAM INFO */}

            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-2">

                <Label>
                  Program Number
                </Label>

                <Input
                  type="number"
                  value={
                    form.program_number
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      program_number:
                        event.target.value,
                    })
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>
                  Category
                </Label>

                <Input
                  value={
                    form.category
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category:
                        event.target.value,
                    })
                  }
                  placeholder="Senior"
                />

              </div>

            </div>

            <div className="space-y-2">

              <Label>
                Program Name
              </Label>

              <Input
                value={
                  form.program_name
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    program_name:
                      event.target.value,
                  })
                }
                placeholder="Group Song"
              />

            </div>

            {/* RESULT TYPE */}

            <div className="grid grid-cols-2 gap-2 rounded-lg border p-1">

              <Button
                type="button"
                variant={
                  mode === 'individual'
                    ? 'default'
                    : 'ghost'
                }
                onClick={() =>
                  setMode(
                    'individual'
                  )
                }
              >
                Individual
              </Button>

              <Button
                type="button"
                variant={
                  mode === 'team'
                    ? 'default'
                    : 'ghost'
                }
                onClick={() =>
                  setMode('team')
                }
              >
                Team / Group
              </Button>

            </div>

            {/* INDIVIDUAL */}

            {mode === 'individual' ? (

              <div className="space-y-4">

                {(
                  [
                    [
                      'first_prize',
                      'first',
                      'First Prize',
                    ],
                    [
                      'second_prize',
                      'second',
                      'Second Prize',
                    ],
                    [
                      'third_prize',
                      'third',
                      'Third Prize',
                    ],
                  ] as const
                ).map(
                  ([
                    field,
                    key,
                    label,
                  ]) => {

                    const name =
                      prizeNames[key] ||
                      findParticipant(
                        form[field]
                      );

                    return (
                      <div
                        key={field}
                        className="space-y-2"
                      >

                        <Label>
                          {label} — Chest Number
                        </Label>

                        <Input
                          value={
                            form[field]
                          }
                          onChange={(event) => {

                            const chest =
                              event.target
                                .value;

                            setForm({
                              ...form,
                              [field]:
                                chest,
                            });

                            setPrizeNames({
                              ...prizeNames,
                              [key]:
                                findParticipant(
                                  chest
                                ),
                            });

                          }}
                          placeholder="Enter chest number"
                          list="participant-chest-numbers"
                        />

                        <Input
                          value={name}
                          readOnly
                          placeholder="Participant name"
                          className="bg-muted/40"
                        />

                      </div>
                    );
                  }
                )}

                <datalist id="participant-chest-numbers">

                  {participants.map(
                    (participant) => (

                      <option
                        key={
                          participant.participant_number
                        }
                        value={
                          participant.participant_number
                        }
                      >
                        {participant.name}
                      </option>

                    )
                  )}

                </datalist>

              </div>

            ) : (

              /* TEAM */

              <div className="space-y-4">

                <div className="rounded-lg border bg-secondary/30 p-3 text-sm text-muted-foreground">

                  For Group Song and other
                  team events, enter the
                  team name and put every
                  member on a separate line.

                </div>

                {(
                  [
                    [
                      'first',
                      'First Prize',
                    ],
                    [
                      'second',
                      'Second Prize',
                    ],
                    [
                      'third',
                      'Third Prize',
                    ],
                  ] as const
                ).map(
                  ([key, label]) => (

                    <div
                      key={key}
                      className="space-y-3 rounded-lg border p-4"
                    >

                      <Label className="text-base font-semibold">
                        {label}
                      </Label>

                      <Input
                        value={
                          teamNames[key]
                        }
                        onChange={(event) =>
                          setTeamNames({
                            ...teamNames,
                            [key]:
                              event.target
                                .value,
                          })
                        }
                        placeholder="Team name"
                      />

                      <Textarea
                        value={
                          teamMembers[key]
                        }
                        onChange={(event) =>
                          setTeamMembers({
                            ...teamMembers,
                            [key]:
                              event.target
                                .value,
                          })
                        }
                        placeholder={
                          'Member 1\nMember 2\nMember 3\nMember 4'
                        }
                        rows={5}
                      />

                    </div>

                  )
                )}

              </div>

            )}

            {/* PUBLISH */}

            <div className="flex items-center justify-between rounded-lg border p-3">

              <div>

                <Label>
                  Publish immediately
                </Label>

                <p className="text-xs text-muted-foreground">
                  Off keeps the result
                  hidden from visitors.
                </p>

              </div>

              <Switch
                checked={
                  form.published
                }
                onCheckedChange={(
                  value
                ) =>
                  setForm({
                    ...form,
                    published: value,
                  })
                }
              />

            </div>

          </div>

          <DialogFooter>

            <DialogClose asChild>

              <Button variant="outline">
                Cancel
              </Button>

            </DialogClose>

            <Button
              onClick={save}
            >
              {editing
                ? 'Save Changes'
                : 'Add Result'}
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>
  );
}