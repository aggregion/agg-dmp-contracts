#include "Brands.hpp"
#include "Vendors.hpp"

namespace catalogs::brands {

   using catalogs::vendors::vendors_table_t;

   void Brands::brandinsert(std::optional<uint64_t> id, std::string name) {
      require_auth(Names::Contract);
      check(!id || *id != 0, "403. Brand ID can't be zero.");

      brands_table_t brands{get_self(), Names::DefaultScope};

      const auto brand_id = id.value_or(brands.begin() == brands.end() ? 1 : brands.available_primary_key());
      brands.emplace(get_self(), [&](auto& row) {
         row.id = brand_id;
         row.name = name;
         row.vendors_count = 0;
      });
      print("New brand was added. Name: '", name, "' Id:", brand_id);
   }


   void Brands::brandremove(uint64_t id) {
      require_auth(Names::Contract);

      brands_table_t brands{get_self(), Names::DefaultScope};
      auto it = brands.require_find(id, "404. Brand is not found");
      check(it->vendors_count == 0, "403. Brands has references to vendors");

      brands.erase(it);
      print("Brand (id=", id, ") was removed");
   }

}
