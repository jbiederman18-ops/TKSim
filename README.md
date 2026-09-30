# Tony Khan Simulator

A wrestling general-manager game: draft, book Dynamite and Collision, and win the fan war on the road to All In. Works fully offline once installed.

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
Upload the new `index.html`, then open `sw.js` and bump the version in `VERSION` (e.g. `aegm-v36` → `aegm-v37`) so phones pick up the update. Installed copies update the next time they're opened online (close and reopen the app once).

## Play online with a friend
Host a league for 2–4 GMs and friends join with a 6-letter code. Everyone runs their own brand, you face a different GM each week, and the most fans after All In wins. Offline turns sync later, and each player gets a notification when it's their move. One-time setup: see [ONLINE-SETUP.md](ONLINE-SETUP.md).

## Party night (same room, big screen)
Party night is a way to play an online league, not a separate game. It uses the same league, the same save and the same code, so you can play some weeks together on the couch and the rest on your own time.

- **Start it:** any GM opens the league's **Office → Party night → Start party night**. Everyone in the league now books **at the same time** instead of taking turns. That covers creating wrestlers too. The draft still goes pick by pick.
- **Lock in:** tap **Go live** on your phone to lock in your card. You can unlock it from the banner until everyone else is in. When the last GM locks in, the week airs right away and every phone gets its results.
- **The TV:** on any screen, open the game, tap **Show a league on this screen** and enter the league code. The TV follows the league live. It shows who's still booking, the draft board and the standings, and plays each week's shows side by side, segment by segment. It doesn't take a seat, and it can **Replay last week**. If the league still has open seats, the TV shows a QR code so friends can join.
- **End it:** **Office → End party night** (or the link in the banner). The league goes back to taking turns from exactly where it is. If someone has to leave early, end party night and they book their show later with turn alerts as usual.
- Needs the Firebase setup in [ONLINE-SETUP.md](ONLINE-SETUP.md) and an internet connection on every device. No new setup beyond online leagues.

## Your games
Tap **⇄** at the top to see every game on this device — several solo games plus any online leagues — and switch between them. When you have more than one, the game opens on this list (tap outside it to carry on where you left off).

**Move a game to your home-screen app or another device:** in ⇄ Your games, tap **⋯ → Move**. A league gives you its seat code; a solo game makes a one-time move code. Open the game where you want it, tap **⇄ → Receive a game**, and paste the code. Mid-draft is fine. Cloud save follows one solo game at a time — the Office shows which.

## Your saves
Turn on **Office → Cloud save** to back up automatically and continue on any device with your sync code (needs the one-time Firebase setup in [ONLINE-SETUP.md](ONLINE-SETUP.md)). The game also keeps automatic backups of your last few weeks under **Office → Backups**.

Saves and photos live on each device, inside the installed app. The installed app does **not** share saves with a copy opened from Files or a browser tab, so use **Office → Export** in the old copy and **Import** in the new one to move a season over (and **Export Photo Pack / Import Photo Pack** for pictures). Exporting now and then is a good backup.
