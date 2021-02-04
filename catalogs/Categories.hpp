#pragma once

#include "Names.hpp"
#include <eosio/eosio.hpp>
#include <optional>

namespace catalogs {

   struct Tables {

      /// @brief
      /// Categories catalog.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Catalogs")]] Categories {
         uint64_t id;
         uint64_t parent_id;
         std::string name;
         int childs_count;

         auto primary_key() const {
            return id;
         }

         auto by_parent() const {
            return parent_id;
         }
      };

      /// @brief
      /// Categories translations.
      /// Scope: Lang.
      struct [[eosio::table, eosio::contract("Catalogs")]] CategoriesTranslations {
         uint64_t id;
         std::string name;

         auto primary_key() const {
            return id;
         }
      };
   };

   using categories_byparent_index_t = indexed_by<Names::CategoriesByParIdx, const_mem_fun<Tables::Categories, uint64_t, &Tables::Categories::by_parent>>;
   using categories_table_t = eosio::multi_index<Names::CategoriesTable, Tables::Categories, categories_byparent_index_t>;
   using categories_translations_table_t = eosio::multi_index<Names::CategoriesTranslationsTable, Tables::CategoriesTranslations>;

   /// @brief
   /// Aggregion categories catalog.
   struct [[eosio::contract("Catalogs")]] Categories : contract {
      using contract::contract;

      [[eosio::action]] void catupsert(uint64_t id, std::optional<uint64_t> parent_id, std::string lang, std::string name);
      [[eosio::action]] void catuptrans(uint64_t category_id, std::string lang, std::string name);
      [[eosio::action]] void catremove(uint64_t category_id);
   };
}
