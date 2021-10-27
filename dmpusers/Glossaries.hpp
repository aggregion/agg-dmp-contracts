#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace dmpusers {

   struct GlossariesInfo {
      std::string sender_org_id;
      std::string receiver_org_id;
      uint64_t updated_at;
      uint64_t bc_version;
      std::string data;
   };

   struct Tables {

      /// @brief
      /// Glossaries.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] Glossaries {
         eosio::name id;
         GlossariesInfo info;

         auto primary_key() const {
            return id.value;
         }

         auto by_updated_at() const {
            return info.updated_at;
         }

         auto by_sender() const {
            return name{info.sender_org_id}.value;
         }

         auto by_receiver() const {
            return name{info.receiver_org_id}.value;
         }
      };
   };


   struct [[eosio::contract("Dmpusers")]] Glossaries : contract {

      using contract::contract;

      using glossaries_byupdat_index_t =
          indexed_by<Names::GlossariesTableByUpdateAt, const_mem_fun<Tables::Glossaries, uint64_t, &Tables::Glossaries::by_updated_at>>;

      using glossaries_bysendr_index_t =
          indexed_by<Names::GlossariesTableBySender, const_mem_fun<Tables::Glossaries, uint64_t, &Tables::Glossaries::by_sender>>;

      using glossaries_byrecvr_index_t =
          indexed_by<Names::GlossariesTableByReceiver, const_mem_fun<Tables::Glossaries, uint64_t, &Tables::Glossaries::by_receiver>>;

      using glossaries_table_t =
          eosio::multi_index<Names::GlossariesTable, Tables::Glossaries, glossaries_byupdat_index_t, glossaries_bysendr_index_t, glossaries_byrecvr_index_t>;

      [[eosio::action]] void upsglossary(std::string glossary_id, GlossariesInfo info);
      [[eosio::action]] void remglossary(std::string glossary_id, std::string sender_org_id);
   };
}