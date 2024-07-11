Badan({
	pattern: "mention",
    fromMe: true,
    desc: "mention message",
    type: "user",
}, async (message, match) => {
    let status = await getStatus(message.client.user.id, "mention");
    let stat = status ? "on" : "off";
    let replyMsg = `Bot Mention Manager\n\nStatus: ${stat}\n\nAvailable Actions:\n\n- mention get: Get the mention message\n- mention on: Enable mention message\n- mention off: Disable mention message\n- mention delete: Delete the mention message`;

    if (!match) {
      return await message.reply(replyMsg);
    }
    if (match.toLowerCase() == 'get') {
      let msg = await getMessage(message.client.user.id, "mention");
      if (!msg) return await message.reply("_There is no mention set_");
      return message.reply(msg.message);
    }
    if (match.toLowerCase() == 'on' && stat == "off") {
      await toggleStatus(message.client.user.id, "mention", true);
      return await message.reply("_Mention enabled_");
    }
    if (match.toLowerCase() == 'off' && stat == "on") {
      await toggleStatus(message.client.user.id, "mention", false);
      return await message.reply("_Mention disabled_");
    }
    if (match.toLowerCase() == 'delete') {
      await delMessage(message.client.user.id, "mention");
      return await message.reply("_Mention deleted successfully_");
    }
    await setMessage(message.client.user.id, "mention", match);
    return await message.reply("_Mention set successfully_");
  }
);
