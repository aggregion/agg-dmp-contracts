#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

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
   };

   struct Tables {
      using trusted_providers_table_t = eosio::multi_index<Names::TrustedProvidersTable, Def::TrustedProviders>;
      using script_approves_table_t = eosio::multi_index<Names::ScriptApprovesTable, Def::ScriptApproves>;
      using script_access_table_t = eosio::multi_index<Names::ScriptAccessTable, Def::ScriptsAccess>;
   };

   /// @brief
   /// Aggregion script access permissions.
   struct [[eosio::contract("Aggregion")]] ScriptAccessRules : contract {
      using contract::contract;

      [[eosio::action]] void trust(name truster, name trustee);
      [[eosio::action]] void untrust(name truster, name trustee);

      [[eosio::action]] void execapprove(name provider, checksum256 hash);
      [[eosio::action]] void execdeny(name provider, checksum256 hash);

      [[eosio::action]] void grantaccess(name owner, checksum256 hash, name grantee);
      [[eosio::action]] void denyaccess(name owner, checksum256 hash, name grantee);
   };
}