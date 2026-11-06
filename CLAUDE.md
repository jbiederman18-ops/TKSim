# Tony Khan Simulator — notes for Claude

- Push updates straight to `main` (no pull requests).
- Every release: bump `VERSION` in `sw.js` and `APP_VERSION` in `index.html` to match (e.g. `aegm-v131` / `v131`), and add any new file to `FILES` in `sw.js`.

## Read the code cheaply (important — this repo is big)
`index.html` is ~1.2MB (~300k tokens). Never read it whole, and never read its top without an offset.
- **Lines 15–23 are base64 fonts (~200KB).** Skip them.
- Find code with Grep first (function name, a UI string, or a section marker below), then Read only that line range (`offset`/`limit`, ~50–150 lines).
- Section markers look like `/* ===================== NAME`. Grep `/\* =====` to get current line numbers — the ranges below drift as code changes.
- Most newer systems live in their own `.js` file. Check the file table before touching `index.html`.
- `README.md` (76KB) is player-facing docs. Don't read it for context; Grep for the paragraph you need to update.
- Skip entirely: `firebase-sdk.js` (bundled SDK), `vendor/`, `tools/icon*.svg`, `photos/`, `sfx/`, root `.png` files.
- Big content files (`scenarios*.js`, `retorts.js`, `gimmicks.js`, PROMOS in index.html) are mostly written lines. Grep for the specific scene or key; don't read them to learn the engine.

## index.html map (line numbers approximate, as of v289)
| Lines | Section | What's there |
|---|---|---|
| 16–1733 | `<style>` | All CSS. The live look is the **v222 Pay-per-view** block (~1276+) plus card styles. Earlier blocks (Balanced, Classic Dynamite, Calmer pass, v212 Hybrid) are older layers that still partly apply. Party-night TV CSS ~520–767. |
| 1755 | DATA | Roster, titles, PPVs, constants, economy costs (~1822) |
| 2226 | PROMOS | Promo types and hand-written outcome lines (163KB — grep only) |
| 2655 | SITUATIONAL MATCH EVENTS | In-match moments, real backstage heat |
| 2720 | PRODUCER CALLS | |
| 2757 | HELPERS | |
| 2768 | ONLINE LEAGUES (2–4 GMs) | League rules/data; Photo Studio ~2887; revenue ~2983; sell-outs ~3003; feud engine ~3036; feud history ~3072 |
| 3139 | SETUP | New game, draft salary cap ~3162 |
| 3187 | SCOUTING | Prospects |
| 3227 | SHOWS | Show rating; stamina ~3305 |
| 3363 | RUN-INS | |
| 3471 | 5★ OVERFLOW | |
| 3495 | FINISHES | |
| 3636 | PROMO ENGINE | Promo rating logic |
| 3822 | AI BOOKER | Rival bot + Suggest the rest |
| 3913 | AIRING | Running a show; free-agent market ~3988 |
| 4049 | FRONT OFFICE CRISES | Between-show events (more in `crises2.js`) |
| 4162 | PERSISTENCE | Save/load |
| 4176 | UI | Main screens/render |
| 4459 | QUICK BOOKING | Drag & drop, rival auto-fill |
| 4605 | SHOW STRUCTURE | Book screen, match editor, dropdowns (~4917), feud detail (~4796). 211KB — biggest JS section |
| 5440 | ONLINE LEAGUE: turns, sync, invites | |
| 5621–6143 | CLOUD SAVE, YOUR GAMES, BACKUPS, CLOUD SYNC | Save safety — be careful here |
| 6144–6176 | `<script>` tags | Load order of the external files |

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
