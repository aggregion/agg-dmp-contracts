#pragma once

#include "../common/Names.hpp"
#include <eosio/eosio.hpp>


namespace catalogs {

   using namespace eosio;

   /// @brief
   /// Contract fixed names.
   namespace Names {
      using namespace common::Names;

      static constexpr const name Contract{"catalogs"};

      static constexpr const name CategoriesTable{"categories"};
      static constexpr const name CategoriesByParIdx{"catbypar"};

      static constexpr const name VendorsTable{"vendors"};

      static constexpr const name BrandsTable{"brands"};

      static constexpr const name VendorBrandsTable{"vendorbrands"};
      static constexpr const name VendorBrandsIdx{"vendbrndidx"};

      static constexpr const name RegionsTable{"regions"};

      static constexpr const name CityTypesTable{"citytypes"};

      static constexpr const name CitiesTable{"cities"};
      static constexpr const name CitiesByRegionTable{"citiesbyreg"};
   };
}
