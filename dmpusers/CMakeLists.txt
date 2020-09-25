cmake_minimum_required(VERSION 3.16)
project(DmpUsers)

set(EOSIO_WASM_OLD_BEHAVIOR "Off")
find_package(eosio.cdt)

add_contract(Dmpusers Dmpusers
    Dmpusers.cpp)

target_compile_options(Dmpusers PUBLIC -R${CMAKE_SOURCE_DIR}/ricardian)
