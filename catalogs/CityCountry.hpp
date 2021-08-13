#pragma once

#include "Names.hpp"
#include <eosio/eosio.hpp>
#include <optional>

namespace catalogs::countries {

   struct Tables {

      struct [[eosio::table, eosio::contract("Catalogs")]] CityCountry {
         uint64_t city_id;
         uint64_t country_id;

         uint64_t primary_key() const {
            return city_id;
         }

         uint64_t by_country() const {
            return country_id;
         }
      };
   };

   using citycountry_bycountry_index_t = indexed_by<Names::CitiesByCountry, const_mem_fun<Tables::CityCountry, uint64_t, &Tables::CityCountry::by_country>>;
   using citycountry_table_t = eosio::multi_index<Names::CityCountry, Tables::CityCountry, citycountry_bycountry_index_t>;

   struct [[eosio::contract("Catalogs")]] CityCountry : contract {
      using contract::contract;

      [[eosio::action]] void citycntrins(uint64_t city_id, uint64_t country_id);
      [[eosio::action]] void citycntrrem(uint64_t city_id);
   };
}
