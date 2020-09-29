#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace dmp {

   struct EncryptionData {
      std::string encrypted_info;
      std::string encrypted_master_key;
      std::string salt;
      std::string hash_params;
   };

   struct Tables {

      /// @brief
      /// Organizations table.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] Organizations {
         eosio::name name;
         std::string email;
         std::string description;
         int users_count;

         auto primary_key() const {
            return name.value;
         }
      };

      /// @brief
      /// Users table.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] Users {
         eosio::name id;
         eosio::name orgname;
         EncryptionData data;

         auto primary_key() const {
            return id.value;
         }
      };
   };


   /// @brief
   /// Aggregion DMP organizations and users smart contract.
   struct [[eosio::contract("Dmpusers")]] Dmpusers : contract {

      enum class UpsertCheck {
         UserMustNotExists,
         UserMustExists,
      };

      using contract::contract;

      using users_table_t = eosio::multi_index<Names::UsersTable, Tables::Users>;
      using org_table_t   = eosio::multi_index<Names::OrganizationsTable, Tables::Organizations>;

      [[eosio::action]] void upsertorg(eosio::name name, std::string email, std::string description);
      [[eosio::action]] void removeorg(eosio::name name);

      [[eosio::action]] void registeruser(eosio::name orgname, eosio::name user, EncryptionData data);
      [[eosio::action]] void updateuser(eosio::name orgname, eosio::name user, EncryptionData data);
      [[eosio::action]] void removeuser(eosio::name orgname, eosio::name user);

   private:
      void upsertuser(UpsertCheck upsertCheck, eosio::name orgname, eosio::name user, const EncryptionData& data);
   };
}