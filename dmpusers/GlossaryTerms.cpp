#include "GlossaryTerms.hpp"
#include <eosio/system.hpp>


namespace dmpusers {

   void GlossaryTerms::upsglterm(std::string glossary_term_id, GlossaryTermsInfo info) {
      const auto glossary_term = name{glossary_term_id};
      const auto sender = name{info.sender_org_id};
      require_auth(sender);

      glterms_table_t terms{get_self(), Names::DefaultScope};
      auto it = terms.find(glossary_term.value);

      if (it == terms.end()) {
         terms.emplace(get_self(), [&](Tables::GlossaryTerms& row) {
            row.id = glossary_term;
            row.info = info;
         });
      } else {
         check(it->info.sender_org_id == info.sender_org_id, "401. Access denied");
         check(it->info.bc_version < info.bc_version, "403. Version too old");
         terms.modify(it, get_self(), [&](Tables::GlossaryTerms& row) {
            row.info = info;
         });
      }
      print("Success. Glossary term: '", glossary_term_id, "' sender: '", info.sender_org_id, "' receiver: '", info.receiver_org_id);
   }

   void GlossaryTerms::remglterm(std::string glossary_term_id, std::string sender_org_id) {
      const auto glossary_term = name{glossary_term_id};
      const auto sender = name{sender_org_id};
      require_auth(sender);
      glterms_table_t terms{get_self(), Names::DefaultScope};
      auto it = terms.require_find(glossary_term.value, "404. Glossary term not found");
      check(name{it->info.sender_org_id} == sender, "401. Access denied");
      terms.erase(it);
      print("Success. Removed glossary term: '", glossary_term);
   }
}
