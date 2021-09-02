#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace dmpusers {

   struct Message {
      uint64_t topic;
      eosio::name sender;
      eosio::name receiver;
      std::string data;
   };

   struct Tables {

      /// @brief
      /// Messages table.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] Messages {
         uint64_t id;
         Message message;

         auto primary_key() const {
            return id;
         }
      };
   };


   /// @brief
   /// Aggregion DMP organizations and users smart contract.
   struct [[eosio::contract("Dmpusers")]] Messages : contract {

      using contract::contract;

      using msgs_table_t = eosio::multi_index<Names::MessagesTable, Tables::Messages>;

      [[eosio::action]] void insertmsg(Message message, uint64_t nonce);
      [[eosio::action]] void removemsg(uint64_t message_id);
   };
}