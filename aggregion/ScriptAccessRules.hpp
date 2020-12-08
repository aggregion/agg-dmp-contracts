#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>
#include <map>

namespace aggregion::sar {

   using eosio::name;

   struct Def {
      /// @brief
      /// Trusted providers.
      /// Scope: Provider (truster).
      struct [[eosio::table, eosio::contract("Aggregion")]] TrustedProviders {
         name provider;
         bool trust;
         auto primary_key() const {
            return provider.value;
         }
      };

      /// @brief
      /// Provider execution approves.
      /// Scope: Provider (approver).
      struct [[eosio::table, eosio::contract("Aggregion")]] ScriptApproves {
         uint64_t script_id;
         bool approved;
         auto primary_key() const {
            return script_id;
         }
      };

      /// @brief
      /// Script access permission.
      /// Scope: Provider (grantee).
      struct [[eosio::table, eosio::contract("Aggregion")]] ScriptsAccess {
         uint64_t script_id;
         bool granted;
         auto primary_key() const {
            return script_id;
         }
      };

      /// @brief
      /// Provider (grantee) access to script within given enclave.
      /// Scope: Provider (enclave owner, grantor).
      /// (Script owner is ignored here)
      struct [[eosio::table, eosio::contract("Aggregion")]] EnclaveScriptsAccess {
         uint64_t script_id;
         std::map<name, bool> permissions;
         auto primary_key() const {
            return script_id;
         }
      };
   };

   struct Tables {
      using trusted_providers_table_t = eosio::multi_index<Names::TrustedProvidersTable, Def::TrustedProviders>;
      using script_approves_table_t = eosio::multi_index<Names::ScriptApprovesTable, Def::ScriptApproves>;
      using script_access_table_t = eosio::multi_index<Names::ScriptAccessTable, Def::ScriptsAccess>;
      using enclave_script_access_table_t = eosio::multi_index<Names::EnclaveScriptAccessTable, Def::EnclaveScriptsAccess>;
   };

   /// @brief
   /// Aggregion script access permissions.
   struct [[eosio::contract("Aggregion")]] ScriptAccessRules : contract {
      using contract::contract;

      [[eosio::action]] void trust(std::string truster, std::string trustee);
      [[eosio::action]] void untrust(std::string truster, std::string trustee);

      [[eosio::action]] void execapprove(std::string provider, checksum256 hash);
      [[eosio::action]] void execdeny(std::string provider, checksum256 hash);

      [[eosio::action]] void grantaccess(std::string owner, checksum256 hash, std::string grantee);
      [[eosio::action]] void denyaccess(std::string owner, checksum256 hash, std::string grantee);

      [[eosio::action]] void encscraccess(std::string enclave_owner, checksum256 script_hash, std::string grantee, bool granted);
   };
}