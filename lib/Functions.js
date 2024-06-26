const { readFileSync, writeFileSync } = require("fs");

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

module.exports = { wawe, MediaUrls };
