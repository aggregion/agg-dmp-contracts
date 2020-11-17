#include "CityTypes.hpp"

namespace catalogs::citytypes {

   void CityTypes::citytypeins(std::optional<uint64_t> id, std::string name) {
      require_auth(Names::Contract);
      check(!id || *id != 0, "403. City type ID can't be zero.");

      citytypes_table_t citytypes{get_self(), Names::DefaultScope};

      const auto citytype_id = id.value_or(citytypes.begin() == citytypes.end() ? 1 : citytypes.available_primary_key());
      citytypes.emplace(get_self(), [&](auto& row) {
         row.id = citytype_id;
         row.name = name;
         row.cities_count = 0;
      });
      print("New citytype was added. Name: '", name, "' Id:", citytype_id);
   }

   void CityTypes::citytyperem(uint64_t citytype_id) {
      require_auth(Names::Contract);
      citytypes_table_t citytypes{get_self(), Names::DefaultScope};

      auto it = citytypes.require_find(citytype_id, "404. City type is not found");
      check(it->cities_count == 0, "403. Region has cities");
      citytypes.erase(it);

      print("City type (id=", citytype_id, ") was removed");
   }

}
