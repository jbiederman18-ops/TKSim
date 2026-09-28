// Tony Khan Simulator — online leagues (Firebase). The game works without this file; it only adds sync + turn alerts.
import { initializeApp, getAuth, signInAnonymously, onAuthStateChanged, initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, getDocFromServer, setDoc, updateDoc, onSnapshot, serverTimestamp, deleteField, getMessaging, getToken, onMessage, isSupported } from './firebase-sdk.js';

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
    join(code, name, key) { return timed(this._join(...arguments)); },
    async _join(code, name, key) {
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
          await updateDoc(game(code), { ['uids.' + open]: uid, ['names.' + open]: name, updated: serverTimestamp() });
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

    listen(code, cb) {
      return onSnapshot(game(code), s => { if (s.exists()) cb(s.data()); }, e => console.warn('listen failed', e));
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
