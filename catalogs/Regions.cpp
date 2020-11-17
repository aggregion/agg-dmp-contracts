#include "Regions.hpp"

namespace catalogs::regions {

   void Regions::regioninsert(std::optional<uint64_t> id, std::string name) {
      require_auth(Names::Contract);
      check(!id || *id != 0, "403. Region ID can't be zero.");

      regions_table_t regions{get_self(), Names::DefaultScope};

      const auto region_id = id.value_or(regions.begin() == regions.end() ? 1 : regions.available_primary_key());
      regions.emplace(get_self(), [&](auto& row) {
         row.id = region_id;
         row.name = name;
         row.cities_count = 0;
      });
      print("New region was added. Name: '", name, "' Id:", region_id);
   }

   void Regions::regionremove(uint64_t region_id) {
      require_auth(Names::Contract);
      regions_table_t regions{get_self(), Names::DefaultScope};

      auto it = regions.require_find(region_id, "404. Region is not found");
      check(it->cities_count == 0, "403. Region has cities");

      regions.erase(it);

      print("Region (id=", region_id, ") was removed");
   }

}
