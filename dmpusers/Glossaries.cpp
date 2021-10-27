#include "Glossaries.hpp"
#include <eosio/system.hpp>


namespace dmpusers {

   void Glossaries::upsglossary(std::string glossary_id, GlossariesInfo info) {
      const auto glossary = name{glossary_id};
      const auto sender = name{info.sender_org_id};
      require_auth(sender);

      glossaries_table_t glossaries{get_self(), Names::DefaultScope};
      auto it = glossaries.find(glossary.value);

      if (it == glossaries.end()) {
         glossaries.emplace(get_self(), [&](Tables::Glossaries& row) {
            row.id = glossary;
            row.info = info;
         });
      } else {
         check(it->info.sender_org_id == info.sender_org_id, "401. Access denied");
         check(it->info.bc_version < info.bc_version, "403. Version too old");
         glossaries.modify(it, get_self(), [&](Tables::Glossaries& row) {
            row.info = info;
         });
      }
      print("Success. Glossary: '", glossary_id, "' sender: '", info.sender_org_id, "' receiver: '", info.receiver_org_id);
   }

   void Glossaries::remglossary(std::string glossary_id, std::string sender_org_id) {
      const auto glossary = name{glossary_id};
      const auto sender = name{sender_org_id};
      require_auth(sender);
      glossaries_table_t glossaries{get_self(), Names::DefaultScope};
      auto it = glossaries.require_find(glossary.value, "404. Glossary not found");
      check(name{it->info.sender_org_id} == sender, "401. Access denied");
      glossaries.erase(it);
      print("Success. Removed glossary: '", glossary);
   }
}
