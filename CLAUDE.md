# TKSim — notes for Claude

- Push updates straight to `main` (no pull requests).
- Every release: bump `VERSION` in `sw.js` and `APP_VERSION` in `index.html` to match (e.g. `aegm-v131` / `v131`), and add any new file to `FILES` in `sw.js`. `python3 tools/check-boot.py` checks both (GitHub runs it on every push).
- Never commit screenshots or mockups to the repo root — check-boot fails on any root image nothing uses.

## Read the code cheaply (important — this repo is big)
`index.html` is ~700KB (~170k tokens). Never read it whole.
- Fonts live in `fonts/` (v290), all CSS in `style.css` and the promo scenes / promo twists / match moments (SCENES, TWISTS, MEV) in `promos.js` (v509) — never inline them back into index.html.
- Find code with Grep first (function name, a UI string, or a section marker below), then Read only that line range (`offset`/`limit`, ~50–150 lines).
- Section markers look like `/* ===================== NAME`. Grep `/\* =====` to get current line numbers — the ranges below drift as code changes.
- Most newer systems live in their own `.js` file. Check the file table before touching `index.html`.
- `README.md` (~150KB) is player-facing docs. Don't read it for context; Grep for the paragraph you need to update.
- Skip entirely: `firebase-sdk.js` (bundled SDK), `vendor/`, `tools/icon*.svg`, `photos/`, `sfx/`, root `.png` files.
- Big content files (`promos.js`, `scenarios*.js`, `retorts.js`, `gimmicks.js`, `reelcontent.js`, `wrestlervoice.js`) are mostly written lines. Grep for the specific scene or key; don't read them to learn the engine.

## index.html map (line numbers approximate, as of v509 — grep the section markers for current ones)
The CSS is in `style.css`. The game has one look: the **Pay-per-view** block (`html.lk-hy …`, the last section). The "Base" sections above it hold only what that look builds on — v510 removed every base declaration the Pay-per-view block overrides. Change the look in the Pay-per-view block, and when you override a base declaration there, delete the base one instead of leaving it underneath. Straight edges everywhere (no slant since v284). Only cards — wrestler cards and mini portraits, belts, saved games — get rounded corners and a drop shadow; panels, buttons, chips, tiles, tabs, plates and sheets are square with flat fills, no soft shadows or glows (v512). Deliberate exceptions: the crowd lights' lit glow, the Go-live dock fade on phones, the dashed drop slot, the X Redditino opening. Party-night TV CSS is the "Party night: the TV screen" block.
| Lines | Section | What's there |
|---|---|---|
| 22–37 | `<script>` tags | External files loaded *before* the main script (party, scenarios, season, wwe, deals, promos.js…) |
| 39 | DATA | Roster, titles, PPVs, constants, economy costs |
| 536 | PROMOS | Promo types (PT), promoFit, voice lines; the scenes themselves are in promos.js |
| 669 | SITUATIONAL MATCH EVENTS | In-match moment logic (the moments are MEV in promos.js) |
| 735 | PRODUCER CALLS | |
| 772 | HELPERS | incl. `hookStep` / `HOOKS` (see below) |
| 800 | ONLINE LEAGUES (2–4 GMs) | League rules/data, Photo Studio, revenue, sell-outs, feud engine, feud history |
| 1183 | SETUP | New game, draft salary cap |
| 1237 | SCOUTING | Prospects |
| 1273 | SHOWS | Show rating, stamina |
| 1440 | RUN-INS | |
| 1600 | 5★ OVERFLOW | |
| 1636 | FINISHES | |
| 1783 | PROMO ENGINE | Promo rating logic |
| 1990 | AI BOOKER | Rival bot + Suggest the rest |
| 2106 | AIRING | `airPair` (running a show), `endWeek`, free-agent market |
| 2291 | FRONT OFFICE CRISES | Between-show events (more in `crises2.js`) |
| 2403 | PERSISTENCE | Save/load, `SAVE_FMT` |
| 2420 | UI | Main screens, `render` |
| 2703 | QUICK BOOKING | Drag & drop for the running order |
| 2835 | SHOW STRUCTURE | Book screen, dropdowns, feud detail, the reveal. Biggest JS section |
| 3580 | ONLINE LEAGUE: turns, sync, invites | |
| 3753–4350 | CLOUD SAVE, YOUR GAMES, BACKUPS, CLOUD SYNC | Save safety — be careful here |
| 4356–4406 | `<script>` tags | Load order of the external files loaded after the main script |

## Adding a step to an existing function: use hookStep (never hand-wrap)
Files add steps to functions defined elsewhere (endWeek, airPair, render, go, applyMatch, openModal, briefItems…) with
`hookStep(name, label, {before(ctx,...args){}, after(ctx,result,...args){}})`, or `{around(prev,...args){… prev.apply(this,args) …}}`
when the step has to wrap the call (try/finally, an early return, changing the arguments or the result): `prev` is the function
as it was before this step. An `after` that returns something other than undefined replaces the result. Steps nest in script
load order, exactly like hand-written wrappers did: the file loaded last runs its `before` first and its `after` last; `ctx`
carries values from a step's `before` to its own `after`. `HOOKS.go` (etc.) in the console lists every step, innermost first;
v510 converted the old wrappers mechanically, so their label is the file name.
- `name` must be a global function (a top-level `function` or one exposed with `window.x=`) — check-boot fails if a step
  doesn't register. A function private to an IIFE has to be exposed with `window.x=x` *and* called through `window.x()`
  inside its own file, or the file's own calls skip the steps (v511 did this for inbox.js's `openFg`).
- Left hand-wrapped on purpose (the wrapper's saved copy is used elsewhere, or the name is local): `toast` (index.html,
  cards.js), `roll` (exchange.js), `card` (index.html, a local).

## Proving a refactor changes nothing
For cleanup that shouldn't change play (moving code, hookStep conversions, removing dead code or CSS), run
`python3 tools/check-same.py <older-commit>`: it plays the same seeded games (~30 weeks, five seeds and difficulties) in both
builds and compares the final save byte for byte. It must say "Same game ✓" (`--strip 'JS'` drops a field you removed on
purpose from the save copy first). The balance sweep only shows "within noise", so it can't prove a refactor is safe; use it
for real gameplay changes. For CSS or screen-code cleanup, also compare the screens: v510 used a side-by-side run of both
builds on a virtual clock, clicking through the game and comparing every element's HTML and computed style after each click —
`python3 tools/check-screens.py <older-commit>` (~5 min a walk; it must say "Same screens ✓").

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
| `reel.js`, `reelcontent.js` | Highlight reels and their arc payoff scripts — switched off (`HR_ON=false`, v496) while the dialogue is rewritten; `tools/check-reels.cjs` still tests them |
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
| `draftcall.js` | "The pick is in" banner for every other GM's draft pick (v412), fed by `S.draft.ids` from `draftPick`; waits while the opening, the draft tour or any sheet is up (`draftHold` in tutorial.js), and steps aside when a sheet opens |
| `style.css` | All the game's CSS (v509) |
| `promos.js` | Promo scenes (SCENES), promo twists (TWISTS) and in-match moments (MEV) — plain data, loaded before the main script (v509) |
| `traits.js` | Traits and fan-group matchups (v425) |
| `arcs.js` | Wrestler arcs: board, stops, payoffs, held stories (v426+) |
| `rivalstory.js` | The offline rival's arcs and promises (v492) |
| `xrfeed.js` | X Redditino's timeline after the reveal (v505) |
| `quarters.js` | Quarter-hour ratings — the reveal's scoreboard (v462) |
| `ppvtheme.js` | Each PPV's own reveal stage (v506) |
| `budget.js` | The budget: only buy what's in the bank, network advances (v501) |
| `profile.js` | The wrestler profile sheet (v422) |
| `friends.js` | Backstage friend groups (v361) |
| `venues.js` | TV buildings / venue ladder (v364, v424) |
| `prove.js` | "Prove them wrong" for undrafted signings (v365) |
| `opps.js` | Opportunities booked on TV from the office door (v454) |
| `draftcrowd.js` | Crowd tallies and crowd-aware picks in the draft (v443) |
| `wrestlervoice.js` | Original promo lines for roster wrestlers |

## Keep the tutorial current (required for every gameplay change)
The Rookie GM orientation lives in `tutorial.js`. When you change, add or remove a game system:
The tour is written for someone who has never seen the game, its history or its design — read "WRITING A STOP" at the top of `tutorial.js` first. In short: teach only what the player does to win and why it pays; describe the game as it is, never what it lacks, used to do or was changed from; no design rationale or reassurance lines.
1. Find the stops whose `sys` tags cover that system and **rewrite** them from scratch for a first-time player (and `sel` if the screen changed) — never append the change to the old text. Add a new stop only if a new system is essential to winning.
2. Pull numbers from the game with `tv()` (e.g. `cardMatches`, `SEASON`, `PPVS`, `FAT_OK`, `UPKEEP_AT`, `FTIER`) instead of typing them.
3. If returning players should see the change, bump `TUT_REV` and set that stop's `since` to the new value — they get a short "What's new" replay of just those stops.
4. Update the matching paragraph in `HOWTO` (index.html) and the README's player guide, by the same rules: describe the game as it is, with no version tags, "no longer", "there's no…" or design rationale. Version history belongs only in the README's changelog entries.
5. Keep every stop under `TUT_WORDS` words (it's a card on a phone) — the full detail goes in `HOWTO`.
6. Run `python3 tools/check-tutorial.py` (needs `pip install playwright`; set `CHROME_PATH` if Playwright's own Chromium isn't installed). It plays every stop and tip headlessly, checks word counts, flags patch-note/design-note phrasing (`TUT_BANNED`), the "What's new" replay for stops at the current `TUT_REV` and the results tip after a real show, and must pass. GitHub runs it on every push too.

## Balance sweeps
`python3 tools/balance-sweep.py --compare <older-commit>` plays full seasons headlessly and prints show ratings, nights and seasons won, fans, money, popularity spread, morale, injuries and errors side by side (~1 min; older commits are fetched automatically). Run it after any change to ratings, fans, money, popularity, stamina, the card or Suggest the rest. Only print the summary lines you need.
- The default bot is an attentive player: answers the office line, books the Needs your attention must-dos (promises, clauses, title defenses — it crowns vacant belts too — the weekly goal, the chant), then taps Suggest the rest and buys production like the rival. `--lazy` only taps Suggest; `--engaged` books like a sharp rival.
- Baselines and known issues are in the script's docstring — compare against them rather than against old targets.
