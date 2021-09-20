#pragma once

#include "Names.hpp"
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>

namespace dmpusers {

   struct UserInfo {
      std::string email;
      std::string firstname;
      std::string lastname;
      std::string data;
   };

   struct ProjectInfo {
      std::string sender_org_id;
      std::string data;
      std::string master_key;
   };

   struct DatasetInfo {
      std::string sender_org_id;
      std::string receiver_org_id;
      uint64_t updated_at;
      uint64_t bc_version;
      std::string data;
   };

   struct DatasetRequestInfo {
      std::string data;
      std::string receiver_org_id;
      uint64_t updated_at;
      uint64_t bc_version;
   };

   struct Tables {

      /// @brief
      /// Organizations table.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] Organizations {
         eosio::name name;
         std::string email;
         std::string description;

         auto primary_key() const {
            return name.value;
         }
      };

      /// @brief
      /// Users table.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] Users {
         eosio::name id;
         UserInfo info;

         auto primary_key() const {
            return id.value;
         }
      };

      /// @brief
      /// Public keys table.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] PublicKeys {
         eosio::name owner;
         std::string key;

         auto primary_key() const {
            return owner.value;
         }
      };

      /// @brief
      /// OrgsV2.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] OrgsV2 {
         eosio::name id;
         std::string data;
         std::string public_key;
         uint64_t updated_at;
         uint64_t bc_version;

         auto primary_key() const {
            return id.value;
         }
      };

      /// @brief
      /// Projects.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] Projects {
         eosio::name id;
         std::string receiver_org_id;
         uint64_t updated_at;
         ProjectInfo info;

         auto primary_key() const {
            return id.value;
         }

         auto by_receiver() const {
            return name{receiver_org_id}.value;
         }

         static auto makeKey(std::string receiver_or_id, uint64_t updated_at) {
            std::string value;
            value.append(receiver_or_id);
            value.append("-");
            value.append(std::to_string(updated_at));
            return sha256(value.data(), value.size());
         }

         auto by_receiver_an_updated_at() const {
            return makeKey(receiver_org_id, updated_at);
         }
      };

      /// @brief
      /// Datasets.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] Datasets {
         eosio::name id;
         DatasetInfo info;

         auto primary_key() const {
            return id.value;
         }

         auto by_updated_at() const {
            return info.updated_at;
         }

         auto by_sender() const {
            return name{info.sender_org_id}.value;
         }

         auto by_receiver() const {
            return name{info.receiver_org_id}.value;
         }
      };

      /// @brief
      /// Dataset requests.
      /// Scope: Default.
      struct [[eosio::table, eosio::contract("Dmpusers")]] DsRequests {
         eosio::name id;
         DatasetRequestInfo info;

         auto primary_key() const {
            return id.value;
         }

         static auto makeKey(std::string receiver_or_id, uint64_t updated_at) {
            std::string value;
            value.append(receiver_or_id);
            value.append("-");
            value.append(std::to_string(updated_at));
            return sha256(value.data(), value.size());
         }

         auto by_receiver_an_updated_at() const {
            return makeKey(info.receiver_org_id, info.updated_at);
         }
      };
   };


   /// @brief
   /// Aggregion DMP organizations and users smart contract.
   struct [[eosio::contract("Dmpusers")]] Dmpusers : contract {

      enum class UpsertCheck {
         UserMustNotExists,
         UserMustExists,
      };

      using contract::contract;

      using users_table_t = eosio::multi_index<Names::UsersTable, Tables::Users>;
      using org_table_t = eosio::multi_index<Names::OrganizationsTable, Tables::Organizations>;
      using pkeys_table_t = eosio::multi_index<Names::PublicKeysTable, Tables::PublicKeys>;
      using orgsv2_table_t = eosio::multi_index<Names::OrganizationsTableV2, Tables::OrgsV2>;

      using projects_byreceiver_index_t = indexed_by<Names::ProjectsTableByReceiver, const_mem_fun<Tables::Projects, uint64_t, &Tables::Projects::by_receiver>>;
      using projects_byreceiverupat_index_t =
          indexed_by<Names::ProjectsTableByReceiverAndUpdateAt, const_mem_fun<Tables::Projects, checksum256, &Tables::Projects::by_receiver_an_updated_at>>;
      using projects_table_t = eosio::multi_index<Names::ProjectsTable, Tables::Projects, projects_byreceiver_index_t, projects_byreceiverupat_index_t>;

      using datasets_byupdat_index_t = indexed_by<Names::DatasetsTableByUpdateAt, const_mem_fun<Tables::Datasets, uint64_t, &Tables::Datasets::by_updated_at>>;
      using datasets_bysendr_index_t = indexed_by<Names::DatasetsTableBySender, const_mem_fun<Tables::Datasets, uint64_t, &Tables::Datasets::by_sender>>;
      using datasets_byrecvr_index_t = indexed_by<Names::DatasetsTableByReceiver, const_mem_fun<Tables::Datasets, uint64_t, &Tables::Datasets::by_receiver>>;
      using datasets_table_t =
          eosio::multi_index<Names::DatasetsTable, Tables::Datasets, datasets_byupdat_index_t, datasets_bysendr_index_t, datasets_byrecvr_index_t>;

      using dsreqs_byreceiverupat_index_t =
          indexed_by<Names::DsReqsTableByReceiverAndUpdateAt, const_mem_fun<Tables::DsRequests, checksum256, &Tables::DsRequests::by_receiver_an_updated_at>>;
      using dsreqs_table_t = eosio::multi_index<Names::DsReqsTable, Tables::DsRequests, dsreqs_byreceiverupat_index_t>;


      [[eosio::action]] void upsertorg(eosio::name name, std::string email, std::string description);
      [[eosio::action]] void removeorg(eosio::name name);

      [[eosio::action]] void registeruser(eosio::name user, UserInfo info);
      [[eosio::action]] void updateuser(eosio::name user, UserInfo info);
      [[eosio::action]] void removeuser(eosio::name user);

      [[eosio::action]] void upsertpkey(eosio::name owner, std::string key);
      [[eosio::action]] void removepkey(eosio::name owner);

      [[eosio::action]] void upsertorgv2(std::string org_id, std::string data, std::string public_key, uint64_t updated_at, uint64_t bc_version);
      [[eosio::action]] void upsproject(std::string project_id, std::string receiver_org_id, uint64_t updated_at, ProjectInfo info);
      [[eosio::action]] void upsdataset(std::string dataset_id, DatasetInfo info);
      [[eosio::action]] void upsdsreq(std::string dsreq_id, DatasetRequestInfo info);

   private:
      void upsertuser(UpsertCheck upsertCheck, eosio::name user, const UserInfo& info);
   };
}