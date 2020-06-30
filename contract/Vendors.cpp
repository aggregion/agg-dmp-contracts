#include "Vendors.hpp"

namespace dmp::vendors {

   void Vendors::vendinsert(std::optional<uint64_t> id, std::string name) {
      require_auth(Names::Contract);
      check(!id || *id != 0, "403. Vendor ID can't be zero.");

      vendors_table_t vendors{get_self(), Names::DefaultScope};

      const auto vendor_id = id.value_or(vendors.begin() == vendors.end() ? 1 : vendors.available_primary_key());
      vendors.emplace(get_self(), [&](auto& row) {
         row.id = vendor_id;
         row.name = name;
         row.brands_count = 0;
      });
      print("New vendor was added. Name: '", name, "' Id:", vendor_id);
   }

   void Vendors::vendremove(uint64_t id) {
      require_auth(Names::Contract);
      vendors_table_t vendors{get_self(), Names::DefaultScope};

      auto it = vendors.require_find(id, "404. Vendor is not found");
      check(it->brands_count == 0, "403. Vendor has brands");

      vendors.erase(it);

      print("Vendor (id=", id, ") was removed");
   }

}
