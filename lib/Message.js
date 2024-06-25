const { getContentType, jidNormalizedUser } = require('baileys');
const Base = require('./Base');
const ReplyMessage = require('./ReplyMessage');
const config = require('../config');
const { serialize } = require("./Serialize");
const { writeExifWebp } = require("./Exif");
const { fromBuffer } = require('file-type');
const { getBuffer } = require("./utils");


class Message extends Base {
    constructor(client, data) {
        super(client);
        if (data) { this.patch(data);
        }
    }

    patch(data) {
        this.id = data.key?.id;
        this.jid = this.chat = data.key?.remoteJid;
        this.fromMe = data.key?.fromMe;
        this.sender = jidNormalizedUser(this.fromMe && this.client.user.id || this.participant || data.key.participant || this.chat || '');
        this.pushName = data.pushName || this.client.user.name || '';
        this.message = this.text = data.message?.extendedTextMessage?.text || data.message?.imageMessage?.caption || data.message?.videoMessage?.caption || data.message?.listResponseMessage?.singleSelectReply?.selectedRowId || data.message?.buttonsResponseMessage?.selectedButtonId || data.message?.templateButtonReplyMessage?.selectedId || data.message?.editedMessage?.message?.protocolMessage?.editedMessage?.conversation || data.message?.conversation;
        this.data = data;
        this.type = getContentType(data.message);
        this.msg = data.message[this.type];
        this.reply_message = this.quoted = this.msg?.contextInfo?.quotedMessage ? new ReplyMessage(this.client, { chat: this.chat, msg: this.msg, ...this.msg.contextInfo }) : false;
        this.mention = this.msg?.contextInfo?.mentionedJid || false;
        this.isGroup = this.chat.endsWith('@g.us');
        this.isPm = this.chat.endsWith('@s.whatsapp.net');
        this.isBot = this.id.startsWith('BAE5') && this.id.length === 16;
        const sudo = config.SUDO.split(',') || config.SUDO + ',0';
	    this.isSudo = [jidNormalizedUser(this.client.user.id), ...sudo].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(this.sender);
        return super.patch(data);
    }

    async reply(text, options) {
        const message = await this.client.sendMessage(this.jid, { text }, { quoted: this.data, ...options });
        return new Message(this.client, message);
    }

    async delete() {
        return await this.client.sendMessage(this.jid, { delete: { ...this.data.key, participant: this.sender } });
    }

    async edit(conversation) {
        return await this.client.relayMessage(this.jid, { protocolMessage: { key: this.data.key, type: 14, editedMessage: { conversation } } }, {});
    }

    async sendSticker(jid, content, opt = { packname: "Loki", author: "Xer", fileName: "LokiXer" }) {
	    const { getFile, sendImageAsSticker } = await serialize(this.client);
	    const { data, mime } = await getFile(content);
	    if (mime === "image/webp") {
		    const buff = await writeExifWebp(data, opt);
		    await this.client.sendMessage(
			    jid,
			    { sticker: { url: buff },...opt },
			    opt
			    );
	    } else {
		    const mimePrefix = mime.split("/")[0];
		    if (mimePrefix === "video" || mimePrefix === "image") {
			    await sendImageAsSticker(jid, content, opt);
		    } else {
			    throw new Error(`Unsupported MIME type: ${mime}`);
		    }
	    };
    }

    async sendFromUrl(url, options = {}) {
        let buff = await getBuffer(url);
        let mime = await fromBuffer(buff);
        let type = mime.mime.split("/")[0];
        if (type === "audio") {
          options.mimetype = "audio/mpeg";
        }
        if (type === "application") type = "document";
        return this.client.sendMessage(
          this.jid,
          { [type]: buff, ...options },
          { ...options }
        );
    }

	    
}

module.exports = Message;
