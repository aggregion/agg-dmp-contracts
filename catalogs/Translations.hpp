#pragma once

#include "Names.hpp"
#include <eosio/eosio.hpp>

namespace catalogs::langs {

   struct Tables {

      struct [[eosio::table, eosio::contract("Catalogs")]] Languages {
         name lang;

         auto primary_key() const {
            return lang.value;
         }
      };
   };

   using languages_table_t = eosio::multi_index<Names::LanguagesTable, Tables::Languages>;

   void ensure_language(name self, name lang);

   template <typename TRANS_TABLE>
   void remove_translations(name self, uint64_t id) {
      languages_table_t langs{self, Names::DefaultScope};
      for (const auto& lit : langs) {
         TRANS_TABLE trans{self, lit.lang.value};
         auto tit = trans.find(id);
         if (tit == trans.end())
            continue;
         trans.erase(tit);
      }
   }

   template <typename TRANS_TABLE>
   void upsert_translation(name self, uint64_t id, std::string lang, std::string name) {
      require_auth(Names::Contract);

      auto langname = eosio::name{lang};
      langs::ensure_language(self, langname);

      TRANS_TABLE trans{self, langname.value};
      auto tit = trans.find(id);
      if (tit == trans.end()) {
         tit = trans.emplace(self, [&](auto& row) {
            row.id = id;
            row.name = name;
         });
      } else {
         trans.modify(tit, self, [&](auto& row) {
            row.name = name;
         });
      }
   }

}
