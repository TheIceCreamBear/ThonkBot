import { state } from "../bot";
import { PersistenceListener } from "./persistence";
import VoiceTrackingListener from "./voiceTracker";

export interface Listener {
    init(): void;
    deconstruct(): void;
}

export function createAndInitAllListeners() {
    var voiceTracking = new VoiceTrackingListener();
    state.listeners.add(voiceTracking);

    var persistence = new PersistenceListener();
    state.listeners.add(persistence);

    for (const listener of state.listeners) {
        listener.init();
    }
}

export function deconstructAllListeners() {
    for (const listener of state.listeners) {
        listener.deconstruct();
    }
}
