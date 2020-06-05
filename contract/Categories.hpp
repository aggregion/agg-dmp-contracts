#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>
#include <optional>

namespace dmp {

   using namespace eosio;

   struct Tables {

      /// @brief
      /// Categories catalog.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Aggregion")]] Categories {
         uint64_t id;
         uint64_t parent_id;
         std::string name;
         int childs_count;

         uint64_t primary_key() const {
            return id;
         }

         uint64_t by_parent() const {
            return parent_id;
         }
      };
   };

   using categories_byparent_index_t = indexed_by<Names::CategoriesByParIdx, const_mem_fun<Tables::Categories, uint64_t, &Tables::Categories::by_parent>>;
   using categories_table_t = eosio::multi_index<Names::CategoriesTable, Tables::Categories, categories_byparent_index_t>;

   /// @brief
   /// Aggregion categories catalog.
   struct [[eosio::contract("Aggregion")]] Categories : contract {
      using contract::contract;

      [[eosio::action]] void catinsert(std::optional<uint64_t> id, std::optional<uint64_t> parent_id, std::string name);
      [[eosio::action]] void catremove(uint64_t id);
   };
}
