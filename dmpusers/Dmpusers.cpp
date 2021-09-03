#include "Dmpusers.hpp"
#include <eosio/system.hpp>


namespace dmpusers {

   void Dmpusers::upsertorg(eosio::name name, std::string email, std::string description) {
      require_auth(Names::AggregionDmp);

      org_table_t organizations{get_self(), Names::DefaultScope};
      auto it = organizations.find(name.value);

      if (it == organizations.end()) {
         organizations.emplace(get_self(), [&](auto& row) {
            row.name = name;
            row.email = email;
            row.description = description;
         });
      } else {
         organizations.modify(it, get_self(), [&](auto& row) {
            row.email = email;
            row.description = description;
         });
      }
      print("Success. Organization: '", name, "', email: '", email, "' description: '", description, "'");
   }


   void Dmpusers::removeorg(eosio::name name) {
      require_auth(Names::AggregionDmp);
      org_table_t organizations{get_self(), Names::DefaultScope};
      auto it = organizations.require_find(name.value, "404. Organization not found");
      organizations.erase(it);
      print("Success. Organization '", name, "' was removed");
   }

   void Dmpusers::upsertuser(UpsertCheck upsertCheck, eosio::name user, const UserInfo& info) {
      require_auth(Names::AggregionDmp);

      users_table_t users{get_self(), Names::DefaultScope};
      auto usrit = users.find(user.value);

      switch (upsertCheck) {
      case UpsertCheck::UserMustExists:
         check(usrit != users.end(), "403. User not found");
         break;
      case UpsertCheck::UserMustNotExists:
         check(usrit == users.end(), "403. User already exists");
         break;
      default:
         break;
      }

      if (usrit == users.end()) {
         users.emplace(get_self(), [&](auto& row) {
            row.id = user;
            row.info = info;
         });
      } else {
         users.modify(usrit, get_self(), [&](auto& row) {
            row.info = info; //
         });
      }
      print("Success. User: '", user, "'");
   }

   void Dmpusers::registeruser(eosio::name user, UserInfo info) {
      upsertuser(UpsertCheck::UserMustNotExists, user, info);
   }

   void Dmpusers::updateuser(eosio::name user, UserInfo info) {
      upsertuser(UpsertCheck::UserMustExists, user, info);
   }

   void Dmpusers::removeuser(eosio::name user) {
      require_auth(Names::AggregionDmp);
      users_table_t users{get_self(), Names::DefaultScope};
      auto usrit = users.require_find(user.value, "404. User not found");
      users.erase(usrit);
      print("Success. User: '", user, "' was removed");
   }


   void Dmpusers::upsertpkey(eosio::name owner, std::string key) {
      require_auth(Names::AggregionDmp);

      pkeys_table_t pkeys{get_self(), Names::DefaultScope};
      auto it = pkeys.find(owner.value);

      if (it == pkeys.end()) {
         pkeys.emplace(get_self(), [&](auto& row) {
            row.owner = owner;
            row.key = key;
         });
      } else {
         pkeys.modify(it, get_self(), [&](auto& row) {
            row.key = key; //
         });
      }
      print("Success. Owner: '", owner, "' key: '", key, "'");
   }

   void Dmpusers::removepkey(eosio::name owner) {
      require_auth(Names::AggregionDmp);
      pkeys_table_t pkeys{get_self(), Names::DefaultScope};
      auto it = pkeys.require_find(owner.value, "404. Not found");
      pkeys.erase(it);
      print("Success. Public key owned by '", owner, "' was removed");
   }

   void Dmpusers::upsertorgv2(std::string org_id, std::string data, std::string public_key, uint64_t updated_at, uint64_t bc_version) {
      const auto org = name{org_id};
      require_auth(org);

      orgsv2_table_t orgs{get_self(), Names::DefaultScope};
      auto it = orgs.find(org.value);

      if (it == orgs.end()) {
         orgs.emplace(get_self(), [&](Tables::OrgsV2& row) {
            row.id = org;
            row.data = data;
            row.public_key = public_key;
            row.updated_at = updated_at;
            row.bc_version = bc_version;
         });
      } else {
         check(it->updated_at < updated_at, "403. Version too old");
         orgs.modify(it, get_self(), [&](Tables::OrgsV2& row) {
            row.data = data;
            row.public_key = public_key;
            row.updated_at = updated_at;
            row.bc_version = bc_version;
         });
      }
      print("Success. Org: '", org, "' data: '", data, "' pk: '", public_key);
   }


   void Dmpusers::upsproject(std::string project_id, std::string receiver_org_id, uint64_t updated_at, ProjectInfo info) {
      const auto project = name{project_id};
      const auto sender = name{info.sender_org_id};
      require_auth(sender);

      projects_table_t projects{get_self(), Names::DefaultScope};
      auto it = projects.find(project.value);

      if (it == projects.end()) {
         projects.emplace(get_self(), [&](Tables::Projects& row) {
            row.id = project;
            row.receiver_org_id = receiver_org_id;
            row.updated_at = updated_at;
            row.info = info;
         });
      } else {
         check(it->info.sender_org_id == info.sender_org_id, "401. Access denied");
         check(it->updated_at < updated_at, "403. Version too old");
         projects.modify(it, get_self(), [&](Tables::Projects& row) {
            row.receiver_org_id = receiver_org_id;
            row.updated_at = updated_at;
            row.info = info;
         });
      }
      print("Success. Project: '", project_id, "' receiver: '", receiver_org_id, "' sender: '", info.sender_org_id);
   }

   void Dmpusers::upsdataset(std::string dataset_id, DatasetInfo info) {
      const auto dataset = name{dataset_id};
      // const auto receiver = name{receiver_org_id};
      const auto sender = name{info.sender_org_id};
      require_auth(sender);

      datasets_table_t datasets{get_self(), Names::DefaultScope};
      auto it = datasets.find(dataset.value);

      if (it == datasets.end()) {
         datasets.emplace(get_self(), [&](Tables::Datasets& row) {
            row.id = dataset;
            row.info = info;
         });
      } else {
         check(it->info.sender_org_id == info.sender_org_id, "401. Access denied");
         check(it->info.updated_at < info.updated_at, "403. Version too old");
         datasets.modify(it, get_self(), [&](Tables::Datasets& row) {
            row.info = info;
         });
      }
      print("Success. Dataset: '", dataset_id, "' sender: '", info.sender_org_id, "' receiver: '", info.receiver_org_id);
   }

   void Dmpusers::upsdsreq(std::string dsreqs_id, DatasetRequestInfo info) {
      const auto request = name{dsreqs_id};
      const auto receiver = name{info.receiver_org_id};
      require_auth(receiver);

      dsreqs_table_t dsreqs{get_self(), Names::DefaultScope};
      auto it = dsreqs.find(request.value);

      if (it == dsreqs.end()) {
         dsreqs.emplace(get_self(), [&](Tables::DsRequests& row) {
            row.id = request;
            row.info = info;
         });
      } else {
         check(it->info.receiver_org_id == info.receiver_org_id, "401. Access denied");
         check(it->info.updated_at < info.updated_at, "403. Version too old");
         dsreqs.modify(it, get_self(), [&](Tables::DsRequests& row) {
            row.info = info;
         });
      }
      print("Success. Dataset: '", dsreqs_id, "' receiver: '", info.receiver_org_id);
   }

}
