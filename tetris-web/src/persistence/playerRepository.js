import { getAuth, signInAnonymously } from "firebase/auth";
import { ref, set, get, update, onDisconnect, remove, onValue, off } from "firebase/database";
import { db } from "./firebase.js"

async function getUid() {
    const auth = getAuth();
    if (auth.currentUser) return auth.currentUser.uid;

    try {
        const result = await signInAnonymously(auth);
        return result.user.uid;
    } catch (err) {
        if (crypto?.randomUUID) return crypto.randomUUID();
        return "id_" + Date.now() + Math.random().toString(36).slice(2);
    }
}

export async function enterLobby(username) {
    const uid = await getUid();
    const userRef = ref(db, `players/${uid}`);

    await set(userRef, {
        username: username,
        attack: 0
    });

    onDisconnect(userRef).remove();

    return {
        uid,
        leave: () => remove(userRef)
    };
}

export function leaveByUid(uid) {
  return remove(ref(db, `players/${uid}`));
}

export function updateAttack(uid, newVal) {
    return update(ref(db, `players/${uid}`), {
        attack: newVal
    });
}

export async function sendAttack(attackerUid, val) {
    try {
        const snap = await get(ref(db, "players"));
        const data = snap.val();

        if (!data) return;

        const updates = {};

        for (const uid in data) {
        if (uid === attackerUid) continue;

        const current = data[uid].attack ?? 0;
        updates[`players/${uid}/attack`] = current + val;
        }

        await update(ref(db), updates);
    } catch (err) {
        console.error("Database error: ", err);
    }
}

export function attachAttackListener(uid, onDataFunction, onErrorFunction) {
    const attackRef = ref(db, `players/${uid}/attack`);
    const handleDataChange = (snapshot) => {
        const attack = snapshot.val();
        onDataFunction(attack ?? 0);
    }

    onValue(attackRef, handleDataChange, onErrorFunction);

    return function detachAttackListener() {
        off(attackRef, "value", handleDataChange);
    };
}

export function attachPlayerListener(onDataFunction, onErrorFunction) {
    const playersRef = ref(db, "players");
    const handleDataChange = (snapshot) => {
        const data = snapshot.val();
        const players = Object.values(data).map(p => p.username);
        onDataFunction(players ?? []);
    };

    onValue(playersRef, handleDataChange, onErrorFunction);

    return function detachPlayerListener() {
        off(playersRef, "value", handleDataChange);
    };
}