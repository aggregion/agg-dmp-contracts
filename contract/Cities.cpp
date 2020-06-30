#include "Cities.hpp"
#include "CityTypes.hpp"
#include "Regions.hpp"

namespace dmp::cities {

   using dmp::citytypes::citytypes_table_t;
   using dmp::regions::regions_table_t;

   void Cities::cityinsert(std::optional<uint64_t> id, uint64_t region_id, uint64_t type_id, std::string name, uint64_t population) {
      require_auth(Names::Contract);
      check(!id || *id != 0, "403. City ID can't be zero.");

      regions_table_t regions{get_self(), Names::DefaultScope};
      auto rit = regions.require_find(region_id, "404. Region is not found");
      regions.modify(rit, get_self(), [&](auto& row) { row.cities_count++; });

      citytypes_table_t citytypes{get_self(), Names::DefaultScope};
      auto stit = citytypes.require_find(type_id, "404. City type is not found");
      citytypes.modify(stit, get_self(), [&](auto& row) { row.cities_count++; });

      cities_table_t cities{get_self(), Names::DefaultScope};

      const auto city_id = id.value_or(cities.begin() == cities.end() ? 1 : cities.available_primary_key());
      cities.emplace(get_self(), [&](auto& row) {
         row.id = city_id;
         row.region_id = region_id;
         row.name = name;
         row.type_id = type_id;
         row.population = population;
      });
      print("New city was added. Name: '", name, "' Id:", city_id);
   }


   void Cities::cityremove(uint64_t city_id) {
      require_auth(Names::Contract);

      cities_table_t cities{get_self(), Names::DefaultScope};
      auto it = cities.require_find(city_id, "404. City is not found");

      regions_table_t region{get_self(), Names::DefaultScope};
      auto rit = region.require_find(it->region_id, "500. Unknown region");
      region.modify(rit, get_self(), [&](auto& row) { row.cities_count--; });

      citytypes_table_t citytypes{get_self(), Names::DefaultScope};
      auto stit = citytypes.require_find(it->type_id, "500. Unknown city type");
      citytypes.modify(stit, get_self(), [&](auto& row) { row.cities_count--; });

      cities.erase(it);
      print("City (id=", city_id, ") was removed");
   }

}
