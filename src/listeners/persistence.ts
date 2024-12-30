import { state } from '../bot';

// TODO: the main todo in here is that i need to decide what DB im using
export class PersistenceListener {
    private snapShotInterval: NodeJS.Timer = undefined;
    private persistInterval: NodeJS.Timer = undefined;

    init() {
        // ping every second
        this.snapShotInterval = setInterval(this.saveSnapShot, 1000);
        this.persistInterval = setInterval(this.persistLonger, 15 * 60 * 1000);
    }

    deconstruct() {
        if (this.snapShotInterval) {
            clearInterval(this.snapShotInterval);
            this.snapShotInterval = undefined;
        }

        if (this.persistInterval) {
            clearInterval(this.persistInterval);
            this.persistInterval = undefined;
        }
    }

    private saveSnapShot() {
        // TODO:
    }

    private persistLonger() {
        // TODO:
    }
}
