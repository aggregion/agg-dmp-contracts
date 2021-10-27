#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace dmpusers {

   struct GlossaryTermsInfo {
      std::string sender_org_id;
      std::string receiver_org_id;
      uint64_t updated_at;
      uint64_t bc_version;
      std::string data;
   };

   struct Tables {

      /// @brief
      /// GlossaryTerms.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] GlossaryTerms {
         eosio::name id;
         GlossaryTermsInfo info;

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


   struct [[eosio::contract("Dmpusers")]] GlossaryTerms : contract {

      using contract::contract;

      using glterms_byupdat_index_t =
          indexed_by<Names::GlossaryTermsTableByUpdateAt, const_mem_fun<Tables::GlossaryTerms, uint64_t, &Tables::GlossaryTerms::by_updated_at>>;

      using glterms_bysendr_index_t =
          indexed_by<Names::GlossaryTermsTableBySender, const_mem_fun<Tables::GlossaryTerms, uint64_t, &Tables::GlossaryTerms::by_sender>>;

      using glterms_byrecvr_index_t =
          indexed_by<Names::GlossaryTermsTableByReceiver, const_mem_fun<Tables::GlossaryTerms, uint64_t, &Tables::GlossaryTerms::by_receiver>>;

      using glterms_table_t =
          eosio::multi_index<Names::GlossaryTermsTable, Tables::GlossaryTerms, glterms_byupdat_index_t, glterms_bysendr_index_t, glterms_byrecvr_index_t>;

      [[eosio::action]] void upsglterm(std::string glossary_term_id, GlossaryTermsInfo info);
      [[eosio::action]] void remglterm(std::string glossary_term_id, std::string sender_org_id);
   };
}