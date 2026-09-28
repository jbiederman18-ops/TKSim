// Sends a push notification to whoever's turn it is in a Tony Khan Simulator online league.
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
  const alerts = [];

  if (after.turn && after.turn !== before.turn) {
    alerts.push({ seat: after.turn, body: after.msg || "It's your turn!" });
  }
  if (!before.guest && after.guest) {
    alerts.push({ seat: 'host', body: `${names.guest || 'Your friend'} joined your league!` });
  }

  const db = getFirestore();
  const url = (after.appUrl || '') + '?game=' + code;
  await Promise.all(alerts.map(async ({ seat, body }) => {
    const uid = after[seat];
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
