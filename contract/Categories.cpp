#include "Categories.hpp"

namespace dmp {


   /// @brief
   /// Add new market catalog entry.
   /// @param id        Entry ID (may be null)
   /// @param parent_id Parent entry (may be null, in which case is root entry).
   /// @param name      Entry name
   void Categories::catinsert(std::optional<uint64_t> id, std::optional<uint64_t> parent_id, std::string name) {
      require_auth(Names::Contract);
      check(!id || *id != 0, "403. Category ID can't be zero.");

      categories_table_t categories{get_self(), Names::DefaultScope};

      if (parent_id) {
         auto pit = categories.find(parent_id.value());
         check(pit != categories.end(), "404. Parent category is not found");
         categories.modify(pit, get_self(), [&](auto& row) { row.childs_count++; });
      }

      const auto entry_id = id.value_or(categories.begin() == categories.end() ? 1 : categories.available_primary_key());
      categories.emplace(get_self(), [&](auto& row) {
         row.id = entry_id;
         row.parent_id = parent_id.value_or(0);
         row.name = name;
         row.childs_count = 0;
      });
      print("New category was added. Name: '", name, "' Id:", entry_id);
   }


   /// @brief
   /// Remove category catalog entry.
   /// @param id  Entry ID.
   void Categories::catremove(uint64_t id) {
      require_auth(Names::Contract);
      categories_table_t categories{get_self(), Names::DefaultScope};

      auto it = categories.require_find(id, "404. Category is not found");
      check(it->childs_count == 0, "403. Category has subcategories");

      if (it->parent_id) {
         auto pit = categories.find(it->parent_id);
         check(pit != categories.end(), "500. Unknown parent category");
         categories.modify(pit, get_self(), [&](auto& row) { row.childs_count--; });
      }

      categories.erase(it);

      print("Category (id=", id, ") was removed");
   }

}
