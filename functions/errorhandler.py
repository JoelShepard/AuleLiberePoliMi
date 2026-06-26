"""
Error handling utilities for AuleLiberePoliMi bot.
"""
import html
import json
import logging
import traceback
import os
from os.path import join, dirname
from telegram import Update
from telegram.constants import ParseMode
from telegram.ext import ContextTypes


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Log errors and notify developer."""
    DEVELOPER_CHAT_ID = os.environ.get("DEVELOPER_CHAT_ID")

    logging.error(msg="Exception while handling an update:", exc_info=context.error)

    tb_list = traceback.format_exception(
        None, context.error, context.error.__traceback__
    )
    tb_string = "".join(tb_list)

    update_str = update.to_dict() if isinstance(update, Update) else str(update)
    message = (
        f"An exception was raised while handling an update\n"
        f"<pre>update = {html.escape(json.dumps(update_str, indent=2, ensure_ascii=False))}"
        "</pre>\n\n"
        f"<pre>context.chat_data = {html.escape(str(context.chat_data))}</pre>\n\n"
        f"<pre>context.user_data = {html.escape(str(context.user_data))}</pre>\n\n"
        f"<pre>{html.escape(tb_string)}</pre>"
    )

    if DEVELOPER_CHAT_ID:
        await context.bot.send_message(
            chat_id=DEVELOPER_CHAT_ID, text=message, parse_mode=ParseMode.HTML
        )


async def bonk(update: Update, texts: dict, lang: str) -> None:
    """Send error message and bonk photo when user uses invalid input."""
    await update.message.reply_text(texts[lang]["texts"]["error"])
    photo_path = join(dirname(dirname(__file__)), "photos", "bonk.jpg")
    with open(photo_path, "rb") as photo:
        await update.message.reply_photo(photo=photo)
