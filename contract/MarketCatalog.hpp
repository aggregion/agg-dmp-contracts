#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>
#include <optional>

namespace dmp {

   using namespace eosio;

   struct Tables {

      /// @brief
      /// Market catalog.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Aggregion")]] MarketCatalog {
         uint64_t id;
         uint64_t parent_id;
         int yid;
         int ypid;
         int ylvl;
         std::string name;
         int childs_count;

         auto primary_key() const {
            return id;
         }
      };
   };

   using mcat_table_t = eosio::multi_index<Names::MarketCatalogTable, Tables::MarketCatalog>;

   /// @brief
   /// Aggregion market catalog actions.
   struct [[eosio::contract("Aggregion")]] MarketCatalog : contract {
      using contract::contract;

      [[eosio::action]] void mcatinsert(std::optional<uint64_t> id, std::optional<uint64_t> parent_id, int yid, std::optional<int> ypid, int ylvl,
                                        std::string name);
      [[eosio::action]] void mcatremove(uint64_t id);
      [[eosio::action]] void dropmcat();
   };
}