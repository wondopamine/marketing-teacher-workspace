# Landing page content

Every word on the Teacher Workspace landing page and on the `/content-review`
wireframe lives in this folder. Edit the `.mdx` files here and the page follows.
You never need to touch TypeScript.

## Preview your changes

```bash
pnpm install     # first time only
pnpm dev
```

Then open <http://localhost:3000/content-review>. Save a file and the page
reloads on its own.

## Editing on the page with ⌘K

You don't have to find the right file first. This works on the dev server *and*
on the shared review link — reviewers need no account of any kind:

1. Press **⌘K** (Ctrl+K on Windows), or click **Edit** in the review panel.
2. Every piece of editable copy gets a dashed outline. Click one and type.
3. Press **Enter**, or click away, to save. The change is written straight into
   the right `.mdx` file and the page reloads.
4. Press **⌘K** again, or **Esc**, to leave edit mode.

**Esc while typing** cancels that one edit and puts the original text back.

Two things it will refuse, and tell you why:

- **Empty copy.** Clear a block and it snaps back — delete the wording in the
  file instead if a slot should be blank.
- **Line breaks.** One block is one line of copy. To add a paragraph, edit the
  `.mdx` file directly.

On the dev server your edits are written straight into the `.mdx` file. On a
deployed review link they are collected instead, and **Send** commits the round
to a branch and adds it to a pull request for the designer to read as a diff.
See `docs/review-feedback-setup.md` for switching sending on.

## What is in each file

Files in `landing/` are numbered in the order they appear down the page.

| File                          | What it controls                                       |
| ----------------------------- | ------------------------------------------------------ |
| `landing/01-meta.mdx`         | Browser-tab title and search-result description        |
| `landing/02-hero.mdx`         | Opening headline, opening copy, and the button         |
| `landing/03-story.mdx`        | The five-act student care journey                      |
| `landing/04-reveal.mdx`       | The "This is Teacher Workspace" moment                 |
| `landing/05-capabilities.mdx` | The four product capabilities                          |
| `landing/07-audiences.mdx`    | Who the page is written for                            |
| `landing/08-proof.mdx`        | The testimonial section framing                        |
| `landing/09-access-support.mdx` | How teachers get in, and where support comes from    |
| `landing/10-close.mdx`        | The closing headline and copy                          |
| `landing/11-footer.mdx`       | Copyright line and feedback link label                 |
| `screens.mdx`                 | Descriptions of the product screens shown beside the copy |
| `wireframe.mdx`               | Labels the review page uses to describe itself         |

## How a file is put together

There are three ingredients. You will recognise all of them from any Markdown
editor.

**1. Settings, between the `---` lines at the top.** Short labels, in
`name: value` form. A line starting with `#` here is a note to you, not content.

```mdx
---
label: Story flow
---
```

**2. Headings and paragraphs.** A line starting with `#` is the big heading. A
line starting with `##` is a heading inside a block. Everything else is body
copy. Leave a blank line between paragraphs.

```mdx
# See the progress worth building on.

Teacher Workspace brings recent observations, next steps, family
communication, and the student record together.
```

**3. `<Item>` blocks**, one per card, step, or capability.

```mdx
<Item id="promise" label="A positive moment">

## A student is beginning to contribute with growing confidence.

You want to understand the progress and help it continue.

</Item>
```

- `id` is the block's name in code. **Do not change it or reorder blocks** —
  that is what connects this copy to the right product capability.
- `label` is the small line above the heading. Change it freely.
- The `##` line and the paragraphs under it are yours to rewrite.

In `screens.mdx`, the bullet list inside each block becomes the three elements
listed under the description. Keep it to exactly three.

## Filling in a "Copy pending" slot

Some slots on the wireframe show **Copy pending** because nobody has decided
the wording yet. Two of them you can resolve here, and the pending note
disappears as soon as you do.

**An audience question and answer** — in `landing/07-audiences.mdx`, change

```mdx
<Item id="teachers" label="Form Teachers" />
```

into

```mdx
<Item id="teachers" label="Form Teachers">

## What changes in my week?

You see one student's full picture without opening four systems.

</Item>
```

**The GA launch line** — in `landing/04-reveal.mdx`, put your line after
`launchLine:`.

The remaining pending slots — testimonials and the public support route — are
waiting on approvals rather than wording, so they stay pending until those
decisions are made in code.

## If something goes wrong

The dev server and the build stop with a message that names the file and what
is missing, for example:

```
Content error in content/landing/03-story.mdx:
<Item id="promise"> needs a heading line that starts with `##`.
```

Fix the named file and save. Nothing is broken permanently, and no change here
can affect the live product.

## What is not in this folder

Which sections exist, the order they appear in, and which product capability
each story step belongs to are set in `src/content/landing-v2.ts`. Those are
product decisions rather than wording, so a developer changes them with you.
