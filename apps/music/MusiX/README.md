# MusiX

This folder is ORG Music's preloaded music library directory.

1. Put audio files (for example, `.mp3`, `.ogg`, or `.wav`) in this folder.
2. Add each relative file path to `playlist.json` under `tracks`, using this shape:

```json
{
  "tracks": [
    { "title": "Track title", "artist": "Artist", "src": "track-file.mp3" }
  ]
}
```

ORG Music reads `playlist.json` on launch and displays the listed files in the **MusiX** library. Relative paths are resolved from this folder. Remote `https://` audio URLs are also supported.
