#include "Places.hpp"
#include "Translations.hpp"

namespace catalogs::places {

   void Places::upsert(uint64_t id, std::string lang, std::string name, bool mustExists) {
      require_auth(Names::Contract);
      check(id != 0, "403. Place ID can't be zero");

      places_table_t places{get_self(), Names::DefaultScope};
      auto it = places.find(id);
      check(!mustExists || it != places.end(), "404. Place not found");
      check(mustExists || it == places.end(), "403. Place with specified ID already exists");

      if (it == places.end()) {
         it = places.emplace(get_self(), [&](auto& row) {
            row.id = id;
            row.name = "";
         });
      }
      langs::upsert_translation<places_translations_table_t>(get_self(), it->id, lang, name);
      print("Success. Place ID: ", it->id, " Lang: '", lang, "' Name: '", name, "'");
   }

   void Places::placeinsert(uint64_t id, std::string lang, std::string name) {
      upsert(id, lang, name, false);
   }

   void Places::placeupdate(uint64_t id, std::string lang, std::string name) {
      upsert(id, lang, name, true);
   }

   void Places::placeremove(uint64_t place_id) {
      require_auth(Names::Contract);
      places_table_t places{get_self(), Names::DefaultScope};

      auto it = places.require_find(place_id, "404. Place is not found");
      places.erase(it);

      langs::remove_translations<places_translations_table_t>(get_self(), place_id);
      print("Success. Place ID: ", place_id, " was removed");
   }

}
