#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>
#include <optional>

namespace dmp::brands {

   struct Tables {

      struct [[eosio::table, eosio::contract("Aggregion")]] Brands {
         uint64_t id;
         std::string name;
         uint64_t vendors_count;

         uint64_t primary_key() const {
            return id;
         }
      };
   };

   using brands_table_t = eosio::multi_index<Names::BrandsTable, Tables::Brands>;

   struct [[eosio::contract("Aggregion")]] Brands : contract {
      using contract::contract;

      [[eosio::action]] void brandinsert(std::optional<uint64_t> id, std::string name);
      [[eosio::action]] void brandremove(uint64_t brand_id);
   };
}
