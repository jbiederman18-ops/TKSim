# Online leagues: one-time Firebase setup

Online leagues let two people play head-to-head. One GM books Dynamite and the other books Collision, and you take turns whenever you like. The game still works fully offline. A turn taken without a connection is saved on the phone and syncs when it's back online.

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

After that, **Host a league** and **Join a league** work in the game (on the start screen, or in **Office**).

## Part 2: Turn notifications (about 5 minutes)

The notification is sent by a small Cloud Function in [`firebase/functions`](firebase/functions). Cloud Functions require Firebase's **Blaze (pay-as-you-go)** plan, which needs a card on file. A two-person league stays far inside the free monthly allowance, so it should cost $0. To be safe, set a budget alert of $1 while upgrading.

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

- **Host:** start screen or Office → **Host a league** → send the 6-letter code (the **Share invite** button does this).
- **Friend:** open the game → **Join a league** → enter the code.
- **Before the draft:** each GM gets a turn to create wrestlers. The draft is a snake draft, and **Auto-draft me** lets the game pick for you whenever you're on the clock.
- **Each week:** you book your show and go live. Your segments play out right away and your card locks in. When your friend books theirs, the week airs, both of you see the results, and they book the next week. Each turn ends with the other person getting a notification.
- Promises, the Performance Center and front-office situations are private to each GM. Free agents, titles and feuds are shared.
- **Changing phones:** Office → **Other device** shows your private seat code (`CODE-XXXXXXXX`). On the new device, enter it in **Join a league**. You also need this when moving from a Safari tab to the installed app, because they keep separate storage.
- Your solo game stays separate. Use **Office → Switch to my solo game** to go back and forth.

## Updating Firebase later

`firebase-sdk.js` is a bundled copy of the Firebase pieces the game uses, so it loads offline. To refresh it, run `tools/build-firebase-sdk.sh`.
