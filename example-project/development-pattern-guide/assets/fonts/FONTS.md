# Bundled Fonts

These fonts are bundled locally (WOFF2) so generated guides render with their
intended typography **offline, with no CDN or network dependency**. They are
declared via `@font-face` in `../default-global.css`.

| Family            | Files (weights / styles)                | Role in design system            |
|-------------------|-----------------------------------------|----------------------------------|
| Epilogue          | regular (400), 600, 700                 | Display / headers (`--font-display`) |
| Lora              | regular (400), 500 italic, 600 italic   | Subheaders / emphasis (`--font-subheader`) |
| DM Serif Display  | regular (400), italic                   | Large emphasis (`--font-emphasis`)   |

Body and monospace roles fall back to system fonts (Helvetica/Arial/Segoe UI and
Cascadia Code/SF Mono/Consolas), so no additional font files are required.

## License

All three families are licensed under the **SIL Open Font License, Version 1.1
(OFL-1.1)**, which permits bundling and redistribution with software, including
embedding in web pages. Source: Google Fonts.

- Epilogue — Copyright The Epilogue Project Authors
- Lora — Copyright The Lora Project Authors (Cyreal)
- DM Serif Display — Copyright The DM Serif Display Project Authors (Colophon Foundry)

The full OFL-1.1 text is available at https://openfontlicense.org. When
redistributing a generated guide, keep this notice alongside the font files.
