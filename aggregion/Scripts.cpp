#include "Aggregion.hpp"

namespace dmp {

   uint64_t Aggregion::get_script_id(name owner, name script, name version) {
      scripts_table_t scripts{get_self(), owner.value};
      auto idx = scripts.get_index<Names::ScriptsIndex>();
      auto ait = idx.find(pack128t(script, version));
      if (ait == idx.end()) {
         return 0;
      }
      return ait->id;
   }

   /// @brief
   /// Add new script.
   void Aggregion::addscript(name owner, name script, name version, std::string description, std::string hash, std::string url) {
      require_auth(owner);

      check(get_script_id(owner, script, version) == 0, "403. Script version already exist!");

      scripts_table_t scripts{get_self(), owner.value};
      scripts.emplace(get_self(), [&](Tables::Scripts& row) {
         row.id = scripts.available_primary_key();
         row.script = script;
         row.version = version;
         row.description = description;
         row.hash = hash;
         row.url = url;
         row.approves_count = 0;
      });
      print("New script '", script, "', version '", version, "' was added by '", owner, "'");
   }


   /// @brief
   /// Modify script if it is not approved.
   void Aggregion::updscript(name owner, name script, name version, std::string description, std::string hash, std::string url) {
      require_auth(owner);

      auto script_id = get_script_id(owner, script, version);

      scripts_table_t scripts{get_self(), owner.value};
      auto item = scripts.require_find(script_id, "500. Script version was not found!");
      check(item->approves_count == 0, "403. Can't update script. Script was approved!");

      scripts.modify(item, get_self(), [&](Tables::Scripts& row) {
         row.description = description;
         row.hash = hash;
         row.url = url;
      });
      print("Script '", script, "', version '", version, "' was updated by '", owner, "'");
   }


   /// @brief
   /// Remove script if it is not approved.
   void Aggregion::remscript(name owner, name script, name version) {
      require_auth(owner);

      auto id = get_script_id(owner, script, version);

      scripts_table_t scripts{get_self(), owner.value};
      auto item = scripts.require_find(id, "Script version was not found!");
      check(item->approves_count == 0, "403. Can't remove script. Script was approved!");

      scripts.erase(item);
      print("Script '", script, "', version '", version, "' was removed by '", owner, "'");
   }
}
