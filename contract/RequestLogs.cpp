#include "Aggregion.hpp"

namespace dmp {


   /// @brief
   /// Add new log request.
   void Aggregion::requestlog(name sender, name receiver, int date, std::string request) {
      require_auth(sender);

      logreq_table_t logreq{get_self(), Names::DefaultScope};
      auto key = Tables::RequestLogs::makeKey(sender, receiver, date, request);
      auto idx = logreq.get_index<Names::RequestLogsIndex>();
      auto lrit = idx.find(key);
      check(lrit == idx.end(), "403. Log request already been queued!");

      auto id = logreq.available_primary_key();
      logreq.emplace(get_self(), [&](auto& row) {
         row.id = id;
         row.receiver = receiver;
         row.date = date;
         row.request = request;
      });
      print("Log request was queued from '", sender, "' to '", receiver, "' at '", date, "'. Id = ", id);
   }
}
