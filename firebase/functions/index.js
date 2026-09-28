// Push notifications for Tony Khan Simulator online leagues:
// the GM whose turn it is, the host when someone joins, and everyone when a week's results are in.
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

exports.turnAlert = onDocumentUpdated('games/{code}', async event => {
  const before = event.data.before.data() || {};
  const after = event.data.after.data() || {};
  const code = event.params.code;
  const names = after.names || {};
  const uids = after.uids || {};
  const oldUids = before.uids || {};
  const alerts = [];

  if (after.turn && after.turn !== before.turn) {
    alerts.push({ seat: after.turn, body: after.msg || "It's your turn!" });
  }
  const joined = Object.keys(uids).filter(k => uids[k] && !oldUids[k] && k !== 's0');
  const count = Object.values(uids).filter(Boolean).length;
  joined.forEach(k => alerts.push({ seat: 's0', body: `${names[k] || 'A friend'} joined your league (${count}/${after.n || 2} GMs).` }));
  if (after.week && before.week && after.week !== before.week && after.season === before.season) {
    Object.keys(uids).filter(k => k !== after.turn).forEach(k => alerts.push({ seat: k, body: `Week ${before.week} results are in — see how your show did.` }));
  }

  const db = getFirestore();
  const url = (after.appUrl || '') + '?game=' + code;
  await Promise.all(alerts.map(async ({ seat, body }) => {
    const uid = uids[seat];
    if (!uid) return;
    const ref = db.doc(`games/${code}/tokens/${uid}`);
    const snap = await ref.get();
    const token = snap.exists && snap.get('token');
    if (!token) return;
    try {
      await getMessaging().send({
        token,
        data: { title: 'Tony Khan Simulator', body, url, code },
        webpush: { headers: { Urgency: 'high', TTL: '86400' } }
      });
    } catch (err) {
      // The device turned alerts off or reinstalled the app — forget the old token.
      if (String(err.code).includes('registration-token-not-registered') || String(err.code).includes('invalid-argument')) {
        await ref.delete().catch(() => {});
      } else {
        console.error('push failed', code, seat, err);
      }
    }
  }));
});
