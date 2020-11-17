#include "RequestsLog.hpp"

namespace aggregion {


   /// @brief
   /// Add new 'request' item.
   void RequestsLog::sendreq(name sender, name receiver, int date, std::string request) {
      require_auth(Names::AggregionDmp);

      reqlog_table_t logreq{get_self(), Names::DefaultScope};
      auto idx = logreq.get_index<Names::RequestsLogIndex>();
      auto key = Tables::RequestsLog::makeKey(sender, receiver, date, request);
      auto lrit = idx.find(key);
      check(lrit == idx.end(), "403. Specified request is already exists!");

      auto id = logreq.available_primary_key();
      logreq.emplace(get_self(), [&](auto& row) {
         row.id = id;
         row.sender = sender;
         row.receiver = receiver;
         row.date = date;
         row.request = request;
      });
      print("Request was added. Sender:'", sender, "' Receiver:'", receiver, "' Date:'", date, "'. Id:", id);
   }
}
