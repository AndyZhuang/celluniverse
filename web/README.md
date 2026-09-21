# CellUniverse — web/

This is the Next.js 16.3.5 front-end for **CellUniverse**.

The parent directory's [README.md](../README.md) is the project entry point.
This file only documents the web subsystem.

```bash
pnpm install            # install deps
pnpm dev                # http://localhost:3000
pnpm build              # static export → ./out5/
```

Build output `./out5/` is shipped in the repo so consumers without Node can
just `python -m http.server` from `web/out5/` and see the demo.
