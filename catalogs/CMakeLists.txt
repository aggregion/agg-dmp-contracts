cmake_minimum_required(VERSION 3.16)
project(AggregionDmp)

set(EOSIO_WASM_OLD_BEHAVIOR "Off")
find_package(eosio.cdt)

add_contract(Catalogs Catalogs
    Brands.cpp
    Categories.cpp
    Cities.cpp
    CityCountry.cpp
    CityTypes.cpp
    Countries.cpp
    Places.cpp
    Regions.cpp
    Translations.cpp
    VendorBrands.cpp
    Vendors.cpp
)

target_compile_options(Catalogs PUBLIC -R${CMAKE_SOURCE_DIR}/ricardian)
