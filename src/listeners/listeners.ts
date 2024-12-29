import { state } from "../bot";
import VoiceTrackingListener from "./voiceTracker";

export interface Listener {
    init(): void;
    deconstruct(): void;
}

export function createAndInitAllListeners() {
    var voiceTracking = new VoiceTrackingListener();
    state.listeners.add(voiceTracking);

    // load other listeners here

    for (const listener of state.listeners) {
        listener.init();
    }
}

export function deconstructAllListeners() {
    for (const listener of state.listeners) {
        listener.deconstruct();
    }
}
