#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace dmp {

   using namespace eosio;

   static auto pack128t(name a, name b) {
      return (static_cast<uint128_t>(a.value) << 64) + b.value;
   }

   struct Tables {

      /// @brief
      /// Providers table.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Aggregion")]] Provider {
         name provider;
         std::string description;

         auto primary_key() const {
            return provider.value;
         }
      };


      /// @brief
      /// Provider services list.
      /// Scope: Provider.
      struct [[eosio::table, eosio::contract("Aggregion")]] Service {
         name service;
         std::string description;
         std::string protocol;
         std::string type;
         std::string endpoint;

         auto primary_key() const {
            return service.value;
         }
      };


      /// @brief
      /// Scripts declaration table.
      /// Scope: Script owner.
      struct [[eosio::table, eosio::contract("Aggregion")]] Scripts {
         uint64_t id;
         name script;
         name version;
         std::string description;
         std::string hash;
         std::string url;
         uint64_t approves_count{0};

         auto primary_key() const {
            return id;
         }

         auto secondary_key() const {
            return pack128t(script, version);
         }
      };


      /// @brief
      /// Provider approves registered script.
      /// Scope: Provider.
      struct [[eosio::table, eosio::contract("Aggregion")]] Approves {
         uint64_t script_id;
         name script_owner;
         bool approved;

         auto primary_key() const {
            return script_id;
         }
      };
   };


   /// @brief
   /// Aggregion providers smart contract.
   struct [[eosio::contract("Aggregion")]] Aggregion : contract {

      using contract::contract;

      using providers_table_t = eosio::multi_index<Names::ProvidersTable, Tables::Provider>;
      using services_table_t = eosio::multi_index<Names::ServicesTable, Tables::Service>;
      using scripts_index_t = indexed_by<Names::ScriptsIndex, const_mem_fun<Tables::Scripts, uint128_t, &Tables::Scripts::secondary_key>>;
      using scripts_table_t = eosio::multi_index<Names::ScriptsTable, Tables::Scripts, scripts_index_t>;
      using approves_table_t = eosio::multi_index<Names::ApprovesTable, Tables::Approves>;

      [[eosio::action]] void regprov(name provider, std::string description);
      [[eosio::action]] void updprov(name provider, std::string description);
      [[eosio::action]] void unregprov(name provider);

      [[eosio::action]] void addsvc(name provider, name service, std::string description, std::string protocol, std::string type, std::string endpoint);
      [[eosio::action]] void updsvc(name provider, name service, std::string description, std::string protocol, std::string type, std::string endpoint);
      [[eosio::action]] void remsvc(name provider, name service);

      [[eosio::action]] void addscript(name owner, name script, name version, std::string description, std::string hash, std::string url);
      [[eosio::action]] void updscript(name owner, name script, name version, std::string description, std::string hash, std::string url);
      [[eosio::action]] void remscript(name owner, name script, name version);

      [[eosio::action]] void approve(name provider, name owner, name script, name version);
      [[eosio::action]] void deny(name provider, name owner, name script, name version);

   private:
      bool provider_has_services(name provider);
      void remove_provider_services(name provider);

      bool provider_has_approves(name provider);
      void remove_provider_scripts_approves(name provider);

      uint64_t get_script_id(name owner, name script, name version);
      void upsert_approve(name provider, name owner, name script, name version, bool approved);
   };
}