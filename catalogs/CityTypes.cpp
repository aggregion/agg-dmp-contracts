#include "CityTypes.hpp"
#include "Translations.hpp"

namespace catalogs::citytypes {

   void CityTypes::upsert(uint64_t id, std::string lang, std::string name, bool mustExists) {
      require_auth(Names::Contract);
      check(id != 0, "403. City type ID can't be zero");

      citytypes_table_t citytypes{get_self(), Names::DefaultScope};
      auto it = citytypes.find(id);

      check(!mustExists || it != citytypes.end(), "404. City type not found");
      check(mustExists || it == citytypes.end(), "403. City type with specified ID already exists");

      if (it == citytypes.end()) {
         it = citytypes.emplace(get_self(), [&](auto& row) {
            row.id = id;
            row.name = "";
            row.cities_count = 0;
         });
      }
      langs::upsert_translation<citytypes_translations_table_t>(get_self(), it->id, lang, name);
      print("Success. City type ID: ", it->id, " Lang: '", lang, "' Name: '", name, "'");
   }

   void CityTypes::citytypeins(uint64_t id, std::string lang, std::string name) {
      upsert(id, lang, name, false);
   }

   void CityTypes::citytypetrn(uint64_t id, std::string lang, std::string name) {
      upsert(id, lang, name, true);
   }

   void CityTypes::citytyperem(uint64_t citytype_id) {
      require_auth(Names::Contract);
      citytypes_table_t citytypes{get_self(), Names::DefaultScope};

      auto it = citytypes.require_find(citytype_id, "404. City type is not found");
      check(it->cities_count == 0, "403. Region has cities");
      citytypes.erase(it);

      langs::remove_translations<citytypes_translations_table_t>(get_self(), citytype_id);
      print("Success. City type ID: ", citytype_id, " was removed");
   }

}
