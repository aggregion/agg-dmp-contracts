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

   };
}
