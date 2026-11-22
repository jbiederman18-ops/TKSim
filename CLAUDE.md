# Tony Khan Simulator — notes for Claude

- Push updates straight to `main` (no pull requests).
- Every release: bump `VERSION` in `sw.js` and `APP_VERSION` in `index.html` to match (e.g. `aegm-v131` / `v131`), and add any new file to `FILES` in `sw.js`.

## Read the code cheaply (important — this repo is big)
`index.html` is ~1MB (~250k tokens). Never read it whole.
- Fonts live in `fonts/` (moved out of index.html in v290) — never inline them again.
- Find code with Grep first (function name, a UI string, or a section marker below), then Read only that line range (`offset`/`limit`, ~50–150 lines).
- Section markers look like `/* ===================== NAME`. Grep `/\* =====` to get current line numbers — the ranges below drift as code changes.
- Most newer systems live in their own `.js` file. Check the file table before touching `index.html`.
- `README.md` (76KB) is player-facing docs. Don't read it for context; Grep for the paragraph you need to update.
- Skip entirely: `firebase-sdk.js` (bundled SDK), `vendor/`, `tools/icon*.svg`, `photos/`, `sfx/`, root `.png` files.
- Big content files (`scenarios*.js`, `retorts.js`, `gimmicks.js`, PROMOS in index.html) are mostly written lines. Grep for the specific scene or key; don't read them to learn the engine.

## index.html map (line numbers approximate, as of v291 — grep the section markers for current ones)
| Lines | Section | What's there |
|---|---|---|
| 16–1495 | `<style>` | All CSS. The live look is the **v222 Pay-per-view** block (~1089+) plus card styles. Earlier blocks (Balanced, Classic Dynamite, Calmer pass, v212 Hybrid) are older layers that still partly apply — rules with no visible effect were stripped in v291, so what's left is load-bearing. Party-night TV CSS ~420–651. |
| 1517 | DATA | Roster, titles, PPVs, constants, economy costs (~1584) |
| 1988 | PROMOS | Promo types and hand-written outcome lines (163KB — grep only) |
| 2417 | SITUATIONAL MATCH EVENTS | In-match moments, real backstage heat |
| 2482 | PRODUCER CALLS | |
| 2519 | HELPERS | |
| 2530 | ONLINE LEAGUES (2–4 GMs) | League rules/data; Photo Studio ~2649; revenue ~2745; sell-outs ~2765; feud engine ~2798; feud history ~2834 |
| 2901 | SETUP | New game, draft salary cap ~2924 |
| 2949 | SCOUTING | Prospects |
| 2989 | SHOWS | Show rating; stamina ~3067 |
| 3125 | RUN-INS | |
| 3233 | 5★ OVERFLOW | |
| 3257 | FINISHES | |
| 3398 | PROMO ENGINE | Promo rating logic |
| 3584 | AI BOOKER | Rival bot + Suggest the rest |
| 3675 | AIRING | Running a show; free-agent market ~3750 |
| 3811 | FRONT OFFICE CRISES | Between-show events (more in `crises2.js`) |
| 3924 | PERSISTENCE | Save/load |
| 3938 | UI | Main screens/render |
| 4221 | QUICK BOOKING | Drag & drop for the running order |
| 4367 | SHOW STRUCTURE | Book screen, match editor, dropdowns (~4679), feud detail (~4558). 211KB — biggest JS section |
| 5202 | ONLINE LEAGUE: turns, sync, invites | |
| 5383–5905 | CLOUD SAVE, YOUR GAMES, BACKUPS, CLOUD SYNC | Save safety — be careful here |
| 5906–5938 | `<script>` tags | Load order of the external files |

## External files
| File | System |
|---|---|
| `cards.js` | Card table: tap-to-pick booking sheet, wrestler cards (v273+). The only Book screen since v338 — it draws over `bookView`'s slots, so the classic slot markup is still the base |
| `fanbase.js` | Fan groups (v397+) and the fan engine (v399): `FG_RAW` group per wrestler id, `fgOf`/`fgTag`; `S.fb[b]` groups (S.fans stays their sum via `fbSync`), `fbCalc`/`fbApply` per show (called from airPair), Crowd read (`fbCrowdCard`, replaces Show flow), The fans + X Redditino (`fbResultsCard`), undiscovered leans `S.fgx`, reinvention at the office door; v402 `fbAiTune` (offline rival swaps stipulations for its hungriest crowds, wraps autoBook) and `fbBar`/`fbTvCard` (standings bars, party TV crowds) |
| `attention.js` | Needs your attention checklist + the This week news panel on Home (v324) |
| `inbox.js` | The line outside your office (Monday decisions; max `DESK_MAX` a week since v341) |
| `season.js` | Season systems, calendar flow |
| `calendar.js` | Season calendar screen |
| `wwe.js` | WWE roster, titles, PPVs, supplemental draft |
| `party.js` | Party night (TV + phones) |
| `feed.js` | Locker-room feed on party TV |
| `solotv.js` | Solo TV mode |
| `online.js`, `firebase-config.js`, `ONLINE-SETUP.md` | Firebase sync + turn alerts |
| `promoshow.js` | Promo showdown (Ace Attorney style) |
| `exchange.js`, `retorts.js` | Back-and-forth promos, mic drops |
| `matchshow.js` | Main-event match showdown |
| `reel.js` | Highlight reels + live crowd |
| `crowd.js` | Read the Crowd, Crowd Hijack |
| `faceoff.js` | Face-off cards in showdowns |
| `backstage.js` | Backstage confrontations, locker room whispers |
| `afterdark.js` | After Dark toggle |
| `morale.js`, `pitches.js` | Morale, wrestler pitches/grievances |
| `deals.js` | Contracts with strings, negotiation |
| `frontoffice.js`, `trades.js` | Tampering, injury decisions, trades |
| `farm.js`, `rohleague.js`, `gimmicks.js` | ROH farm, prospect tapes, gimmick prospects |
| `rebrand.js` | Fresh-start sheet (new ring name, face/heel) before a call-up or an ROH signing (v341) |
| `history.js`, `hype.js`, `titlepic.js` | History book, PPV build-up, title picture |
| `squash.js`, `openchal.js`, `teamsug.js` | Squash matches, open challenges, suggested tag teams |
| `challenges.js` | Challenge scenarios |
| `scenarios.js`, `scenarios2.js`, `scenarios3.js`, `crises2.js` | Content packs (match moments, promo twists, events) |
| `fx.js`, `sfx.js` | Broadcast effects, sound |
| `belts.js`, `cut.js` | Belt photos, photo background removal |
| `tutorial.js` | Rookie GM orientation (see below) |
| `sw.js`, `manifest.webmanifest` | Offline/PWA |
| `desk.js` | Desktop layout, mouse and keyboard at 1100px+ (v374–v375) |
| `phone.js` | Phone conventions under 1100px, never on the TV (v377): Go live pinned above the tabs on Book, swipe-down to close sheets, back button closes sheets / goes back a tab, bigger touch areas, minimum card text sizes |

## Keep the tutorial current (required for every gameplay change)
The Rookie GM orientation lives in `tutorial.js`. When you change, add or remove a game system:
1. Find the stops whose `sys` tags cover that system and update their text (and `sel` if the screen changed). Add a new stop if a new system is essential to winning.
2. Pull numbers from the game with `tv()` (e.g. `cardMatches`, `SEASON`, `PPVS`, `FAT_OK`, `UPKEEP_AT`, `FTIER`) instead of typing them.
3. If returning players should see the change, bump `TUT_REV` and set that stop's `since` to the new value — they get a short "What's new" replay of just those stops.
4. Update the matching paragraph in `HOWTO` (index.html) and the README.
5. Keep every stop under `TUT_WORDS` words (it's a card on a phone) — the full detail goes in `HOWTO`.
6. Run `python3 tools/check-tutorial.py` (needs `pip install playwright`; set `CHROME_PATH` if Playwright's own Chromium isn't installed). It plays every stop and tip headlessly, checks word counts, the "What's new" replay for stops at the current `TUT_REV` and the results tip after a real show, and must pass. GitHub runs it on every push too.

## Balance sweeps
`python3 tools/balance-sweep.py --compare <older-commit>` plays full seasons headlessly and prints show ratings, nights and seasons won, fans, money, popularity spread, morale, injuries and errors side by side (~1 min; older commits are fetched automatically). Run it after any change to ratings, fans, money, popularity, stamina, the card or Suggest the rest. Only print the summary lines you need.
- The default bot is an attentive player: answers the office line, books the Needs your attention must-dos (promises, clauses, title defenses — it crowns vacant belts too — the weekly goal, the chant), then taps Suggest the rest and buys production like the rival. `--lazy` only taps Suggest; `--engaged` books like a sharp rival.
- Baselines and known issues are in the script's docstring — compare against them rather than against old targets.
