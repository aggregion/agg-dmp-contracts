#pragma once

#include "Names.hpp"
#include <eosio/eosio.hpp>
#include <optional>

namespace catalogs::regions {

   struct Tables {

      struct [[eosio::table, eosio::contract("Catalogs")]] Regions {
         uint64_t id;
         std::string name;
         int cities_count;

         uint64_t primary_key() const {
            return id;
         }
      };

      /// @brief
      /// Regions translations.
      /// Scope: Lang.
      struct [[eosio::table, eosio::contract("Catalogs")]] RegionsTranslations {
         uint64_t id;
         std::string name;

         uint64_t primary_key() const {
            return id;
         }
      };
   };

   using regions_table_t = eosio::multi_index<Names::RegionsTable, Tables::Regions>;
   using regions_translations_table_t = eosio::multi_index<Names::RegionsTranslationsTable, Tables::RegionsTranslations>;

   struct [[eosio::contract("Catalogs")]] Regions : contract {
      using contract::contract;

      [[eosio::action]] void regioninsert(uint64_t id, std::string lang, std::string name);
      [[eosio::action]] void regionupdate(uint64_t id, std::string lang, std::string name);
      [[eosio::action]] void regionremove(uint64_t region_id);

   private:
      void upsert(uint64_t id, std::string lang, std::string name, bool mustExists);
   };
}
