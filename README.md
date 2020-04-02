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

1. nodejs (https://nodejs.org/) in system path.
1. testnet blockchain (local node is fine).
1. contract account and its code on the blockchain.
1. tests accounts 'alice' and 'bob'
1. tests accounts private keys.

Write config file and put it in 'test' directory'. See `config.example.json` for example.

## Run tests

```sh
$ npm install
$ npm test
```

## License

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## Contacts
For any questions: info@aggregion.com
