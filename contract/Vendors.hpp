#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>
#include <optional>

namespace dmp::vendors {

   struct Tables {

      struct [[eosio::table, eosio::contract("Aggregion")]] Vendors {
         uint64_t id;
         std::string name;
         int brands_count;

         uint64_t primary_key() const {
            return id;
         }
      };
   };

   using vendors_table_t = eosio::multi_index<Names::VendorsTable, Tables::Vendors>;

   struct [[eosio::contract("Aggregion")]] Vendors : contract {
      using contract::contract;

      [[eosio::action]] void vendinsert(std::optional<uint64_t> id, std::string name);
      [[eosio::action]] void vendremove(uint64_t vendor_id);
   };
}
