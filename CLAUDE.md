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

## index.html map (line numbers approximate, as of v291)
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
| 4221 | QUICK BOOKING | Drag & drop, rival auto-fill |
| 4367 | SHOW STRUCTURE | Book screen, match editor, dropdowns (~4679), feud detail (~4558). 211KB — biggest JS section |
| 5202 | ONLINE LEAGUE: turns, sync, invites | |
| 5383–5905 | CLOUD SAVE, YOUR GAMES, BACKUPS, CLOUD SYNC | Save safety — be careful here |
| 5906–5938 | `<script>` tags | Load order of the external files |

## External files
| File | System |
|---|---|
| `cards.js` | Card table: tap-to-pick booking sheet, wrestler cards (v273+) |
| `attention.js` | Needs your attention + Rundown briefing |
| `inbox.js` | The line outside your office (Monday decisions) |
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
| `history.js`, `hype.js`, `titlepic.js` | History book, PPV build-up, title picture |
| `squash.js`, `openchal.js`, `teamsug.js` | Squash matches, open challenges, suggested tag teams |
| `challenges.js` | Challenge scenarios |
| `scenarios.js`, `scenarios2.js`, `scenarios3.js`, `crises2.js` | Content packs (match moments, promo twists, events) |
| `fx.js`, `sfx.js` | Broadcast effects, sound |
| `belts.js`, `cut.js` | Belt photos, photo background removal |
| `tutorial.js` | Rookie GM orientation (see below) |
| `sw.js`, `manifest.webmanifest` | Offline/PWA |

## Keep the tutorial current (required for every gameplay change)
The Rookie GM orientation lives in `tutorial.js`. When you change, add or remove a game system:
1. Find the stops whose `sys` tags cover that system and update their text (and `sel` if the screen changed). Add a new stop if a new system is essential to winning.
2. Pull numbers from the game with `tv()` (e.g. `cardMatches`, `SEASON`, `PPVS`, `FAT_OK`, `UPKEEP_AT`, `FTIER`) instead of typing them.
3. If returning players should see the change, bump `TUT_REV` and set that stop's `since` to the new value — they get a short "What's new" replay of just those stops.
4. Update the matching paragraph in `HOWTO` (index.html) and the README.
5. Run `python3 tools/check-tutorial.py` (needs `pip install playwright`). It plays every stop and tip headlessly and must pass. GitHub runs it on every push too.

## Balance sweeps
`python3 tools/balance-sweep.py --compare <older-commit>` plays full seasons headlessly (bot books with Suggest the rest and decides like the offline rival) and prints show ratings, fan war results, money, popularity spread, morale, injuries and errors side by side. Run it after any change to ratings, fans, money, popularity, stamina or the card. Only print the summary lines you need.
