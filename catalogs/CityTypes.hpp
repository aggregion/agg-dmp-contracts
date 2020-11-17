#pragma once

#include "Names.hpp"
#include <eosio/eosio.hpp>
#include <optional>

namespace catalogs::citytypes {

   struct Tables {

      struct [[eosio::table, eosio::contract("Catalogs")]] CityTypes {
         uint64_t id;
         std::string name;
         int cities_count;

         uint64_t primary_key() const {
            return id;
         }
      };
   };

   using citytypes_table_t = eosio::multi_index<Names::CityTypesTable, Tables::CityTypes>;

   struct [[eosio::contract("Catalogs")]] CityTypes : contract {
      using contract::contract;

      [[eosio::action]] void citytypeins(std::optional<uint64_t> id, std::string name);
      [[eosio::action]] void citytyperem(uint64_t citytype_id);
   };
}