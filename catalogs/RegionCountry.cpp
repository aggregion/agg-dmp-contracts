#include "RegionCountry.hpp"
#include "Regions.hpp"

namespace catalogs::countries {

   using catalogs::regions::regions_table_t;

   [[eosio::action]] void RegionCountry::regncntrups(uint64_t region_id, uint64_t country_id) {
      require_auth(Names::Contract);
      check(region_id != 0, "403. Region ID can't be zero");
      check(country_id != 0, "403. Country ID can't be zero");

      regions_table_t regions{get_self(), Names::DefaultScope};
      check(regions.find(region_id) != regions.end(), "404. Region not found");

      regioncountry_table_t countries{get_self(), Names::DefaultScope};
      auto it = countries.find(region_id);
      if (it == countries.end()) {
         it = countries.emplace(get_self(), [&](auto& row) {
            row.region_id = region_id;
            row.country_id = country_id;
         });
      } else {
         countries.modify(it, get_self(), [&](auto& row) {
            row.country_id = country_id;
         });
      }
      print("Success. Region ID: ", it->region_id, ". Country ID: ", it->country_id);
   }

   [[eosio::action]] void RegionCountry::regncntrrem(uint64_t region_id) {
      require_auth(Names::Contract);

      regioncountry_table_t countries{get_self(), Names::DefaultScope};
      auto it = countries.require_find(region_id, "404. Region not found");
      countries.erase(it);
      print("Success. Region ID: ", region_id, " was removed (countries)");
   }
}
