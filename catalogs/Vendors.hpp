#pragma once

#include "Names.hpp"
#include <eosio/eosio.hpp>
#include <optional>

namespace catalogs::vendors {

   struct Tables {

      struct [[eosio::table, eosio::contract("Catalogs")]] Vendors {
         uint64_t id;
         std::string name;
         int brands_count;

         uint64_t primary_key() const {
            return id;
         }
      };
   };

   using vendors_table_t = eosio::multi_index<Names::VendorsTable, Tables::Vendors>;

   struct [[eosio::contract("Catalogs")]] Vendors : contract {
      using contract::contract;

      [[eosio::action]] void vendinsert(std::optional<uint64_t> id, std::string name);
      [[eosio::action]] void vendremove(uint64_t vendor_id);
   };
}
