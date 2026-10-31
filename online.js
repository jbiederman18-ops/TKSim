// Tony Khan Simulator — online leagues (Firebase). The game works without this file; it only adds sync + turn alerts.
import { initializeApp, getAuth, signInAnonymously, onAuthStateChanged, initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, getDocFromServer, setDoc, updateDoc, onSnapshot, serverTimestamp, deleteField, runTransaction, getMessaging, getToken, onMessage, isSupported } from './firebase-sdk.js';

const cfg = window.TK_FIREBASE || {};
const TKO = window.TKO = { configured: false, ready: false };

function announce() { window.dispatchEvent(new Event('tko-ready')); }

if (!cfg.apiKey || !cfg.projectId) {
  announce();
} else {
  const app = initializeApp(cfg);
  const auth = getAuth(app);
  // Keeps a copy of each league on the device, so turns taken offline are queued and sent when you reconnect.
  const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  const game = code => doc(db, 'games', code);

  let resolveUid;
  const uidReady = new Promise(r => { resolveUid = r; });
  onAuthStateChanged(auth, u => {
    if (u) { TKO.uid = u.uid; resolveUid(u.uid); }
    else signInAnonymously(auth).catch(e => console.warn('sign-in failed', e));
  });
  window.addEventListener('online', () => { if (!auth.currentUser) signInAnonymously(auth).catch(() => {}); });
  // Creating/joining needs a connection; don't leave the button spinning forever.
  const timed = (p, ms = 15000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

  const ALERTS = 'tksim_alerts';
  const alertMap = () => { try { return JSON.parse(localStorage.getItem(ALERTS) || '{}'); } catch (e) { return {}; } };

  Object.assign(TKO, {
    configured: true,
    ready: true,
    uidReady,

    create(code, data, key) { return timed(this._create(...arguments)); },
    async _create(code, data, key) {
      const uid = await uidReady;
      const snap = await getDocFromServer(game(code));
      if (snap.exists()) throw new Error('taken');
      const uids = {};
      for (let i = 0; i < (data.n || 2); i++) uids['s' + i] = i === 0 ? uid : null;
      await setDoc(game(code), { ...data, uids, created: serverTimestamp(), updated: serverTimestamp() });
      await setDoc(doc(db, 'games', code, 'seats', 's0'), { key });
    },

    // Take the first open seat in a league (retries if a friend grabs the same seat at the same moment).
    join(code, name, key, show) { return timed(this._join(...arguments)); },
    async _join(code, name, key, show) {
      const uid = await uidReady;
      for (let attempt = 0; attempt < 4; attempt++) {
        const snap = await getDocFromServer(game(code));
        if (!snap.exists()) throw new Error('nogame');
        const d = snap.data();
        const mine = Object.keys(d.uids || {}).find(k => d.uids[k] === uid);
        if (mine) return { seat: mine, data: d };
        const open = Object.keys(d.uids || {}).sort().find(k => !d.uids[k]);
        if (!open) throw new Error('full');
        try {
          await updateDoc(game(code), { ['uids.' + open]: uid, ['names.' + open]: name, ['shows.' + open]: show || ['Dynamite', 'Collision', 'Rampage', 'Ring of Honor'][+open.slice(1)] || 'Dynamite', updated: serverTimestamp() });
        } catch (e) { continue; }
        await setDoc(doc(db, 'games', code, 'seats', open), { key });
        const fresh = await getDocFromServer(game(code));
        return { seat: open, data: fresh.data(), key };
      }
      throw new Error('full');
    },

    // Move a seat to this device using its private seat code.
    claim(code, key) { return timed(this._claim(...arguments)); },
    async _claim(code, key) {
      const uid = await uidReady;
      const snap = await getDocFromServer(game(code));
      if (!snap.exists()) throw new Error('nogame');
      let seat = null;
      for (const s of Object.keys(snap.data().uids || {}).sort()) {
        try { await updateDoc(game(code), { ['uids.' + s]: uid, claim: key, updated: serverTimestamp() }); seat = s; break; } catch (e) { /* not this seat */ }
      }
      if (!seat) throw new Error('badkey');
      await updateDoc(game(code), { claim: deleteField() });
      await setDoc(doc(db, 'games', code, 'seats', seat), { key }).catch(() => {});
      const fresh = await getDocFromServer(game(code));
      return { seat, data: fresh.data(), key };
    },

    push(code, fields) {
      return updateDoc(game(code), { ...fields, updated: serverTimestamp() });
    },

    // Save a turn by merging it into whatever is in the league right now (several phones can save at once
    // on party night). fn gets the league as it is on the server and returns {fields} to write, or
    // {conflict} to write nothing. Runs as a transaction, so fn may run more than once; it needs a connection.
    pushMerge(code, fn) {
      return timed(runTransaction(db, async tx => {
        const ref = game(code);
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error('nogame');
        const r = fn(snap.data());
        if (r && r.fields) tx.update(ref, { ...r.fields, updated: serverTimestamp() });
        return r;
      }), 20000);
    },

    // ---- cloud saves (solo game + your list of leagues), keyed by a private 12-character sync code ----
    cloudGet(id) { return timed(getDocFromServer(doc(db, 'saves', id)).then(s => (s.exists() ? s.data() : null)), 12000); },
    // Only save if nobody else saved since this device last synced (base = the cloud version we last saw).
    // Runs as a transaction, so it never gets queued offline and blindly replayed over a newer save later.
    // The new version number is worked out inside the transaction so it only ever goes up, even if an earlier
    // upload from this device finished after it timed out here. Resolves with the version that was saved.
    cloudPut(id, data, base) {
      return timed(runTransaction(db, async tx => {
        const ref = doc(db, 'saves', id);
        const cur = await tx.get(ref);
        const c = cur.exists() ? cur.data() : null;
        const curRev = (c && c.rev) || 0;
        if (c && curRev > (base || 0) && c.dev !== data.dev) throw new Error('conflict');
        const rev = Math.max(curRev, base || 0) + 1;
        // A device with no solo game only syncs its league list; never blank out a save that exists.
        const out = { ...data, rev, updated: serverTimestamp() };
        if (!out.state && c && c.state) { out.state = c.state; out.label = c.label; }
        tx.set(ref, out);
        return rev;
      }), 15000);
    },
    // Every other solo game on a device gets its own cloud copy under the same sync code, plus a line in a shared list
    // (merged field by field, so two devices adding games never overwrite each other). Writes queue up offline.
    cloudGamePut(id, sid, data) {
      const meta = { t: data.t || '', sub: data.sub || '', label: data.label || '', at: data.at || Date.now(), game: data.game || '' };
      return Promise.all([
        setDoc(doc(db, 'saves', id, 'games', sid), { ...data, updated: serverTimestamp() }),
        setDoc(doc(db, 'saves', id, 'games', 'INDEX000'), { g: { [sid]: meta } }, { merge: true }),
      ]);
    },
    // v196: every solo game syncs both ways in its own slot (saves/{code}/games/{sid}), with the same rule as cloudPut:
    // only save if nobody else saved since this device last synced that game (base = the version we last saw).
    // The line in the shared list (INDEX000) is written in the same transaction, so the list never runs ahead of or
    // behind the save it describes. Saving a game that was deleted elsewhere brings it back (gone: false).
    cloudSlotPut(id, sid, data, base) {
      return timed(runTransaction(db, async tx => {
        const ref = doc(db, 'saves', id, 'games', sid);
        const cur = await tx.get(ref);
        const c = cur.exists() ? cur.data() : null;
        const curRev = (c && c.rev) || 0;
        if (c && curRev > (base || 0) && c.dev !== data.dev) throw new Error('conflict');
        if (!data.state) throw new Error('nostate');
        const rev = Math.max(curRev, base || 0) + 1;
        tx.set(ref, { ...data, rev, gone: false, updated: serverTimestamp() });
        const meta = { t: data.t || '', sub: data.sub || '', label: data.label || '', at: data.at || Date.now(), rev, dev: data.dev || '', gone: false, game: '' };
        tx.set(doc(db, 'saves', id, 'games', 'INDEX000'), { g: { [sid]: meta } }, { merge: true });
        return rev;
      }), 20000);
    },
    // The list of online leagues rides on the main save document without touching its version number, so older
    // versions of the app never mistake a league-list change for a newer save.
    cloudLeaguesPut(id, leagues) { return setDoc(doc(db, 'saves', id), { leagues, lgAt: Date.now() }, { merge: true }); },
    cloudGameDrop(id, sid) { return setDoc(doc(db, 'saves', id, 'games', 'INDEX000'), { g: { [sid]: { gone: true, at: Date.now() } } }, { merge: true }); },
    cloudGameList(id) { return timed(getDocFromServer(doc(db, 'saves', id, 'games', 'INDEX000')).then(s => (s.exists() && s.data().g) || {}), 12000); },
    cloudGameGet(id, sid) { return timed(getDocFromServer(doc(db, 'saves', id, 'games', sid)).then(s => (s.exists() ? s.data() : null)), 12000); },
    cloudBackup(id, slot, data) { return setDoc(doc(db, 'saves', id, 'backups', 'b' + slot), { ...data, updated: serverTimestamp() }); },
    async cloudBackups(id, n) {
      const out = [];
      for (let i = 0; i < n; i++) {
        try { const s = await getDocFromServer(doc(db, 'saves', id, 'backups', 'b' + i)); if (s.exists()) out.push(s.data()); } catch (e) { /* offline */ }
      }
      return out;
    },

    // Office → Test connection: walks through each piece of the Firebase setup and reports the first thing that's wrong.
    async diagnose() {
      const out = [];
      const step = (ok, name, detail) => out.push({ ok, name, detail });
      step(true, 'Settings file', `Project ${cfg.projectId}`);
      if (!navigator.onLine) { step(false, 'Internet', 'This device is offline.'); return out; }
      let uid;
      try {
        uid = auth.currentUser ? auth.currentUser.uid : (await timed(signInAnonymously(auth), 12000)).user.uid;
        step(true, 'Sign-in', 'Anonymous sign-in works.');
      } catch (e) {
        const c = String(e && (e.code || e.message));
        step(false, 'Sign-in', c.includes('operation-not-allowed') || c.includes('admin-restricted') ? 'Anonymous sign-in is switched off. Firebase console → Authentication → Sign-in method → Anonymous → Enable.'
          : c.includes('api-key') ? 'The apiKey in firebase-config.js is not valid for this project.'
          : c.includes('network-request-failed') ? 'Could not reach Firebase from this network. Check the connection (or an ad/content blocker) and try again.'
          : c.includes('timeout') ? 'Firebase did not answer. Check the connection and try again.' : 'Sign-in failed: ' + c);
        return out;
      }
      try {
        // A random sync code that doesn't exist: the rules allow reading it, so "not found" means everything is wired up.
        await timed(getDocFromServer(doc(db, 'saves', 'ZZTEST' + Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, 'Z'))), 12000);
        step(true, 'Database & rules', 'Firestore is set up and the security rules are published.');
      } catch (e) {
        const c = String(e && (e.code || e.message));
        step(false, 'Database & rules', c.includes('permission-denied') ? 'Firestore refused the read. Paste firebase/firestore.rules into Firestore → Rules and click Publish.'
          : c.includes('not-found') || c.includes('failed-precondition') ? 'No Firestore database yet. Firebase console → Build → Firestore Database → Create database.'
          : c.includes('timeout') || c.includes('unavailable') ? 'Firestore did not answer. Check the connection and try again.' : 'Database check failed: ' + c);
        return out;
      }
      let push = false;
      try { push = !!cfg.vapidKey && await isSupported(); } catch (e) {}
      step(!!cfg.vapidKey, 'Turn alerts', !cfg.vapidKey ? 'No vapidKey in firebase-config.js, so turn alerts are off.'
        : push ? 'Push key found. Alerts also need the Cloud Function deployed (ONLINE-SETUP.md, Part 2).'
        : 'Push key found, but this browser can\'t receive push alerts. On iPhone, use the Home Screen app.');
      return out;
    },

    // v262: a listener that hits an error is dead for good in Firestore — it used to just log it, and the phone (or TV)
    // sat on an old copy of the league until someone refreshed. Now it re-subscribes on its own, backing off a little each time.
    listen(code, cb, missing) {
      let unsub = null, stop = false, tries = 0, t = null;
      const sub = () => {
        if (stop) return;
        unsub = onSnapshot(game(code), s => {
          tries = 0;
          if (s.exists()) cb(s.data()); else if (missing && !s.metadata.fromCache) missing();
        }, e => {
          console.warn('listen failed — reconnecting', e);
          unsub = null; if (stop) return;
          const ms = Math.min(30000, 1500 * 2 ** Math.min(tries++, 5));
          t = setTimeout(sub, ms);
        });
      };
      sub();
      return () => { stop = true; clearTimeout(t); if (unsub) unsub(); unsub = null; };
    },
    // v262: the league straight from the server (not the device's copy) — the safety net for a live update that never arrived.
    fetch(code) { return timed(getDocFromServer(game(code)).then(s => (s.exists() ? s.data() : null)), 12000); },

    // v262: the TV feed (the live GM's screen and the locker-room office answers) lives in its own small document,
    // games/{code}/live/now. It changes every few seconds during a live segment; on the main league document every one of
    // those changes made every phone download the whole save again (a few hundred KB each time) and knocked other GMs'
    // saves off their transaction mid-way. If the database rules haven't been updated for it yet, it falls back to the old
    // place on the league document, so nothing breaks before the rules are published.
    sideOK: null,
    pushSide(code, key, value) {
      const main = () => updateDoc(game(code), { [key]: value, updated: serverTimestamp() });
      if (this.sideOK === false) return main();
      const parts = key.split('.'), obj = {};
      let cur = obj; parts.forEach((p, i) => { if (i === parts.length - 1) cur[p] = value; else cur = cur[p] = {}; });
      obj.at = Date.now();
      return setDoc(doc(db, 'games', code, 'live', 'now'), obj, { merge: true })
        .then(() => { this.sideOK = true; })
        .catch(e => {
          if (String(e && (e.code || e.message)).includes('permission')) { this.sideOK = false; console.warn('TV feed: database rules not updated yet — using the league document'); return main(); }
          throw e;
        });
    },
    listenSide(code, cb) {
      let unsub = null, stop = false, tries = 0, t = null;
      const sub = () => {
        if (stop) return;
        unsub = onSnapshot(doc(db, 'games', code, 'live', 'now'), s => { tries = 0; cb(s.exists() ? s.data() : null); }, e => {
          unsub = null; if (stop) return;
          if (String(e && (e.code || e.message)).includes('permission')) return; // rules not published: the main doc carries the feed
          t = setTimeout(sub, Math.min(30000, 1500 * 2 ** Math.min(tries++, 5)));
        });
      };
      sub();
      return () => { stop = true; clearTimeout(t); if (unsub) unsub(); unsub = null; };
    },

    // v262: a solo game shown on a TV. It uses an ordinary two-seat league document (both seats are this device), so the
    // TV's "Show a league on this screen" works on it unchanged and the existing database rules allow it.
    soloTv(code, data) { return timed(this._soloTv(...arguments)); },
    async _soloTv(code, data) {
      const uid = await uidReady;
      const snap = await getDocFromServer(game(code));
      if (snap.exists()) {
        const d = snap.data();
        if (!(d.solo && d.uids && d.uids.s0 === uid)) throw new Error('taken');
        await updateDoc(game(code), { ...data, updated: serverTimestamp() });
        return;
      }
      await setDoc(game(code), { ...data, n: 2, solo: true, uids: { s0: uid, s1: uid }, created: serverTimestamp(), updated: serverTimestamp() });
    },

    canAlert() { return 'Notification' in window && 'serviceWorker' in navigator && !!cfg.vapidKey; },
    alertsOn(code) { return !!alertMap()[code] && typeof Notification !== 'undefined' && Notification.permission === 'granted'; },

    async enableAlerts(code) {
      if (!cfg.vapidKey || !(await isSupported())) throw new Error('unsupported');
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') throw new Error('denied');
      const uid = await uidReady;
      const reg = await navigator.serviceWorker.ready;
      const token = await getToken(getMessaging(app), { vapidKey: cfg.vapidKey, serviceWorkerRegistration: reg });
      if (!token) throw new Error('notoken');
      await setDoc(doc(db, 'games', code, 'tokens', uid), { token, updated: serverTimestamp() });
      const m = alertMap(); m[code] = 1; localStorage.setItem(ALERTS, JSON.stringify(m));
      try { onMessage(getMessaging(app), () => {}); } catch (e) { /* foreground: the live sync already updates the screen */ }
    }
  });
  announce();
}
