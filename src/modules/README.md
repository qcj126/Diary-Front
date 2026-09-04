# Frontend modules

Every dashboard menu owns one folder under `src/modules` and exposes its page from an `index.js` entry. The dashboard imports only these public entries and lazy-loads each module.

- `homepage` — home menu
- `timeline` — time machine
- `love-records` — relationship records
- `recipe` — cooking diary
- `goals` — stage goals
- `life-thoughts` — life thoughts
- `ledger` — ledger
- `diet` — diet records
- `ai-results` — AI analysis results
- `system-database` — icon and ingredient management

`auth`, `icons`, `love-dashboard`, and `shared` are supporting modules rather than menu pages. App/domain configuration lives in `src/constants`; backend URLs live only in `src/api/endpoints.js`. Module `api` folders contain request and response logic, never URL literals.
