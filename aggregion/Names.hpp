#pragma once

#include "../common/Names.hpp"
#include <eosio/eosio.hpp>


namespace aggregion {

   using namespace eosio;

   /// @brief
   /// Contract fixed names.
   namespace Names {
      using namespace common::Names;

      static constexpr const name Contract{"aggregion"};

      static constexpr const name ProvidersTable{"providers"};
      static constexpr const name ServicesTable{"services"};

      static constexpr const name ScriptsTable{"scripts"};
      static constexpr const name ScriptsVersionIndex{"scrveridx"};
      static constexpr const name ScriptsHashIndex{"scrhashidx"};

      static constexpr const name TrustedProvidersTable{"trustedprov"};
      static constexpr const name ScriptApprovesTable{"approves"};
      static constexpr const name ScriptAccessTable{"scriptaccess"};
      static constexpr const name EnclaveScriptAccessTable{"encscraccess"};

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
