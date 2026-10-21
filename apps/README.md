# ORG-OS standalone apps

Each app lives in its own folder under `apps/<app-id>/` and contains:
- `index.html`: standalone app UI and behavior
- `app.json`: app metadata, declared capabilities, and widget metadata

## Apps
- [Calendar](calendar/index.html) — Plan events with month navigation and saved appointments.
- [ORG Paint](paint/index.html) — Draw freely, pick colors, undo, and export your canvas.
- [ORG Music](music/index.html) — Play audio files locally with a queue and playback controls.
- [Tasks](tasks/index.html) — Organize to-dos with priorities, due dates, and filters.
- [ORG Photos](photos/index.html) — Browse local images in a thumbnail gallery and preview them.
- [Weather](weather/index.html) — A clean weather dashboard with city search and a saved location.
- [System Monitor](monitor/index.html) — Inspect browser capabilities, open app windows, and runtime status.

## Widget convention
Each manifest declares a `widgets` array with a stable `id`, title, and description. Apps render a compact widget inside their own window. The next OS integration step is to teach the desktop widget host to read `app.json` and mount each app's widget entry on the desktop; these standalone apps do not yet register themselves with the desktop widget host automatically.

All apps support Light, Dark, and System appearance and use unique local-storage keys for their data where applicable.
