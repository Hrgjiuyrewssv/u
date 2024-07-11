const { Badan, mode } = require('../lib/');
const { setMessage, getMessage, delMessage, getStatus, toggleStatus } = require("../lib/database");

Badan({
	pattern: "alive",
        fromMe: mode,
        desc: "alive message",
        type: "user",
}, async (message, match) => {
	let msg = await getMessage(message.client.user.id, "alive");
	if (match.toLowerCase() == 'get') {
		if (!msg) return await message.reply("_there is no alive set_");
		return await message.reply(msg.message);
	} else if (match.toLowerCase() == 'delete') {
		if (!msg) return await message.reply("_there is no alive set for delete_");
		await delMessage(message.client.user.id, "alive");
		return await message.reply("_alive deleted successfully_");
	} else if (match) {
		await setMessage(message.client.user.id, "alive", match);
        return await message.reply("_alive set successfully_");
	} else if (!match) {
		if (!msg) return await message.reply(`_there is no alive set_\nexample: `);
		return await message.sendAlive(message.jid)
	}
});

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

Badan({
	on: "all",
	fromMe: false,
	dontAddCommandList: true,
   },
   async(message)=> {
	let admins = message.sudo
    let mention = message.mention
    let isOwner = (admins.map((v) => mention.includes(v))).includes(true)
    if(isOwner) {
    await message.sendMention(message.jid)
	}
});
