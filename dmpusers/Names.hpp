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
      static constexpr const name PublicKeysTable{"pkeys"};
      static constexpr const name MessagesTable{"msgs"};
      static constexpr const name OrganizationsTableV2{"orgsv2"};
      static constexpr const name ProjectsTable{"projects"};
      static constexpr const name ProjectsTableByReceiver{"projbyrecidx"};
      static constexpr const name ProjectsTableByReceiverAndUpdateAt{"projbrupdidx"};
      static constexpr const name DatasetsTable{"datasets"};
      static constexpr const name DatasetsTableByUpdateAt{"dsupdatidx"};
      static constexpr const name DatasetsTableByReceiver{"dsrecidx"};
      static constexpr const name DatasetsTableBySender{"dssendidx"};
      static constexpr const name DsReqsTable{"dsreqs"};
      static constexpr const name DsReqsTableByReceiverAndUpdateAt{"drqsrecupidx"};
      static constexpr const name InteractionsTable{"interactions"};
      static constexpr const name InteractionsTripletIndex{"intertripidx"};
      static constexpr const name InteractionsOwnerIndex{"interownridx"};
   };
}
