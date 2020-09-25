#include "Dmpusers.hpp"


namespace dmp {


   void Dmpusers::upsertorg(eosio::name name, std::string email, std::string description) {
      require_auth(name);
      org_table_t organizations{get_self(), Names::DefaultScope};
      auto it = organizations.find(name.value);
      if (it == organizations.end()) {
         organizations.emplace(get_self(), [&](auto& row) {
            row.name = name;
            row.email = email;
            row.description = description;
            row.users_count = 0;
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
      require_auth(name);
      org_table_t organizations{get_self(), Names::DefaultScope};
      auto it = organizations.require_find(name.value, "404. Organization not found");
      check(it->users_count == 0, "403. Organization has users");
      organizations.erase(it);
      print("Success. Organization '", name, "' was removed");
   }


   void Dmpusers::upsertuser(eosio::name orgname, eosio::name name, std::string encrypted_info) {
      require_auth(orgname);

      org_table_t organizations{get_self(), Names::DefaultScope};
      users_table_t users{get_self(), Names::DefaultScope};

      auto orgit = organizations.require_find(orgname.value, "404. Organization not found");
      auto usrit = users.find(name.value);

      if (usrit == users.end()) {
         users.emplace(get_self(), [&](auto& row) {
            row.name = name;
            row.encrypted_info = encrypted_info;
            row.org = orgname;
         });
         organizations.modify(orgit, get_self(), [&](auto& row) { row.users_count++; });
      } else {
         check(usrit->org == orgname, "403. User organization is different");
         users.modify(usrit, get_self(), [&](auto& row) { row.encrypted_info = encrypted_info; });
      }
      print("Success. User: '", name, "', organization: '", orgname, "'");
   }


   void Dmpusers::removeuser(eosio::name orgname, eosio::name name) {
      require_auth(orgname);

      org_table_t organizations{get_self(), Names::DefaultScope};
      users_table_t users{get_self(), Names::DefaultScope};

      auto orgit = organizations.require_find(orgname.value, "404. Organization not found");
      auto usrit = users.require_find(name.value, "404. User not found");

      users.erase(usrit);
      organizations.modify(orgit, get_self(), [&](auto& row) { row.users_count--; });
      print("Success. User: '", name, "' was removed from '", orgname, "'");
   }
}
