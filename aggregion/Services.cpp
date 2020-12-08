#include "Aggregion.hpp"


namespace aggregion {

   /// @brief
   /// Register provider service.
   void Aggregion::addsvc(std::string provider, std::string service, ServiceInfo info) {
      const auto p = name{provider};
      const auto s = name{service};
      require_auth(p);

      providers_table_t providers{get_self(), Names::DefaultScope};
      providers.require_find(p.value, "404. Unknown provider!");

      services_table_t services{get_self(), p.value};
      auto sit = services.find(s.value);
      check(sit == services.end(), "403. Provider service already registered!");

      services.emplace(get_self(), [&](Tables::Service& row) {
         row.service = s;
         row.info = info;
      });
      print("Provider service '", service, "' was added to '", provider, "'");
   }


   /// @brief
   /// Update provider service.
   void Aggregion::updsvc(name provider, name service, ServiceInfo info) {
      require_auth(provider);

      providers_table_t providers{get_self(), Names::DefaultScope};
      providers.require_find(provider.value, "404. Unknown provider!");

      services_table_t services{get_self(), provider.value};
      auto sit = services.require_find(service.value, "404. Provider service not found!");

      services.modify(sit, get_self(), [&](Tables::Service& row) {
         row.info = info;
      });
      print("Provider '", provider, "' service '", service, "' was updated.");
   }


   /// @brief
   /// Remove provider service.
   void Aggregion::remsvc(name provider, name service) {
      require_auth(provider);

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
      require_auth(provider);

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