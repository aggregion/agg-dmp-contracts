#pragma once

#include "Names.hpp"
#include <eosio/eosio.hpp>
#include <optional>

namespace catalogs::citytypes {

   struct Tables {

      /// @brief
      /// City types.
      /// Scope: Lang.
      struct [[eosio::table, eosio::contract("Catalogs")]] CityTypes {
         uint64_t id;
         std::string name;
         int cities_count;

         uint64_t primary_key() const {
            return id;
         }
      };

      /// @brief
      /// City types translations.
      /// Scope: Lang.
      struct [[eosio::table, eosio::contract("Catalogs")]] CityTypesTranslations {
         uint64_t id;
         std::string name;

         uint64_t primary_key() const {
            return id;
         }
      };
   };

   using citytypes_table_t = eosio::multi_index<Names::CityTypesTable, Tables::CityTypes>;
   using citytypes_translations_table_t = eosio::multi_index<Names::CityTypesTranslationsTable, Tables::CityTypesTranslations>;

   struct [[eosio::contract("Catalogs")]] CityTypes : contract {
      using contract::contract;

      [[eosio::action]] void citytypeins(uint64_t id, std::string lang, std::string name);
      [[eosio::action]] void citytypetrn(uint64_t id, std::string lang, std::string name);
      [[eosio::action]] void citytyperem(uint64_t citytype_id);

   private:
      void upsert(uint64_t id, std::string lang, std::string name, bool mustExists);
   };
}
