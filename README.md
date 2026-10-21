# ORG OS

A browser-based desktop environment built with HTML, CSS, and JavaScript. ORG OS brings a familiar desktop experience to your browser, with draggable desktop icons, app windows, a taskbar, settings, and an app store.


## Features

- **Desktop experience** — movable app icons, a taskbar, Start menu, and resizable app windows.
- **Desktop grid** — drag apps around the desktop and snap them into aligned positions.
- **ORG Store** — browse apps, install supported apps, and explore app categories.
- **Widgets** — add supported widgets to the desktop, move them by their headers, and resize them.
- **Personalization** — wallpaper, appearance, and desktop preferences.
- **Built-in apps** — Welcome, Notes, Terminal, Settings, and other desktop tools.
- **Standalone app collection** — seven additional apps with their own HTML entry points and JSON manifests.

## Included apps

| App | Description |
| --- | --- |
| Calendar | Month view and saved appointments |
| ORG Paint | Draw, choose colors, undo, and export your canvas |
| ORG Music | Play local audio files with playback controls |
| Tasks | Organize to-dos, priorities, and due dates |
| ORG Photos | Browse and preview local images |
| Weather | City-search weather dashboard |
| System Monitor | View browser capabilities, open app windows, and runtime status |

These apps declare **ORG OS 1.0.0** as their minimum version and **ORG OS 1+** compatibility in their manifests. Some features rely on browser capabilities and local browser storage. Weather currently uses illustrative forecast information rather than a connected live weather service, and System Monitor cannot access all underlying device-level CPU or memory metrics from a regular browser page.

## Repository structure

```text
ORG-OS/
├── index.html
├── apps/
│   ├── calendar/
│   │   ├── index.html
│   │   └── app.json
│   ├── paint/
│   │   ├── index.html
│   │   └── app.json
│   ├── music/
│   │   ├── index.html
│   │   └── app.json
│   ├── tasks/
│   │   ├── index.html
│   │   └── app.json
│   ├── photos/
│   │   ├── index.html
│   │   └── app.json
│   ├── weather/
│   │   ├── index.html
│   │   └── app.json
│   └── monitor/
│       ├── index.html
│       └── app.json
└── README.md
```

## Run locally

1. Clone or download this repository.
2. Open `index.html` in a modern browser.
3. For GitHub Pages, publish the repository from the branch and folder containing `index.html`.

Some browser features may work best when served from a local development server or GitHub Pages rather than opened directly as a `file://` URL.

## Project status

ORG OS is actively evolving. App capabilities vary, and not every widget is a live, continuously updating desktop panel yet. Contributions and ideas are welcome.

---

Made for the ORG OS project.
