"""
String builder for formatting classroom search results.
"""
from telegram.constants import MessageLimit

MAX_MESSAGE_LENGTH = MessageLimit.MAX_TEXT_LENGTH


def room_builder_str(available_rooms, until):
    """
    Parse the list of available classrooms into multiple strings
    to not exceed Telegram's message length limit.
    """
    splitted_msg = []
    available_rooms_str = ""
    for building in available_rooms:
        if MAX_MESSAGE_LENGTH - len(available_rooms_str) <= 50:
            splitted_msg.append(available_rooms_str)
            available_rooms_str = ""
        available_rooms_str += "\n<b>{}</b>\n".format(building)
        for room in available_rooms[building]:
            emoji = "🔌" if room["powerPlugs"] else ""
            available_rooms_str += (
                ' <a href ="{}">{:^10}</a> ({} {}) {}\n'.format(
                    room["link"],
                    room["name"],
                    until,
                    room["until"],
                    emoji,
                )
            )

    splitted_msg.append(available_rooms_str)
    return splitted_msg
