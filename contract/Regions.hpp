#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>
#include <optional>

namespace dmp::regions {

   struct Tables {

      struct [[eosio::table, eosio::contract("Aggregion")]] Regions {
         uint64_t id;
         std::string name;
         int cities_count;

         uint64_t primary_key() const {
            return id;
         }
      };
   };

   using regions_table_t = eosio::multi_index<Names::RegionsTable, Tables::Regions>;

   struct [[eosio::contract("Aggregion")]] Regions : contract {
      using contract::contract;

      [[eosio::action]] void regioninsert(std::optional<uint64_t> id, std::string name);
      [[eosio::action]] void regionremove(uint64_t region_id);
   };
}
