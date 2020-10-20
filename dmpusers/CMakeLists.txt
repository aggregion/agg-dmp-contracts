cmake_minimum_required(VERSION 3.16)
project(DmpUsers)

set(EOSIO_WASM_OLD_BEHAVIOR "Off")
find_package(eosio.cdt)

include_directories($ENV{EOS_CONTRACTS_ROOT}/contracts/eosio.system/include/)

add_contract(Dmpusers Dmpusers
    Dmpusers.cpp)

target_compile_options(Dmpusers PUBLIC -R${CMAKE_SOURCE_DIR}/ricardian)
