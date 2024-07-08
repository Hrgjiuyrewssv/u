const { Badan, mode, formatTime } = require('../lib/');

Badan({
	pattern: 'ping ?(.*)',
	fromMe: mode,
	desc: 'Bot response in milliseconds.',
	type: 'info'
}, async (message, match, client) => {
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
}, async (message, match, client) => {
	await message.reply(formatTime(process.uptime()));
});
