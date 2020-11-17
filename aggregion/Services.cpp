#include "Aggregion.hpp"


namespace aggregion {

   /// @brief
   /// Register provider service.
   void Aggregion::addsvc(name provider, name service, std::string description, std::string protocol, std::string type, std::string endpoint) {
      require_auth(Names::AggregionDmp);

      providers_table_t providers{get_self(), Names::DefaultScope};
      providers.require_find(provider.value, "404. Unknown provider!");

      services_table_t services{get_self(), provider.value};
      auto sit = services.find(service.value);
      check(sit == services.end(), "403. Provider service already registered!");

      services.emplace(get_self(), [&](Tables::Service& row) {
         row.service = service;
         row.description = description;
         row.protocol = protocol;
         row.type = type;
         row.endpoint = endpoint;
      });
      print("Provider service '", service, "' was added to '", provider, "'");
   }


   /// @brief
   /// Update provider service.
   void Aggregion::updsvc(name provider, name service, std::string description, std::string protocol, std::string type, std::string endpoint) {
      require_auth(Names::AggregionDmp);

      providers_table_t providers{get_self(), Names::DefaultScope};
      providers.require_find(provider.value, "404. Unknown provider!");

      services_table_t services{get_self(), provider.value};
      auto sit = services.require_find(service.value, "404. Provider service not found!");

      services.modify(sit, get_self(), [&](Tables::Service& row) {
         row.description = description;
         row.protocol = protocol;
         row.type = type;
         row.endpoint = endpoint;
      });
      print("Provider '", provider, "' service '", service, "' was updated.");
   }


   /// @brief
   /// Remove provider service.
   void Aggregion::remsvc(name provider, name service) {
      require_auth(Names::AggregionDmp);

      providers_table_t providers{get_self(), Names::DefaultScope};
      auto pit = providers.find(provider.value);
      check(pit != providers.end(), "404. Unknown provider!");

      services_table_t services{get_self(), provider.value};
      auto sit = services.require_find(service.value, "404. Unknown provider service!");

      services.erase(sit);
      print("Provider service '", service, "' was removed from '", provider, "'");
   }


   bool Aggregion::provider_has_services(name provider) {
      services_table_t services{get_self(), provider.value};
      return services.begin() != services.end();
   }


   void Aggregion::remove_provider_services(name provider) {
      require_auth(Names::AggregionDmp);

      providers_table_t providers{get_self(), Names::DefaultScope};
      providers.require_find(provider.value, "404. Unknown provider!");

      services_table_t services{get_self(), provider.value};
      while (true) {
         auto it = services.begin();
         if (it == services.end())
            break;
         services.erase(it);
      }
   }
}