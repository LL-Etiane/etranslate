require("dotenv").config()
const { Telegraf } = require("telegraf");
const translate = require("@vitalets/google-translate-api");
const express = require("express");
const axios = require("axios").default;

const app = express();

const bot = new Telegraf(process.env.BOT_TOKEN);
const PORT = process.env.PORT || 4000;

bot.start((ctx) => {
  ctx.reply(
    `Hello ${ctx.update.message.from.first_name}. I can help you translate from english to frech and french to english. use /vt to translate a message`
  );
});

//translate command
bot.command("vt", async (ctx) => {
  if (ctx.update.message.reply_to_message) {
    var message = ctx.update.message.reply_to_message.text;
    var message_id = ctx.update.message.reply_to_message.message_id;
  } else {
    var message = ctx.update.message.text.substring(
      3,
      ctx.update.message.text.length
    );
    var message_id = ctx.update.message.message_id;
  }

  //check if message exceed 5000 characters
  if (message.length >= 5000) {
    return ctx.reply("Maximum text limit of 5000 exceeded", {
      reply_to_message_id: message_id,
    });
  }

  //translation logic
  try {
    let message_translated = await translate(message, { to: "fr" });

    // check to see the language the user sent message in and then know which language to translate to
    if (message_translated.from.language.iso === "en") {
      ctx.reply(message_translated.text, {
        reply_to_message_id: message_id,
      });
    } else if (message_translated.from.language.iso === "fr") {
      let message_translated_french = await translate(message, { to: "en" });
      ctx.reply(message_translated_french.text, {
        reply_to_message_id: message_id,
      });
    }
  } catch (error) {
    ctx.reply("There was a problem translating please try again later", {
      reply_to_message_id: message_id,
    });
  }
});

//start the bot
bot.launch();

//express server
app.get("/", (req, res) => {
  res.send("Bot running now");
});

app.listen(PORT, () => {
  console.log("Server Running");
});


// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
