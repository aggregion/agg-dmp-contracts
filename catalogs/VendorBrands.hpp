#pragma once

#include "Names.hpp"
#include <eosio/eosio.hpp>
#include <libc/bits/stdint.h>
#include <optional>

namespace catalogs {

   struct Tables {

      struct [[eosio::table, eosio::contract("Catalogs")]] VendorBrands {
         uint64_t id;
         uint64_t vendor_id;
         uint64_t brand_id;

         uint64_t primary_key() const {
            return id;
         }

         static auto makeKey(uint64_t vendor_id, uint64_t brand_id) {
            return (static_cast<uint128_t>(vendor_id) << 64) + brand_id;
         }

         uint128_t key() const {
            return makeKey(vendor_id, brand_id);
         }
      };
   };

   using vendorbrands_index_t = indexed_by<Names::VendorBrandsIdx, const_mem_fun<Tables::VendorBrands, uint128_t, &Tables::VendorBrands::key>>;
   using vendorbrands_table_t = eosio::multi_index<Names::VendorBrandsTable, Tables::VendorBrands, vendorbrands_index_t>;


   struct [[eosio::contract("Catalogs")]] VendorBrands : contract {
      using contract::contract;

      [[eosio::action]] void venbrbind(uint64_t vendor_id, uint64_t brand_id);
      [[eosio::action]] void venbrunbind(uint64_t vendor_id, uint64_t brand_id);
   };
}
