#pragma once

#include <eosio/eosio.hpp>


namespace aggregion {

   using eosio::name;

   bool is_provider(name self, name provider);
   bool provider_has_services(name self, name provider);

   void remove_provider_services(name self, name provider);
   void remove_provider_trusts(name self, name provider);
   void remove_provider_approves(name self, name provider);
   void remove_provider_accesses(name self, name provider);
   void remove_provider_enclave_accesses(name self, name provider);

}
