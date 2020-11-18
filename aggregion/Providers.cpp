#include "Aggregion.hpp"


namespace aggregion {

   /// @brief
   /// Register service provider.
   void Aggregion::regprov(name provider, std::string description) {
      require_auth(Names::AggregionDmp);

      providers_table_t providers{get_self(), Names::DefaultScope};
      check(providers.find(provider.value) == providers.end(), "403. Provider already registered!");

      providers.emplace(get_self(), [&](auto& row) {
         row.provider = provider;
         row.description = description;
      });
      print("New provider was registered '", provider, "'");
   }


   /// @brief
   /// Update provider description.
   void Aggregion::updprov(name provider, std::string description) {
      require_auth(Names::AggregionDmp);

      providers_table_t providers{get_self(), Names::DefaultScope};
      auto it = providers.require_find(provider.value, "404. Unknown provider!");

      providers.modify(it, get_self(), [&](auto& row) { row.description = description; });
      print("Provider '", provider, "' description was changed to '", description, "'");
   }


   /// @brief
   /// Unregister service provider.
   void Aggregion::unregprov(name provider) {
      require_auth(Names::AggregionDmp);

      providers_table_t providers{get_self(), Names::DefaultScope};
      auto it = providers.require_find(provider.value, "404. Unknown provider!");

      remove_provider_services(provider);

      // check(!provider_has_services(provider), "Provider has refs to services. Remove services first!");
      // check(!provider_has_approves(provider), "Provider has refs to approves. Remove approves first!");

      providers.erase(it);
      print("Provider '", provider, "' was unregistered.");
   }
}
