#include "Messages.hpp"
#include <eosio/system.hpp>


namespace dmpusers {

   void Messages::insertmsg(Message message, uint64_t) {
      const auto sender = name{message.sender};
      const auto receiver = name{message.receiver};
      require_auth(sender);
      msgs_table_t messages{get_self(), Names::DefaultScope};
      auto it = messages.emplace(get_self(), [&](Tables::Messages& row) {
         row.id = messages.available_primary_key();
         row.message = message;
      });
      print("Success. Message ID: '", it->id, "' ");
      print("topic: '", it->message.topic, "' ");
      print("sender: '", it->message.sender, "' ");
      print("receiver: '", it->message.receiver, "' ");
   }


   void Messages::removemsg(uint64_t message_id) {
      msgs_table_t messages{get_self(), Names::DefaultScope};
      auto it = messages.require_find(message_id, "404. Message not found");
      const auto sender = it->message.sender;
      const auto receiver = it->message.receiver;
      check(has_auth(sender) || has_auth(receiver), "401. Access denied");
      messages.erase(it);
   }

}
