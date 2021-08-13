#pragma once

#include "Names.hpp"
#include <eosio/eosio.hpp>

namespace catalogs::countries {

   struct Tables {

      struct [[eosio::table, eosio::contract("Catalogs")]] Countries {
         uint64_t id;
         uint64_t code;
         std::string name;

         uint64_t primary_key() const {
            return id;
         }
      };

      /// @brief
      /// Countries name translations.
      /// Scope: Lang.
      struct [[eosio::table, eosio::contract("Catalogs")]] CountriesTranslations {
         uint64_t id;
         std::string name;

         auto primary_key() const {
            return id;
         }
      };
   };

   using countries_table_t = eosio::multi_index<Names::CountriesTable, Tables::Countries>;
   using countries_translations_table_t = eosio::multi_index<Names::CountriesTranslationsTable, Tables::CountriesTranslations>;

   struct [[eosio::contract("Catalogs")]] Countries : contract {
      using contract::contract;

      [[eosio::action]] void countryups(uint64_t id, uint64_t code, std::string lang, std::string name);
      [[eosio::action]] void countryrem(uint64_t country_id);
   };
}
