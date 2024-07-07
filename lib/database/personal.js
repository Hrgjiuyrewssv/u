const config = require("../../config");
const { DataTypes } = require("sequelize");

const PersonalDB = config.DATABASE.define("Personal", {
  chat: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  buffer: {
    type: DataTypes.BLOB,
    allowNull: false,
  },
});

async function setBuffer(jid = null, type = null, buff = null) {
  const existingMessage = await PersonalDB.findOne({
    where: {
      chat: jid,
      type,
    },
  });

  if (!existingMessage) {
    return await PersonalDB.create({
      chat: jid,
      buffer: buff,
      type,
      status: true,
    });
  } else {
    return await existingMessage.update({ chat: jid, buffer: buff });
  }
}

async function getMessage(jid = null, type = null) {
  const message = await PersonalDB.findOne({
    where: {
      chat: jid,
      type,
    },
  });

  return message ? message.dataValues : false;
}

async function setMessage(jid = null, type = null, text = null) {
  const existingMessage = await PersonalDB.findOne({
    where: {
      chat: jid,
      type,
    },
  });

  if (!existingMessage) {
    return await PersonalDB.create({
      chat: jid,
      message: text,
      type,
      status: true,
    });
  } else {
    return await existingMessage.update({ chat: jid, message: text });
  }
}

async function toggleStatus(jid = null, type = null) {
  const existingMessage = await PersonalDB.findOne({
    where: {
      chat: jid,
      type,
    },
  });

  if (!existingMessage) {
    return false;
  } else {
    const newStatus = !existingMessage.dataValues.status;
    return await existingMessage.update({ chat: jid, status: newStatus });
  }
}

async function delMessage(jid = null, type = null) {
  const existingMessage = await PersonalDB.findOne({
    where: {
      chat: jid,
      type,
    },
  });

  if (existingMessage) {
    await existingMessage.destroy();
  }
}

async function getStatus(jid = null, type = null) {
  try {
    const existingMessage = await PersonalDB.findOne({
      where: {
        chat: jid,
        type,
      },
    });

    return existingMessage ? existingMessage.dataValues.status : false;
  } catch {
    return false;
  }
}

module.exports = {
  PersonalDB,
  setMessage,
  getMessage,
  delMessage,
  toggleStatus,
  getStatus,
};
