const { Badan, mode, formatTime, numToJid } = require('../lib/');
const { ANTI_DELETE, SUDO } = require("../config")

Badan({
	pattern: 'ping ?(.*)',
	fromMe: mode,
	desc: 'Bot response in milliseconds.',
	type: 'info'
}, async (message) => {
	const start = new Date().getTime();
	const msg = await message.reply('*ᴩɪɴɢ...*');
	const end = new Date().getTime();
	const responseTime = end - start;
	await message.reply(`*pong!*\nʟᴀᴛᴇɴᴄʏ: ${responseTime}ms`);
});

Badan({
	pattern: 'jid',
	fromMe: mode,
	desc: 'To get remoteJid',
	type: 'whatsapp'
}, async (message) => {
	await message.reply(message.mention[0] ? message.mention[0] : message.reply_message ? message.reply_message.sender : message.jid)
});


Badan({
	pattern: 'uptime',
	fromMe: mode,
	desc: 'Get bots runtime',
	type: 'info'
}, async (message) => {
	await message.reply(formatTime(process.uptime()));
})

Badan({
	on: "delete",
	fromMe: false,
	desc: 'anti delete',
	type: 'whatsapp'
}, async (message, match, client) => {
	if (ANTI_DELETE) {
		let msg = await message.client.store.loadMessage(message.messageId)
		let { pushName } = msg.message;
		let name = pushName.trim().replace(/\s+/g, ' ');
		//let name = "hi"
		let sudo = numToJid(SUDO.split(',')[0]) || message.client.user.id;
		await message.forwardMessage(sudo, msg.message , { contextInfo: { isFrowarded: false, externalAdReply: { title: "deleted message", body: `from: ${name}`, mediaType: 2, thumbnail: "https://banner2.cleanpng.com/20231217/wca/transparent-cartoon-garbage-overflow-trash-bin-waste-managemen-chaotic-overflowing-garbage-bin-with-assorted-1710959851836.webp", mediaUrl: "", sourceUrl: "" }}, quoted: msg.message })
	}
});
