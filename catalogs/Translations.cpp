#include "Translations.hpp"

namespace catalogs::langs {


   void ensure_language(name self, name lang) {
      uint64_t lang_id = 0;
      languages_table_t langs{self, Names::DefaultScope};
      auto it = langs.find(lang.value);
      if (it != langs.end())
         return;

      it = langs.emplace(self, [&](Tables::Languages& row) {
         row.lang = lang;
      });
   }

}
