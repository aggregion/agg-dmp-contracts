#pragma once

#include <eosio/eosio.hpp>

namespace common {

   using namespace eosio;

   /// @brief
   /// Contracts common names.
   namespace Names {
      static constexpr const int64_t DefaultScope{name{"default"}.value};
      static constexpr const name AggregionDmp{"aggregiondmp"};
   };
}
