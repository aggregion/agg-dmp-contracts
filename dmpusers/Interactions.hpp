#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace dmpusers {

   std::string to_string(uint8_t const& type) {
      return std::to_string(static_cast<int>(type));
   }

   struct InteractionInfo {
      std::string partner;
      uint8_t interaction_type;
      std::string params;
   };

   struct Tables {

      /// @brief
      /// Organizations table.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] Interactions {
         uint64_t id;
         std::string owner;
         bool enabled;
         InteractionInfo info;

         auto primary_key() const {
            return id;
         }

         static auto makeKey(std::string owner, std::string partner, uint8_t interaction_type) {
            std::string value;
            value.append(owner);
            value.append("-");
            value.append(partner);
            value.append("-");
            value.append(std::to_string(interaction_type));
            return sha256(value.data(), value.size());
         }

         auto secondary_key() const {
            return makeKey(owner, info.partner, info.interaction_type);
         }
      };
   };


   /// @brief
   /// Aggregion DMP interactions.
   struct [[eosio::contract("Dmpusers")]] Interactions : contract {

      using contract::contract;

      using interactions_index_t =
          indexed_by<Names::InteractionsMainIndex, const_mem_fun<Tables::Interactions, checksum256, &Tables::Interactions::secondary_key>>;
      using interactions_table_t = eosio::multi_index<Names::InteractionsTable, Tables::Interactions, interactions_index_t>;

      [[eosio::action]] void insinteract(std::string owner, InteractionInfo info, uint64_t nonce);
      [[eosio::action]] void updinteract(std::string owner, uint64_t interaction_id, InteractionInfo info, uint64_t nonce);
      [[eosio::action]] void intrctenble(std::string owner, uint64_t interaction_id, bool enable, uint64_t nonce);
      [[eosio::action]] void reminteract(std::string owner, std::string partner, uint8_t interaction_type, uint64_t nonce);
      [[eosio::action]] void remintrbyid(std::string owner, uint64_t interaction_id, uint64_t nonce);
   };
}