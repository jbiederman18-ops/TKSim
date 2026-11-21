# Online leagues: one-time Firebase setup

Online leagues let 2–4 friends play together. Each GM runs their own brand (Dynamite, Collision, Rampage, Ring of Honor), and every week you go head-to-head with a different GM. Everyone books each week at the same time and the draft goes in order, with a pick queue so nobody waits on you. The game still works fully offline. A turn taken without a connection is saved on the phone and syncs when it's back online.

Firebase holds the shared league. It's free at this size. Setup takes about 15 minutes and only has to be done once. Your friends don't need to do any of this.

---

## Part 1: Online play (about 10 minutes, no credit card)

1. **Create the project.** Go to <https://console.firebase.google.com>, click **Create a project**, and name it something like `tksim`. You can turn off Google Analytics.
2. **Turn on sign-in.** Go to **Build → Authentication → Get started → Sign-in method**, choose **Anonymous**, switch it on, and click **Save**.
   Then open **Authentication → Settings → Authorized domains → Add domain** and add `jbiederman18-ops.github.io`.
3. **Create the database.** Go to **Build → Firestore Database → Create database**. Pick a location near you and start in **production mode**.
4. **Add the security rules.** In Firestore, open the **Rules** tab. Replace everything with the contents of [`firebase/firestore.rules`](firebase/firestore.rules) and click **Publish**.
5. **Register the web app.** Click the ⚙️ gear → **Project settings → General**. Under *Your apps*, click the **`</>`** (Web) icon, give it a nickname, and click **Register app**. Leave Firebase Hosting unchecked. You'll see a `firebaseConfig` block. Copy its values into [`firebase-config.js`](firebase-config.js).
6. **Get the push key.** In **Project settings → Cloud Messaging → Web Push certificates**, click **Generate key pair**. Paste the long key into `vapidKey` in `firebase-config.js`.
7. Commit `firebase-config.js`. These values are safe to publish. Firebase web keys aren't secrets, and the security rules are what protect the leagues.

After that, **Host a league**, **Join a league** and **Cloud save** all work in the game (on the start screen, or in the **⚙️ Game menu**).

> Already published the rules from an earlier version? Paste the latest `firebase/firestore.rules` again. Cloud saves need the new `saves` section.
> v383: **Sign in with Google** for cloud saves. In **Authentication → Sign-in method → Add new provider**, choose **Google**, switch it on, pick a support email and click **Save**. Make sure `jbiederman18-ops.github.io` is under **Authentication → Settings → Authorized domains**. Then paste the latest `firebase/firestore.rules` again (it adds the `users` section, which remembers each account's sync code). Anonymous sign-in must stay on: leagues and cloud saves still use it.
> v262: party night's TV feed has its own `live` section in the rules. Paste the latest rules again so phones stop re-downloading the whole league on every live tap (it still works without it, just heavier).

## Part 2: Turn notifications (about 5 minutes)

Notifications are sent by a small Cloud Function in [`firebase/functions`](firebase/functions). Cloud Functions require Firebase's **Blaze (pay-as-you-go)** plan, which needs a card on file. A two-person league stays far inside the free monthly allowance, so it should cost $0. To be safe, set a budget alert of $1 while upgrading.

1. In the Firebase console, click **Upgrade** (bottom left) and choose **Blaze**.
2. On your computer, install [Node.js LTS](https://nodejs.org). Then run these commands in Terminal from the repo folder:
   ```sh
   npm install -g firebase-tools
   firebase login
   cd firebase
   firebase use --add            # pick your project, alias: default
   (cd functions && npm install)
   firebase deploy --only firestore:rules,functions
   ```
3. In the game, open the **⚙️ Game menu → Online league** and turn on alerts on each phone.

**iPhone:** notifications only work from the installed app. Open the site in Safari, tap **Share → Add to Home Screen**, open the game from the home screen, then turn alerts on. This needs iOS 16.4 or newer.

---

## How a league plays

- **Host:** start screen or **⚙️ Game menu → Host a league** → pick **2, 3 or 4 GMs** → send the 6-letter code (the **Share invite** button does this).
- **Friends:** open the game → **Join a league** → enter the code. Each friend takes the next open seat.
- **Before the draft:** everyone creates wrestlers at the same time, and the draft starts once the last GM is ready. The draft goes in turns in a random order, the same order every round. **Auto-draft me** lets the game pick for you whenever you're on the clock. You can switch it on or off any time during the draft, even when it isn't your pick, and it keeps picking for you with the app closed.
- **Schedule:** with 2 GMs it's head-to-head every week. In leagues with 3 or 4 GMs, every show competes every week and the night is ranked: 1st gets the biggest fan bump (and the ratings win), the places below get smaller bumps and last gets none, just like losing a head-to-head. The best main event of the night earns +3K. (3- and 4-GM leagues created before v239 keep their round robin, with byes, until you start a new league.)
- **Each week:** everyone books the same week at the same time, on their own phone, whenever suits them — make your calls, lock in, and the week airs the moment the last GM locks in. Cards stay secret until then. You get a notification when the results are in. (Prefer the old way? **⚙️ Game menu → League weeks → Take turns** has GMs book one at a time, with a turn alert when it's yours.)
- **Party night:** everyone in the same room? **Start party night** (Home, or the ⚙️ Game menu): everyone books at once, then GMs go live one at a time on the TV — any highlight reels as they happen, then a rundown of the rest of that GM's card. Any screen can show the league (**Show a league on this screen** + the league code). End it any time and the league carries on as normal. See the README.
- **Winning:** the most fans gained by the end of the season (Survivor Series) wins the league. Promises, the Performance Center and front-office situations are private to each GM. Free agents, titles and feuds are shared.
- **Changing phones:** in **⇄ Your games**, tap **⋯ → Move** on the league to get your private seat code (`CODE-XXXXXXXX`). On the new device, tap **⇄ → Receive a game** and paste it. You also need this when moving from a Safari tab to the installed app, because they keep separate storage.
- Your solo game stays separate. Use **⇄ Your games** to go back and forth.
- League size is fixed once created. If a friend drops out, their seat waits for them, so pick the size you'll actually play with.

## Cloud save

- **Turning it on:** **⚙️ Game menu → Saves & backups → Turn on cloud save** gives you a 12-character sync code. On any other device (phone, iPad, computer, or the installed app vs. a Safari tab), go to **Cloud save → I have a sync code** or **☁️ Load my cloud save** on the start screen and enter it.
- **Saving:** every change saves on the device first, then uploads in the background. Offline play just works. The upload waits until you're back online and never overwrites a newer save from another device.
- **Conflicts:** if two devices were both played offline, the game asks which one to keep. The other one is saved as a backup.
- **Leagues:** your online leagues come along too. Opening one on a new device moves your seat there automatically. Turn alerts go to whichever device you used last, so turn them on for each device.
- **Backups:** the game keeps the last 5 weeks on the device and in the cloud, plus a snapshot whenever something is about to replace your save (loading from the cloud, importing a file, restoring a backup, starting a new game). **⚙️ Game menu → Saves & backups → Backups on this device** restores any of them.
- **Not included:** custom photos stay on each device, because they're too big for the cloud. Use **Export Photo Pack / Import Photo Pack** to move them.

## Updating Firebase later

`firebase-sdk.js` is a bundled copy of the Firebase pieces the game uses, so it loads offline. To refresh it, run `tools/build-firebase-sdk.sh`.
