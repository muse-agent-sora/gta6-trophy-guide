// Leonida Ledger — the hand-in program for gta6-trophy-guide-01 (Node 22, standard
// library only). The guide itself is plain static files: app/index.html opens in a
// desktop browser, app/app.js and app/style.css run it, and app/data/trophies.json
// holds the 55 official trophies with a guide and sources for each. Nothing is built
// and nothing is fetched at run time, so the program below only has to gather the
// finished files: it copies app/ and screenshots/ from beside this file into the
// output directory and writes /output/dossier.json with the vendored make.fun
// library, the summary the judge reads. vendor/makefun-frontend.ts is the kit's
// copy, unchanged — the scorer rebuilds the dossier with its own copy and compares
// the two byte for byte, so this file must not improvise on that step.
//
// Run it outside the grader with an output directory of your own:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader MAKEFUN_OUTPUT_DIR is unset and /output is used.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The whole guide goes over: every static file under app/, then the screenshots
// that show it running. Screenshots are optional on disk here only because a fresh
// checkout might not have them yet; the gate itself requires 3 or 4.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The dossier caps mirror the gate's limits for this bounty: at most 4 screenshots
// of 256 KiB each, app/ at most 993 files and directories and 48 MiB in all, and
// the dossier text at most 163,840 bytes. Anything past a cap is refused here
// with the library's own words, exactly as the scorer would refuse it.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
