#include "ScriptAccessRules.hpp"
#include "Scripts.hpp"
#include "Utility.hpp"

namespace aggregion {

   namespace sar {

      void upsert_trust(name self, name truster, name trustee, bool trust) {
         require_auth(truster);

         check(is_provider(self, truster), "404. Provider (truster) not found");
         check(is_provider(self, trustee), "404. Provider (trustee) not found");

         trusted_providers_table_t trusted{self, truster.value};
         auto it = trusted.find(trustee.value);
         if (it == trusted.end()) {
            trusted.emplace(self, [&](Tables::TrustedProviders& row) {
               row.provider = trustee;
               row.trust = trust;
            });
         } else {
            trusted.modify(it, self, [&](Tables::TrustedProviders& row) {
               row.trust = trust;
            });
         }
         print("Success. Truster:'", truster, "' Trustee:'", trustee, "' Trust:'", trust, "'");
      }


      void upsert_execution_approve(name self, name provider, checksum256 script_hash, bool approve) {
         require_auth(provider);

         check(is_provider(self, provider), "404. Provider not found");

         auto script_id = scripts::get_script_id(self, script_hash);
         check(script_id.has_value(), "404. Script not found by given hash");

         script_approves_table_t approves{self, provider.value};
         auto it = approves.find(script_id.value());
         if (it == approves.end()) {
            approves.emplace(self, [&](Tables::ScriptApproves& row) {
               row.script_id = script_id.value();
               row.approved = approve;
            });
         } else {
            approves.modify(it, self, [&](Tables::ScriptApproves& row) {
               row.approved = approve;
            });
         }

         scripts::scripts_table_t scripts{self, Names::DefaultScope};
         auto sit = scripts.require_find(script_id.value(), "500. Script not found");
         scripts.modify(sit, self, [&](scripts::Tables::Scripts& row) {
            row.approves_count += (approve ? 1 : -1);
         });

         print("Success. Provider:'", provider, "' Script hash:'", script_hash, "' Approved:'", approve, "'");
      }


      void upsert_script_access(name self, name owner, checksum256 script_hash, name grantee, bool granted) {
         require_auth(owner);

         check(is_provider(self, grantee), "404. Provider (grantee) not found");

         auto script_id = scripts::get_script_id(self, script_hash);
         check(script_id.has_value(), "404. Script not found by given hash");

         scripts::scripts_table_t scripts{self, Names::DefaultScope};
         auto sit = scripts.require_find(script_id.value(), "500. Script not found");
         check(sit->owner == owner, "403. Script owner mismatch");

         script_access_table_t access{self, grantee.value};
         auto it = access.find(script_id.value());
         if (it == access.end()) {
            access.emplace(self, [&](Tables::ScriptsAccess& row) {
               row.script_id = script_id.value();
               row.granted = granted;
            });
         } else {
            access.modify(it, self, [&](Tables::ScriptsAccess& row) {
               row.granted = granted;
            });
         }
         print("Success. Owner:'", owner, "' Script hash:'", script_hash, "' Grant access:'", granted, "'");
      }

      void ScriptAccessRules::encscraccess(std::string enclave_owner, checksum256 script_hash, std::string grantee, bool granted) {
         const auto eo = name{enclave_owner};
         const auto g = name{grantee};
         require_auth(eo);
         auto script_id = scripts::get_script_id(get_self(), script_hash);
         check(script_id.has_value(), "404. Script not found by given hash");

         enclave_script_access_table_t esa{get_self(), eo.value};
         auto it = esa.find(script_id.value());

         if (it == esa.end()) {
            it = esa.emplace(get_self(), [&](Tables::EnclaveScriptsAccess& row) {
               row.script_id = script_id.value();
            });
         }
         esa.modify(it, get_self(), [&](Tables::EnclaveScriptsAccess& row) {
            row.permissions[g] = granted;
         });
         print("Success. Enclave owner:'", eo, "' Script hash:'", script_hash, "' Grant access:'", granted, "' to '", g, "'");
      }


      void ScriptAccessRules::trust(std::string truster, std::string trustee) {
         upsert_trust(get_self(), name{truster}, name{trustee}, true);
      }

      void ScriptAccessRules::untrust(std::string truster, std::string trustee) {
         upsert_trust(get_self(), name{truster}, name{trustee}, false);
      }

      void ScriptAccessRules::execapprove(std::string provider, checksum256 hash) {
         upsert_execution_approve(get_self(), name{provider}, hash, true);
      }

      void ScriptAccessRules::execdeny(std::string provider, checksum256 hash) {
         upsert_execution_approve(get_self(), name{provider}, hash, false);
      }

      void ScriptAccessRules::grantaccess(std::string owner, checksum256 hash, std::string grantee) {
         upsert_script_access(get_self(), name{owner}, hash, name{grantee}, true);
      }

      void ScriptAccessRules::denyaccess(std::string owner, checksum256 hash, std::string grantee) {
         upsert_script_access(get_self(), name{owner}, hash, name{grantee}, false);
      }

   }

   void remove_provider_trusts(name self, name provider) {
      sar::trusted_providers_table_t trusted{self, provider.value};
      while (true) {
         auto it = trusted.begin();
         if (it == trusted.end())
            break;
         trusted.erase(it);
      }
   }

   void remove_provider_approves(name self, name provider) {
      sar::script_approves_table_t approves{self, provider.value};
      while (true) {
         auto it = approves.begin();
         if (it == approves.end())
            break;
         approves.erase(it);
      }
   }

   void remove_provider_accesses(name self, name provider) {
      sar::script_access_table_t access{self, provider.value};
      while (true) {
         auto it = access.begin();
         if (it == access.end())
            break;
         access.erase(it);
      }
   }

   void remove_provider_enclave_accesses(name self, name provider) {
      sar::enclave_script_access_table_t esa{self, provider.value};
      while (true) {
         auto it = esa.begin();
         if (it == esa.end())
            break;
         esa.erase(it);
      }
   }

}
