#!/usr/bin/env python3
"""Balance sweep: plays full seasons headlessly with an automated GM and prints a comparison table.

The bot books with the in-game "Suggest the rest" assistant and makes promo/match calls, contract and crisis decisions
with the same rules the offline rival uses, so differences between versions show up as drift in the numbers.

    pip install playwright && python3 -m playwright install chromium
    python3 tools/balance-sweep.py                       # this checkout, 10 games x 2 seasons per difficulty (~1 min)
    python3 tools/balance-sweep.py --compare <commit>    # also run an older commit side by side (fetched if needed)
    python3 tools/balance-sweep.py --engaged             # also a hands-on booker (stips, finishes, run-ins)
    python3 tools/balance-sweep.py --lazy                # also a GM who only taps Suggest and ignores the checklist
    python3 tools/balance-sweep.py --frugal              # the bot never buys production (it does by default, like the rival)

The default bot clears the Needs your attention checklist (promises, clauses, defenses, the weekly goal), answers the
office line, then taps Suggest the rest — an attentive player who leaves the creative booking to the assistant.
--compare runs the same bot on both builds, so it is meaningful from v260 (highlight reels) on.

Baseline (v354, Normal, 15-24 games x 3 seasons — season 1 / 2 / 3) — compare new numbers against these:
  default bot   show ~3.62/3.74/3.83, ~24-35% of nights, ~46/70/75% of seasons, fans ~685K/465K, morale ~63-71, bank ~$0.5-2.1M
  --lazy        show ~3.81/3.79/3.67, ~35% of nights, ~17/58/4% of seasons, fans ~620K/420K/315K, injured ~0.5-0.9/wk
  skip every checklist step but still rest people (variant {'skip': [...all steps]}): show ~3.83, ~37-40% of nights,
                ~42/54/29% of seasons — the "ignore what they want" GM wins more nights but fewer seasons, as designed
v354 made keeping your word pay (OWE_K lift in the match, DELIVER_FANS per delivery, RIPPLE when you break it) and made
neglect cost money (INJ_BILL rehab, BREACH_PAY, WAGE_K .5 -> .6). Before it, ignoring every must-do while resting people
won ~35-50% of seasons to the attentive GM's ~10-45%. Money still builds up from season 2 (~$1.5-3M): a real sink would be
a new system. Opponents for must-dos are picked with the real match preview (opt.crude: the old pop formula).
v355 (draft money choice: START_BANK $350K, TV_BASE/TV_GROW + in-season viewership bonus, DRAFT_CON 16-52 wks), Normal,
18 games x 3 seasons: default bot show ~3.63/3.75/3.82, fans ~686K/478K/474K (same as v354), bank ~$0.95M/1.26M/2.05M
(v354: 0.61/1.62/1.88), seasons won ~39/56/56% (close races; v354's 67/50/50% is within noise of it). For the draft itself and
the early weeks use tools/draft-sweep.py (strategies stars / auto / cap .85 / .7 / .55, week-by-week bank and red %).
v358 (no potential: shared growth curve, in-ring upkeep at 85+, offline rival stops climbing at 89+), Normal, 60 games x 3 seasons:
  default bot show ~3.58/3.68/3.77 vs v357's 3.63/3.74/3.79 (rival ~3.86/3.92/3.99 vs 3.91/4.00/3.99, so the gap is the same),
  seasons won ~48/58/47% vs 47/50/50%, promo stars ~0.1 lower from season 2. Easy/hard within noise.
v361 (backstage friend groups, FG_SHARE .35), Normal, 40 games x 3 seasons vs v360: default bot show 3.59/3.71/3.80 vs
  3.58/3.72/3.82, seasons won 47/55/50% vs 53/42/60% (noise), morale ~5 higher in season 1; skip-every-step bot unchanged
  (show ~3.8, seasons 50/70/45%). Friends move morale, but morale only shows in the work below 50 / above 75, so it doesn't
  separate the two styles yet. Tried: smooth morale slope (pivot 65/68, k .08-.12) with FG_SHARE .35-.5 lifts both bots
  ~0.1-0.15 stars and inflates seasons won; the neglectful GM's featured stars stay happy, so it doesn't separate them either.
v362 (locker-room mood LR_K .2 under LR_MID 66, chant +1/2 star and 5K fans), Normal, 40 games x 3 seasons, seasons won:
  default bot 78/65/65%, skip-every-step bot 33/50/47%, --lazy 33/47/25% (v361: 47/55/50 vs 50/70/45). Ignoring still wins
  more single nights (35% vs 26-30%) and ends ~$1.4M richer by season 3 (money needs the venue ladder). Before v362 the chant
  and trial-promo steps cost more show quality than they paid, and neglect almost never broke a promise or contract term.
v364 (venue ladder: Piddly-Ass Auditorium / Good Building / Actual Arena; the bot moves up when it can carry it and would fill
  it), Normal, 32 games x 3 seasons, seasons won: default 59/66/56%, skip-every-step 38/44/22%, --lazy 31/47/16%. Bank gap
  (ignore minus attentive) at season 3 shrank from ~$1.35M to ~$0.3M; the rival moves up too (show ~4.0 in season 3).
  draft-sweep --invest 0: cap .85 seasons won 58/54% vs drafting to the cap 67/54% (banking is close; with FA investing it isn't).
v382 (pitches lose "Give it a try": the bot now says Go for it where it used to take a trial, when it can afford it), Normal,
  24 games x 3 seasons vs v381: show 3.62/3.79/3.91 vs 3.56/3.63/3.79 (promo stars +0.1-0.24: no more trial promos forced
  onto the card), rival 3.87/3.98/4.08 vs 3.83/3.95/4.00, seasons won 67/62/62% vs 67/50/58%, morale and injuries unchanged.
v395 (stipulation bonus added to each wrestler's own Ring, STIP_RING 2, so it runs through the singles weakest link; hidden
  specialties FAV_P .25 / FAV_B 6), Normal, 40 games x 3 seasons vs v394: show 3.66/3.78/3.91 vs 3.67/3.78/3.91, match stars
  3.82/3.83/3.91 vs 3.84/3.85/3.90, seasons won 85/57/70% vs 85/65/70% (noise). --engaged 3.83/3.98/4.08. Balance-neutral.
v399 (the fan engine: fans come from five fan groups in fanbase.js, not the show rating; Show flow retired so running order no
  longer moves the rating; offline rival gets AIQ.fan flat fans per show for the promises/goals/chants it doesn't play), 3 seasons:
  Normal 24 games vs v398: default fans 835/655/612K (v398 747/537/604), seasons won 83/38/33% (67/54/79%), bank ~$0.7/1.3/1.9M (same);
  --engaged 1023/895/808K, seasons 100/100/96% (100/92/83%), Chaos fiends grow most (run-ins); --lazy 382/312/249K, seasons 0/4/0%.
  16 games per difficulty, seasons won: easy 100/94/88%, normal 81/69/56%, hard 75/19/6%. Rival show stars ~0.15 lower (it lost the
  flow bonus it used to earn). Group sizes at season 3 (default bot): casuals ~1.75M, Technical ~200K, Bloodhounds ~160K, Flippy
  ~105K, Chaos ~120K. Tuning knobs: FB_GKC/FB_GKH (pool pull), FB_DRIFT, FB_HOLD/FB_STARVE, FB_FED, AIQ.fan. Rows 'fans <group> K'
  and 'show gain <brand>.<group>' come from S.fb and S.last.fb.
v400 (fans switch shows: fbDefect moves each group toward the show that served it better — casuals FB_SW .02 on a 1.5+ gap,
  hardcore only off a show that let them down; flat head-to-head +4K and main event war +3K removed; promise fans go to the
  wrestlers' crowds via fbHit; FB_DRIFT 2 -> 1.2, FB_GKC .024 -> .018), 3 seasons: Normal 24 games: default fans 706/517/477K vs
  rival 585/526/521K, seasons won 83/58/38%; --engaged 831/682/580K, 100/79/58%. 16 games per difficulty, seasons won: easy
  100/94/62%, normal 75/50/44%, hard 75/31/25%; --lazy ~0% everywhere. Known: the player's seasons won fall season over season —
  casual drift and switching are proportional to your own base, and the attentive player's base grows faster (promises, goals),
  so a big base is harder to grow. Watch this when money and the rival change (v401/v402).
v401 (fan war = total audience, fanWar; money by group: TV/ads from fbAud 'tv', tickets 'live', PPV 'ppv', merch fbMerchF;
  buzz = fans' mood S.fbm, FB_BUZZ0 2.9), Normal 24 games x 3 seasons: default seasons won 71/58/50% (v400 under the same total-audience
  rule: 79/54/21%), engaged 96/88/75%, lazy 0%; bank $0.76/1.23/1.63M (v400 0.51/1.35/2.02M); buzz ~3.85 (v400 ratings buzz 3.8-4.0).
  draft-sweep (12 games): early-week banks, red weeks (0%) and the stars-vs-cap trade-off match v400. 'seasons won' uses the build's
  own rule (row 'war' from balance-sim: total audience when fanWar exists, otherwise fans gained).
v402 (offline rival books for its crowds: fbAiTune swaps up to 1/2/3 stipulations a show on easy/normal/hard for its hungriest
  crowd; AIQ.fan removed), 3 seasons: Normal 40 games: default seasons won 82/62/45%, fans 681/461/387K vs rival 530/493/582K;
  --engaged 97/93/80%; --lazy 10/0/0%. 24 games per difficulty: easy 96/88/75%, normal 79/62/33%, hard 79/50/25%. 0 errors.
v403 (found hidden specialties open the stipulation's crowd, fbSpecGroup; Bloodhounds orange), Normal 40 games vs v402 in the
  same run: seasons won 80/68/53% vs 95/78/62% (v402's own 40-game run earlier: 82/62/45% — within noise), fans gained ~same,
  rival +50K in season 1 (it reveals specialties too). 0 errors.
--diff normal runs one difficulty; a variant's 'pre' script runs before the bot (handy for testing a constant).
v405 (feuds feed the crowds: a stipulation's crowd pull is FB_STIP0 .1 + up to FB_STIP1 .6 with feud heat toward FB_STIPH 45, was a
  flat .5; casuals follow the card's hottest feuds (FB_STORY*); HEAT_TV/PPV .15/.25 -> .22/.35, HEAT_GAIN 1.35; FB_AI_TUNE easy [.5,1]
  normal [1,3] hard [1,4]; your crowds expect FB_XDIFF more on easy/normal/hard -.15/.05/.25), 16 games x 3 seasons, seasons won:
  Normal: default 19/38/12%, feud-builder 62/44/25%, crowd-tuner 69/81/50%, both 100/94/75%. Hard: default 19/12/0%, feud 31/31/6%,
  crowd 62/19/6%, both 75/38/19%. v403 Normal: default 81/81%, crowd-tuner 100/94%; Hard crowd-tuner 100/100%. Feud heat per match
  ~.08 -> ~.4 stars for a feud-builder (11% of its matches at 45+ heat). The feud and crowd bots were local to that sweep.
v410 (stipulations: steady pull FB_STIP0 .35 with no feud needed, STIP_TOLL stamina x1.5 / injury x1.3 on rough+big, prices x3,
  FB_REP .5 for a repeat of last show's stip, rival skips repeats, FB_XDIFF normal .12 / hard .3), 16 games x 3 seasons, seasons won:
  Normal: default 56/44/25%, feud 88/56/25%, crowd 75/62/31%, both 100/88/75%. Hard: default 31/25/6%, feud 62/44/12%, crowd
  50/25/12%, both 88/31/19%. Crowd bots bank ~$0.8M vs ~$1.8M by S3 and get ~50% more injuries.
v413 (the rival books a stipulation at 4x its price in the bank, was 8x — v410's 3x prices had starved its Bloodhounds;
  FB_XDIFF normal .18 / hard .36), 24 games x 2 seasons, seasons won: Normal default 42/33%, feud 75/58%, crowd 62/38%, both 83/62%.
  Hard default 17/4%, feud 38/29%, crowd 25/12%, both 50/33%. (v410 at 24 games: Normal default 71/62% — too easy.)
v416 (5-star inflation: STAR_TOP2 4.5 / STAR_TOPK2 .25 on top of v121's knee, HEAT_PPV .35 -> .28, FB_STORYCAP 1.5 -> 1, FB_XDIFF
  normal .26 / hard .42), 16 games x 2 seasons, seasons won S1/S2: Normal default 50/19%, --engaged 88/69%, feuds+crowds 81/44%;
  Hard default 0/0%, --engaged 56/38%, feuds+crowds 81/31%. 5-star segments a season: engaged ~20 (was 41-49), rival ~6 (was 20-28),
  default ~2; engaged PPVs 14% 5-star (was 37%), TV show ~3.8, PPV ~4.2. At v414 --engaged won 100/100% on Normal. Raising the rival's
  Normal smart .5 -> .85 didn't close that gap (it already books like the engaged bot on Hard); the engaged edge was casuals.
v424 (tiredness bites: FAT_MT singles 16 -> 18 etc., REC_WORK 10 -> 7, REC_REST 25 -> 22, FAT_PPV 6; 90+ popularity held only by a
  main event, PPV win or UPKEEP_TOP_ST 4-star match; buildings unlocked once and booked per TV show, top stars grumble in a small room),
  local runner, 12-14 games x 3 seasons vs v423 (S3 fans, Normal / Hard): default 1.31M / 1.06M (v423 1.18M / 1.17M), sharp booker
  1.59M / 1.46M (1.65M / 1.55M), lazy 506K / 379K (562K / 408K). Attentive roster stamina ~87 (was ~93), 1 wrestler a week under 45
  (was 0.3), injuries 6-8 a season (was ~5), lazy 12-14 (was ~9-10). Segment stars default 3.7 (same), sharp 3.7 (was 3.8), sharp 5-star
  6% (was 8%). Top-5 popularity ~92 (was ~95); hands-on bookers' 88+ stars +1 to +3 over 3 seasons, Suggest-only -2. Default bot books
  the Good Building ~40% of S3 TV shows, the Arena almost never; its stars grumble ~11-16% of S3 shows. Lazy GM still banks the most.
v425 (styles retired: fan-group matchups GRP_M with clashes at -4, trait bridges, "in their element" +.5; one fixed starting
  trait, slots at 70/85 popularity picked at the office door (the bot takes option 0), stipulation fit = group base + traits x.6,
  7 new traits), vs v424 in the same runs. Normal 40 games x 3 seasons: default fans gained 527/288/197K (v424 518/298/204),
  seasons won 65/30/5% (53/20/15); engaged 656/456/327K (639-647/423-425/350-364), 95/82/50% (90/68-72/33-47), match stars
  3.96/4.05/4.12 (3.96/4.02/4.09); lazy show ~+0.1 star, still 0%. Rival show 3.68/3.75/3.81 (3.68/3.74/3.78). Hard 32 games:
  engaged 550/365/247K (560/356/277K), seasons 62/47/9% (72/41/16%). Easy within noise. 0 errors. Smart trait picks (best
  chemistry vs own roster) = own-group picks for the bot, within noise.
v426 (arcs: two player-started arcs at a time replace the Performance Center; build steps +ARC_BUILD .25 a step, payoff +.6-1.0 star,
  ARC_FANS 12K, arcs count as stories for casuals (ARC_CAS .5 a segment, cap 1); mandates cash .4 cap / 14K fans / miss -8K, story
  mandates x1.3 and twice as likely). The default and engaged bots now keep two arcs running (a random one of the three on offer, Book
  it each week; --noarcs adds bots that never start one) and chase the network mandate in its last two weeks. 24 games x 2 seasons,
  seasons won S1/S2 (fans gained K): Normal v425 default 58/21% (530/303), default 54/38% (561/362), default no arcs 38/25% (503/278),
  engaged 96/88% (651/471), engaged no arcs 83/54% (644/446), lazy 0/0%. Hard: v425 33/4%, default 33/17%, no arcs 25/12%, engaged
  58/42%, engaged no arcs 54/29%. Easy ~100% for all but lazy. About 7 arcs paid off and 4-5 failed a season. Before arcs fed the
  casuals' story pull, the same bots lost 50-75K fans a season by running arcs (forced pairings cost Suggest's best matches).
v427 (the arc board: 39 arcs, each runs once a season across the roster; 10 open in season 1 plus 9 by milestone / Good Building,
  10 more in season 2 plus 10 by season-2 milestones / Actual Arena, all open in season 3; the profile lists every arc that fits).
  Normal 24 games x 3 seasons, seasons won S1/S2/S3: v425 default 67/50/12%, default + arcs 62/50/25%, default no arcs 42/17/0%,
  engaged + arcs 83/75/38%, engaged no arcs 79/62/33%, lazy 0%. The bot starts ~13 arcs a season and never runs the board dry.
v428 (a different board every game: 22 arcs shuffled across the unlock slots, 11 story arcs dealt one of 2-3 variants, a hidden
  "made for" arc per wrestler at x1.5 payoff and rewards), Normal 24 x 3: default + arcs 50/29/8%, no arcs 29/4/8%, engaged + arcs
  100/71/33%, engaged no arcs 75/58/29%, lazy 0% (same picture as v427, within noise). 0 errors.
v429 (storylines dealt per run, Copycat / Transformation / Faction War, Retirement: Absorption), Normal 20 x 2: default + arcs
  75/30%, no arcs 30/25%, engaged + arcs 100/70%, engaged no arcs 90/65%. 0 errors.
"""
import argparse, asyncio, json, os, socket, statistics as st, subprocess, sys, tempfile, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIM = open(os.path.join(ROOT, 'tools', 'balance-sim.js')).read()


def port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p


async def run(variants, games, weeks, spend=True, diffs=('easy', 'normal', 'hard')):
    from playwright.async_api import async_playwright
    srv, results = [], {}
    for v in variants.values():
        v['port'] = port()
        srv.append(subprocess.Popen([sys.executable, '-m', 'http.server', str(v['port']), '-d', v['dir'], '--bind', '127.0.0.1'],
                                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
    time.sleep(1)
    try:
        async with async_playwright() as p:
            exe = os.environ.get('CHROME_PATH')
            b = await p.chromium.launch(**({'executable_path': exe} if exe else {}))
            sem = asyncio.Semaphore(6)

            async def one(name, diff):
                v = variants[name]
                async with sem:
                    ctx = await b.new_context(); pg = await ctx.new_page(); perr = []
                    pg.on('pageerror', lambda e: perr.append(str(e)[:200]))
                    pg.on('dialog', lambda d: asyncio.ensure_future(d.dismiss()))
                    try:
                        await pg.goto(f"http://127.0.0.1:{v['port']}/index.html"); await pg.wait_for_timeout(800)
                        if v.get('pre'): await pg.add_script_tag(content=v['pre'])
                        await pg.add_script_tag(content=SIM)
                        r = await pg.evaluate(f"SIM({{diff:'{diff}',weeks:{weeks},spend:{str(spend).lower()},engaged:{str(v.get('engaged', False)).lower()},crude:{str(v.get('crude', False)).lower()},checklist:{str(v.get('checklist', True)).lower()},skip:{json.dumps(v.get('skip', []))},pitch:{json.dumps(v.get('pitch'))},...{json.dumps(v.get('opt', {}))}}})")
                    except Exception as e:
                        r = {'seasons': [], 'errs': ['runner: ' + str(e)[:200]]}
                    r['perr'] = perr; results.setdefault(f'{name}|{diff}', []).append(r); await ctx.close()
            await asyncio.gather(*[one(n, d) for n in variants for d in diffs for _ in range(games)])
            await b.close()
    finally:
        for s in srv: s.kill()
    return results


def table(results):
    m = lambda x: round(st.mean(x), 2) if x else '-'
    rows = []
    for key in sorted(results):
        G = results[key]; errs = sum(len(g['errs']) + len(g['perr']) for g in G)
        for sn in (1, 2, 3):
            S = [s for g in G for s in g['seasons'] if s['season'] == sn and s['weeks'] >= 38]
            if not S: continue
            E = [s['end'] for s in S]
            rows.append({'variant|difficulty': key, 'season': sn, 'n': len(S),
                         'show★ you': m([st.mean(s['rp']) for s in S]), 'show★ rival': m([st.mean(s['rai']) for s in S]),
                         'weeks won': m([s['wins'] / s['weeks'] for s in S]),
                         'fans gained K you': m([e['fansGained']['p'] / 1000 for e in E]), 'fans gained K rival': m([e['fansGained']['ai'] / 1000 for e in E]),
                         'seasons won': m([1 if (e['fans']['p'] > e['fans']['ai'] if e.get('war') == 'total' else e['fansGained']['p'] > e['fansGained']['ai']) else 0 for e in E]),
                         'bank $K you': m([e['money']['p'] for e in E]), 'bank $K rival': m([e['money']['ai'] for e in E]),
                         'pop 90+': m([e['pop90'] for e in E]), 'pop 85+': m([e['pop85'] for e in E]), 'pop 80+': m([e['pop80'] for e in E]),
                         'median pop': m([e['medPop'] for e in E]), 'morale': m([e['mor']['p'] for e in E]),
                         'injured/wk': m([s['injP'] / s['weeks'] for s in S]), 'checklist/wk': m([s.get('checklist', 0) / s['weeks'] for s in S]), 'promo★': m([st.mean(s['promoStars']) for s in S if s['promoStars']]),
                         'match★': m([st.mean(s['matchStars']) for s in S if s['matchStars']]), 'title changes': m([s['titleChanges'] for s in S]),
                         **({('fans ' + g + ' K'): m([e['fb']['p'][g] / 1000 for e in E if e.get('fb')]) for g in ('cas', 'tech', 'blood', 'flip', 'chaos')} if any(e.get('fb') for e in E) else {}),
                         **({('show gain ' + k): m([e['fbd'].get(k, 0) / 1000 for e in E if e.get('fbd')]) for k in ('p.cas', 'p.tech', 'p.blood', 'p.flip', 'p.chaos', 'ai.cas', 'ai.tech', 'ai.blood', 'ai.flip', 'ai.chaos')} if any(e.get('fbd') for e in E) else {}),
                         **({'arcs started': m([e['arcs']['started'] for e in E]), 'arcs paid': m([e['arcs']['paid'] for e in E]), 'arcs great': m([e['arcs']['great'] for e in E]), 'arcs failed': m([e['arcs']['failed'] for e in E])} if any(e.get('arcs') for e in E) else {}),
                         'buzz you': m([e['buzz']['p'] for e in E if e.get('buzz')]), 'buzz rival': m([e['buzz']['ai'] for e in E if e.get('buzz')]),
                         'errors': errs})
    if not rows: print('no complete seasons'); return
    keys = list(dict.fromkeys(k for r in rows for k in r))
    for k in keys: print(f'{k:>20} ' + ' '.join(f'{str(r.get(k, "-")):>16}' for r in rows))
    bad = [e for G in results.values() for g in G for e in g['errs'] + g['perr']]
    print('\nerrors:', len(bad)); [print('  ' + e) for e in bad[:10]]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--games', type=int, default=10); ap.add_argument('--seasons', type=int, default=2)
    ap.add_argument('--compare', help='an older commit/tag to run side by side')
    ap.add_argument('--diff', choices=['easy', 'normal', 'hard'], help='one difficulty only (faster)')
    ap.add_argument('--frugal', action='store_true', help='the bot never buys production')
    ap.add_argument('--engaged', action='store_true', help='also a hands-on booker (stips, finishes, run-ins, title challenges) to compare with Suggest the rest')
    ap.add_argument('--lazy', action='store_true', help='also a GM who only taps Suggest the rest and ignores the checklist')
    ap.add_argument('--noarcs', action='store_true', help='also the default bot without arcs (it keeps two running otherwise)')
    a = ap.parse_args()
    variants = {'current': {'dir': ROOT}}
    if a.engaged: variants['engaged'] = {'dir': ROOT, 'engaged': True}
    if a.lazy: variants['lazy'] = {'dir': ROOT, 'checklist': False}
    if a.noarcs: variants['noarcs'] = {'dir': ROOT, 'opt': {'arcs': False}}
    if a.engaged and a.noarcs: variants['engaged-noarcs'] = {'dir': ROOT, 'engaged': True, 'opt': {'arcs': False}}
    wt = None
    if a.compare:
        if subprocess.run(['git', '-C', ROOT, 'cat-file', '-e', a.compare + '^{commit}'], capture_output=True).returncode:
            # a shallow clone (Claude's sessions start with one) doesn't have older commits: fetch enough history
            subprocess.run(['git', '-C', ROOT, 'fetch', '-q', '--depth=400', 'origin', 'main'], check=True)
        wt = tempfile.mkdtemp(prefix='tksim-'); subprocess.run(['git', '-C', ROOT, 'worktree', 'add', '-q', '--detach', wt, a.compare], check=True)
        variants[a.compare] = {'dir': wt}
    try:
        t = time.time(); res = asyncio.run(run(variants, a.games, a.seasons * 41, not a.frugal, (a.diff,) if a.diff else ('easy', 'normal', 'hard')))
        print(f'{sum(len(v) for v in res.values())} games in {round(time.time() - t)}s\n'); table(res)
    finally:
        if wt: subprocess.run(['git', '-C', ROOT, 'worktree', 'remove', '--force', wt])


if __name__ == '__main__':
    main()
