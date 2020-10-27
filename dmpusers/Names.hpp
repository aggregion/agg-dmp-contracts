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
      static constexpr const name Contract{"dmpusers"};

      static constexpr const name AccountsTable{"accounts"};
      static constexpr const name UsersTable{"users"};
      static constexpr const name OrganizationsTable{"orgs"};

      static constexpr const name Aggregion{"aggregiondmp"};
   };
}
