#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace dmp {

   struct Tables {

      /// @brief
      /// Requests log.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Aggregion")]] RequestsLog {
         uint64_t id;
         name sender;
         name receiver;
         int date;
         std::string request;

         auto primary_key() const {
            return id;
         }

         static auto makeKey(name sender, name receiver, int date, std::string const& request) {
            std::string value;
            value.append(sender.to_string());
            value.append(receiver.to_string());
            value.append(std::to_string(date));
            value.append(request);

            return sha256(value.data(), value.size());
         }

         auto secondary_key() const {
            return makeKey(sender, receiver, date, request);
         }
      };
   };

   using logreq_index_t = indexed_by<Names::RequestsLogIndex, const_mem_fun<Tables::RequestsLog, checksum256, &Tables::RequestsLog::secondary_key>>;
   using reqlog_table_t = eosio::multi_index<Names::RequestsLogTable, Tables::RequestsLog, logreq_index_t>;


   /// @brief
   /// Aggregion request logs smart contract actions.
   struct [[eosio::contract("Aggregion")]] RequestsLog : contract {
      using contract::contract;

      [[eosio::action]] void sendreq(name sender, name receiver, int date, std::string request);
   };
}