# Tony Khan Simulator

A wrestling general-manager game: draft, book Dynamite and Collision through a full AEW year — a PPV every 4 weeks from Revolution through All In to Worlds End — and win the fan war. Works fully offline once installed.

## Put it on GitHub Pages
1. Create a new public repository on GitHub (e.g. `all-elite-gm`).
2. Upload every file in this folder to the repository root (**Add file → Upload files**).
3. Go to **Settings → Pages**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, and save.
4. After a minute your game is live at `https://<your-username>.github.io/all-elite-gm/`.

## Install on your phone
- **iPhone (Safari):** open the link, tap **Share → Add to Home Screen**.
- **Android (Chrome):** open the link, tap **⋮ → Install app** (or *Add to Home screen*).

Open it once while online; after that it launches with no connection.

## Updating the game
Upload the changed files (usually `index.html`, plus any `.js` files that changed, such as `season.js` or `tutorial.js`), then open `sw.js` and bump the version in `VERSION` (e.g. `aegm-v36` → `aegm-v37`) so phones pick up the update. Installed copies update the next time they're opened online (close and reopen the app once).

## Play online with a friend
Host a league for 2–4 GMs and friends join with a 6-letter code. Everyone runs their own brand, you face a different GM each week, and the most fans gained by Worlds End wins. Offline turns sync later, and each player gets a notification when it's their move. One-time setup: see [ONLINE-SETUP.md](ONLINE-SETUP.md).

## New players: the tour
A new game offers a one-minute **draft tour**, then a **first-week tour** once the draft is done. Each stop spotlights the real screen — the cap, what Ring/Mic/Pop mean, the running order, crowd buzz, feuds, stamina, making stars, free agents, titles and money — and explains how you win the fan war. After that, one-time **coach tips** pop up the first time you open the match editor, see your results or reach a PPV week. Replay it any time from **⚙️ → Rookie orientation** (where you can also turn coach tips on or off).

The tour reads its numbers straight from the game and is checked automatically on every update (`tools/check-tutorial.py`), so it keeps up as the rules change. When a stop changes, players who already took the tour get a short **What's new** replay of just those stops.

## The countdown

Now and then a countdown clock appears during a solo promo. Three weeks later a free agent from the other side of the face/heel line debuts and goes after the wrestler who had the mic (instant heat), and you get one week to sign them at a discount — bigger if the promo hyped the clock. Sign them early, or let the rival, and they debut for whoever did.

## Scouting & ROH (the farm system)
- **Three scouting boards** (Roster → Free agents → Scouting), refreshing every few weeks: **🌱 Indies** (raw prospects and gimmick acts, the most upside), **🏟️ ROH** (polished regulars plus the real ROH roster — Jay Lethal, Matt Sydal, Top Flight, the Von Erichs, Premier Athletes, Dalton Castle, Lacey Lane and more. They aren't in the AEW draft, so ROH is the only place to get them. Ready sooner, less upside) and **🌏 Overseas** (skilled imports from Japan, Mexico and the UK who are still learning promos).
- **Sign to AEW or to ROH.** AEW signings take a roster spot and can be booked right away. ROH signings go to your ROH roster (Roster → 🏟️ ROH, up to 8): no AEW roster spot, half salary, and they grow toward their potential every week on ROH TV, slower than the Performance Center.
- **Feature** one ROH wrestler to grow faster and build popularity (up to 45). Send someone on a once-per-career **10-week excursion**: NJPW (biggest in-ring jump and a tougher body), CMLL (comes back a bigger draw) or RevPro (real mic reps). They return with more potential and a bigger debut pop.
- **Call up** anyone whenever you need them (they get a debut pop), and **send down** rookies or anyone at 45 popularity or lower to develop. Champions can't be sent down. ROH deals run out like any contract — extend them from the ROH screen.
- **Teams reunite.** Sign or call up both halves of a real ROH team (Top Flight, the Von Erichs, Premier Athletes…) and they're a team again on your roster.
- Works in online leagues too: every GM has their own ROH roster.

## Challenge scenarios
Tap **🎯 Challenge scenarios** on the new-game screen for a solo season with one goal and a deadline:

| Challenge | Goal | Deadline |
|---|---|---|
| ⭐ Make a Star | Pick a wrestler at 50 popularity or lower after the draft and get them to 75 | All In |
| 🚢 Sinking Ship | Start $500K in the red with the rival 150K fans ahead; reach $1.5M in the bank and more total fans | All In |
| 📺 Ratings War | Win 6 straight weeks of TV head to head (PPV weeks don't break the streak) | All In |
| 🏆 Gold Rush | Hold 7 of the 10 titles at once | Week 32 |
| ✨ Five-Star Factory | 12 matches at 5★ or better, your own wrestlers only | All In |
| 🪨 David vs. Goliath | On Hard, with the rival 150K fans and $1.5M ahead, finish the year with more total fans | Worlds End |
| 🌱 Homegrown | A wrestler you scouted or created holds a singles title | Week 32 |
| 🤝 Happy Locker Room | Win the fan war at All In with morale averaging 92+, nobody under 75, and no walkouts | All In |

A card on Home shows your progress and the weeks left. Win or lose, the save keeps going as a normal game, and your best result for each challenge is kept on the device.

## Offers & contracts
- **Free agents with 55+ popularity want an offer**, not just a fee: a signing bonus, a weekly salary, and promises — 🎬 creative control, ⭐ main event spots, 🏆 a title shot, 📺 a place on every PPV. Each wrestler wants different things (a big star wants control, a hungry midcarder wants main events), and the offer screen tells you how it looks to them. Smaller names still sign on the spot.
- **Sealed bids.** Solo, the rival may send an offer too and the wrestler picks right away. In a league, every other GM can send one sealed counter before the week airs, and the wrestler picks the best package when it does. On party night the TV reveals every offer in a "Signing war" before the results.
- **Contract countdown.** Deals with 5 weeks or less left (9 for stars) show on a ✍️ card on Home and at the top of the weekly briefing, amber at 3 weeks and red on the last show. The Book screen repeats it, and going live on someone's last show asks you to re-sign them or let them go first
- **Re-signing is a negotiation** (from the weekly briefing or the wrestler's card). They make demands; agree to some or all, or counter on money. They take it, counter back (up to three rounds) or walk away, depending on their morale, how hot your show is and whether you've kept your word before.
- **Promises are contract terms.** The Book screen shows what's owed. Keep one and morale rises (and a little lost trust comes back); break one and morale drops; after three, a wrestler may walk out. An injury pauses the clock on a promise. Only true main eventers ask for creative control, it lasts 12 weeks, and a roster can have at most 3 people with it. **Creative control** means they won't agree to lose: the card flags it before you go live, and if you go ahead, about half the time they change the finish and go over (−¼★); otherwise they do the job under protest and morale drops hard.

## Booking by feel
- **No star math while booking.** The match editor shows crowd buzz (🥶 → 🔥🔥🔥) and ▲/▼ tells on titles and finishes instead of exact star bonuses. Stipulations show a rough upside (📈 big / some / little, or 📉 works against them) weighed against the extra wear (🔋), injury risk (🩹) and anyone it would leave gassed. Risky calls (first-time pairings, gimmick matches, screwy finishes, run-ins, rookies) make a match a 🎲 wild card.
- **Pick who takes the pin.** In any match with three or more wrestlers, only one person on the losing end takes the fall and everyone else stays protected. The match editor lets you choose who (the default is the lowest-billed), and shows how much of a rub the winner gets for pinning them. A wrestler with creative control only objects if they're the one taking the pin.
- **Titles are split evenly.** A new game deals the titles out between the two shows (each gets five, with a top men's and a top women's title on each side). Each brand crowns its own vacant titles, a vacated title stays on its brand, and a PPV title challenge is still the way to take gold from the rival.
- **Reveal after the show.** Live promos end on the crowd's reaction (🥶 → 🔥🔥🔥) rather than a star rating, so every number waits for the results. In solo play the results come out like a broadcast, on one screen that never scrolls, as head-to-head rounds: your segment and the rival's in the same slot of the card share the spotlight, each one's stars sweep in smoothly (part-stars fill part of a star), and the better one gets ▲ Wins the round. Main events always meet in the final round. A rundown of both cards underneath fills in as you go, and the scoreboard keeps a running "so far" for both shows. The final ratings and the winner land last, then **Full results** opens the whole breakdown. Tap to hurry it along or **Skip ▸▸**; **Last Show** goes straight to the full results, with a **▶ Replay the reveal** button. Then tap **Why that rating?** under any of your matches to see what each part was worth, including the luck of the night.
- **Every promo has a job.** Callout (can get a match made), Sneak Attack (most heat, counts as physical contact), Contract Signing (books the PPV match), Sit-Down Interview (biggest morale lift and fastest mic growth — the fix for an unhappy wrestler), Faction Rally (the bigger star, listed first, rubs off on a less popular partner; alone, it lifts the whole group's spirits), Backstage Vignette (low risk, and grows wrestlers at popularity 60 or below faster), Champion's Address (raises the title's prestige when it lands) and Heel / Face Turn. The promo picker marks ✓ Good fit when one suits who you've picked, and Suggest the rest and the rival use the whole set.
- **Discovered chemistry.** Wrestlers who've never shared a ring only show chemistry "on paper" with a ❓; their first match rolls a spark that sticks as history.
- **A bonus match.** Weekly TV has an optional bonus match alongside the bonus promo. Book it when you have something worth showing or leave it empty — it counts toward the show rating like any segment and costs stamina like any match. ✨ Suggest the rest leaves it for you to decide.
- **Stipulation specialties.** In the match editor, stipulations that suit someone's style are marked ⭐ with their name (e.g. ⭐ Specialty · Ospreay on a Ladder match), listed first, and the closed picker tells you how many there are. Ones that work against a style get a ⚠️. A booked match on a specialty stipulation shows the ⭐ on the Book screen.
- **Money stays meaningful.** A bigger company pays bigger wages when wrestlers sign or re-sign (about +15% at 1M fans), production and stipulations cost more in bigger venues, and past a big night's box office the extra comes in at half — so a hit promotion's bank levels off instead of piling up millions. The offline rival doesn't pay the wage premium (it runs a bigger roster); in online leagues every GM does.
- **The top is hard to reach and hard to hold.** Popularity gains slow sharply past 80 and again past 90, and stars at 85+ slip a little in weeks they aren't featured (main event, PPV win, or a 3½★+ match or promo).
- **Multi-person matches** are carried by their top two names and their hottest rivalry, reward a mix of styles (triple threats and 4-ways love flyers and showmen; tags lean on partners who click), and pay off later: only one loser takes the fall, lower names gain popularity from the top star, and the top star uses less stamina.

## Party night (same room, big screen)
Party night is a way to play an online league, not a separate game. It uses the same league, the same save and the same code, so you can play some weeks together on the couch and the rest on your own time.

- **Start it:** any GM opens the league's **Office → Party night → Start party night**. Everyone in the league now books **at the same time** instead of taking turns. That covers creating wrestlers too. The draft still goes pick by pick.
- **Lock in, then go live on the TV:** book your card and tap **Lock in my card**. You can unlock it until everyone else is in. Once every card is locked, GMs go live **one at a time on the TV**. Your phone says "You're live!" and you play your show there, but every promo beat, match call, choice and outcome is shown on the TV so the room can watch and shout advice. When the last GM wraps up, the week airs and every phone gets its results.
- **Picks on the TV:** when the live GM taps a promo or match choice, the TV lights up that option for a moment, then shows how it played out with a "Picked" tag on top. Your phone does the same on every show, party night or not: the call you tap lights up with a ✓ Picked tag while the others dim, and the outcome keeps a "You picked" strip on top.
- **The TV:** on any screen, open the game, tap **Show a league on this screen** and enter the league code. The TV follows the league live. It shows who's still booking, the draft board, the standings and whoever is live right now (choices and all). Then it plays each week's shows side by side, segment by segment, alternating between the two shows: stars sweep in, the better segment in each slot gets ▲ Wins the round, and the final ratings fill in before the winner is announced. It doesn't take a seat, and it can **Replay last week**. It fills any size screen: a PC running a 4K TV at 100% Windows scaling gets the same layout as 1080p, just sharper (150% and 200% scaling look the same too). If the league still has open seats, the TV shows a QR code so friends can join.
- **Everyone at once:** phones save at the same time, and each save is merged into the league. If two GMs grab the same thing in the same moment (say, the same free agent), the first one gets it and the other phone refreshes — keeping that GM's card, lock-in and private plans. Two GMs forming different tag teams or factions at once both stick.
- **End it:** **Office → End party night** (or the link in the banner). The league goes back to taking turns from exactly where it is. GMs who already went live that week stay locked in, and everyone else goes live on their own turn. If someone has to leave early, end party night and they book their show later with turn alerts as usual.
- Needs the Firebase setup in [ONLINE-SETUP.md](ONLINE-SETUP.md) and an internet connection on every device. No new setup beyond online leagues.

## Looks
**Office → ⚙️ Game menu → Look** changes how the game looks on this device (your save and leagues aren't affected):
- **Classic** — black and gold, broadcast style (the default).
- **⚔️ '06 Brand War** — gritty mid-2000s console menus: scratched steel, chrome titles, red-vs-blue lines and red buttons.
- **🔥 '26 Modern** — today's console style: flat and dark, huge headlines, frosted rounded panels, pill buttons, one hot accent.
- **🕹️ 16-Bit** — a retro video game with pixel fonts and pixel-art wrestlers (photos become pixel art, or pick **Sprites only**).

The looks live in `retro.css`, `retro.js` and `fonts/`, so upload those too when updating.

## Your games
Tap **⇄** at the top to see every game on this device — several solo games plus any online leagues — and switch between them. When you have more than one, the game opens on this list (tap outside it to carry on where you left off).

**Move a game to your home-screen app or another device:** in ⇄ Your games, tap **⋯ → Move**. A league gives you its seat code; a solo game makes a one-time move code. Open the game where you want it, tap **⇄ → Receive a game**, and paste the code. Mid-draft is fine. Cloud save follows one solo game at a time — the Office shows which.

## Your saves
Turn on **Office → Cloud save** to back up automatically and continue on any device with your sync code (needs the one-time Firebase setup in [ONLINE-SETUP.md](ONLINE-SETUP.md)). The game also keeps automatic backups of your last few weeks under **Office → Backups**.

Saves and photos live on each device, inside the installed app. The installed app does **not** share saves with a copy opened from Files or a browser tab, so use **Office → Export** in the old copy and **Import** in the new one to move a season over (and **Export Photo Pack / Import Photo Pack** for pictures). Exporting now and then is a good backup.
