cmake_minimum_required(VERSION 3.16)
project(AggregionDmp)

set(EOSIO_WASM_OLD_BEHAVIOR "Off")
find_package(eosio.cdt)

add_contract(Aggregion Aggregion
    Providers.cpp
    Services.cpp
    Scripts.cpp
    Approves.cpp
    RequestsLog.cpp
    Categories.cpp)

target_compile_options(Aggregion PUBLIC -R${CMAKE_SOURCE_DIR}/ricardian)
