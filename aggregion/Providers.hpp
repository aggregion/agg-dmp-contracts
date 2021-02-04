#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace aggregion::providers {

   using eosio::name;

   struct Tables {

      /// @brief
      /// Providers table.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Aggregion")]] Provider {
         name provider;
         std::string description;

         auto primary_key() const {
            return provider.value;
         }
      };
   };

   using providers_table_t = eosio::multi_index<Names::ProvidersTable, Tables::Provider>;

   /// @brief
   /// Aggregion providers smart contract.
   struct [[eosio::contract("Aggregion")]] Aggregion : contract {

      using contract::contract;

      [[eosio::action]] void regprov(std::string provider, std::string description);
      [[eosio::action]] void updprov(name provider, std::string description);
      [[eosio::action]] void unregprov(name provider);
   };

}