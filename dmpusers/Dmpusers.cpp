#include "Dmpusers.hpp"
#include <eosio.system/eosio.system.hpp>
#include <eosio.system/native.hpp>


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
}
