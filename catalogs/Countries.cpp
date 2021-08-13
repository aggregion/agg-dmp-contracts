#include "Countries.hpp"
#include "Translations.hpp"

namespace catalogs::countries {

   void Countries::countryups(uint64_t id, uint64_t code, std::string lang, std::string name) {
      require_auth(Names::Contract);
      check(id != 0, "403. Country ID can't be zero");

      countries_table_t countries{get_self(), Names::DefaultScope};
      auto it = countries.find(id);
      if (it == countries.end()) {
         it = countries.emplace(get_self(), [&](auto& row) {
            row.id = id;
            row.code = code;
            if (lang == "ru") {
               row.name = name;
            }
         });
      } else {
         countries.modify(it, get_self(), [&](auto& row) {
            row.code = code;
            if (lang == "ru") {
               row.name = name;
            }
         });
      }

      langs::upsert_translation<countries_translations_table_t>(get_self(), id, lang, name);
      print("Success. Country ID: ", id, ". Code: ", code, ". Name: ", name);
   }

   void Countries::countryrem(uint64_t country_id) {
      require_auth(Names::Contract);

      countries_table_t countries{get_self(), Names::DefaultScope};
      auto it = countries.require_find(country_id, "404. Country is not found");
      countries.erase(it);

      langs::remove_translations<countries_translations_table_t>(get_self(), country_id);
      print("Success. Country ID: ", country_id, " was removed");
   }
}
