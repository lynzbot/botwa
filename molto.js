require("./owner-dan-menu");
// const useCODE = process.argv.includes("--code")
// const useQR = !useCODE
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  getAggregateVotesInPollMessage,
  proto,
  Browsers
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const chalk = require("chalk");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const axios = require("axios");
const FileType = require("file-type");
const figlet = require("figlet");
const PhoneNumber = require("awesome-phonenumber");
const { smsg, getBuffer, fetchJson } = require("./lib/simple");
const fetch = require("node-fetch");
const { Low, JSONFile } = require("./lib/lowdb");
const _ = require("lodash");
const readline = require("readline");
// const { nocache, uncache } = require('./lib/chache.js');
const { color, bgcolor } = require("./lib/color");
const { welcomeCard } = require("greetify");
const usePairingCode = true;
global.db = new Low(new JSONFile(`lib/database.json`));

global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ)
    return new Promise((resolve) =>
      setInterval(function () {
        !global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null;
      }, 1 * 1000)
    );
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read();
  global.db.READ = false;
  global.db.data = {
    users: {},
    database: {},
    chats: {},
    game: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = _.chain(global.db.data);
};
loadDatabase();

if (global.db)
  setInterval(async () => {
    if (global.db.data) await global.db.write();
  }, 30 * 1000);

const { imageToWebp, videoToWebp, writeExifImg, writeExifVid, writeExif } = require("./lib/exif");
const {
  isSetClose,
  addSetClose,
  removeSetClose,
  changeSetClose,
  getTextSetClose,
  isSetDone,
  addSetDone,
  removeSetDone,
  changeSetDone,
  getTextSetDone,
  isSetLeft,
  addSetLeft,
  removeSetLeft,
  changeSetLeft,
  getTextSetLeft,
  isSetOpen,
  addSetOpen,
  removeSetOpen,
  changeSetOpen,
  getTextSetOpen,
  isSetProses,
  addSetProses,
  removeSetProses,
  changeSetProses,
  getTextSetProses,
  //    isSetWelcome,
  //    addSetWelcome,
  //    removeSetWelcome,
  //    changeSetWelcome,
  //    getTextSetWelcome,
  addSewaGroup,
  getSewaExpired,
  getSewaPosition,
  expiredCheck,
  checkSewaGroup,
} = require("./lib/store");

//let set_welcome_db = JSON.parse(fs.readFileSync('./database/set_welcome.json'));
//let set_left_db = JSON.parse(fs.readFileSync('./database/set_left.json'));
//let _welcome = JSON.parse(fs.readFileSync('./database/welcome.json'));
//let _left = JSON.parse(fs.readFileSync('./database/left.json')); */
let set_proses = JSON.parse(fs.readFileSync("./database/set_proses.json"));
let set_done = JSON.parse(fs.readFileSync("./database/set_done.json"));
let set_open = JSON.parse(fs.readFileSync("./database/set_open.json"));
let set_close = JSON.parse(fs.readFileSync("./database/set_close.json"));
let sewa = JSON.parse(fs.readFileSync("./database/sewa.json"));
let setpay = JSON.parse(fs.readFileSync("./database/pay.json"));
let opengc = JSON.parse(fs.readFileSync("./database/opengc.json"));
let antilink = JSON.parse(fs.readFileSync("./database/antilink.json"));
let antiwame = JSON.parse(fs.readFileSync("./database/antiwame.json"));
let antilink2 = JSON.parse(fs.readFileSync("./database/antilink2.json"));
let antiwame2 = JSON.parse(fs.readFileSync("./database/antiwame2.json"));
let db_respon_list = JSON.parse(fs.readFileSync("./database/list.json"));
const { toBuffer, toDataURL } = require("qrcode");
const express = require("express");
let app = express();
const { createServer } = require("http");
let server = createServer(app);
let _qr = "invalid";
let PORT = process.env.PORT;
const path = require("path");

// const question = (text) => {
//   const rl = readline.createInterface({
// input: process.stdin,
// output: process.stdout
//   });
//   return new Promise((resolve) => {
// rl.question(text, resolve)
//   })
// };

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
//   });

//   function askQuestion(query) {
//     return new Promise(resolve => rl.question(query, resolve));
//   }

// const usePairingCode = true
const store = {
  contacts: new Map(),
  chats: new Map(),
  messages: new Map(),
  saveMessage(jid, id, message, expireMs = 1 * 24 * 60 * 60 * 1000) {
    if (!jid || !id || !message) return false;
    if (!this.messages.has(jid)) this.messages.set(jid, new Map());
    const msgs = this.messages.get(jid);
    if (msgs.has(id)) clearTimeout(msgs.get(id).timer);
    msgs.set(id, {
      data: message,
      timer: setTimeout(() => {
        msgs.delete(id);
        if (!msgs.size) this.messages.delete(jid);
      }, expireMs),
      savedAt: Date.now(),
    });
    return true;
  },
  loadMessage(jid, id) {
    return this.messages.get(jid)?.get(id)?.data;
  },
  hasMessage(jid, id) {
    return !!this.messages.get(jid)?.has(id);
  },
  deleteMessage(jid, id) {
    const msgs = this.messages.get(jid);
    if (!msgs?.has(id)) return false;
    clearTimeout(msgs.get(id).timer);
    msgs.delete(id);
    if (!msgs.size) this.messages.delete(jid);
    return true;
  },
  flushMessages() {
    this.messages.forEach((msgs) => msgs.forEach((m) => clearTimeout(m.timer)));
    this.messages.clear();
  },
};

console.log(
  chalk.bold.green(
    figlet.textSync("Miki Store Bot", {
      font: "Standard",
      horizontalLayout: "default",
      vertivalLayout: "default",
      whitespaceBreak: false,
    })
  )
);

let phoneNumber = "6281340930744";
let owner = global.owner;

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

console.log(
  chalk.yellow(
    `${chalk.red("[ Made By Moldy ]")}\n\n${chalk.italic.magenta(`SV Moldy\nNomor: 081340930744\nSebut NamaðŸ‘†,`)}\n\n\n${chalk.red(`ADMIN SEDIA`)}\n${chalk.white(
      `-TEMPLATE WEBSITE\n-SCRIT CREATE PANEL\n-SCRIPT MD\n-LAYANAN TENTANG BOT WA\n`
    )}`
  )
);

async function Botstarted() {
  const { state, saveCreds } = await useMultiFileAuthState(`./${sessionName}`);
  let { version, isLatest } = await fetchLatestBaileysVersion();
  const molto = makeWASocket({
    syncFullHistory: false,
    logger: pino({ level: "silent" }),
    // printQRInTerminal: true,
    printQRInTerminal: !pairingCode,
    version: version,
    auth: state,
    browser: Browsers.macOS("Safari")
  });

  if (pairingCode && !molto.authState.creds.registered) {
    if (useMobile) throw new Error("Cannot use pairing code with mobile api");

    let phoneNumber;

    phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number \nFor example: +62xxx : `)));
    phoneNumber = phoneNumber.replace(/[^0-9]/g, "");

   const code = await molto.requestPairingCode(phoneNumber, 'MIKIBOTZ')
		console.log(`Pairing code: ${code}`)

    setTimeout(async () => {
      let code = await molto.requestPairingCode(phoneNumber);
      code = code?.match(/.{1,4}/g)?.join("-") || code;
      console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)));
    }, 3000);
  }

  /*
 async function Botstarted() {
    const { state, saveCreds } = await useMultiFileAuthState(`./${sessionName}`)

    const molto = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !usePairingCode,
        browser: ['MikiStore','Windows'],
        patchMessageBeforeSending: (message) => {

                const requiresPatch = !!(
                  message.buttonsMessage
              	  || message.templateMessage
              		|| message.listMessage
                );
                if (requiresPatch) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadataVersion: 2,
                                    deviceListMetadata: {},
                                },
                                ...message,
                            },
                        },
                    };
                }
                return message;
    },
        auth: state
    })
    */

  // molto.ev.on('creds.update', saveCreds)

  // store.bind(molto.ev)

  molto.ev.on("messages.upsert", async (chatUpdate) => {
    console.log(JSON.stringify(chatUpdate, undefined, 2))
    try {
      mek = chatUpdate.messages[0];
      // console.log(`mek : ${mek}`);
      if (!mek.message) return;
      mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;
      if (mek.key && mek.key.remoteJid === "status@broadcast") return;
      if (!molto.public && !mek.key.fromMe && chatUpdate.type === "notify") return;
      if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) return;
      m = smsg(molto, mek, store);
      console.log(JSON.stringify(m, undefined, 2));
      require("./store")(molto, m, chatUpdate, store, opengc, setpay, antilink, antiwame, antilink2, antiwame2, set_proses, set_done, set_open, set_close, sewa, db_respon_list);
    } catch (err) {
      console.log(err);
    }
  });
  setInterval(() => {
    for (let i of Object.values(opengc)) {
      if (Date.now() >= i.time) {
        molto
          .groupSettingUpdate(i.id, "not_announcement")
          .then((res) => molto.sendMessage(i.id, { text: `Sukses, group telah dibuka` }))
          .catch((err) => molto.sendMessage(i.id, { text: "Error" }));
        delete opengc[i.id];
        fs.writeFileSync("./database/opengc.json", JSON.stringify(opengc));
      }
    }
  }, 1000);

  /*    molto.ev.on('group-participants.update', async (anu) => {
        const isWelcome = _welcome.includes(anu.id)
        const isLeft = _left.includes(anu.id)
        try {
            let metadata = await molto.groupMetadata(anu.id)
            let participants = anu.participants
            const groupName = metadata.subject
  		      const groupDesc = metadata.desc
            for (let num of participants) {
                try {
                    ppuser = await molto.profilePictureUrl(num, 'image')
                } catch {
                    ppuser = 'https://telegra.ph/file/c3f3d2c2548cbefef1604.jpg'
                }

                try {
                    ppgroup = await molto.profilePictureUrl(anu.id, 'image')
                } catch {
                    ppgroup = 'https://telegra.ph/file/c3f3d2c2548cbefef1604.jpg'
                }
                if (anu.action == 'add' && isWelcome) {
                  console.log(anu)
                    if (isSetWelcome(anu.id, set_welcome_db)) {
                        var get_teks_welcome = await getTextSetWelcome(anu.id, set_welcome_db)
                    var replace_pesan = (get_teks_welcome.replace(/@user/gi, `@${num.split('@')[0]}`))
                        var full_pesan = (replace_pesan.replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc))
                        molto.sendMessage(anu.id, { image: { url: ppuser }, mentions: [num], caption: `${full_pesan}` })
                       } else {
                       	molto.sendMessage(anu.id, { image: { url: ppuser }, mentions: [num], caption: `Halo @${num.split("@")[0]}, Welcome To ${metadata.subject}` })
                      }
                } else if (anu.action == 'remove' && isLeft) {
                	console.log(anu)
                  if (isSetLeft(anu.id, set_left_db)) {
                        var get_teks_left = await getTextSetLeft(anu.id, set_left_db)
                        var replace_pesan = (get_teks_left.replace(/@user/gi, `@${num.split('@')[0]}`))
                        var full_pesan = (replace_pesan.replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc))
                      molto.sendMessage(anu.id, { image: { url: ppuser }, mentions: [num], caption: `${full_pesan}` })
                       } else {
                       	molto.sendMessage(anu.id, { image: { url: ppuser }, mentions: [num], caption: `Sayonara @${num.split("@")[0]}` })
                        }
                        } else if (anu.action == 'promote') {
                    molto.sendMessage(anu.id, { image: { url: ppuser }, mentions: [num], caption: `@${num.split('@')[0]} sekaran menjadi admin grup ${metadata.subject}` })
                } else if (anu.action == 'demote') {
                    molto.sendMessage(anu.id, { image: { url: ppuser }, mentions: [num], caption: `@${num.split('@')[0]} bukan admin grup ${metadata.subject} lagi` })
              }
            }
        } catch (err) {
            console.log(err)
        }
    }) */
  //=================================================//
  molto.ev.on("group-participants.update", async (anu) => {
    try {
      if(anu.id = '120363420416232341@g.us') return console.log('skipped')
      let metadata = await molto.groupMetadata(anu.id);
      let participants = anu.participants;
      //console.log(metadata)
      for (let num of participants) {
        // Get Profile Picture User
        try {
          ppuser = await molto.profilePictureUrl(num, "image");
        } catch {
          ppuser = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60";
        }

        // Get Profile Picture Group
        try {
          ppgroup = await molto.profilePictureUrl(anu.id, "image");
        } catch {
          ppgroup = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60";
        }

        if (anu.action == "add") {
          const card = new welcomeCard()
            .setName(`${num.split("@")[0]}`)
            .setAvatar(ppuser)
            .setMessage(`KAMU ADALAH MEMBER KE #${metadata.participants.length}`)
            .setBackground("https://i.ibb.co/Y366nD9/IMG-20231228-WA0055.png")
            .setColor("1F51FF") // without #
            .setTitle("Welcome");

          // Building process
          const output = await card.build();

          molto.sendMessage(anu.id, {
            image: output,
            mentions: [num],
            caption: `Halo @${num.split("@")[0]}, Selamat Datang Di Group *${metadata.subject}*
\n_Silahkan Ketik *Menu* Untuk Menampilkan Daftar Layanan Grup ya ✨\nDan Ketik *Help* untuk Menampilkan Daftar Fitur ☺️_
`,
          });
        } else if (anu.action == "remove") {
          const card = new welcomeCard()
            .setName(`${num.split("@")[0]}`)
            .setAvatar(ppuser)
            .setMessage(`Ditinggal Lagi :(`)
            .setBackground("https://telegra.ph/file/5ff4563de9e6ea4ae81b7.jpg")
            .setColor("1F51FF") // without #
            .setTitle("Goodbye");

          // Building process
          const output = await card.build();

          molto.sendMessage(anu.id, { image: output, mentions: [num] });
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
  //=================================================//
  // Setting
  molto.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else return jid;
  };

  molto.ev.on("contacts.update", (update) => {
    for (let contact of update) {
      let id = molto.decodeJid(contact.id);
      if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
    }
  });

  molto.getName = (jid, withoutContact = false) => {
    id = molto.decodeJid(jid);
    withoutContact = molto.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = molto.groupMetadata(id) || {};
        resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
      });
    else
      v =
        id === "0@s.whatsapp.net"
          ? {
              id,
              name: "WhatsApp",
            }
          : id === molto.decodeJid(molto.user.id)
          ? molto.user
          : store.contacts[id] || {};
    return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
  };

  molto.sendContact = async (jid, kon, quoted = "", opts = {}) => {
    let list = [];
    for (let i of kon) {
      list.push({
        displayName: await molto.getName(i + "@s.whatsapp.net"),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await molto.getName(i + "@s.whatsapp.net")}\nFN:${await molto.getName(i + "@s.whatsapp.net")}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
      });
    }
    molto.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted });
  };

  molto.public = true;

  molto.serializeM = (m) => smsg(molto, m, store);

  molto.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    //           if (qr) {
    //      app.use(async (req, res) => {
    //         res.setHeader('content-type', 'image/png')
    //         res.end(await toBuffer(qr))
    //      })
    //      app.use(express.static(path.join(__dirname, 'views')))
    //      app.listen(PORT, () => {
    //         console.log('Silahkan scan qr di bagian webview')
    //      })
    //   }
    try {
      if (connection === "close") {
        let reason = lastDisconnect?.error?.output?.statusCode;
        if (reason === DisconnectReason.badSession) {
          console.log(`Bad Session File, Please Delete Session and Scan Again`);
          try {
            const sessionPath = path.join(__dirname, sessionName);
            if (fs.existsSync(sessionPath)) {
              fs.rmSync(sessionPath, { recursive: true, force: true });
              console.log("Session folder deleted successfully.");
            }
          } catch (err) {
            console.error("Failed to delete session folder:", err);
          }
          molto.logout();
        } else if (reason === DisconnectReason.connectionClosed) {
          console.log("Connection closed, reconnecting....");
          Botstarted();
        } else if (reason === DisconnectReason.connectionLost) {
          console.log("Connection Lost from Server, reconnecting...");
          Botstarted();
        } else if (reason === DisconnectReason.connectionReplaced) {
          console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
          Botstarted();
        } else if (reason === DisconnectReason.loggedOut) {
          console.log(`Device Logged Out, Please Delete Session and Scan Again.`);
          try {
            const sessionPath = path.join(__dirname, sessionName);
            if (fs.existsSync(sessionPath)) {
              fs.rmSync(sessionPath, { recursive: true, force: true });
              console.log("Session folder deleted successfully.");
            }
          } catch (err) {
            console.error("Failed to delete session folder:", err);
          }
          molto.logout();
        } else if (reason === DisconnectReason.restartRequired) {
          console.log("Restart Required, Restarting...");
          Botstarted();
        } else if (reason === DisconnectReason.timedOut) {
          console.log("Connection TimedOut, Reconnecting...");
          Botstarted();
        } else {
          console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
          Botstarted();
        }
      }

      if (update.connection == "open" || update.receivedPendingNotifications == "true") {
        //  await store.chats.all()
        console.log(`Connected to = ` + JSON.stringify(molto.user, null, 2));
        //molto.sendMessage("77777777777" + "@s.whatsapp.net", {text:"", "contextInfo":{"expiration": 86400}})
      }
    } catch (err) {
      console.log("Error in Connection.update " + err);
      Botstarted();
    }
  });

  molto.ev.on("creds.update", saveCreds);

  /* molto.ev.on("connection.update", ({ connection }) => {
      if (connection === "open") {
        console.log("CONNECTION" + " OPEN (" + molto.user?.["id"]["split"](":")[0] + ")")
      }
      if (connection === "close") {
      	console.log("Connection closed, Hapus File Sesion dan scan ulang");
        startmolto()
      }
      if (connection === "connecting") {
        if (molto.user) {
          console.log("CONECTION" + " FOR (" + molto.user?.["id"]["split"](":")[0] + ")")
        } else if (!useQR && !useCODE) {
          console.log("CONNECTION " + "Autentikasi Dibutuhkan\nGunakan Perintah \x1B[36mnpm start\x1B[0m untuk terhubung menggunakan nomor telepon")
        }
      }
    })
   store.bind(molto.ev) */

  molto.sendText = (jid, text, quoted = "", options) => molto.sendMessage(jid, { text: text, ...options }, { quoted, ...options });

  molto.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
  };

  molto.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;

    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    trueFileName = attachExtension ? filename + "." + type.ext : filename;
    // save to file
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };
  molto.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
    molto.sendMessage(
      jid,
      {
        text: text,
        mentions: [...text.matchAll(/@(\d{0,16})/g)].map((v) => v[1] + "@s.whatsapp.net"),
        ...options,
      },
      {
        quoted,
      }
    );

  molto.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
      ? Buffer.from(path.split`,`[1], "base64")
      : /^https?:\/\//.test(path)
      ? await (await fetch(path)).buffer()
      : fs.existsSync(path)
      ? fs.readFileSync(path)
      : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp(buff);
    }

    await molto.sendMessage(
      jid,
      {
        sticker: {
          url: buffer,
        },
        ...options,
      },
      {
        quoted,
      }
    );
    return buffer;
  };

  /**
   *
   * @param {*} jid
   * @param {*} path
   * @param {*} quoted
   * @param {*} options
   * @returns
   */
  molto.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
      ? Buffer.from(path.split`,`[1], "base64")
      : /^https?:\/\//.test(path)
      ? await getBuffer(path)
      : fs.existsSync(path)
      ? fs.readFileSync(path)
      : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVid(buff, options);
    } else {
      buffer = await videoToWebp(buff);
    }

    await molto.sendMessage(
      jid,
      {
        sticker: {
          url: buffer,
        },
        ...options,
      },
      {
        quoted,
      }
    );
    return buffer;
  };

  return molto;
}

Botstarted();
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
