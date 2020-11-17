#pragma once

#include "Names.hpp"
#include <eosio/eosio.hpp>
#include <optional>

namespace catalogs::brands {

   struct Tables {

      struct [[eosio::table, eosio::contract("Catalogs")]] Brands {
         uint64_t id;
         std::string name;
         uint64_t vendors_count;

         uint64_t primary_key() const {
            return id;
         }
      };
   };

   using brands_table_t = eosio::multi_index<Names::BrandsTable, Tables::Brands>;

   struct [[eosio::contract("Catalogs")]] Brands : contract {
      using contract::contract;

      [[eosio::action]] void brandinsert(std::optional<uint64_t> id, std::string name);
      [[eosio::action]] void brandremove(uint64_t brand_id);
   };
}
