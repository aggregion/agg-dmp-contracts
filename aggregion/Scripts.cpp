#include "Scripts.hpp"

namespace aggregion::scripts {

   std::optional<uint64_t> get_script_id(name self, name owner, name script, name version) {
      scripts_table_t scripts{self, Names::DefaultScope};
      auto idx = scripts.get_index<Names::ScriptsVersionIndex>();
      auto ait = idx.find(hash3s(owner, script, version));
      if (ait == idx.end()) {
         return std::nullopt;
      }
      return ait->id;
   }

   std::optional<uint64_t> get_script_id(name self, checksum256 hash) {
      scripts_table_t scripts{self, Names::DefaultScope};
      auto idx = scripts.get_index<Names::ScriptsHashIndex>();
      auto ait = idx.find(hash);
      if (ait == idx.end()) {
         return std::nullopt;
      }
      return ait->id;
   }

   /// @brief
   /// Add new script.
   void Scripts::addscript(std::string owner, std::string script, std::string version, std::string description, checksum256 hash, std::string url) {
      const auto o = name{owner};
      const auto s = name{script};
      const auto v = name{version};
      require_auth(o);

      check(get_script_id(get_self(), o, s, v) == std::nullopt, "403. Script version already exist!");
      check(get_script_id(get_self(), hash) == std::nullopt, "403. Script hash already exist!");

      scripts_table_t scripts{get_self(), Names::DefaultScope};
      scripts.emplace(get_self(), [&](Tables::Scripts& row) {
         row.id = scripts.available_primary_key();
         row.owner = o;
         row.script = s;
         row.version = v;
         row.description = description;
         row.hash = hash;
         row.url = url;
         row.approves_count = 0;
      });
      print("New script '", script, "', version '", version, "' was added by '", owner, "'");
   }


   /// @brief
   /// Modify script if it is not approved.
   void Scripts::updscript(name owner, name script, name version, std::string description, checksum256 hash, std::string url) {
      require_auth(owner);

      auto id = get_script_id(get_self(), owner, script, version);
      check(id.has_value(), "404. Script version not found");

      scripts_table_t scripts{get_self(), Names::DefaultScope};
      auto item = scripts.require_find(id.value(), "500. Script not found!");
      check(item->approves_count == 0, "403. Can't update script. Script was approved!");
      check(item->owner == owner, "403. Wrong owner");

      scripts.modify(item, get_self(), [&](Tables::Scripts& row) {
         row.description = description;
         row.hash = hash;
         row.url = url;
      });
      print("Script '", script, "', version '", version, "' was updated by '", owner, "'");
   }


   /// @brief
   /// Remove script if it is not approved.
   void Scripts::remscript(name owner, name script, name version) {
      require_auth(owner);

      auto id = get_script_id(get_self(), owner, script, version);
      check(id.has_value(), "404. Script version not found");

      scripts_table_t scripts{get_self(), Names::DefaultScope};
      auto item = scripts.require_find(id.value(), "500. Script not found!");
      check(item->approves_count == 0, "403. Can't remove script. Script was approved!");
      check(item->owner == owner, "403. Wrong owner!");

      scripts.erase(item);
      print("Script '", script, "', version '", version, "' was removed by '", owner, "'");
   }
}
