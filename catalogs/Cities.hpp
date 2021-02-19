#pragma once

#include "Names.hpp"
#include <eosio/eosio.hpp>
#include <optional>

namespace catalogs::cities {

   struct Tables {

      struct [[eosio::table, eosio::contract("Catalogs")]] Cities {
         uint64_t id;
         std::string name;
         uint64_t region_id;
         uint64_t type_id;
         uint64_t population;

         uint64_t primary_key() const {
            return id;
         }

         uint64_t by_region() const {
            return region_id;
         }
      };

      /// @brief
      /// Cities name translations.
      /// Scope: Lang.
      struct [[eosio::table, eosio::contract("Catalogs")]] CitiesTranslations {
         uint64_t id;
         std::string name;

         auto primary_key() const {
            return id;
         }
      };
   };

   using cities_byregion_index_t = indexed_by<Names::CitiesByRegionTable, const_mem_fun<Tables::Cities, uint64_t, &Tables::Cities::by_region>>;
   using cities_table_t = eosio::multi_index<Names::CitiesTable, Tables::Cities, cities_byregion_index_t>;
   using cities_translations_table_t = eosio::multi_index<Names::CitiesTranslationsTable, Tables::CitiesTranslations>;

   struct [[eosio::contract("Catalogs")]] Cities : contract {
      using contract::contract;

      [[eosio::action]] void cityinsert(uint64_t id, uint64_t region_id, uint64_t type_id, std::string lang, std::string name, uint64_t population);
      [[eosio::action]] void citychtype(uint64_t id, uint64_t type_id);
      [[eosio::action]] void citytrans(uint64_t id, std::string lang, std::string name);
      [[eosio::action]] void cityremove(uint64_t city_id);
   };
}
