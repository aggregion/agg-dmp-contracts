#include "Providers.hpp"


namespace aggregion {

   /// @brief
   /// Register service provider.
   void Aggregion::regprov(std::string provider, std::string description) {
      const auto p = name{provider};
      check(has_auth(p) || has_auth(get_self()), "missing authority");

      providers_table_t providers{get_self(), Names::DefaultScope};
      check(providers.find(p.value) == providers.end(), "403. Provider already registered!");

      providers.emplace(get_self(), [&](auto& row) {
         row.provider = p;
         row.description = description;
      });
      print("New provider was registered '", p, "'");
   }


   /// @brief
   /// Update provider description.
   void Aggregion::updprov(name provider, std::string description) {
      check(has_auth(provider) || has_auth(get_self()), "missing authority");

      providers_table_t providers{get_self(), Names::DefaultScope};
      auto it = providers.require_find(provider.value, "404. Unknown provider!");

      providers.modify(it, get_self(), [&](auto& row) {
         row.description = description;
      });
      print("Provider '", provider, "' description was changed to '", description, "'");
   }


   /// @brief
   /// Unregister service provider.
   void Aggregion::unregprov(name provider) {
      check(has_auth(provider) || has_auth(get_self()), "missing authority");

      providers_table_t providers{get_self(), Names::DefaultScope};
      auto it = providers.require_find(provider.value, "404. Unknown provider!");

      remove_provider_services(provider);

      // check(!provider_has_services(provider), "Provider has refs to services. Remove services first!");
      // check(!provider_has_approves(provider), "Provider has refs to approves. Remove approves first!");

      providers.erase(it);
      print("Provider '", provider, "' was unregistered.");
   }


   bool is_provider(name self, name provider) {
      Aggregion::providers_table_t providers{self, Names::DefaultScope};
      return providers.find(provider.value) != providers.end();
   }
}
