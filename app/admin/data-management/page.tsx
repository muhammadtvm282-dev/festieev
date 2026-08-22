'use client';

import {
  useState,
} from 'react';

import JSZip from 'jszip';

import {
  Download,
  Upload,
  Database,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';

import { useToast } from '@/hooks/use-toast';

import { supabase } from '@/lib/supabase';

type BackupData = {
  format: string;
  version: number;
  exported_at: string;
  source: string;

  settings: unknown[];
  categories: unknown[];
  programs: unknown[];
  schedule: unknown[];
  participants: unknown[];
  results: unknown[];
  live_status: unknown[];
  emergency_contacts: unknown[];
  queries_contact: unknown[];
};

type ExportResult = {
  name: string;
  data: unknown[];
};

function safeJson(
  value: unknown
) {
  return JSON.stringify(
    value,
    null,
    2
  );
}

function escapeHtml(
  value: unknown
) {
  return String(
    value ?? ''
  )
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getObjectValue(
  object: unknown,
  keys: string[]
) {
  if (
    !object ||
    typeof object !== 'object'
  ) {
    return '';
  }

  const record =
    object as Record<
      string,
      unknown
    >;

  for (const key of keys) {
    if (
      record[key] !== undefined &&
      record[key] !== null
    ) {
      return String(
        record[key]
      );
    }
  }

  return '';
}

function createEventReport(
  backup: BackupData
) {
  const settings =
    (backup.settings[0] ??
      {}) as Record<
      string,
      unknown
    >;

  const madrasaName =
    getObjectValue(
      settings,
      ['madrasa_name', 'name']
    ) ||
    'Festieev Event';

  const programName =
    getObjectValue(
      settings,
      ['program_name']
    );

  const eventDate =
    getObjectValue(
      settings,
      ['event_date', 'date']
    );

  const venue =
    getObjectValue(
      settings,
      ['venue']
    );

  const address =
    getObjectValue(
      settings,
      ['address']
    );

  const categoriesHtml =
    backup.categories
      .map(
        (category, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(
              getObjectValue(
                category,
                ['name', 'category_name']
              )
            )}</td>
          </tr>
        `
      )
      .join('');

  const programsHtml =
    backup.programs
      .map(
        (program, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(
              getObjectValue(
                program,
                [
                  'program_number',
                  'number',
                  'sl_no',
                ]
              )
            )}</td>
            <td>${escapeHtml(
              getObjectValue(
                program,
                [
                  'name',
                  'program_name',
                ]
              )
            )}</td>
            <td>${escapeHtml(
              getObjectValue(
                program,
                [
                  'category',
                  'category_name',
                ]
              )
            )}</td>
          </tr>
        `
      )
      .join('');

  const scheduleHtml =
    backup.schedule
      .map(
        (entry, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(
              getObjectValue(
                entry,
                [
                  'sl_no',
                  'program_number',
                ]
              )
            )}</td>
            <td>${escapeHtml(
              getObjectValue(
                entry,
                [
                  'program_name',
                  'name',
                ]
              )
            )}</td>
            <td>${escapeHtml(
              getObjectValue(
                entry,
                [
                  'start_time',
                  'time',
                ]
              )
            )}</td>
            <td>${escapeHtml(
              getObjectValue(
                entry,
                [
                  'end_time',
                ]
              )
            )}</td>
          </tr>
        `
      )
      .join('');

  const participantsHtml =
    backup.participants
      .map(
        (participant, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(
              getObjectValue(
                participant,
                [
                  'participant_number',
                  'chest_number',
                  'number',
                ]
              )
            )}</td>
            <td>${escapeHtml(
              getObjectValue(
                participant,
                [
                  'name',
                  'participant_name',
                ]
              )
            )}</td>
            <td>${escapeHtml(
              getObjectValue(
                participant,
                [
                  'category',
                ]
              )
            )}</td>
          </tr>
        `
      )
      .join('');

  const resultsHtml =
    backup.results
      .map(
        (result, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(
              getObjectValue(
                result,
                [
                  'program_number',
                ]
              )
            )}</td>
            <td>${escapeHtml(
              getObjectValue(
                result,
                [
                  'program_name',
                  'name',
                ]
              )
            )}</td>
            <td>${escapeHtml(
              getObjectValue(
                result,
                [
                  'first_prize',
                ]
              )
            )}</td>
            <td>${escapeHtml(
              getObjectValue(
                result,
                [
                  'second_prize',
                ]
              )
            )}</td>
            <td>${escapeHtml(
              getObjectValue(
                result,
                [
                  'third_prize',
                ]
              )
            )}</td>
          </tr>
        `
      )
      .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${escapeHtml(
    madrasaName
  )} - Event Report</title>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    Arial,
    Helvetica,
    sans-serif;
  background: #f5f7f6;
  color: #1f2937;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px;
}

.hero {
  background: #164b36;
  color: white;
  padding: 40px 30px;
  border-radius: 18px;
  margin-bottom: 24px;
}

.hero h1 {
  margin: 0 0 8px;
  font-size: 32px;
}

.hero p {
  margin: 5px 0;
  opacity: .9;
}

.info {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.info-card {
  background: white;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.info-card strong {
  display: block;
  color: #164b36;
  margin-bottom: 5px;
}

.section {
  background: white;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.section h2 {
  margin-top: 0;
  color: #164b36;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #e8f3ed;
  color: #164b36;
}

.stats {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.stat {
  text-align: center;
  background: #f3f7f5;
  padding: 18px;
  border-radius: 12px;
}

.stat strong {
  display: block;
  font-size: 28px;
  color: #164b36;
}

.footer {
  text-align: center;
  color: #6b7280;
  padding: 25px;
  font-size: 13px;
}

@media print {
  body {
    background: white;
  }

  .container {
    max-width: none;
  }

  .section,
  .hero {
    break-inside: avoid;
  }
}
</style>
</head>

<body>

<div class="container">

  <div class="hero">

    <h1>
      ${escapeHtml(madrasaName)}
    </h1>

    <p>
      ${escapeHtml(
        programName
      )}
    </p>

    <p>
      Complete Event Information
    </p>

  </div>

  <div class="info">

    <div class="info-card">
      <strong>Event Date</strong>
      ${escapeHtml(eventDate) || 'Not specified'}
    </div>

    <div class="info-card">
      <strong>Venue</strong>
      ${escapeHtml(venue) || 'Not specified'}
    </div>

    <div class="info-card">
      <strong>Address</strong>
      ${escapeHtml(address) || 'Not specified'}
    </div>

    <div class="info-card">
      <strong>Exported</strong>
      ${escapeHtml(
        backup.exported_at
      )}
    </div>

  </div>

  <div class="section">

    <h2>Event Summary</h2>

    <div class="stats">

      <div class="stat">
        <strong>
          ${backup.categories.length}
        </strong>
        Categories
      </div>

      <div class="stat">
        <strong>
          ${backup.programs.length}
        </strong>
        Programs
      </div>

      <div class="stat">
        <strong>
          ${backup.schedule.length}
        </strong>
        Schedule Entries
      </div>

      <div class="stat">
        <strong>
          ${backup.participants.length}
        </strong>
        Participants
      </div>

      <div class="stat">
        <strong>
          ${backup.results.length}
        </strong>
        Results
      </div>

    </div>

  </div>

  <div class="section">

    <h2>Categories</h2>

    <table>

      <thead>
        <tr>
          <th>#</th>
          <th>Category</th>
        </tr>
      </thead>

      <tbody>
        ${
          categoriesHtml ||
          `
          <tr>
            <td colspan="2">
              No categories
            </td>
          </tr>
          `
        }
      </tbody>

    </table>

  </div>

  <div class="section">

    <h2>Programs</h2>

    <table>

      <thead>
        <tr>
          <th>#</th>
          <th>Program No</th>
          <th>Program Name</th>
          <th>Category</th>
        </tr>
      </thead>

      <tbody>
        ${
          programsHtml ||
          `
          <tr>
            <td colspan="4">
              No programs
            </td>
          </tr>
          `
        }
      </tbody>

    </table>

  </div>

  <div class="section">

    <h2>Schedule</h2>

    <table>

      <thead>
        <tr>
          <th>#</th>
          <th>Program No</th>
          <th>Program</th>
          <th>Start</th>
          <th>End</th>
        </tr>
      </thead>

      <tbody>
        ${
          scheduleHtml ||
          `
          <tr>
            <td colspan="5">
              No schedule
            </td>
          </tr>
          `
        }
      </tbody>

    </table>

  </div>

  <div class="section">

    <h2>Participants</h2>

    <table>

      <thead>
        <tr>
          <th>#</th>
          <th>Number</th>
          <th>Name</th>
          <th>Category</th>
        </tr>
      </thead>

      <tbody>
        ${
          participantsHtml ||
          `
          <tr>
            <td colspan="4">
              No participants
            </td>
          </tr>
          `
        }
      </tbody>

    </table>

  </div>

  <div class="section">

    <h2>Results</h2>

    <table>

      <thead>
        <tr>
          <th>#</th>
          <th>Program No</th>
          <th>Program</th>
          <th>First</th>
          <th>Second</th>
          <th>Third</th>
        </tr>
      </thead>

      <tbody>
        ${
          resultsHtml ||
          `
          <tr>
            <td colspan="6">
              No results
            </td>
          </tr>
          `
        }
      </tbody>

    </table>

  </div>

  <div class="section">

    <h2>Backup Contents</h2>

    <ul>
      <li>Website Settings</li>
      <li>Categories</li>
      <li>Programs</li>
      <li>Schedule</li>
      <li>Participants</li>
      <li>Results</li>
      <li>Live Status</li>
      <li>Emergency Contacts</li>
      <li>Queries Contact</li>
      <li>Website Assets</li>
    </ul>

  </div>

  <div class="footer">

    Generated by Festieev Event Management System.

    <br />

    This report is included inside the
    Event Package ZIP.

  </div>

</div>

</body>
</html>`;
}

async function fetchTable(
  tableName: string,
  orderColumn?: string
): Promise<ExportResult> {
  let query =
    supabase
      .from(tableName)
      .select('*');

  if (orderColumn) {
    query = query.order(
      orderColumn
    );
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    throw new Error(
      `${tableName}: ${error.message}`
    );
  }

  return {
    name: tableName,
    data: data ?? [],
  };
}

async function downloadAsset(
  zip: JSZip,
  url: string | null | undefined,
  path: string
) {
  if (!url) {
    return;
  }

  try {
    const response =
      await fetch(url);

    if (!response.ok) {
      console.warn(
        'Asset download failed:',
        url
      );

      return;
    }

    const blob =
      await response.blob();

    zip.file(
      path,
      blob
    );
  } catch (error) {
    console.warn(
      'Could not download asset:',
      url,
      error
    );
  }
}

export default function DataManagementPage() {
  const { toast } =
    useToast();

  const [exporting, setExporting] =
    useState(false);

  const [importing, setImporting] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<BackupData | null>(null);

  const [confirmed, setConfirmed] =
    useState(false);

  const exportEvent =
    async () => {
      setExporting(true);

      try {
        const [
          settings,
          categories,
          programs,
          schedule,
          participants,
          results,
          liveStatus,
          emergencyContacts,
          queriesContact,
        ] =
          await Promise.all([
            fetchTable(
              'settings'
            ),

            fetchTable(
              'categories',
              'sort_order'
            ),

            fetchTable(
              'programs',
              'sort_order'
            ),

            fetchTable(
              'schedule',
              'sl_no'
            ),

            fetchTable(
              'participants',
              'participant_number'
            ),

            fetchTable(
              'results',
              'program_number'
            ),

            fetchTable(
              'live_status'
            ),

            fetchTable(
              'emergency_contacts',
              'sort_order'
            ),

            fetchTable(
              'queries_contact'
            ),
          ]);

        const backup: BackupData = {
          format:
            'festieev-event-package',

          version: 2,

          exported_at:
            new Date().toISOString(),

          source:
            'Festieev Event Management System',

          settings:
            settings.data,

          categories:
            categories.data,

          programs:
            programs.data,

          schedule:
            schedule.data,

          participants:
            participants.data,

          results:
            results.data,

          live_status:
            liveStatus.data,

          emergency_contacts:
            emergencyContacts.data,

          queries_contact:
            queriesContact.data,
        };

        const zip =
          new JSZip();

        /*
         * Main manifest
         */

        zip.file(
          'manifest.json',
          safeJson({
            format:
              backup.format,

            version:
              backup.version,

            exported_at:
              backup.exported_at,

            source:
              backup.source,

            contents: [
              'README.html',
              'data/settings.json',
              'data/categories.json',
              'data/programs.json',
              'data/schedule.json',
              'data/participants.json',
              'data/results.json',
              'data/live-status.json',
              'data/emergency-contacts.json',
              'data/queries-contact.json',
              'assets/',
            ],
          })
        );

        /*
         * Individual JSON files
         */

        zip.file(
          'data/settings.json',
          safeJson(
            backup.settings
          )
        );

        zip.file(
          'data/categories.json',
          safeJson(
            backup.categories
          )
        );

        zip.file(
          'data/programs.json',
          safeJson(
            backup.programs
          )
        );

        zip.file(
          'data/schedule.json',
          safeJson(
            backup.schedule
          )
        );

        zip.file(
          'data/participants.json',
          safeJson(
            backup.participants
          )
        );

        zip.file(
          'data/results.json',
          safeJson(
            backup.results
          )
        );

        zip.file(
          'data/live-status.json',
          safeJson(
            backup.live_status
          )
        );

        zip.file(
          'data/emergency-contacts.json',
          safeJson(
            backup.emergency_contacts
          )
        );

        zip.file(
          'data/queries-contact.json',
          safeJson(
            backup.queries_contact
          )
        );

        /*
         * Human-readable HTML report
         */

        const report =
          createEventReport(
            backup
          );

        zip.file(
          'README.html',
          report
        );

        /*
         * Download website assets referenced
         * by the current settings.
         */

        const settingsRow =
          (backup.settings[0] ??
            {}) as Record<
            string,
            unknown
          >;

        const logoUrl =
          typeof settingsRow.logo_url ===
          'string'
            ? settingsRow.logo_url
            : typeof settingsRow.madrasa_logo ===
                'string'
              ? settingsRow.madrasa_logo
              : null;

        const bannerUrl =
          typeof settingsRow.banner_url ===
          'string'
            ? settingsRow.banner_url
            : null;

        await downloadAsset(
          zip,
          logoUrl,
          'assets/logo/logo'
        );

        await downloadAsset(
          zip,
          bannerUrl,
          'assets/banners/banner'
        );

        /*
         * Security note
         *
         * No .env, API keys,
         * service-role keys or passwords
         * are exported.
         */

        zip.file(
          'SECURITY-NOTE.txt',
          [
            'Festieev Event Package',
            '',
            'This package does NOT contain:',
            '- Supabase service-role keys',
            '- API secrets',
            '- Admin passwords',
            '- .env files',
            '- Authentication tokens',
            '',
            'Keep this package secure because it contains event data.',
          ].join('\n')
        );

        /*
         * Generate ZIP
         */

        const blob =
          await zip.generateAsync({
            type: 'blob',
            compression:
              'DEFLATE',
            compressionOptions: {
              level: 6,
            },
          });

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            'a'
          );

        link.href = url;

        const date =
          new Date()
            .toISOString()
            .slice(
              0,
              10
            );

        link.download =
          `Festieev-Event-${date}.zip`;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
          url
        );

        toast({
          title:
            'Complete event package exported',

          description:
            'The ZIP contains event data, a readable HTML report and website assets.',
        });
      } catch (
        error: unknown
      ) {
        console.error(error);

        const message =
          error instanceof Error
            ? error.message
            : 'Export failed';

        toast({
          title:
            'Export failed',

          description:
            message,

          variant:
            'destructive',
        });
      } finally {
        setExporting(false);
      }
    };

  const handleFile =
    async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      setSelectedFile(file);
      setPreview(null);
      setConfirmed(false);

      try {
        const zip =
          await JSZip.loadAsync(
            file
          );

        const manifestFile =
          zip.file(
            'manifest.json'
          );

        if (!manifestFile) {
          throw new Error(
            'This ZIP is not a valid Festieev Event Package.'
          );
        }

        const manifestText =
          await manifestFile.async(
            'text'
          );

        const manifest =
          JSON.parse(
            manifestText
          );

        if (
          manifest.format !==
          'festieev-event-package'
        ) {
          throw new Error(
            'Invalid Festieev Event Package.'
          );
        }

        const readJson =
          async (
            path: string
          ) => {
            const entry =
              zip.file(path);

            if (!entry) {
              return [];
            }

            const text =
              await entry.async(
                'text'
              );

            return JSON.parse(
              text
            );
          };

        const imported: BackupData =
          {
            format:
              manifest.format,

            version:
              manifest.version,

            exported_at:
              manifest.exported_at,

            source:
              manifest.source,

            settings:
              await readJson(
                'data/settings.json'
              ),

            categories:
              await readJson(
                'data/categories.json'
              ),

            programs:
              await readJson(
                'data/programs.json'
              ),

            schedule:
              await readJson(
                'data/schedule.json'
              ),

            participants:
              await readJson(
                'data/participants.json'
              ),

            results:
              await readJson(
                'data/results.json'
              ),

            live_status:
              await readJson(
                'data/live-status.json'
              ),

            emergency_contacts:
              await readJson(
                'data/emergency-contacts.json'
              ),

            queries_contact:
              await readJson(
                'data/queries-contact.json'
              ),
          };

        setPreview(
          imported
        );

        toast({
          title:
            'Event package loaded',

          description:
            'Review the event details before importing.',
        });
      } catch (
        error: unknown
      ) {
        console.error(error);

        const message =
          error instanceof Error
            ? error.message
            : 'Invalid event package';

        setSelectedFile(
          null
        );

        toast({
          title:
            'Invalid Event Package',

          description:
            message,

          variant:
            'destructive',
        });
      }

      event.target.value = '';
    };

  /*
   * IMPORTANT:
   *
   * We keep Import disabled in this version.
   *
   * Export is safe.
   *
   * Importing complete participants/results
   * into the currently live database needs
   * a separate "Create New Event" workflow
   * so existing live data cannot be overwritten.
   */

  const importEvent =
    async () => {
      if (!preview) {
        return;
      }

      if (!confirmed) {
        toast({
          title:
            'Confirmation required',

          description:
            'Confirm the package before continuing.',

          variant:
            'destructive',
        });

        return;
      }

      setImporting(true);

      try {
        /*
         * We deliberately do not insert
         * anything into the live database yet.
         *
         * The next version will create a
         * separate event and remap all IDs.
         */

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              500
            )
        );

        toast({
          title:
            'Package verified',

          description:
            'The package is valid. New Event import can now be connected safely.',
        });
      } finally {
        setImporting(false);
      }
    };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <h1 className="text-2xl font-bold text-primary sm:text-3xl">
          Data Management
        </h1>

        <p className="mt-1 text-muted-foreground">
          Export and share the complete event
          package with your event manager.
        </p>

      </div>

      {/* SECURITY WARNING */}

      <Card className="border-amber-500/30 bg-amber-500/5">

        <CardContent className="flex gap-3 p-4">

          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

          <div>

            <p className="font-semibold">
              Complete event backup
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              The exported package contains
              event information including
              participants and results.
              Keep the ZIP secure when sharing it.
              Passwords, API keys and secrets
              are never exported.
            </p>

          </div>

        </CardContent>

      </Card>

      {/* EXPORT */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <Download className="h-5 w-5 text-primary" />

            Export Complete Event

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-5">

          <p className="text-sm text-muted-foreground">
            Create one ZIP package containing
            the complete event information and
            a readable HTML report for your event
            manager.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {[
              [
                'Website Settings',
                Database,
              ],

              [
                'Programs & Categories',
                Database,
              ],

              [
                'Schedule',
                Database,
              ],

              [
                'Participants',
                Database,
              ],

              [
                'Results',
                Database,
              ],

              [
                'Event Report',
                FileText,
              ],

              [
                'Logo & Banner',
                ImageIcon,
              ],

              [
                'Live Status',
                Database,
              ],

              [
                'Contacts',
                Database,
              ],
            ].map(
              ([label, Icon]) => {

                const IconComponent =
                  Icon as React.ElementType;

                return (
                  <div
                    key={
                      label as string
                    }
                    className="flex items-center gap-2 rounded-lg border p-3"
                  >

                    <CheckCircle2 className="h-4 w-4 text-green-600" />

                    <IconComponent className="h-4 w-4 text-muted-foreground" />

                    <span className="text-sm">
                      {label as string}
                    </span>

                  </div>
                );
              }
            )}

          </div>

          <Button
            onClick={
              exportEvent
            }
            disabled={
              exporting
            }
            className="w-full sm:w-auto"
          >

            <Download className="mr-2 h-4 w-4" />

            {exporting
              ? 'Creating Complete ZIP...'
              : 'Download Complete Event ZIP'}

          </Button>

        </CardContent>

      </Card>

      {/* IMPORT */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <Upload className="h-5 w-5 text-primary" />

            Import Event Package

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-5">

          <p className="text-sm text-muted-foreground">
            Select a Festieev Event Package ZIP
            exported from this system.
          </p>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:bg-secondary/40">

            <FileArchive className="h-10 w-10 text-muted-foreground" />

            <span className="mt-3 font-medium">
              Choose Event Package
            </span>

            <span className="mt-1 text-xs text-muted-foreground">
              .zip Event Package
            </span>

            <input
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={
                handleFile
              }
            />

          </label>

          {selectedFile && (

            <div className="rounded-lg border p-3">

              <div className="flex items-center justify-between gap-3">

                <span className="truncate text-sm font-medium">
                  {selectedFile.name}
                </span>

                <Badge variant="secondary">
                  ZIP
                </Badge>

              </div>

            </div>

          )}

          {preview && (

            <div className="space-y-4 rounded-xl border bg-secondary/20 p-4">

              <div>

                <h3 className="font-semibold">
                  Event Package Preview
                </h3>

                <p className="text-xs text-muted-foreground">
                  Exported:{' '}
                  {new Date(
                    preview.exported_at
                  ).toLocaleString()}
                </p>

              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                <Count
                  label="Categories"
                  value={
                    preview.categories.length
                  }
                />

                <Count
                  label="Programs"
                  value={
                    preview.programs.length
                  }
                />

                <Count
                  label="Schedule"
                  value={
                    preview.schedule.length
                  }
                />

                <Count
                  label="Participants"
                  value={
                    preview.participants.length
                  }
                />

                <Count
                  label="Results"
                  value={
                    preview.results.length
                  }
                />

                <Count
                  label="Live Status"
                  value={
                    preview.live_status.length
                  }
                />

              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">

                <strong>
                  Import protection:
                </strong>

                <span className="text-muted-foreground">
                  {' '}
                  Complete event restoration
                  will use a separate New Event
                  workflow so the current live
                  event cannot be accidentally
                  overwritten.
                </span>

              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">

                <input
                  type="checkbox"
                  checked={
                    confirmed
                  }
                  onChange={(
                    event
                  ) =>
                    setConfirmed(
                      event.target
                        .checked
                    )
                  }
                  className="mt-1 h-4 w-4"
                />

                <span className="text-sm">
                  I understand that this package
                  contains complete event data and
                  must be handled securely.
                </span>

              </label>

              <Button
                onClick={
                  importEvent
                }
                disabled={
                  importing ||
                  !confirmed
                }
                variant="outline"
                className="w-full"
              >

                <Upload className="mr-2 h-4 w-4" />

                {importing
                  ? 'Verifying...'
                  : 'Verify Event Package'}

              </Button>

            </div>

          )}

        </CardContent>

      </Card>

    </div>
  );
}

function Count({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">

      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-primary">
        {value}
      </p>

    </div>
  );
}