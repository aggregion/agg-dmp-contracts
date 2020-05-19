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
   };
}