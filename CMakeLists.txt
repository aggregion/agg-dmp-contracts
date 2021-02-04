cmake_minimum_required(VERSION 3.16)
project(Aggregion)

include(ExternalProject)
if(EOSIO_CDT_ROOT STREQUAL "" OR NOT EOSIO_CDT_ROOT)
   find_package(eosio.cdt)
endif()

function(add_contract FOLDER)
   ExternalProject_Add(
      ${FOLDER}_project
      SOURCE_DIR ${CMAKE_SOURCE_DIR}/${FOLDER}
      BINARY_DIR ${CMAKE_BINARY_DIR}/${FOLDER}
      CMAKE_ARGS -DCMAKE_TOOLCHAIN_FILE=${EOSIO_CDT_ROOT}/lib/cmake/eosio.cdt/EosioWasmToolchain.cmake
      UPDATE_COMMAND ""
      PATCH_COMMAND ""
      TEST_COMMAND ""
      INSTALL_COMMAND ""
      BUILD_ALWAYS 1
   )
endfunction(add_contract)

add_contract(aggregion)
add_contract(dmpusers)
add_contract(catalogs)

configure_file(${CMAKE_SOURCE_DIR}/scripts/deploy.sh.in deploy.sh @ONLY)

add_custom_target(deploy
    COMMAND ./deploy.sh
    WORKING_DIRECTORY ${CMAKE_BINARY_DIR})
    add_dependencies(deploy aggregion_project)
