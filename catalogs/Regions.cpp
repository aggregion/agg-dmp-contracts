#include "Regions.hpp"
#include "Translations.hpp"

namespace catalogs::regions {

   void Regions::upsert(uint64_t id, std::string lang, std::string name, bool mustExists) {
      require_auth(Names::Contract);
      check(id != 0, "403. Region ID can't be zero");

      regions_table_t regions{get_self(), Names::DefaultScope};
      auto it = regions.find(id);
      check(!mustExists || it != regions.end(), "404. Region not found");
      check(mustExists || it == regions.end(), "403. Region with specified ID already exists");

      if (it == regions.end()) {
         it = regions.emplace(get_self(), [&](auto& row) {
            row.id = id;
            row.name = "";
            row.cities_count = 0;
         });
      }
      langs::upsert_translation<regions_translations_table_t>(get_self(), it->id, lang, name);
      print("Success. Region ID: ", it->id, " Lang: '", lang, "' Name: '", name, "'");
   }

   void Regions::regioninsert(uint64_t id, std::string lang, std::string name) {
      upsert(id, lang, name, false);
   }

   void Regions::regionupdate(uint64_t id, std::string lang, std::string name) {
      upsert(id, lang, name, true);
   }

   void Regions::regionremove(uint64_t region_id) {
      require_auth(Names::Contract);
      regions_table_t regions{get_self(), Names::DefaultScope};

      auto it = regions.require_find(region_id, "404. Region is not found");
      check(it->cities_count == 0, "403. Region has cities");
      regions.erase(it);

      langs::remove_translations<regions_translations_table_t>(get_self(), region_id);
      print("Success. Region ID: ", region_id, " was removed");
   }

}
