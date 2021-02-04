#include "RequestsLog.hpp"

namespace aggregion {


   /// @brief
   /// Add new 'request' item.
   void RequestsLog::sendreq(std::string sender, std::string receiver, int date, std::string request) {
      const auto s = name{sender};
      const auto r = name{receiver};
      require_auth(s);

      reqlog_table_t logreq{get_self(), Names::DefaultScope};
      auto idx = logreq.get_index<Names::RequestsLogIndex>();
      auto key = Tables::RequestsLog::makeKey(s, r, date, request);
      auto lrit = idx.find(key);
      check(lrit == idx.end(), "403. Specified request is already exists!");

      auto id = logreq.available_primary_key();
      logreq.emplace(get_self(), [&](auto& row) {
         row.id = id;
         row.sender = s;
         row.receiver = r;
         row.date = date;
         row.request = request;
      });
      print("Request was added. Sender:'", s, "' Receiver:'", r, "' Date:'", date, "'. Id:", id);
   }
}
