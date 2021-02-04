#include "Categories.hpp"
#include "Translations.hpp"

namespace catalogs {

   /// @brief
   /// Add new market catalog entry.
   /// @param id        Category ID
   /// @param parent_id Parent entry (may be null, in which case is root entry).
   /// @param lang      Language
   /// @param name      Category name
   void Categories::catupsert(uint64_t id, std::optional<uint64_t> parent_id, std::string lang, std::string name) {
      require_auth(Names::Contract);
      check(id != 0, "403. Category ID can't be zero");

      categories_table_t categories{get_self(), Names::DefaultScope};

      auto it = categories.find(id);
      if (it == categories.end()) {
         it = categories.emplace(get_self(), [&](auto& row) {
            row.id = id;
            row.name = "";
            row.parent_id = parent_id.value_or(0);
            row.childs_count = 0;
         });

         if (parent_id) {
            auto pit = categories.require_find(parent_id.value(), "404. Parent category not found");
            categories.modify(pit, get_self(), [&](auto& row) {
               row.childs_count++;
            });
         }
      }

      check(it->parent_id == parent_id.value_or(0), "403. Cant change parent with catupsert");

      langs::upsert_translation<categories_translations_table_t>(get_self(), id, lang, name);
      print("Success. Category ID: ", it->id, " Lang: '", lang, "' Name: '", name, "'");
   }

   /// @brief
   /// Insert/update market catalog entry name translation.
   /// @param id        Category ID
   /// @param lang      Language
   /// @param name      Category name
   void Categories::catuptrans(uint64_t category_id, std::string lang, std::string name) {
      require_auth(Names::Contract);

      categories_table_t categories{get_self(), Names::DefaultScope};
      check(categories.find(category_id) != categories.end(), "404. Category not found");

      langs::upsert_translation<categories_translations_table_t>(get_self(), category_id, lang, name);
      print("Success. Category ID: ", category_id, " Lang: '", lang, "' Name: '", name, "'");
   }


   /// @brief
   /// Remove category catalog entry.
   /// @param id  Category ID.
   void Categories::catremove(uint64_t id) {
      require_auth(Names::Contract);

      categories_table_t categories{get_self(), Names::DefaultScope};
      auto it = categories.require_find(id, "404. Category not found");
      check(it->childs_count == 0, "403. Category has subcategories");

      if (it->parent_id) {
         auto pit = categories.find(it->parent_id);
         check(pit != categories.end(), "500. Unknown parent category");
         categories.modify(pit, get_self(), [&](auto& row) {
            row.childs_count--;
         });
      }
      langs::remove_translations<categories_translations_table_t>(get_self(), it->id);
      categories.erase(it);
      print("Category (id=", id, ") was removed");
   }

}
