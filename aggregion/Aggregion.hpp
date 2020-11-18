#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace aggregion {

   using namespace eosio;

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
   };


   /// @brief
   /// Aggregion providers smart contract.
   struct [[eosio::contract("Aggregion")]] Aggregion : contract {

      using contract::contract;

      using providers_table_t = eosio::multi_index<Names::ProvidersTable, Tables::Provider>;
      using services_table_t = eosio::multi_index<Names::ServicesTable, Tables::Service>;

      [[eosio::action]] void regprov(name provider, std::string description);
      [[eosio::action]] void updprov(name provider, std::string description);
      [[eosio::action]] void unregprov(name provider);

      [[eosio::action]] void addsvc(name provider, name service, std::string description, std::string protocol, std::string type, std::string endpoint);
      [[eosio::action]] void updsvc(name provider, name service, std::string description, std::string protocol, std::string type, std::string endpoint);
      [[eosio::action]] void remsvc(name provider, name service);

   private:
      bool provider_has_services(name provider);
      void remove_provider_services(name provider);
   };
}