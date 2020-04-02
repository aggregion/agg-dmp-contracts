#include "Aggregion.hpp"

namespace dmp {


   void Aggregion::upsert_approve(name provider, name owner, name script, name version, bool approved) {
      require_auth(provider);

      providers_table_t providers{get_self(), Names::DefaultScope};
      providers.require_find(provider.value, "404. Unknown provider!");

      scripts_table_t scripts{get_self(), owner.value};
      auto script_id = get_script_id(owner, script, version);

      // Search for approve item (create one if it not found).
      // Update 'approve' flag with given value.
      // And carefuly modify script approves counter
      // (because we can't update script if provider approve it).
      approves_table_t approves{get_self(), provider.value};
      auto ait = approves.find(script_id);

      bool already_approved{false};
      uint64_t id{};
      if (ait == approves.end()) {
         approves.emplace(get_self(), [&](Tables::Approves& row) {
            row.script_id = script_id;
            row.script_owner = owner;
            row.approved = approved;
         });
      } else {
         already_approved = ait->approved;
         approves.modify(ait, get_self(), [&](Tables::Approves& row) {
            row.approved = approved; // (either approve or deny)
         });
      }

      // unapproved --> approved => +1
      // approved --> unapproved => -1
      auto script_item = scripts.require_find(script_id, "500. Invalid script id!");
      if (!already_approved && approved) {
         scripts.modify(script_item, get_self(), [&](Tables::Scripts& row) { row.approves_count++; });
      } else if (already_approved && !approved) {
         scripts.modify(script_item, get_self(), [&](Tables::Scripts& row) { row.approves_count--; });
      }
   }


   /// @brief
   /// Approve script execution.
   void Aggregion::approve(name provider, name owner, name script, name version) {
      upsert_approve(provider, owner, script, version, true);
   }


   /// @brief
   /// Deny script execution.
   void Aggregion::deny(name provider, name owner, name script, name version) {
      upsert_approve(provider, owner, script, version, false);
   }


   bool Aggregion::provider_has_approves(name provider) {
      approves_table_t approves{get_self(), provider.value};
      return approves.begin() != approves.end();
   }

   void Aggregion::remove_provider_scripts_approves(name provider) {
      require_auth(provider);

      providers_table_t providers{get_self(), Names::DefaultScope};
      providers.require_find(provider.value, "404. Unknown provider!");

      approves_table_t approves{get_self(), provider.value};
      while (true) {
         auto item = approves.begin();
         if (item == approves.end())
            break;

         // If we script was approved we must update (decrement)
         // corresponding script counter.
         // 1) Find the script item referenced by this approve item.
         // 2) Decrement counter.
         if (item->approved) {
            scripts_table_t scripts{get_self(), item->script_owner.value};
            auto script_item = scripts.require_find(item->script_id, "500. Approve has invalid reference to script item!");
            scripts.modify(script_item, get_self(), [&](Tables::Scripts& row) {
               row.approves_count--;
            });
         }

         // Erase the approve item.
         approves.erase(item);
      }
   }
}
