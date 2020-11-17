#pragma once

#include "../common/Names.hpp"
#include <eosio/eosio.hpp>

namespace dmpusers {

   using namespace eosio;

   /// @brief
   /// Contract fixed names.
   namespace Names {
      using namespace common::Names;

      static constexpr const name Contract{"dmpusers"};

      static constexpr const name AccountsTable{"accounts"};
      static constexpr const name UsersTable{"users"};
      static constexpr const name OrganizationsTable{"orgs"};
   };
}
