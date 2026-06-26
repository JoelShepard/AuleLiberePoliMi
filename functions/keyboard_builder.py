"""
Keyboard builder for AuleLiberePoliMi bot.
Generates ReplyKeyboards for the conversation flow.

IMPORTANT: The ⚙️Preferenze button is a KeyboardButton with web_app type.
This is REQUIRED for Telegram.WebApp.sendData() to work.
InlineKeyboardButton with web_app does NOT support sendData().
"""
import pytz
from datetime import datetime, timedelta
from search.find_classrooms import MAX_TIME, MIN_TIME
from telegram import KeyboardButton, WebAppInfo


class KeyboadBuilder:

    def __init__(self, texts, location_dict, webapp_url: str = ""):
        self.texts = texts
        self.location_dict = location_dict
        self.webapp_url = webapp_url

    def initial_keyboard(self, lang):
        """
        Main menu ReplyKeyboard.
        ⚙️Preferenze is a web_app button so Telegram.WebApp.sendData() works.
        """
        prefs_label = self.texts[lang]["keyboards"]["preferences"]
        if self.webapp_url:
            prefs_button = KeyboardButton(
                prefs_label, web_app=WebAppInfo(url=self.webapp_url)
            )
        else:
            prefs_button = KeyboardButton(prefs_label)

        return [
            [KeyboardButton(self.texts[lang]["keyboards"]["search"])],
            [KeyboardButton(self.texts[lang]["keyboards"]["now"])],
            [
                KeyboardButton(self.texts[lang]["keyboards"]["info"]),
                prefs_button,
            ],
        ]

    def location_keyboard(self, lang):
        """Campus selection keyboard."""
        return [[KeyboardButton(self.texts[lang]["keyboards"]["cancel"])]] + [
            [KeyboardButton(x)] for x in self.location_dict
        ]

    def day_keyboard(self, lang):
        """Day selection keyboard (today + next 6 days)."""
        now = datetime.now(pytz.timezone("Europe/Rome"))
        return [[KeyboardButton(self.texts[lang]["keyboards"]["cancel"])]] + [
            [
                KeyboardButton(
                    (now + timedelta(days=x)).strftime("%d/%m/%Y")
                    if x > 1
                    else (
                        self.texts[lang]["keyboards"]["today"]
                        if x == 0
                        else self.texts[lang]["keyboards"]["tomorrow"]
                    )
                )
            ]
            for x in range(7)
        ]

    def start_time_keyboard(self, lang):
        """Start time selection keyboard."""
        return [[KeyboardButton(self.texts[lang]["keyboards"]["cancel"])]] + [
            [KeyboardButton(str(x))] for x in range(MIN_TIME, MAX_TIME)
        ]

    def end_time_keyboard(self, lang, start_time):
        """End time selection keyboard."""
        return [[KeyboardButton(self.texts[lang]["keyboards"]["cancel"])]] + [
            [KeyboardButton(str(x))] for x in range(start_time + 1, MAX_TIME + 1)
        ]
