# IT PMO Kanban Board

[![CI/CD](https://github.com/sameerumralkar/Kanban/actions/workflows/ci.yml/badge.svg)](https://github.com/sameerumralkar/Kanban/actions/workflows/ci.yml)

A lightweight Kanban board for the internal IT Project Management Office of a fictitious bank. It's built as a single, dependency-free HTML file.

**Live demo:** https://sameerumralkar.github.io/Kanban/

## Features

- **Four-column board:** Backlog, In Progress, Blocked, Done.
- **Drag and drop** cards between columns. There's also a keyboard-accessible "Move ▸" menu.
- **Add Task** modal with inline validation (project, category, priority, status, due date).
- **Filters** by project and priority. Column badges show `shown/total` while a filter is on.
- **Overdue highlighting** for tasks past their due date that aren't Done.
- **Inline delete confirmation.** There are no browser `alert()`/`confirm()` popups.
- **Email notification** for each new task, sent through [FormSubmit](https://formsubmit.co). This is optional and the board works without it.
- **Responsive layout:** 1 column on phones, 2 on tablets, 4 on desktop.
- **Accessible:** ARIA labels, focus restore after re-render, and priority shown as text as well as colour.

## Tech stack

Vanilla HTML, CSS and JavaScript in one file (`index.html`). There are no frameworks, build step, npm packages or external resources.

## Getting started

```bash
git clone https://github.com/sameerumralkar/Kanban.git
cd Kanban
open index.html            # or double-click it
```

To serve it over HTTP instead:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
# then open http://127.0.0.1:8000/index.html
```

### Email notifications (optional)

Set your address in `FORMSUBMIT_ENDPOINT` at the top of the `<script>` block in `index.html`:

```js
const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/you@example.com";
```

FormSubmit sends a one-time activation email on the first submission. Nothing is delivered until you click that link.

> **Note:** The board has no persistence by design. Refreshing the page resets it to the seed data.

## Project structure

```
.
├── index.html               # The whole app: markup, <style>, <script>
├── CLAUDE.md                # Architecture notes and constraints for contributors / Claude Code
└── .github/workflows/ci.yml # CI checks + GitHub Pages deployment
```

## CI/CD

Every push and pull request to `main` runs:

1. **Constraint check:** no storage APIs, `alert`/`confirm`, `!important` or external resources.
2. **JavaScript syntax check** of the inline script.
3. **Secret scan** with [gitleaks](https://github.com/gitleaks/gitleaks).

Pushes to `main` that pass all three checks are deployed to GitHub Pages automatically.

## License

No license has been chosen yet. All rights reserved by the author.
