#include "MarketCatalog.hpp"

namespace dmp {


   /// @brief
   /// Add new market catalog entry.
   /// @param id     Entry ID (may be null)
   /// @param parent Parent entry (may be null, in which case is root entry).
   /// @param yid    Reference item id
   /// @param ypid   Reference item parent id
   /// @param ylvl   Reference item level
   /// @param name   Entry name
   void MarketCatalog::mcatinsert(std::optional<uint64_t> id, std::optional<uint64_t> parent_id, int yid, std::optional<int> ypid, int ylvl,
                                    std::string name) {
      require_auth(Names::Contract);

      mcat_table_t mc{get_self(), Names::DefaultScope};

      if (parent_id) {
         auto pit = mc.find(parent_id.value());
         check(pit != mc.end(), "404. Parent item is not found");
         mc.modify(pit, get_self(), [&](auto& row) { row.childs_count++; });
      }

      const auto entry_id = id.value_or(mc.begin() == mc.end() ? 1 : mc.available_primary_key());
      mc.emplace(get_self(), [&](auto& row) {
         row.id = entry_id;
         row.parent_id = parent_id.value_or(0);
         row.yid = yid;
         row.ypid = ypid.value_or(0);
         row.ylvl = ylvl;
         row.name = name;
         row.childs_count = 0;
      });
      print("New market catalog entry was added. Name: '", name, "' Id:", entry_id);
   }


   /// @brief
   /// Remove market catalog entry.
   /// @param id  Entry ID.
   void MarketCatalog::mcatremove(uint64_t id) {
      require_auth(Names::Contract);
      mcat_table_t mc{get_self(), Names::DefaultScope};

      auto it = mc.require_find(id, "404. Catalog item is not found");
      check(it->childs_count == 0, "403. Item has child items");

      if (it->parent_id) {
         auto pit = mc.find(it->parent_id);
         check(pit != mc.end(), "500. Unknown parent item");
         mc.modify(pit, get_self(), [&](auto& row) { row.childs_count--; });
      }

      mc.erase(it);

      print("Market catalog (id=", id, ") was erased");
   }


   /// @brief
   /// Remove all market catalog entries.
   void MarketCatalog::dropmcat() {
      require_auth(Names::Contract);
      mcat_table_t mc{get_self(), Names::DefaultScope};
      while (true) {
         auto it = mc.begin();
         if (it == mc.end())
            break;
         mc.erase(it);
      }
   }
}
