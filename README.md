# Aggregion Contract
## Version : 1.0.0

# CODE

Prerequisites

1. EOS v2.0.4 tools `cleos` and `keosd` accessible in path (https://github.com/EOSIO/eos/tree/release/2.0.x).
1. EOSIO.CDT installed (https://github.com/EOSIO/eosio.cdt/tree/release/1.7.x)


Environment variables

```sh

# Example
export EOSIO_CDT_ROOT=/opt/eosio.cdt/
export NODE_URL=http://testnet:8888
export AGGREGION_ACCOUNT=aggregion
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
1. public and private keys for `eosio` account.
1. accessible contract wasm and abi files.

Write config file and put it in `test` directory'.

Use `config.example.json` as template:

```javascript
{
    "node": {
        "endpoint": "127.0.0.1:8888",
        "workdir": "/tmp/aggtests"
    },
    "blockchain": {
        "eosio_root_key": {
            "public": "EOS....",
            "private": "5K...."
        }
    },
    "contract": {
        "account" : "aggregion",
        "wasm": "/home/user/Aggregion/Aggregion.wasm",
        "abi": "/home/user/Aggregion/Aggregion.abi"
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
