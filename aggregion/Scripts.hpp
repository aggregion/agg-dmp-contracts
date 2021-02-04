#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>
#include <optional>

namespace aggregion::scripts {

   using eosio::name;

   static auto hash3s(name a, name b, name c) {
      auto mix = a.to_string() + b.to_string() + c.to_string();
      return sha256(mix.c_str(), mix.size());
   }

   struct Tables {
      /// @brief
      /// Scripts declaration table.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Aggregion")]] Scripts {
         uint64_t id;
         name owner;
         name script;
         name version;
         std::string description;
         checksum256 hash;
         std::string url;
         int approves_count;

         auto primary_key() const {
            return id;
         }

         auto script_version_key() const {
            return hash3s(owner, script, version);
         }

         auto script_hash_key() const {
            return hash;
         }
      };
   };


   struct Indexes {
      using scripts_version_idx_t = indexed_by<Names::ScriptsVersionIndex, const_mem_fun<Tables::Scripts, checksum256, &Tables::Scripts::script_version_key>>;
      using scripts_hash_idx_t = indexed_by<Names::ScriptsHashIndex, const_mem_fun<Tables::Scripts, checksum256, &Tables::Scripts::script_hash_key>>;
   };

   using scripts_table_t = eosio::multi_index<Names::ScriptsTable, Tables::Scripts, Indexes::scripts_version_idx_t, Indexes::scripts_hash_idx_t>;

   /// @brief
   /// Aggregion scripts.
   struct [[eosio::contract("Aggregion")]] Scripts : contract {
      using contract::contract;

      [[eosio::action]] void addscript(std::string owner, std::string script, std::string version, std::string description, checksum256 hash, std::string url);
      [[eosio::action]] void updscript(name owner, name script, name version, std::string description, checksum256 hash, std::string url);
      [[eosio::action]] void remscript(name owner, name script, name version);
   };

   std::optional<uint64_t> get_script_id(name self, name owner, name script, name version);
   std::optional<uint64_t> get_script_id(name self, checksum256 hash);
}