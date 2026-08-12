# CMS cutover and rollback

## Current state

Production stays on `CONTENT_SOURCE=static` until the replacement has final
approval. Publishing in the editor changes only the private comparison while
this switch remains static.

The switch is read at runtime but an environment change still needs a new
deployment. Do not describe it as instant.

## Safety rules

- Never cut over without a published `/` version, a content export, and a
  database backup.
- Never fall back to the static page after a CMS read error. The application
  returns a clear 503 page so stale content cannot look current.
- Keep all migrations additive during the first release window. The static
  rollback build ignores CMS tables, so it remains compatible with schema
  version 1 and later additive changes.
- Keep the previous static deployment URL until the release window closes.
- Do not store exports or database dumps under `public/`, `.output/`, `.git/`,
  or `node_modules/`.

## 1. Back up the release

Do not start the production steps before final approval. First connect the
approved CMS database to Vercel's Production environment and add
`CMS_EDIT_KEY_HASH` and `CMS_COOKIE_SECRET` there. Use the same database that
held the approved Preview publication; do not run a fresh template import over
it. These environment changes do not alter the currently promoted static
deployment.

Use a UTC timestamp in both filenames. These commands read the production
environment without writing an environment file to disk.

```sh
vercel env run --environment production -- pnpm cms:export-published -- --path / --output backups/cms-publication-YYYYMMDDTHHMMSSZ.json
vercel env run --environment production -- pnpm cms:backup-database -- --output backups/cms-database-YYYYMMDDTHHMMSSZ.dump
pg_restore --list backups/cms-database-YYYYMMDDTHHMMSSZ.dump
```

The publication export is private because it contains the full immutable
version, including reviewer context. The PostgreSQL dump is private for the
same reason.

Use a `pg_dump` major version that is the same as or newer than the database
server. Preview currently runs PostgreSQL 17, so its backup needs PostgreSQL
17 tools. Set `PG_DUMP_BIN` when the matching binary is not first on `PATH`:

```sh
PG_DUMP_BIN=/path/to/postgresql-17/bin/pg_dump vercel env run --environment preview -- pnpm cms:backup-database -- --output backups/cms-preview-YYYYMMDDTHHMMSSZ.dump
```

Stop if `pg_dump` reports a server-version mismatch. Do not treat an older
client's failed dump as a backup.

## 2. Test a preview deployment

Apply migrations, keep the imported homepage idempotent, and make the switch
explicit for Preview deployments:

```sh
vercel env run --environment preview -- pnpm db:migrate
vercel env run --environment preview -- pnpm cms:import
vercel env update CONTENT_SOURCE preview --value cms --yes
vercel deploy --yes
```

On the returned preview URL, verify:

- `/` is the published teacher page and contains no review pins or editor
  controls.
- a saved draft that has not been published does not change `/`.
- an unknown one-part path returns the Page not found screen.
- `/cms-preview` still needs the shared edit link.
- `/cms-compare` still needs the shared edit link.
- response HTML contains no UUID, design intent, comments, editor name, draft,
  version, or history data.
- the page has one main landmark, one H1, no horizontal overflow at 320px, and
  correct title and description metadata.

Then test the rollback build path without changing production:

```sh
vercel env update CONTENT_SOURCE preview --value static --yes
vercel deploy --yes
```

The new preview must show the released visual homepage at `/` and return 404
for CMS-only paths. Restore Preview to `cms` and deploy once more before the
production rehearsal.

## 3. Rehearse the production deployment after final approval

Do not start this step before the replacement has final approval. Record the
current production deployment URL as `STATIC_DEPLOYMENT_URL` in the release
notes. Build the future production deployment with CMS content, but keep it
away from the public domain while testing. The command overrides the switch
only for this unpromoted deployment, so the project setting stays static:

```sh
vercel deploy --prod --skip-domain --yes --build-env CONTENT_SOURCE=cms --env CONTENT_SOURCE=cms
```

Run every Preview check against the returned deployment URL. Confirm its
database schema is compatible with both this build and the recorded static
deployment. If the deployment command fails, the current public deployment and
the project's static default remain unchanged.

## 4. Promote after final approval

Only run this step after the replacement has final approval:

```sh
vercel env add CONTENT_SOURCE production --value cms --yes
vercel promote CMS_DEPLOYMENT_URL --yes
```

If `CONTENT_SOURCE` already exists in Production, update it to `cms` instead
of adding a second value. Setting the persistent value immediately before
promotion makes later production deployments use the CMS source too.

If promotion fails, immediately restore the Production setting before any
other deployment:

```sh
vercel env update CONTENT_SOURCE production --value static --yes
```

Immediately check `/`, one published secondary path if one exists, an unknown
path, `/cms-preview`, and `/cms-compare`. Confirm a draft-only edit does not
change `/`.

Expected promotion time: up to 3 minutes, plus DNS and edge propagation. Allow
5 minutes before declaring the release failed unless Vercel reports an error.

## 5. Roll back

The fastest recovery is the recorded deployment rollback:

```sh
vercel rollback STATIC_DEPLOYMENT_URL --yes
```

Expected recovery time: 2–5 minutes. This restores the previous code and its
static homepage without depending on the CMS database.

Also restore the production setting so a later deployment cannot cut over
again by accident:

```sh
vercel env update CONTENT_SOURCE production --value static --yes
```

That environment update alone does not change the live deployment. If the
deployment rollback is unavailable, create and promote a static deployment:

```sh
vercel deploy --prod --yes
```

Expected recovery time for this configuration redeploy: 5–10 minutes.

## 6. Close the release window

Keep the static source, its deployment, the full publication export, and the
database dump until the CMS release has been stable for the agreed window.
Only then may the prototype MDX/GitHub write path be frozen. Never add two-way
synchronisation between the files and PostgreSQL.
