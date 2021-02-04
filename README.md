# Aggregion Contract

# CODE

Prerequisites

1. EOS v2.0.4 tools `cleos` and `keosd` accessible in path (https://github.com/EOSIO/eos/tree/release/2.0.x).
1. EOSIO.CDT installed (https://github.com/EOSIO/eosio.cdt/tree/release/1.7.x)
1. EOSIO contracts cloned (https://github.com/EOSIO/eosio.contracts)


Environment variables

```sh

# Example
export EOSIO_CDT_ROOT=/opt/eosio.cdt/
export EOS_CONTRACTS_ROOT=/home/user/eosio.contracts/
export NODE_URL=http://testnet:8888
```

Building

```sh
$ cd build
$ cmake ..
$ make
```

Deploy smart contract to blockchain

```sh
$ cleos unlock wallet
$ make deploy
```

# TESTS

Prerequisites

1. `nodejs` (https://nodejs.org/) in system path.
1. `nodeos` in system path.
1. public and private keys for `eosio` (root) account.
1. accessible contracts wasm and abi files.

Write config file and put it in `test` directory. Config file content example:

```javascript
{
    "node": {
        "endpoint": "127.0.0.1:8888",
        "workdir": "/tmp/aggregion_tests_blockchain_data"
    },
    "debug" : false,
    "blockchain": {
        "eosio_root_key": {
            "public": "<eosio public key>",
            "private": "<eosio private key>"
        }
    },
    "contracts" : {
        "aggregion": {
            "account" : "aggregion",
            "wasm": "/home/user/aggregion-dmp-contracts/build/aggregion/Aggregion.wasm",
            "abi": "/home/user/aggregion-dmp-contracts/build/aggregion/Aggregion.abi"
        }
        "dmpusers": {
            "account" : "dmpusers",
            "wasm": "/home/user/aggregion-dmp-contracts/build/dmpusers/Dmpusers.wasm",
            "abi": "/home/user/aggregion-dmp-contracts/build/dmpusers/Dmpusers.abi"
        }
    }
}

```

## Run tests

```sh
$ npm install
$ npm test
```

## License

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## Contacts
For any questions: info@aggregion.com
