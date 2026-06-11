# Modules

The `src/modules` directory is organized by Vue feature modules:

- `auth`: login, register, reset password, and authentication helpers.
- `timeline`: time-machine pages, timeline components, composables, constants, and mock data.
- `diet`: diet dashboard pages and related components.
- `recipe`: recipe pages, recipe cards, settings, detail view, and recipe data.
- `love-dashboard`: the dashboard shell, navigation, dashboard-only constants, and fallback panels.
- `homepage`: the home overview screen used by the dashboard.
- `shared`: reusable UI components, utilities, and app-level services.

Global and cross-module styles live in `src/styles`. Component-specific styles remain in each Vue single-file component with `scoped`, which keeps the module boundaries clear and follows common Vue 3 practice.
