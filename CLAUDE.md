# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An IT PMO Kanban board for a fictitious bank's internal IT project management office. The whole app is one file, `index.html`, holding the markup, a `<style>` block and a `<script>` block.

## Hard constraints (from the original brief — do not violate)

- **Vanilla HTML/CSS/JS only.** No frameworks, libraries, build step, bundler or npm.
- **Single file.** Everything stays in `index.html`, and it must work when opened by double-click from `file://`.
- **No external resources.** That means no CDN scripts, web fonts or image files. Use the system font stack and inline SVG or Unicode glyphs for icons.
- **No persistence.** Don't use localStorage, sessionStorage, IndexedDB or cookies. A refresh intentionally resets the board to the seed data, and the header note tells users this.
- **The only backend is FormSubmit**, called through its AJAX JSON endpoint with `fetch`. Never use a plain form POST. The only network destination is `FORMSUBMIT_ENDPOINT`.
- **Never use `alert()`, `confirm()` or `!important`.**
- **Escape all user-supplied strings with `escapeHtml()`** before they go into HTML strings.

## Running / testing

There is no build, lint or test tooling.

- **Run it:** `open index.html`.
- **Run the in-app browser's page tools:** they can't run scripts on `file://` pages, so serve the folder with `python3 -m http.server <free-port> --bind 127.0.0.1` and drive `http://127.0.0.1:<port>/index.html`.
- **Testing the add-task flow:** replace `window.fetch` with a rejecting function first. Otherwise you'll send real requests to FormSubmit.
- **Constraint check:** this should print nothing.
  ```
  grep -nE 'localStorage|sessionStorage|indexedDB|document\.cookie|alert\(|confirm\(|!important|<link|src="http' index.html
  ```

## Architecture (inside the `<script>` block)

- **Config first.** `FORMSUBMIT_ENDPOINT` is the one place the recipient email is set. `NOTIFY_TIMEOUT_MS` caps the email call. The HTML comment above `<script>` documents FormSubmit's one-time activation email.
- **One source of truth.** All state lives in one object:
  ```
  state = { tasks, filters, nextId, pendingDelete, openMoveMenu }
  ```
  Short-lived UI state also lives here: the inline delete confirmation and the open "Move ▸" menu. Cards render it, so it survives re-renders.
- **One-way render.** Action functions change `state` and then call `renderBoard()`:
  - `addTask()`, `moveTask()` and `deleteTask()` are the actions.
  - `renderBoard()` is the only code that writes card markup. It builds HTML strings with `renderCard()`, updates the column count badges (shown as `shown/total` while filtered) and calls `renderSummary()`.
  - `applyFilters()` is a pure filter over `state.tasks`.
  - Don't change card DOM anywhere else. The one exception is the temporary `.dragging` and `.drag-over` CSS classes during a drag.
- **Event delegation.** One set of listeners on `#board` handles clicks (by `data-action`: `move-toggle`, `move-to`, `delete-ask`, `delete-yes`, `delete-no`) and native HTML5 drag and drop. Because every render replaces the card DOM, `restoreFocus(taskId, action)` puts keyboard focus back afterwards. Keep that pattern for any new card control.
- **Add Task flow** (`handleSubmit`):
  1. `validateForm()` builds an errors map, and `showFieldErrors()` shows inline messages and sets `aria-invalid`.
  2. `addTask()` runs, so the card appears straight away.
  3. The form resets and a success toast shows.
  4. The submit button is disabled with the label "Sending…".
  5. `notifyNewTask()` runs inside try/catch. Any failure, including FormSubmit replying with `success:"false"`, only shows the warning toast and never touches the board.
  6. The modal stays open for the next entry.
- **Dates** are compared as local `YYYY-MM-DD` strings (`toISODate`, `todayISO`) to avoid UTC off-by-one bugs. `isOverdue` means the due date is before today and the status isn't Done.
- **Task IDs** come from `formatId(state.nextId++)`, in the format `ITPM-####`. Seed tasks use IDs 0001–0008, and their due dates are set relative to today with `addDays()` so some are always overdue.
- **Reference data.** `STATUSES`, `PROJECTS`, `CATEGORIES` and `PRIORITIES` drive the select options (filled by `fillSelect()` in `init()`) and validation. Column order on the board is fixed in the HTML markup.

## CSS conventions

- **Tokens.** The palette and spacing scale (`--space-1`…`--space-6`) are custom properties on `:root`.
- **Priority colour.** A card's left border comes from `--prio-color`, set by its `.prio-<priority>` class. Priority pills always show their text too, so colour is never the only signal.
- **Breakpoints:**
  - below 768px, everything is one stacked column;
  - from 768px to 1100px, the board has 2 columns;
  - above 1100px, it has 4.
