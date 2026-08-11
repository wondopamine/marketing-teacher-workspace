# Cut the product explorer from the GA page

The three-step product explorer ("choose scenario → inspect context → preview action") has no section on the GA landing page. Issue #3's seven-section IA gives comprehension two layers, the five-act journey and the capability cards ("the discovery layer... comes after the story, never before"), and the explorer was a third layer doing the same job with the least earned attention. Its page placement had never been decided (`placement: null`), which was the seam that let it go cleanly.

The explorer remains an accepted **product** decision (`productExplorer.status: "accepted"` in `src/content/landing-v2.ts`), with its comprehension flow and synthetic-data-only contract intact. It is future work with no page slot, not cancelled work. The measurement plan keeps its three `explorer-*` engagement events as a contract for that future milestone.

Consequences: `content/landing/06-explorer.mdx` is gone, the review registry and section order have no `explorer` section, and the access-and-support section moved after the close so the page lands on the ticket's seven sections. Re-adding the explorer later is a new IA decision that reopens the section order, not a revert of this file.
