const { readFileSync, writeFileSync } = require("fs");
const {
    generateWAMessageFromContent,
    proto,
} = require("baileys");

async function wawe(buff) {
    writeFileSync("./temp.mp4", buff);
    return await readFileSync("./temp.mp4");
    }
    
function MediaUrls(text) {
     let array = [];
     const regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi;
     let urls = text.match(regexp);
     if (urls) {
      urls.map(url => {
       if (['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webp'].includes(url.split('.').pop().toLowerCase())) {
        array.push(url);
       }
      });
      return array;
     } else {
      return false;
     }
    }

function createInteractiveMessage(data, options = {}) {
        const { jid, button, header, footer, body } = data;
        let buttons = [];
        for (let i = 0; i < button.length; i++) {
          let btn = button[i];
          let Button = {};
          Button.buttonParamsJson = JSON.stringify(btn.params);
          switch (btn.type) {
            case "copy":
              Button.name = "cta_copy";
              break;
            case "url":
              Button.name = "cta_url";
              break;
            case "location":
              Button.name = "send_location";
              break;
            case "address":
              Button.name = "address_message";
              break;
            case "call":
              Button.name = "cta_call";
              break;
            case "reply":
              Button.name = "quick_reply";
              break;
            case "list":
              Button.name = "single_select";
              break;
            default:
              Button.name = "quick_reply";
              break;
          }
          buttons.push(Button);
        }
        const mess = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: proto.Message.InteractiveMessage.create({
                body: proto.Message.InteractiveMessage.Body.create({ ...body }),
                footer: proto.Message.InteractiveMessage.Footer.create({ ...footer }),
                header: proto.Message.InteractiveMessage.Header.create({ ...header }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create(
                  {
                    buttons: buttons,
                  }
                ),
              }),
            },
          },
        };
        let optional = generateWAMessageFromContent(jid, mess, options);
        return optional;
      }

module.exports = { wawe, MediaUrls, createInteractiveMessage };
