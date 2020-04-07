
class DelayMaker {
    constructor(requiredDelayMs) {
        this.requiredDelayMs = requiredDelayMs;
    }

    async init() {
        this.hrstart = process.hrtime();
    }

    async doAdjustedSleep() {

        const sleep = (milliseconds) => {
            return new Promise(resolve => setTimeout(resolve, milliseconds))
        };

        let hrend = process.hrtime(this.hrstart);
        let ms = hrend[1] / 1000000;

        let delay = this.requiredDelayMs - ms;
        if (delay > 0) {
            await sleep(delay);
        }
    }
};

module.exports = DelayMaker;
