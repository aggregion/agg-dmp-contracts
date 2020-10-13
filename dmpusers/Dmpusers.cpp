#include "Dmpusers.hpp"


namespace dmp {


   void Dmpusers::upsertorg(eosio::name name, std::string email, std::string description) {
      require_auth(name);

      org_table_t organizations{get_self(), Names::DefaultScope};
      auto it = organizations.find(name.value);

      if (it == organizations.end()) {
         organizations.emplace(get_self(), [&](auto& row) {
            row.name        = name;
            row.email       = email;
            row.description = description;
            row.users_count = 0;
         });
      } else {
         organizations.modify(it, get_self(), [&](auto& row) {
            row.email       = email;
            row.description = description;
         });
      }
      print("Success. Organization: '", name, "', email: '", email, "' description: '", description, "'");
   }


   void Dmpusers::removeorg(eosio::name name) {
      require_auth(name);
      org_table_t organizations{get_self(), Names::DefaultScope};
      auto it = organizations.require_find(name.value, "404. Organization not found");
      check(it->users_count == 0, "403. Organization has users");
      organizations.erase(it);
      print("Success. Organization '", name, "' was removed");
   }

   void Dmpusers::upsertuser(UpsertCheck upsertCheck, eosio::name orgname, eosio::name user, const UserInfo& info, const EncryptionData& data) {
      require_auth(orgname);

      org_table_t organizations{get_self(), Names::DefaultScope};
      users_table_t users{get_self(), Names::DefaultScope};

      auto orgit = organizations.require_find(orgname.value, "404. Organization not found");
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
            row.id      = user;
            row.orgname = orgname;
            row.data    = data;
            row.info    = info;
         });
         organizations.modify(orgit, get_self(), [&](auto& row) { row.users_count++; });
      } else {
         check(usrit->orgname == orgname, "403. User organization is different");
         users.modify(usrit, get_self(), [&](auto& row) {
            row.data = data; //
         });
      }
      print("Success. User: '", user, "', organization: '", orgname, "'");
   }

   void Dmpusers::registeruser(eosio::name orgname, eosio::name user, UserInfo info, EncryptionData data) {
      upsertuser(UpsertCheck::UserMustNotExists, orgname, user, info, data);
   }

   void Dmpusers::updateuser(eosio::name orgname, eosio::name user, UserInfo info, EncryptionData data) {
      upsertuser(UpsertCheck::UserMustExists, orgname, user, info, data);
   }

   void Dmpusers::removeuser(eosio::name orgname, eosio::name user) {
      require_auth(orgname);

      org_table_t organizations{get_self(), Names::DefaultScope};
      users_table_t users{get_self(), Names::DefaultScope};

      auto orgit = organizations.require_find(orgname.value, "404. Organization not found");
      auto usrit = users.require_find(user.value, "404. User not found");

      users.erase(usrit);
      organizations.modify(orgit, get_self(), [&](auto& row) { row.users_count--; });
      print("Success. User: '", user, "' was removed from '", orgname, "'");
   }
}
