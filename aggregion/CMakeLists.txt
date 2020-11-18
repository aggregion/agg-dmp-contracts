cmake_minimum_required(VERSION 3.16)
project(AggregionDmp)

set(EOSIO_WASM_OLD_BEHAVIOR "Off")
find_package(eosio.cdt)

add_contract(Aggregion Aggregion
    Brands.cpp
    Categories.cpp
    Cities.cpp
    CityTypes.cpp
    Providers.cpp
    Regions.cpp
    RequestsLog.cpp
    Scripts.cpp
    ScriptAccessRules.cpp
    Services.cpp
    VendorBrands.cpp
    Vendors.cpp
)

target_compile_options(Aggregion PUBLIC -R${CMAKE_SOURCE_DIR}/ricardian)
