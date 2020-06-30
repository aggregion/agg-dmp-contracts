#include "VendorBrands.hpp"
#include "Brands.hpp"
#include "Vendors.hpp"

namespace dmp::vendorbrands {

   using dmp::brands::brands_table_t;
   using dmp::vendors::vendors_table_t;

   void VendorBrands::venbrbind(uint64_t vendor_id, uint64_t brand_id) {
      require_auth(Names::Contract);

      auto key = Tables::VendorBrands::makeKey(vendor_id, brand_id);

      vendorbrands_table_t vbt{get_self(), Names::DefaultScope};
      auto idx = vbt.get_index<Names::VendorBrandsIdx>();
      check(idx.find(key) == idx.end(), "403. Vendor already has specified brand");

      vendors_table_t vendors{get_self(), Names::DefaultScope};
      auto vit = vendors.require_find(vendor_id, "404. Vendor is not found");
      vendors.modify(vit, get_self(), [&](auto& row) { row.brands_count++; });

      brands_table_t brands{get_self(), Names::DefaultScope};
      auto bit = brands.require_find(brand_id, "404. Brand is not found");
      brands.modify(bit, get_self(), [&](auto& row) { row.vendors_count++; });

      const auto id = vbt.available_primary_key();
      vbt.emplace(get_self(), [&](auto& row) {
         row.id = id;
         row.vendor_id = vendor_id;
         row.brand_id = brand_id;
      });
      print("Brand '", bit->name, "' binded to vendor '", vit->name, "' Key:", key);
   }


   void VendorBrands::venbrunbind(uint64_t vendor_id, uint64_t brand_id) {
      require_auth(Names::Contract);

      auto key = Tables::VendorBrands::makeKey(vendor_id, brand_id);

      vendorbrands_table_t vbt{get_self(), Names::DefaultScope};
      auto idx = vbt.get_index<Names::VendorBrandsIdx>();
      auto vbit = idx.find(key);
      check(vbit != idx.end(), "404. Vendor does not have specified brand");

      vendors_table_t vendors{get_self(), Names::DefaultScope};
      auto vit = vendors.require_find(vendor_id, "500. Vendor is not found");
      vendors.modify(vit, get_self(), [&](auto& row) { row.brands_count--; });

      brands_table_t brands{get_self(), Names::DefaultScope};
      auto bit = brands.require_find(brand_id, "500. Brand is not found");
      brands.modify(bit, get_self(), [&](auto& row) { row.vendors_count--; });

      print("Brand '", bit->name, "' removed from vendor '", vit->name, "'. ID:", vbit->id);
      auto rowit = vbt.require_find(vbit->id, "500. Vendor-brand relation is not found");
      vbt.erase(rowit);
   }

}
