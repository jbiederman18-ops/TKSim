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
Upload the new `index.html`, then open `sw.js` and bump the version in `VERSION` (e.g. `aegm-v30` → `aegm-v31`) so phones pick up the update. Installed copies update the next time they're opened online (close and reopen the app once).

## Play online with a friend
Host a league for 2–4 GMs and friends join with a 6-letter code. Everyone runs their own brand, you face a different GM each week, and the most fans after All In wins. Offline turns sync later, and each player gets a notification when it's their move. One-time setup: see [ONLINE-SETUP.md](ONLINE-SETUP.md).

## Your saves
Turn on **Office → Cloud save** to back up automatically and continue on any device with your sync code (needs the one-time Firebase setup in [ONLINE-SETUP.md](ONLINE-SETUP.md)). The game also keeps automatic backups of your last few weeks under **Office → Backups**.

Saves and photos live on each device, inside the installed app. The installed app does **not** share saves with a copy opened from Files or a browser tab, so use **Office → Export** in the old copy and **Import** in the new one to move a season over (and **Export Photo Pack / Import Photo Pack** for pictures). Exporting now and then is a good backup.
