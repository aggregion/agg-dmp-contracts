#include "CityCountry.hpp"
#include "Cities.hpp"

namespace catalogs::countries {

   using catalogs::cities::cities_table_t;

   [[eosio::action]] void CityCountry::citycntrins(uint64_t city_id, uint64_t country_id) {
      require_auth(Names::Contract);
      check(city_id != 0, "403. City ID can't be zero");
      check(country_id != 0, "403. Country ID can't be zero");

      cities_table_t cities{get_self(), Names::DefaultScope};
      check(cities.find(city_id) != cities.end(), "404. City not found");

      citycountry_table_t countries{get_self(), Names::DefaultScope};
      auto it = countries.find(city_id);
      if (it == countries.end()) {
         it = countries.emplace(get_self(), [&](auto& row) {
            row.city_id = city_id;
            row.country_id = country_id;
         });
      } else {
         countries.modify(it, get_self(), [&](auto& row) {
            row.country_id = country_id;
         });
      }
      print("Success. City ID: ", it->city_id, ". Country ID: ", it->country_id);
   }

   [[eosio::action]] void CityCountry::citycntrrem(uint64_t city_id) {
      require_auth(Names::Contract);

      citycountry_table_t countries{get_self(), Names::DefaultScope};
      auto it = countries.require_find(city_id, "404. City not found");
      countries.erase(it);
      print("Success. City ID: ", city_id, " was removed (countries)");
   }
}
