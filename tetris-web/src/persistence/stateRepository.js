import { ref, set, onValue, off } from "firebase/database";
import { db } from "./firebase.js"

export const GAMESTATES = {
    START: 'Start',
    PAUSE: 'Pause',
    GAMEOVER: 'Game Over'
}

const gameStateRef = ref(db, "gameState");

export function changeGameState(gameState) {
    set(gameStateRef, gameState)
        .catch(err => console.error("Error while changing state: ", err));
}

export function attachGameStateListener(onDataFunction, onErrorFunction) {
    const handleDataChange = (snapshot) => {
        const gameState = snapshot.val();
        onDataFunction(gameState ?? 'Game Over');
    };

    onValue(gameStateRef, handleDataChange, onErrorFunction);

    return function detachGameStateListener() {
        off(gameStateRef, "value", handleDataChange);
    };
}
