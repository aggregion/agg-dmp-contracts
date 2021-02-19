#include "Cities.hpp"
#include "CityTypes.hpp"
#include "Regions.hpp"
#include "Translations.hpp"

namespace catalogs::cities {

   using catalogs::citytypes::citytypes_table_t;
   using catalogs::regions::regions_table_t;

   void Cities::cityinsert(uint64_t id, uint64_t region_id, uint64_t type_id, std::string lang, std::string name, uint64_t population) {
      require_auth(Names::Contract);
      check(id != 0, "403. City ID can't be zero");

      regions_table_t regions{get_self(), Names::DefaultScope};
      auto rit = regions.require_find(region_id, "404. Region not found");
      regions.modify(rit, get_self(), [&](auto& row) {
         row.cities_count++;
      });

      citytypes_table_t citytypes{get_self(), Names::DefaultScope};
      auto stit = citytypes.require_find(type_id, "404. Citytype not found");
      citytypes.modify(stit, get_self(), [&](auto& row) {
         row.cities_count++;
      });

      cities_table_t cities{get_self(), Names::DefaultScope};
      auto it = cities.find(id);
      check(it == cities.end(), "403. City with specified ID already exists");
      if (it == cities.end()) {
         it = cities.emplace(get_self(), [&](auto& row) {
            row.id = id;
            row.region_id = region_id;
            row.name = "";
            row.type_id = type_id;
            row.population = population;
         });
      }

      langs::upsert_translation<cities_translations_table_t>(get_self(), id, lang, name);
      print("Success. City ID: ", id, ". Name: '", name);
   }

   void Cities::citytrans(uint64_t id, std::string lang, std::string name) {
      require_auth(Names::Contract);
      cities_table_t cities{get_self(), Names::DefaultScope};
      check(cities.find(id) != cities.end(), "404. City not found");
      langs::upsert_translation<cities_translations_table_t>(get_self(), id, lang, name);
   }

   void Cities::citychtype(uint64_t id, uint64_t type_id) {
      require_auth(Names::Contract);

      citytypes_table_t citytypes{get_self(), Names::DefaultScope};
      check(citytypes.find(type_id) != citytypes.end(), "403. Unknown city type");

      cities_table_t cities{get_self(), Names::DefaultScope};
      const auto cit = cities.require_find(id, "404. City not found");
      cities.modify(cit, get_self(), [&](auto& row) {
         row.type_id = type_id;
      });
      print("Success. City ID: ", cit->id, ". New type: ", cit->type_id);
   }


   void Cities::cityremove(uint64_t city_id) {
      require_auth(Names::Contract);

      cities_table_t cities{get_self(), Names::DefaultScope};
      auto it = cities.require_find(city_id, "404. City is not found");

      regions_table_t region{get_self(), Names::DefaultScope};
      auto rit = region.require_find(it->region_id, "500. Unknown region");
      region.modify(rit, get_self(), [&](auto& row) {
         row.cities_count--;
      });

      citytypes_table_t citytypes{get_self(), Names::DefaultScope};
      auto stit = citytypes.require_find(it->type_id, "500. Unknown city type");
      citytypes.modify(stit, get_self(), [&](auto& row) {
         row.cities_count--;
      });

      cities.erase(it);
      langs::remove_translations<cities_translations_table_t>(get_self(), city_id);
      print("Success. City ID: ", city_id, " was removed");
   }

}
