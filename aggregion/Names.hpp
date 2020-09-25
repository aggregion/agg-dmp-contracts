#pragma once

#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace dmp {

   using namespace eosio;

   /// @brief
   /// Contract fixed names.
   struct Names {
      static constexpr const int64_t DefaultScope{name{"default"}.value};
      static constexpr const name Contract{"aggregion"};

      static constexpr const name ProvidersTable{"providers"};
      static constexpr const name ServicesTable{"services"};
      static constexpr const name ScriptsTable{"scripts"};
      static constexpr const name ScriptsIndex{"approvesidx"};
      static constexpr const name ApprovesTable{"approves"};

      static constexpr const name RequestsLogTable{"reqslog"};
      static constexpr const name RequestsLogIndex{"reqslogidx"};

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
