#include "ScriptAccessRules.hpp"
#include "Scripts.hpp"

namespace aggregion::sar {


   void upsert_trust(name self, name truster, name trustee, bool trust) {
      require_auth(Names::AggregionDmp); // truster
      // TODO: check that truster and trustee is providers
      Tables::trusted_providers_table_t trusted{self, truster.value};
      auto it = trusted.find(trustee.value);
      if (it == trusted.end()) {
         trusted.emplace(self, [&](Def::TrustedProviders& row) {
            row.provider = trustee;
            row.trust = trust;
         });
      } else {
         trusted.modify(it, self, [&](Def::TrustedProviders& row) { row.trust = trust; });
      }
      print("Success. Truster:'", truster, "' Trustee:'", trustee, "' Trust:'", trust, "'");
   }


   void upsert_execution_approve(name self, name provider, checksum256 script_hash, bool approve) {
      require_auth(Names::AggregionDmp); // provider
      // TODO:
      // 1. check that provider is real provider
      auto script_id = scripts::get_script_id(self, script_hash);
      check(script_id.has_value(), "404. Script not found by given hash");

      Tables::script_approves_table_t approves{self, provider.value};
      auto it = approves.find(script_id.value());
      if (it == approves.end()) {
         approves.emplace(self, [&](Def::ScriptApproves& row) {
            row.script_id = script_id.value();
            row.approved = approve;
         });
      } else {
         approves.modify(it, self, [&](Def::ScriptApproves& row) { row.approved = approve; });
      }

      scripts::Tables::scripts_table_t scripts{self, Names::DefaultScope};
      auto sit = scripts.require_find(script_id.value(), "500. Script not found");
      scripts.modify(sit, self, [&](scripts::Def::Scripts& row) { row.approves_count += (approve ? 1 : -1); });

      print("Success. Provider:'", provider, "' script hash:'", script_hash, "' approved:'", approve, "'");
   }


   void upsert_script_access(name self, name owner, checksum256 script_hash, name grantee, bool granted) {
      require_auth(Names::AggregionDmp); // provider
      auto script_id = scripts::get_script_id(self, script_hash);
      check(script_id.has_value(), "404. Script not found by given hash");

      scripts::Tables::scripts_table_t scripts{self, Names::DefaultScope};
      auto sit = scripts.require_find(script_id.value(), "500. Script not found");
      check(sit->owner == owner, "403. Script owner mismatch");

      Tables::script_access_table_t access{self, grantee.value};
      auto it = access.find(script_id.value());
      if (it == access.end()) {
         access.emplace(self, [&](Def::ScriptsAccess& row) {
            row.script_id = script_id.value();
            row.granted = granted;
         });
      } else {
         access.modify(it, self, [&](Def::ScriptsAccess& row) { row.granted = granted; });
      }
      print("Success. Owner:'", owner, "' script hash:'", script_hash, "' grant access:'", granted, "'");
   }


   void ScriptAccessRules::trust(name truster, name trustee) {
      require_auth(Names::AggregionDmp); // truster
      upsert_trust(get_self(), truster, trustee, true);
   }

   void ScriptAccessRules::untrust(name truster, name trustee) {
      require_auth(Names::AggregionDmp); // truster
      upsert_trust(get_self(), truster, trustee, false);
   }

   void ScriptAccessRules::execapprove(name provider, checksum256 hash) {
      require_auth(Names::AggregionDmp); // provider
      upsert_execution_approve(get_self(), provider, hash, true);
   }

   void ScriptAccessRules::execdeny(name provider, checksum256 hash) {
      require_auth(Names::AggregionDmp); // provider
      upsert_execution_approve(get_self(), provider, hash, false);
   }

   void ScriptAccessRules::grantaccess(name owner, checksum256 hash, name grantee) {
      require_auth(Names::AggregionDmp); // owner
      upsert_script_access(get_self(), owner, hash, grantee, true);
   }

   void ScriptAccessRules::denyaccess(name owner, checksum256 hash, name grantee) {
      require_auth(Names::AggregionDmp); // owner
      upsert_script_access(get_self(), owner, hash, grantee, false);
   }
}
