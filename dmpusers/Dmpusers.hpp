#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace dmpusers {

   struct UserInfo {
      std::string email;
      std::string firstname;
      std::string lastname;
      std::string data;
   };

   struct Tables {

      /// @brief
      /// Organizations table.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] Organizations {
         eosio::name name;
         std::string email;
         std::string description;

         auto primary_key() const {
            return name.value;
         }
      };

      /// @brief
      /// Users table.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] Users {
         eosio::name id;
         UserInfo info;

         auto primary_key() const {
            return id.value;
         }
      };

      /// @brief
      /// Public keys table.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] PublicKeys {
         eosio::name owner;
         std::string key;

         auto primary_key() const {
            return owner.value;
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
      using org_table_t = eosio::multi_index<Names::OrganizationsTable, Tables::Organizations>;
      using pkeys_table_t = eosio::multi_index<Names::PublicKeysTable, Tables::PublicKeys>;

      [[eosio::action]] void upsertorg(eosio::name name, std::string email, std::string description);
      [[eosio::action]] void removeorg(eosio::name name);

      [[eosio::action]] void registeruser(eosio::name user, UserInfo info);
      [[eosio::action]] void updateuser(eosio::name user, UserInfo info);
      [[eosio::action]] void removeuser(eosio::name user);

      [[eosio::action]] void upsertpkey(eosio::name owner, std::string key);
      [[eosio::action]] void removepkey(eosio::name owner);

   private:
      void upsertuser(UpsertCheck upsertCheck, eosio::name user, const UserInfo& info);
   };
}