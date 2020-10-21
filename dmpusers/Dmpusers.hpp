#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace dmp {

   struct UserInfo {
      std::string email;
      std::string firstname;
      std::string lastname;
      std::string other;
   };

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
         UserInfo info;
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

      [[eosio::action]] void newacc(eosio::name creator, eosio::name name, eosio::public_key ownerkey, eosio::public_key activekey);

      [[eosio::action]] void upsertorg(eosio::name name, std::string email, std::string description);
      [[eosio::action]] void removeorg(eosio::name name);

      [[eosio::action]] void registeruser(eosio::name orgname, eosio::name user, UserInfo info, EncryptionData data);
      [[eosio::action]] void updateuser(eosio::name orgname, eosio::name user, UserInfo info, EncryptionData data);
      [[eosio::action]] void removeuser(eosio::name orgname, eosio::name user);


   private:
      void upsertuser(UpsertCheck upsertCheck, eosio::name orgname, eosio::name user, const UserInfo& info, const EncryptionData& data);
   };
}