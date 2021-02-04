#pragma once

#include "Names.hpp"
#include <eosio/eosio.hpp>
#include <optional>

namespace catalogs::places {

   struct Tables {

      struct [[eosio::table, eosio::contract("Catalogs")]] Places {
         uint64_t id;
         std::string name;

         uint64_t primary_key() const {
            return id;
         }
      };

      struct [[eosio::table, eosio::contract("Catalogs")]] PlacesTranslations {
         uint64_t id;
         std::string name;

         uint64_t primary_key() const {
            return id;
         }
      };
   };

   using places_table_t = eosio::multi_index<Names::PlacesTable, Tables::Places>;
   using places_translations_table_t = eosio::multi_index<Names::PlacesTranslationsTable, Tables::PlacesTranslations>;

   struct [[eosio::contract("Catalogs")]] Places : contract {
      using contract::contract;

      [[eosio::action]] void placeinsert(uint64_t id, std::string lang, std::string name);
      [[eosio::action]] void placeupdate(uint64_t id, std::string lang, std::string name);
      [[eosio::action]] void placeremove(uint64_t place_id);

   private:
      void upsert(uint64_t id, std::string lang, std::string name, bool mustExists);
   };
}
