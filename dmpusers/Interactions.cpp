#include "Interactions.hpp"
#include <eosio/system.hpp>


namespace dmpusers {

   void Interactions::insinteract(std::string owner, InteractionInfo const info, uint64_t /* nonce */) {
      require_auth(name{owner});
      interactions_table_t interactions{get_self(), Names::DefaultScope};
      auto idx = interactions.get_index<Names::InteractionsMainIndex>();
      auto key = Tables::Interactions::makeKey(owner, info.partner, info.interaction_type);
      check(idx.find(key) == idx.end(), "403. Interaction already exists");
      auto it = interactions.emplace(get_self(), [&](auto& row) {
         row.id = interactions.available_primary_key();
         row.owner = owner;
         row.info = info;
         row.enabled = true;
      });
      print("Success. Interaction ID:'", it->id, "', owner: '", it->owner, "' partner: '", it->info.partner, "'");
   }

   void Interactions::updinteract(std::string owner, uint64_t interaction_id, InteractionInfo const info, uint64_t /* nonce */) {
      require_auth(name{owner});
      interactions_table_t interactions{get_self(), Names::DefaultScope};
      auto it = interactions.require_find(interaction_id, "404. Interaction not found");
      auto idx = interactions.get_index<Names::InteractionsMainIndex>();
      auto key = Tables::Interactions::makeKey(owner, info.partner, info.interaction_type);
      check(idx.find(key) == idx.end(), "403. Duplicate interaction");
      interactions.modify(it, get_self(), [&](auto& row) {
         row.info = info;
      });
      print("Success. Interaction ID:'", it->id, "', owner: '", it->owner, "' partner: '", it->info.partner, "'");
   }

   void Interactions::intrctenble(std::string owner, uint64_t interaction_id, bool enable, uint64_t /* nonce */) {
      require_auth(name{owner});
      interactions_table_t interactions{get_self(), Names::DefaultScope};
      auto it = interactions.require_find(interaction_id, "404. Interaction not found");
      interactions.modify(it, get_self(), [&](auto& row) {
         row.enabled = enable;
      });
      print("Success. Interaction ID:'", it->id, "', enabled: '", it->enabled, "'");
   }

   void Interactions::reminteract(std::string owner, std::string partner, uint8_t interaction_type, uint64_t /* nonce */) {
      require_auth(name{owner});
      interactions_table_t interactions{get_self(), Names::DefaultScope};
      auto idx = interactions.get_index<Names::InteractionsMainIndex>();
      auto key = Tables::Interactions::makeKey(owner, partner, interaction_type);
      auto id = idx.require_find(key, "404. Interaction not found")->id;
      auto it = interactions.require_find(id, "500. Interaction not found");
      interactions.erase(it);
      print("Success. Interaction '", id, "' was removed");
   }

   void Interactions::remintrbyid(std::string owner, uint64_t interaction, uint64_t /* nonce */) {
      require_auth(name{owner});
      interactions_table_t interactions{get_self(), Names::DefaultScope};
      auto idx = interactions.get_index<Names::InteractionsMainIndex>();
      auto it = interactions.require_find(interaction, "404. Interaction not found");
      interactions.erase(it);
      print("Success. Interaction '", interaction, "' was removed");
   }

}
