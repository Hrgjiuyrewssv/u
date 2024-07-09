const {
	default: makeWASocket,
	useMultiFileAuthState,
	DisconnectReason,
	Browsers,
	fetchLatestBaileysVersion,
	delay,
	makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const store = require("./database/Store");
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const { serialize } = require("./Serialize");
const config = require('../config');
const { Message, commands, numToJid, sudoIds, PREFIX } = require('./index');
const axios = require('axios');
const logger = pino({ level: 'silent' });
const Greetings = require("./Greetings");

const initialize = async () => {
const connect = async () => {
	await config.DATABASE.sync();
	if (!fs.existsSync("./auth")) {
		let dir = await fs.mkdirSync('./auth');
	} else {
		const files = await fs.rmSync('./auth', {
			recursive: true
		});
		fs.mkdirSync('./auth');
	};
	const [name, id] = config.SESSION.split("--");
	if (name !== "bot") {
		console.log("use og version");
                process.exit(0);
	}
	const sessionfile = await axios.get(`https://pastebin.com/raw/${id}`);
        Object.keys(sessionfile.data).forEach(a => fs.writeFileSync(`./auth/${a}`, JSON.stringify(sessionfile.data[a]), "utf8"));
        console.log("session connected");
	fs.readdirSync('./plugins').forEach(plugin => {
		if (path.extname(plugin).toLowerCase() == '.js') {
			require('../plugins/' + plugin);
		}
	});

	const { state, saveCreds } = await useMultiFileAuthState('auth');
	const { version, isLatest } = await fetchLatestBaileysVersion();
const connectToWhatsApp = async () => {
	let client = makeWASocket({
		logger,
		printQRInTerminal: true,
		downloadHistory: false,
		syncFullHistory: false,
		browser: Browsers.macOS('Desktop'),
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		version,
	});
	client = await serialize(client);
	client.store = store;
	client.ev.on("chats.update", async (chats) =>
		chats.forEach(async (chat) => await store.saveChat(chat))
	);
	
	client.ev.on('connection.update', async (node) => {
		const { connection, lastDisconnect } = node;
		if (connection == 'open') {
			console.log("Connecting to Whatsapp...");
			console.log('connected');
			await delay(5000);
			const sudo = numToJid(config.SUDO.split(',')[0]) || client.user.id;
			await client.sendMessage(sudo, { text: '*BOT CONNECTED*\n\n```PREFIX : ' + PREFIX + '\nPLUGINS : ' + commands.filter(command => command.pattern).length + '\nVERISON : ' + require('../package.json').version + '```'});
		}
		if (connection === 'close') {
			// const { error, message } = lastDisconnect.error?.output.payload;
			if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
				await delay(300);
				connectToWhatsApp();
				console.log('reconnecting...');
				console.log(node)
			} else {
				console.log('connection closed');
				await delay(3000);
				process.exit(0);
			}
		}
	});
	
	client.ev.on('creds.update', saveCreds);
	client.ev.on("group-participants.update", async (data) => {
		Greetings(data, client);
	  });

	client.ev.on('messages.upsert', async (upsert) => {
		if (!upsert.type === 'notify') return;
		msg = upsert.messages[0];
		if (!msg.message) return;
		const message = new Message(client, msg);
		if (message.type === "templateButtonReplyMessage") {
		    message.text = msg.message[message.type].selectedId;
		} else if (message.type === "interactiveResponseMessage") {
		    message.text = JSON.parse(msg.message[message.type].nativeFlowResponseMessage.paramsJson).id;
		};
		await store.saveMessage(msg, message.sender);
		if (config.LOG_MSG && !message.data.key.fromMe) console.log(`[MESSAGE] [${message.pushName || message.sender.split('@')[0]}] : ${message.text || message.type || null}`);
		if (config.READ_MSG == true && message.data.key.remoteJid !== 'status@broadcast') await client.readMessages([message.data.key]);
		commands.map(async (command) => {
					if (command.fromMe && command.fromMe != 'public' && !message.isSudo) return;
					if (command.pattern && command.pattern.replace(/[^a-zA-Z0-9-+]/g, '')) {
						let EventCmd = command.pattern.replace(/[^a-zA-Z0-9-+]/g, '');
						let cmd = message.text.toLowerCase().trim().replace(/\s+/g, '');
						let k = PREFIX + EventCmd
						if (cmd.startsWith(k)) {
						    if (config.READ_CMD) await client.readMessages([message.data.key]);
							message.command = k;
						    let match = message.text.slice(message.command.length).trim();
							command.function(message, match, client).catch((e) => {
								console.log(e);
							});
						}
					}
					if (command.on === "all" && message) {
						command.function(message, message.text, client);
					} else if (command.on === "text" && message.text) {
						command.function(message, message.text, client);
					} else if (command.on === "sticker" && message.type === "stickerMessage") {
						command.function(message, message.text, client);
					} else if (command.on === "image" && message.type === "imageMessage") {
						command.function(message, message.text, client);
					} else if (command.on === "video" && message.type === "videoMessage") {
						command.function(message, message.text, client);
					} else if (command.on === "audio" && message.type === "audioMessage") {
						command.function(message, message.text, client);
					} else if (command.on === "delete" && message.type === "protocolMessage") {
						message.messageId = msg.message.protocolMessage.key?.id;
						command.function(message, message.text, client);
					}
				});
	});
	return client;
};

connectToWhatsApp()
};

connect()
};

module.exports = { initialize };
