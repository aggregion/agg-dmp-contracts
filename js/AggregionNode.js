const fs = require('fs');
const { spawn } = require('child_process');


function until(conditionFunction) {
    const poll = resolve => {
        if (conditionFunction()) resolve();
        else setTimeout(_ => poll(resolve), 400);
    }
    return new Promise(poll);
}


class AggregionNode {

    constructor(signatureProvider, endpoint, workdir) {
        let args = [];
        args.push('--signature-provider', signatureProvider);
        args.push('--plugin', 'eosio::producer_plugin');
        args.push('--plugin', 'eosio::producer_api_plugin');
        args.push('--plugin', 'eosio::chain_plugin');
        args.push('--plugin', 'eosio::chain_api_plugin');
        args.push('--plugin', 'eosio::http_plugin');
        args.push('--http-server-address', endpoint);
        args.push('--data-dir', workdir + '/data');
        args.push('--blocks-dir', workdir + '/blocks');
        args.push('--config-dir', workdir + '/config');
        args.push('--contracts-console');
        args.push('--verbose-http-errors');
        args.push('--enable-stale-production');
        args.push('--delete-all-blocks');
        args.push('--producer-name', 'eosio');
        args.push('--abi-serializer-max-time-ms', '1000');
        args.push('--max-transaction-time', '500');

        this.args = args;
        this.log = fs.createWriteStream(workdir + "/node.log", { flags: 'w', autoClose: true });
    }

    async start() {
        const instance = spawn('nodeos', this.args);

        instance.stdout.on('data', (data) => {
            this.log.write(`${data}`);
        });

        let ready = false;
        instance.stderr.on('data', (data) => {
            if (`${data}`.match('Produced block.*#3')) {
                ready = true;
            }
            this.log.write(`${data}`);
        });

        instance.on('close', (code) => {
            this.log.write(`node process exited with code ${code}`);
            if (code) {
                ready = true;
                throw `node process exited with code ${code}`;
            }
        });

        this.instance = instance;

        await until(_ => ready);
    }

    async stop() {
        this.instance.kill();
    }
};

module.exports = AggregionNode;
