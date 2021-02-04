#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace aggregion::services {

   using eosio::name;

   struct ServiceInfo {
      std::string description;
      std::string protocol;
      std::string type;
      std::string endpoint;
   };


   struct Tables {

      /// @brief
      /// Provider services list.
      /// Scope: Provider.
      struct [[eosio::table, eosio::contract("Aggregion")]] Service {
         name service;
         ServiceInfo info;

         auto primary_key() const {
            return service.value;
         }
      };
   };

   using services_table_t = eosio::multi_index<Names::ServicesTable, Tables::Service>;

   /// @brief
   /// Provider services.
   struct [[eosio::contract("Aggregion")]] Services : contract {

      using contract::contract;

      [[eosio::action]] void addsvc(std::string provider, std::string service, ServiceInfo info);
      [[eosio::action]] void updsvc(name provider, name service, ServiceInfo info);
      [[eosio::action]] void remsvc(name provider, name service);
   };

}