#include "Aggregion.hpp"

namespace dmp {

   template<typename TARGET>
   void clear_table(name owner, uint64_t scope) {
      TARGET table{owner, scope};
      while (true) {
         auto it = table.begin();
         if (it == table.end())
            break;
         table.erase(it);
      }
   }

   void Aggregion::erasescope(name scope) {
      require_auth(Names::Contract);

      clear_table<approves_table_t>(get_self(), scope.value);
      clear_table<scripts_table_t>(get_self(), scope.value);
      clear_table<services_table_t>(get_self(), scope.value);
      clear_table<providers_table_t>(get_self(), scope.value);
      print("Data was removed");
   }

}
