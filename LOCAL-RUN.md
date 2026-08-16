# Local development

1. Open this folder in VS Code.
2. In the project root run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

## Branding & theme settings

Go to **Admin → Website Settings**.

You can now edit:
- Madrasa name
- Program name and subtitle
- Logo and hero banner
- Footer and copyright text
- Contact/social links
- Primary, secondary and accent colours
- Page background
- Header background and header text colour
- Search bar background colour

The public header, homepage hero, buttons, cards, footer, browser tab title and other theme elements use these settings dynamically.

## Important: Supabase migration

Run the new migration against the Supabase project before saving the new colour fields:

`supabase db push`

The migration is located at:
`supabase/migrations/20260816000000_add_theme_settings.sql`

If the database is already linked to this project, `supabase db push` will add the new columns to the existing `settings` table.
