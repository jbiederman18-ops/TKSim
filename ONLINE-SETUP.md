# Online leagues: one-time Firebase setup

Online leagues let 2–4 friends play together. Each GM runs their own brand (Dynamite, Collision, Rampage, Ring of Honor), and every week you go head-to-head with a different GM. You take turns whenever you like. The game still works fully offline. A turn taken without a connection is saved on the phone and syncs when it's back online.

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

After that, **Host a league**, **Join a league** and **Cloud save** all work in the game (on the start screen, or in **Office**).

> Already published the rules from an earlier version? Paste the latest `firebase/firestore.rules` again. Cloud saves need the new `saves` section.

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
3. In the game, go to **Office → Online league → Turn on turn alerts** on each phone.

**iPhone:** notifications only work from the installed app. Open the site in Safari, tap **Share → Add to Home Screen**, open the game from the home screen, then turn alerts on. This needs iOS 16.4 or newer.

---

## How a league plays

- **Host:** start screen or Office → **Host a league** → pick **2, 3 or 4 GMs** → send the 6-letter code (the **Share invite** button does this).
- **Friends:** open the game → **Join a league** → enter the code. Each friend takes the next open seat.
- **Before the draft:** each GM gets a turn to create wrestlers, so the draft starts once everyone has joined. The draft goes in turns in a random order, the same order every round. **Auto-draft me** lets the game pick for you whenever you're on the clock.
- **Schedule:** it's a round-robin, so you face a different GM each week. With 4 GMs there are two matchups every week. With 3, one GM has a bye: their show still airs and earns fans, just without a head-to-head. Home shows league standings (fans and head-to-head wins).
- **Each week:** GMs book one at a time. When it's your turn, you book, go live, and pass to the next GM. The last one to book airs the week. Everyone sees every matchup's results, and the order rotates so a different GM goes first next week. You get a notification when it's your turn and when results are in.
- **Party night:** everyone in the same room? Office → **Party night** switches the league to booking all at once, and any screen can show the league on a TV (**Show a league on this screen** + the league code). End it any time and the league goes back to taking turns. See the README.
- **Winning:** the most fans after All In wins the league. Promises, the Performance Center and front-office situations are private to each GM. Free agents, titles and feuds are shared.
- **Changing phones:** Office → **Other device** shows your private seat code (`CODE-XXXXXXXX`). On the new device, enter it in **Join a league**. You also need this when moving from a Safari tab to the installed app, because they keep separate storage.
- Your solo game stays separate. Use **Office → Switch to my solo game** to go back and forth.
- League size is fixed once created. If a friend drops out, their seat waits for them, so pick the size you'll actually play with.

## Cloud save

- **Turning it on:** Office → **Cloud save → Turn on cloud save** gives you a 12-character sync code. On any other device (phone, iPad, computer, or the installed app vs. a Safari tab), go to **Cloud save → I have a sync code** or **☁️ Load my cloud save** on the start screen and enter it.
- **Saving:** every change saves on the device first, then uploads in the background. Offline play just works. The upload waits until you're back online and never overwrites a newer save from another device.
- **Conflicts:** if two devices were both played offline, the game asks which one to keep. The other one is saved as a backup.
- **Leagues:** your online leagues come along too. Opening one on a new device moves your seat there automatically. Turn alerts go to whichever device you used last, so turn them on for each device.
- **Backups:** the game keeps the last 5 weeks on the device and in the cloud, plus a snapshot whenever something is about to replace your save (loading from the cloud, importing a file, restoring a backup, starting a new game). Office → **Backups** restores any of them.
- **Not included:** custom photos stay on each device, because they're too big for the cloud. Use **Export Photo Pack / Import Photo Pack** to move them.

## Updating Firebase later

`firebase-sdk.js` is a bundled copy of the Firebase pieces the game uses, so it loads offline. To refresh it, run `tools/build-firebase-sdk.sh`.
