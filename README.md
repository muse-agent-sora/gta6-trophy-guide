# Leonida Ledger — GTA 6 trophy guide and tracker

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/muse-agent-sora/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/muse-agent-sora/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline GTA 6 trophy guide and tracker for all 55 PlayStation 5 trophies of
Grand Theft Auto VI: the official list with a checklist saved in the browser,
filters by kind, a spoiler setting, a roadmap to the platinum, missable flags,
and a guide in our own words — with its sources — for every trophy.

## What it does

- **Checklist of all 55 trophies** — official name, official description and
  grade for each (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on
  PlayStation until earned), with a target count where PlayStation tracks one
  (250 stunts, 42 Shooting Range golds, 100 WAiNK locations, and the rest).
  Tick a trophy off and it stays ticked: progress saves in localStorage.
- **Export & import** — download your progress as a JSON file and import it
  back, on the Settings tab.
- **Filters** — by kind (Story, Missable, Collectibles, Activities, Open World,
  Goal, Online), by grade, by earned / not yet earned, and free-text search.
  The list has **no online trophies**: every trophy is single-player, so the
  Online filter says so instead of showing an empty list with no explanation.
- **Spoiler setting** — hides the names and descriptions of story trophies
  until you earn them, the way PlayStation hides them.
- **Roadmap to the platinum** — seven stages in play order: story, stranger
  chains, open-world sweep, activities, crime & money, 100% completion, then
  the platinum itself. Built from the official descriptions: which chapters
  and missions, which collectibles and counts.
- **Missables** — exactly one trophy is reported as possibly missable
  (Positive Mental Attitude: meditate at every spot; the first meditation,
  Lucia's on the balcony at Jason's house in Chapter 1, is reported to
  disappear once that chapter ends), plus a story-window watch list for the
  stranger chains. Everything else is repeatable or story-locked, so one
  playthrough is enough for the platinum.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080>. The app is static files under `app/` with
no build step, and it works with the network off: it loads only its own files
(`data/trophies.json` by a relative fetch) and makes no network request at run
time. No external fonts, no CDN, no Rockstar logo or official artwork — the
look is our own.

Hand it in (writes `out/` with `app/`, `screenshots/` and `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources & honesty note

GTA VI launched 19 November 2026, so launch-day walkthrough detail is thin
and some of it is unconfirmed. Where a method is confirmed we say where it
came from; where it is not, the guide says so plainly instead of inventing a
location or a step. Every guide is written in our own words for this page;
nothing is copied from another guide.

- Official list (names, descriptions, grades, PSN counts):
  Exophase — <https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/>
  and PSNProfiles — <https://psnprofiles.com/trophies/43531-grand-theft-auto-vi>
  (the two agree on every name, description and grade).
- Launch-day method tips, credited beside each trophy:
  PowerPyx — <https://www.powerpyx.com/grand-theft-auto-6-gta-vi-trophy-guide-roadmap/>,
  GTABase — <https://www.gtabase.com/gta-6/trophies> and
  EGamers — <https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/>
  (all 18 November 2026), with TechWiser for the stranger-chain window warning.
- Counts used by the guide: 250 of 397 stunts, 42 Shooting Range challenges,
  14 Top Fun drone-race locations, 9 activity types, 18 meditation spots
  (GTABase; the 100% checklist counts 15 — the two disagree and the guide
  says so), 3 of 15 card sets, 100 WAiNK locations, 100 vehicles, 52 areas,
  9 gangs, 8 garage properties, 5 of 8 bank vaults, 50 of 70 challenges,
  20 of 30 races, 500 Criminal Profile actions.

## License

MIT — see [LICENSE](LICENSE).
