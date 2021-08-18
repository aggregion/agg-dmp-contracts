#pragma once

#include "Names.hpp"
#include <eosio/eosio.hpp>
#include <optional>

namespace catalogs::countries {

   struct Tables {

      struct [[eosio::table, eosio::contract("Catalogs")]] RegionCountry {
         uint64_t region_id;
         uint64_t country_id;

         uint64_t primary_key() const {
            return region_id;
         }

         uint64_t by_country() const {
            return country_id;
         }
      };
   };

   using regioncountry_bycountry_index_t = indexed_by<Names::RegionsByCountry, const_mem_fun<Tables::RegionCountry, uint64_t, &Tables::RegionCountry::by_country>>;
   using regioncountry_table_t = eosio::multi_index<Names::RegionCountry, Tables::RegionCountry, regioncountry_bycountry_index_t>;

   struct [[eosio::contract("Catalogs")]] RegionCountry : contract {
      using contract::contract;

      [[eosio::action]] void regncntrups(uint64_t region_id, uint64_t country_id);
      [[eosio::action]] void regncntrrem(uint64_t region_id);
   };
}
