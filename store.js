require("./owner-dan-menu");
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
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");
const cheerio = require("cheerio");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");
const util = require("util");
const chalk = require("chalk");
const axios = require("axios");
const { exec } = require("child_process");
const moment = require("moment-timezone");
const ms = (toMs = require("ms"));
const FormData = require("form-data");
const { fromBuffer } = require("file-type");
const fetch = require("node-fetch");
let set_bot = JSON.parse(fs.readFileSync("./database/set_bot.json"));
const calc = require("./lib/calcml");
const { smsg, fetchJson, getBuffer } = require("./lib/simple");
const { createSticker, StickerTypes } = require("wa-sticker-formatter");
const {
  isSetBot,
  addSetBot,
  removeSetBot,
  changeSetBot,
  getTextSetBot,
  updateResponList,
  delResponList,
  resetListAll,
  isAlreadyResponListGroup,
  sendResponList,
  isAlreadyResponList,
  getDataResponList,
  addResponList,
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
  isSetWelcome,
  addSetWelcome,
  removeSetWelcome,
  changeSetWelcome,
  getTextSetWelcome,
  addSewaGroup,
  getSewaExpired,
  getSewaPosition,
  expiredCheck,
  checkSewaGroup,
  addPay,
  updatePay,
} = require("./lib/store");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const { ytmp3, ytmp4, igdl, fbdl } = require("ruhend-scraper");
const savetube = require("./lib/src/scraper/savetube.js");
const { qrisDinamis } = require("./lib/qrDinamis.js");
const { sleep } = require("./lib/myfunc.js");
const { translate } = require("bing-translate-api");
const { remini, remini2 } = require("./lib/upscale");
const { mooCountry } = require("./lib/region.js");
const ocean = require("./lib/src/scraper/ocean.js");
global.imgbbKey = "3a99030b56c5b2e42b299638a3aac17e";
let botState = null;
// const Upscaler = require("upscaler");
// const models = require('@upscalerjs/esrgan-thick');
// const { downloadMediaMessage } = require("baileys");

const jsonFilePath = path.join(__dirname, "database", "dataExcel.json");

// Fungsi untuk menyimpan data ke JSON
function saveToJSON(data) {
  let existingData = [];

  // Baca file JSON jika sudah ada
  if (fs.existsSync(jsonFilePath)) {
    const fileContent = fs.readFileSync(jsonFilePath, "utf-8");
    existingData = JSON.parse(fileContent);
  }

  // Tambahkan data baru
  existingData.push(data);

  // Tulis kembali ke file JSON
  fs.writeFileSync(jsonFilePath, JSON.stringify(existingData, null, 2), "utf-8");
}

// Fungsi untuk membuat file Excel dari JSON


const afkFilePath = "./database/afk_user.json";

let afkUsers = {}; // Penyimpanan status AFK

// Fungsi untuk memuat data AFK dari file
function loadAFKUsers() {
  try {
    const data = fs.readFileSync(afkFilePath, "utf8");
    afkUsers = JSON.parse(data);
  } catch (error) {
    afkUsers = {};
  }
}

// Fungsi untuk menyimpan data AFK ke file
function saveAFKUsers() {
  fs.writeFileSync(afkFilePath, JSON.stringify(afkUsers, null, 2));
}

// Memanggil loadAFKUsers saat awal berjalan
loadAFKUsers();

function setAFK(userJid, reason) {
  const timeNow = Date.now();
  afkUsers[userJid] = {
    reason: reason,
    time: timeNow,
  };
  saveAFKUsers(); // Simpan data ke file setiap kali ada perubahan
}

function getAFKStatus(userJid) {
  return afkUsers[userJid];
}

function removeAFK(userJid) {
  delete afkUsers[userJid];
  saveAFKUsers(); // Simpan data ke file setiap kali ada perubahan
}

function formatTimeAgo(time) {
  const now = Date.now();
  const diff = now - time;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours} jam yang lalu`;
  if (minutes > 0) return `${minutes} menit yang lalu`;
  return `${seconds} detik yang lalu`;
}

// Fungsi untuk mendapatkan emoji bendera berdasarkan kode negara
function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

   async function getGroupAdmins(participants) {
  let admins = [];
  for (let i of participants) {
    if (i.admin === "superadmin" || i.admin === "admin") {
      admins.push(i.id); // gunakan i.id, bukan i.jid
    }
  }
  return admins;
}

async function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function TelegraPh(Path) {
  let axios = require("axios");
  let FormData = require("form-data");

  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(Path)) {
      return reject(new Error("File not found"));
    }

    try {
      const form = new FormData();
      form.append("image", fs.createReadStream(Path), "image.png"); // Ensure 'image' is used as per API

      const response = await axios.post("https://idshopxzn.com/v2/foto-url?api_req=mikiAPIKEY", form, {
        headers: {
          ...form.getHeaders(),
        },
      });

      // Log the response to see what the API is returning
      console.log("API Response:", response.data);

      const result = response.data;

      if (result.status === "success" && result.url) {
        return resolve(result.url);
      } else {
        return reject(new Error("Unexpected response from API: " + JSON.stringify(result)));
      }
    } catch (err) {
      console.error("Error uploading to the API:", err.response ? err.response.data : err.message);
      return reject(new Error(`Error uploading file: ${err.message}`));
    }
  });
}

async function createBackupZip() {
  const fs = require("fs");
  const path = require("path");
  const archiver = require("archiver");

  return new Promise((resolve, reject) => {
    const outputPath = path.join(__dirname, "backup.zip");
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", () => {
      console.log(`backup berhasil dilakukan total file yang didapatkan ${outputPath} (${archive.pointer()} total bytes`);
      resolve(outputPath);
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    archive.glob("database/**/*");
    archive.glob("image/**/*");
    archive.glob("lib/**/*");
    archive.glob("*");

    archive.finalize();
  });
}

// async function autoTranslate(text) {
//   try {
//     const encodedText = encodeURIComponent(text);
//     const url = `https://lingva.ml/api/v1/auto/id/${encodedText}`;

//     const response = await axios.get(url, {
//       headers: {
//         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
//         'Accept-Encoding': 'gzip, deflate, br, zstd',
//         'Accept-Language': 'en-US,en;q=0.7',
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
//         'Sec-Ch-Ua': '"Brave";v="137", "Chromium";v="137", "Not(A:Brand";v="24"',
//         'Sec-Ch-Ua-Mobile': '?0',
//         'Sec-Ch-Ua-Platform': '"Windows"',
//         'Sec-Fetch-Dest': 'document',
//         'Sec-Fetch-Mode': 'navigate',
//         'Sec-Fetch-Site': 'none',
//         'Sec-Fetch-User': '?1',
//         'Upgrade-Insecure-Requests': '1',
//       }
//     });

//     console.log(response.data);
//     return response.data;

//   } catch (error) {
//     console.error('Terjadi kesalahan:', error.response?.status, error.response?.data || error.message);
//   }
// }

function runtime(seconds) {
  seconds = Number(seconds);

  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);
  var dDisplay = d > 0 ? d + (d == 1 ? " Hari " : " Hari ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " Jam " : " Jam ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " Menit " : " Menit ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " Detik " : " Detik ") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
function msToDate(mse) {
  temp = mse;
  days = Math.floor(mse / (24 * 60 * 60 * 1000));
  daysms = mse % (24 * 60 * 60 * 1000);
  hours = Math.floor(daysms / (60 * 60 * 1000));
  hoursms = mse % (60 * 60 * 1000);
  minutes = Math.floor(hoursms / (60 * 1000));
  minutesms = mse % (60 * 1000);
  sec = Math.floor(minutesms / 1000);
  return days + " Days " + hours + " Hours " + minutes + " Minutes";
}

async function validateMobileLegendsMoogold(userId, zoneId) {
  const qs = require("qs");
  const url = "https://moogold.com/wp-content/plugins/id-validation-new/id-validation-ajax.php";
  const formData = qs.stringify({
    attributes_diamonds: "Weekly Pass",
    "text-5f6f144f8ffee": userId,
    "text-1601115253775": zoneId,
    quantity: "1",
    "add-to-cart": "5846232",
    product_id: "5846232",
    variation_id: "5846345",
  });

  try {
    const response = await axios.post(url, formData, {
      headers: {
        Origin: "https://moogold.com",
        Referer: "https://moogold.com/product/mobile-legends-brazil/",
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error("Axios Error:", error.response?.data || error.message);
    return null;
  }
}

const isUrl = (url) => {
  return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, "gi"));
};

const tanggal = (numer) => {
  myMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  myDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum’at", "Sabtu"];
  var tgl = new Date(numer);
  var day = tgl.getDate();
  bulan = tgl.getMonth();
  var thisDay = tgl.getDay(),
    thisDay = myDays[thisDay];
  var yy = tgl.getYear();
  var year = yy < 1000 ? yy + 1900 : yy;
  const time = moment.tz("Asia/Jakarta").format("DD/MM HH:mm:ss");
  let d = new Date();
  let locale = "id";
  let gmt = new Date(0).getTime() - new Date("1 January 1970").getTime();
  let weton = ["Pahing", "Pon", "Wage", "Kliwon", "Legi"][Math.floor((d * 1 + gmt) / 84600000) % 5];

  return `${thisDay}, ${day} - ${myMonths[bulan]} - ${year}`;
};
module.exports = molto = async (molto, m, chatUpdate, store, opengc, setpay, antilink, antiwame, antilink2, antiwame2, set_proses, set_done, set_open, set_close, sewa, db_respon_list) => {
  try {
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype === "imageMessage"
        ? m.message.imageMessage.caption
        : m.mtype === "videoMessage"
        ? m.message.videoMessage.caption
        : m.mtype === "extendedTextMessage"
        ? m.message.extendedTextMessage.text
        : m.mtype === "buttonsResponseMessage"
        ? m.message.buttonsResponseMessage.selectedButtonId
        : m.mtype === "listResponseMessage"
        ? m.message.listResponseMessage.singleSelectReply.selectedRowId
        : m.mtype === "InteractiveResponseMessage"
        ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)?.id
        : m.mtype === "templateButtonReplyMessage"
        ? m.message.templateButtonReplyMessage.selectedId
        : m.mtype === "messageContextInfo"
        ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.message.InteractiveResponseMessage.NativeFlowResponseMessage || m.text
        : "";
    var budy = typeof m.text == "string" ? m.text : "";
    var prefix = prefa ? (/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : "") : prefa ?? global.prefix;
    // const isCmd = body.startsWith(prefix);
    const command = (body || "").replace(prefix, "").trim().split(/ +/).shift()?.toLowerCase() || "";

    var args = (body || "").trim().split(/ +/).slice(1);
    const sender = m.isGroup ? m.key.participantPn || m.key.participant || m.participant || m.sender || m.key.remoteJid : m.key.remoteJid;

    const pushname = m.pushName || "No Name";
    const botNumber = await molto.decodeJid(molto.user.id);
    console.log("Bot Number:", botNumber);
    const isCreator = ["6281340930744@s.whatsapp.net", botNumber, ...global.owner].map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(sender);
    const text = (q = args.join(" "));
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";
    const isMedia = /image|video|sticker|audio/.test(mime);
    const groupMetadata = m.isGroup ? await molto.groupMetadata(m.chat).catch((e) => {}) : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";
    const participants = m.isGroup ? await groupMetadata.participants : "";
    const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : "";
    console.log("Group Admins:", groupAdmins);
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
    console.log(isBotAdmins);
    const isAdmins = m.isGroup ? groupAdmins.includes(sender) : false;
    const isSewa = checkSewaGroup(m.chat, sewa);
    const isAntiLink = antilink.includes(m.chat) ? true : false;
    const isAntiWame = antiwame.includes(m.chat) ? true : false;
    const isAntiLink2 = antilink2.includes(m.chat) ? true : false;
    const isAntiWame2 = antiwame2.includes(m.chat) ? true : false;
    //const isWelcome = _welcome.includes(m.chat)
    //const isLeft = _left.includes(m.chat)
    const jam = moment().format("HH:mm:ss z");
    const time = moment(Date.now()).tz("Asia/Jakarta").locale("id").format("HH:mm:ss z");

    const reply = (text) => {
      m.reply(text);
    };
    function formatmoney(amount, options = {}) {
      const { currency = "IDR", locale = "id", minimumFractionDigits = 0, maximumFractionDigits = 0, useSymbol = true } = options;

      const formattedAmount = amount.toLocaleString(locale, {
        style: "currency",
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
      });

      return useSymbol ? formattedAmount : formattedAmount.replace(/[^\d.,]/g, "");
    }

    function formatRupiah(amount) {
      return formatmoney(amount, { currency: "IDR", locale: "id", minimumFractionDigits: 0 });
    }

    async function getGcName(groupID) {
      try {
        let data_name = await molto.groupMetadata(groupID);
        return data_name.subject;
      } catch (err) {
        return "-";
      }
    }
    if (m.message) {
      molto.readMessages([m.key]);
      console.log(
        chalk.black(chalk.bgWhite("[ CMD ]")),
        chalk.black(chalk.bgGreen(new Date())),
        chalk.black(chalk.bgBlue(budy || m.mtype)) + "\n" + chalk.magenta("=> From"),
        chalk.green(pushname),
        chalk.yellow(sender) + "\n" + chalk.blueBright("=> In"),
        chalk.green(m.isGroup ? pushname : "Chat Pribadi", m.chat)
      );
    }
    if (m.isGroup) {
      expiredCheck(molto, sewa);
    }

    if (isAntiLink) {
      if (budy.match(`chat.whatsapp.com`)) {
        m.reply(`*Antilink sedang on kamu akan dikick*`);
        if (!isBotAdmins) return m.reply(`*Bot bukan admin*`);
        let gclink = `https://chat.whatsapp.com/` + (await molto.groupInviteCode(m.chat));
        let isLinkThisGc = new RegExp(gclink, "i");
        let isgclink = isLinkThisGc.test(m.text);
        if (isgclink) return m.reply(`*Gagal karena link grup ini*`);
        if (isAdmins) return m.reply(`*Admin tidak bisa dikick*`);
        if (isCreator) return m.reply(`*Owner tidak bisa dikick*`);
        if (m.key.fromMe) return m.reply(`*Owner tidak bisa dikick*`);
        await molto.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,

            fromMe: false,
            id: m.key.id,
            participant: m.key.participant,
          },
        });
        molto.groupParticipantsUpdate(m.chat, [sender], "remove");
      }
    }
    if (isAntiLink2) {
      if (budy.match(`chat.whatsapp.com`)) {
        if (!isBotAdmins) return; //m.reply(`*Bot bukan admin*`)
        let gclink = `https://chat.whatsapp.com/` + (await molto.groupInviteCode(m.chat));
        let isLinkThisGc = new RegExp(gclink, "i");
        let isgclink = isLinkThisGc.test(m.text);
        if (isgclink) return; //m.reply`(*Gagal karena link grup ini*`)
        if (isAdmins) return; //m.reply(`*Admin tidak bisa dikick*`)
        if (isCreator) return; //m.reply(`*Owner tidak bisa dikick*`)
        if (m.key.fromMe) return; //m.reply(`*Owner tidak bisa dikick*`)
        await molto.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,

            fromMe: false,
            id: m.key.id,
            participant: m.key.participant,
          },
        });
      }
    }
    if (m.mtype === "interactiveResponseMessage") {
      console.log("interactiveResponseMessage Detected!");
      let msg = m.message[m.mtype] || m.msg;
      if (msg.nativeFlowResponseMessage && !m.isBot) {
        let { id } = JSON.parse(msg.nativeFlowResponseMessage.paramsJson) || {};
        if (id) {
          let emit_msg = {
            key: { ...m.key }, // SET RANDOME MESSAGE ID
            message: { extendedTextMessage: { text: id } },
            pushName: m.pushName,
            messageTimestamp: m.messageTimestamp || 754785898978,
          };
          return molto.ev.emit("messages.upsert", { messages: [emit_msg], type: "notify" });
        }
      }
    }
    if (isAntiWame) {
      if (budy.match(`wa.me/`)) {
        m.reply(`*Gagal karena link grup ini*`);
        if (!isBotAdmins) return m.reply(`*Bot bukan admin*`);
        if (isAdmins) return m.reply(`*Kasian adminnya klo di kick*`);
        if (isCreator) return m.reply(`*Kasian owner ku klo di kick*`);
        if (m.key.fromMe) return m.reply(`*Kasian owner ku klo di kick*`);
        await molto.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,

            fromMe: false,
            id: m.key.id,
            participant: m.key.participant,
          },
        });
        molto.groupParticipantsUpdate(m.chat, [sender], "remove");
      }
    }
    if (isAntiWame2) {
      if (budy.match(`wa.me/`)) {
        if (!isBotAdmins) return; //m.reply(`Upsss... gajadi, bot bukan admin`)
        if (isAdmins) return; //m.reply(`Upsss... gak jadi, kasian adminnya klo di kick`)
        if (isCreator) return; //m.reply(`Upsss... gak jadi, kasian owner ku klo di kick`)
        if (m.key.fromMe) return; //m.reply(`Upsss... gak jadi, kasian owner ku klo di kick`)
        await molto.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,

            fromMe: false,
            id: m.key.id,
            participant: m.key.participant,
          },
        });
      }
    }

    if (isAntiWame) {
      if (budy.includes(`Wa.me/` || `Wa.me/`)) {
        m.reply(`*「 ANTI WA ME 」*\n\nWa Me detected, maaf kamu akan di kick !`);
        if (!isBotAdmins) return m.reply(`Upsss... gajadi, bot bukan admin`);
        if (isAdmins) return m.reply(`Upsss... gak jadi, kasian adminnya klo di kick`);
        if (isCreator) return m.reply(`Upsss... gak jadi, kasian owner ku klo di kick`);
        if (m.key.fromMe) return m.reply(`Upsss... gak jadi, kasian owner ku klo di kick`);
        molto.groupParticipantsUpdate(m.chat, [sender], "remove");
      }
    }

    if (isAlreadyResponList(m.isGroup ? m.chat : botNumber, body, db_respon_list)) {
      var get_data_respon = getDataResponList(m.isGroup ? m.chat : botNumber, body, db_respon_list);
      if (get_data_respon.isImage === false) {
        molto.sendMessage(
          m.chat,
          { text: sendResponList(m.isGroup ? m.chat : botNumber, body, db_respon_list) },
          {
            quoted: m,
          }
        );
      } else {
        molto.sendMessage(
          m.chat,
          { image: await getBuffer(get_data_respon.image_url), caption: get_data_respon.response },
          {
            quoted: m,
          }
        );
      }
    }
    /*const { Low, JSONFile } = require('./lib/lowdb')
        global.db = new Low(new JSONFile(`lib/database.json`))
        const users = global.db.users
        let mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
for (let jid of mentionUser) {
let user = global.db.users[jid]
if (!user) continue
let afkTime = user.afkTime
if (!afkTime || afkTime < 0) continue
let reason = user.afkReason || ''
m.reply(`${tag} sedang Afk ${reason ? 'karena ' + reason : 'tanpa alasan'} selama ${clockString(new Date - afkTime)}
`.trim())
}
if (global.db.users[m.chat].afkTime > -1) {
let user = global.db.users[m.chat]
m.reply(`${tag} telah kembali dari *Afk* ${user.afkReason ? 'setelah ' + user.afkReason : ''}\nselama *${clockString(new Date - user.afkTime)}*`.trim())
user.afkTime = -1
user.afkReason = ''
}*/
    let senderJid = m.key.participant;
    if (m.message.extendedTextMessage?.contextInfo?.mentionedJid || m.message.extendedTextMessage?.contextInfo?.participant) {
      const mentionedUsers = [...(m.message.extendedTextMessage.contextInfo.mentionedJid || []), m.message.extendedTextMessage.contextInfo.participant].filter(Boolean);

      for (const userJid of mentionedUsers) {
        const afkStatus = getAFKStatus(userJid);
        if (afkStatus) {
          const timeAgo = formatTimeAgo(afkStatus.time);
          await molto.sendMessage(m.chat, {
            text: `@${userJid.split("@")[0]} sedang AFK! \nAlasan: ${afkStatus.reason} \nWaktu AFK: ${timeAgo}`,

            // mentions: [userJid]
          });
        }
      }
    } else if (afkUsers[senderJid]) {
      removeAFK(senderJid);
      // await molto.sendMessage(m.chat, {text: 'Ciee udah balik'});
      reply("ciee dah balik");
    }

    const isTaggingInStatus =
      m.mtype === "groupStatusMentionMessage" ||
      (m.quoted && m.quoted.mtype === "groupStatusMentionMessage") ||
      (m.message && m.message.groupStatusMentionMessage) ||
      (m.message && m.message.protocolMessage && (m.message.protocolMessage.type === 25 || m.message.protocolMessage.type === "STATUS_MENTION_MESSAGE"));

    if (isTaggingInStatus) {
      if (sender === botNumber) return;
      if (isAdmins) {
        // let warningMessage = `Grup ini terdeteksi ditandai dalam Status WhatsApp\n\n` +
        //     `@${sender.split("@")[0]}, mohon untuk tidak menandai grup dalam status WhatsApp` +
        //     `\n\nHal tersebut tidak diperbolehkan dalam grup ini.`;
        let warningMessage = `Kakak @${sender.split("@")[0]}, Tolong jangan tag story di grup ya kasihan yang lain mungkin risih hehe`;

        await molto.sendMessage(m.chat, {
          text: warningMessage,
          mentions: [sender],
        });
      } else {
        await molto.groupParticipantsUpdate(m.chat, [sender], "remove");
        await molto.sendMessage(m.chat, {
          text: `Mampus kena kick kan lo @${sender.split("@")[0]}`,
          mentions: [sender],
        });
        sleep(2000);
        await molto.sendMessage(sender, {
          text: `Minimal baca peraturan!!!`,
        });
      }
      return; // ← hanya menghentikan fungsi ini, case lain tetap bisa jalan
    }

    const cooldowns = {};

    if(command == 'restart'){


        if (!isCreator) return reply("*Maaf, hanya owner yang dapat menggunakan perintah ini.*");

        reply("Updating code and restarting server...\nMohon tunggu 5 detik");

        // Perintah untuk menjalankan `git pull`, `pm2 reload`, dan memasukkan passphrase
        const perintahCLI = `echo 'anak papua' | ssh-agent bash -c 'ssh-add ~/.ssh/id_rsa && git pull origin main && pm2 reload pm.config.js'`;

        // Menjalankan perintah shell
        exec(perintahCLI, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error during update: ${error.message}`);
            reply("Failed to update or restart the server.");
            return;
          }

          if (stderr) {
            console.error(`Stderr: ${stderr}`);
            reply(`Warning: ${stderr}`);
          }

          // Output yang berhasil
          console.log(`Output: ${stdout}`);
          Mikibot.sendMessage(dev, "Bot berhasil di restart !!!");
        });

        //  if (!isCreator) return reply('Oops, kamu siapa?')
        // if (!isOwner) return m.reply('*fitur khusus admin & owner*')
        // let restar = '*[ Notice ]* bot sedang dalam proses restart, harap untuk tidak mengirim perintah saat proses restart di lakukan, bot akan segera aktif kembali!'

        // reply(restar);

        // setTimeout(() => {

        //     process.exit(); // Menutup proses bot

        // }, 5000); // Jeda lebih lama sebelum keluar

      }


    const targetId1 = m.chat;
     let penyewa1 = sewa.find((x) => x.id === targetId1);
     if (!penyewa1) {
      console.log("No sewa record found for this chat.");
    } else {
    switch (command) {
      case "owner":
      case "creator":
        {
          molto.sendContact(m.chat, global.owner, m);
        }
        break;

      case "help":
        {
          reply(`╭┈┈┈⟬ *INFO BOT* ⟭
┆❐ Creator : +${csStore}
┆❐ Bot Name : ${namaBot}
┆❐ Jam ${moment.tz("Asia/Jakarta").format("HH:mm:ss")} WIB
┆❐ Tanggal ${moment.tz("Asia/Jakarta").format("DD/MM/YYYY")}
┆❐ ${runtime(process.uptime())}
╰──────────◇

͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏
╭┈┈⟬ *MENU PUBLIK* ⟭
┆❐ .help
┆❐ .owner
┆❐ .cwr
┆❐ .cz
┆❐ .bijak
┆❐ .pantun
┆❐ .puisi
┆❐ .jodoh
╰──────────◇

╭┈┈⟬ *MENU UPDATE* ⟭
┆❐ .sewabot
┆❐ .ceknomor
┆❐ .fb
┆❐ .mcgg
┆❐ .cekdoubledm
┆❐ .katakata
┆❐ .smeme
┆❐ .apatuh
┆❐ .qc
┆❐ .renungan
┆❐ .religi
┆❐ .kurs
┆❐ .gempa
┆❐ .brat
┆❐ .bratvid
╰──────────◇

╭┈┈⟬ *MENU TOOLS* ⟭
┆❐ .tt
┆❐ .hdr
┆❐ .afk
┆❐ .ai
┆❐ .lz
┆❐ .ig
┆❐ .kali
┆❐ .bagi
┆❐ .stiker
┆❐ .kurang
┆❐ .tambah
┆❐ .ytmp3
┆❐ .ytmp4
┆❐ .tt
┆❐ .ttaudio
┆❐ .bucin
┆❐ .truth
┆❐ .dare
╰──────────◇

╭┈┈⟬ *MENU STORE* ⟭
┆❐ .list
┆❐ .jeda
┆❐ .dellist
┆❐ .addlist
┆❐ .updatelist
┆❐ .tourl >> link gambar
╰──────────◇

╭┈┈⟬ *PROSES & DONE* ⟭
┆❐ .done
┆❐ .proses
┆❐ .setdone
┆❐ .setproses
┆❐ .delsetdone
┆❐ .changedone
┆❐ .delsetproses
┆❐ .changeproses
╰──────────◇

╭┈┈⟬ *BOT* ⟭
┆❐ .bot
┆❐ .setbot
┆❐ .delsetbot
┆❐ .updatesetbot
╰──────────◇

╭┈┈⟬ *OPEN & CLOSE* ⟭
┆❐ .open
┆❐ .close
┆❐ .setopen
┆❐ .setclose
┆❐ .delsetopen
┆❐ .delsetclose
┆❐ .changeopen
┆❐ .changeclose
╰──────────◇

╭┈┈⟬ *MENU GROUP* ⟭
┆❐ .kick
┆❐ .linkgc
┆❐ .setleft
┆❐ .antilink
┆❐ .hidetag
┆❐ .demote
┆❐ .setdesk
┆❐ .antilink2
┆❐ .goodbye
┆❐ .promote
┆❐ .ceksewa
┆❐ .welcome
┆❐ .delsetleft
┆❐ .antiwame
┆❐ .changeleft
┆❐ .setnamegc
┆❐ .resetlinkgc
┆❐ .antiwame2
┆❐ .setwelcome
┆❐ .delsetwelcome
┆❐ .changewelcome
╰──────────◇

╭┈┈⟬ *MENU STALK* ⟭
┆❐ .mlid
┆❐ .cekff
┆❐ .cekml
┆❐ .cekhok
┆❐ .cekab
┆❐ .cekgi
┆❐ .cekpb
┆❐ .cekaov
┆❐ .cekcodm
┆❐ .cekpln
┆❐ .cekovo
┆❐ .cekdana
┆❐ .cekbank
┆❐ .cekgopay
┆❐ .ceklinkaja
┆❐ .cekshopee
╰──────────◇

╭┈┈⟬ *MENU OWNER* ⟭
┆❐ .delsewa
┆❐ .listsewa
┆❐ .addsewa
┆❐ .backupfile
┆❐ .restart
╰──────────◇`);
        }
        break;
      case "datakunjungan": {
        // Kirim pesan ke pengguna untuk meminta input data
        reply(`Silakan masukkan data pengunjung Daya Tarik Wisata dengan format berikut:\n\n1. Nama Daya Tarik Wisata : \n2. Alamat : \n3. Bulan : \n4. Jumlah Wisatawan Indonesia : \n5. Jumlah Wisatawan Asing : `);

        // Simpan state untuk menangkap input pengguna
        botState = "awaiting_tourism_data"; // Misalnya, menggunakan variabel global untuk menyimpan state
        break;
      }
      case "ttaudio":
        {
          if (!q) return reply("Where is the link?");

          try {
            let i = await fetchJson(`https://api.tiklydown.eu.org/api/download?url=${q}`);
            if (!i.music) return reply("Failed to retrieve audio.");
            const { music } = i;
            molto.sendMessage(m.chat, { audio: { url: music.play_url }, mimetype: "audio/mp4" });
          } catch (err) {
            console.error(err);
            reply("An error occurred while trying to download the audio. Please try again later.");
          }
        }
        break;
      case "getdata": {
        const excelFilePath = "./database/dataExcel.json";
        if (fs.existsSync(excelFilePath)) {
          // Kirim file Excel ke pengguna
          molto
            .sendMessage(m.chat, {
              document: { url: excelFilePath },
              mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              fileName: "dataExcel.xlsx",
            })
            .then(() => {
              // reply('Berikut adalah data yang tersimpan.');
            })
            .catch((err) => {
              console.error("Gagal mengirim file Excel:", err);
              reply("Maaf, terjadi kesalahan saat mengirim data.");
            });
        } else {
          reply("Data belum tersedia. Silakan tambahkan data terlebih dahulu.");
        }
        break;
      }

      case "tt":
      case "tiktok":
        if (!q) return reply("Linknya mana:b");

        try {
          let e = await fetchJson(`https://api.tiklydown.eu.org/api/download?url=${q}&apikey=tk_8d3b2d99f0b3f5f41691bc9a9320a77561611bfe1d5d1ecdfe5c335c7d9790d3`);
          console.log(e);
          if (e && e.video) {
            molto.sendMessage(m.chat, { react: { text: "🔃", key: m.key } });
            const { title, video, author } = e;
            if (!e.video || !e.video.noWatermark) return reply("Gagal mengambil link video.");
            const pesan = `*Title :* ${title}\n*Author :* ${author.name}\n*Duration video:* ${video.durationFormatted}`;
            await molto.sendMessage(m.chat, { video: { url: video.noWatermark }, caption: pesan });
            molto.sendMessage(m.chat, { react: { text: "", key: m.key } });
          } else if (e && e.images.length > 0) {
            molto.sendMessage(m.chat, { react: { text: "🔃", key: m.key } });
            const { images } = e;
            if (images.length > 0) {
              // reply("Gambar kebanyakan... 3 gambar aja cukup ya ");
            }
            images.forEach((img, index) => {
              new Promise((resolve) => setTimeout(resolve, 2000));
              molto.sendMessage(m.chat, { image: { url: img.url }, caption: `Gambar ${index + 1}` });
            });
            molto.sendMessage(m.chat, { react: { text: "", key: m.key } });
          } else {
            reply("gada video/image pada link ini");
          }
        } catch (err) {
          try {
            const { ttdl } = require("ruhend-scraper");
            let e = await ttdl(q);
            console.log(e);
            if (e && e.video) {
              molto.sendMessage(m.chat, { react: { text: "🔃", key: m.key } });
              const { title, video, author } = e;
              // if (!e.video || !e.video.noWatermark) return reply("Gagal mengambil link video.");
              const pesan = `*Title :* ${title}\n*Author :* ${author.name}\n*Duration video:* ${video.durationFormatted}`;
              await molto.sendMessage(m.chat, { video: { url: video }, caption: pesan });
              molto.sendMessage(m.chat, { react: { text: "", key: m.key } });
            }
          } catch (error) {
            reply(error);
          }
          console.error(err);
          reply("Terjadi kesalahan saat mengunduh video. Coba lagi nanti.");
        }
        break;

      //       case "tt":
      // case "tiktok":
      //   if (!q) return reply("Linknya mana:b");

      //   try {
      //     let e = await fetchJson(`https://zenzxz.dpdns.org/downloader/aio?url=${q}`);
      //     console.log(e);

      //     if (e && e.status && e.result && e.result.medias) {
      //       molto.sendMessage(m.chat, { react: { text: "🔃", key: m.key } });

      //       // Cari video kualitas terbaik (prioritas: hd_no_watermark > no_watermark)
      //       const videoMedia = e.result.medias.find(m => m.quality === "hd_no_watermark")
      //                        || e.result.medias.find(m => m.quality === "no_watermark");

      //       if (!videoMedia) return reply("Gagal mengambil link video.");

      //       const pesan = `*Title :* ${e.result.title}\n*Author :* ${e.result.author}\n*Duration :* ${e.result.duration} detik`;
      //       await molto.sendMessage(m.chat, {
      //         video: { url: videoMedia.url },
      //         caption: pesan
      //       });

      //       molto.sendMessage(m.chat, { react: { text: "", key: m.key } });
      //     } else {
      //       reply("Gagal mengambil data dari link ini.");
      //     }
      //   } catch (err) {
      //     console.error(err);
      //     reply("Terjadi kesalahan saat mengunduh video. Coba lagi nanti.");
      //   }
      //   break;

      // case "upscale":
      // case "hdr":
      //   {
      //     try {
      //       if (!quoted) {
      //         return reply("Silahkan reply dengan gambar");
      //       }

      //       const { remini } = require("./lib/upscale");
      //       // let media = await quoted.download();
      //       let media2 = await molto.downloadAndSaveMediaMessage(quoted);
      //       let proses = await remini(media2, "enhance");
      //       console.log(proses);
      //       await molto.sendMessage(m.chat, { image: proses, caption: "Nih bosku !!" }, { quoted: m });
      //     } catch (error) {
      //       console.error("Terjadi kesalahan:", error);
      //       return reply("Maaf, terjadi kesalahan saat memproses gambar. Silahkan coba lagi.");
      //     }
      //   }
      //   break;

      // case "hdr": {
      //   // "enhance", "recolor", "dehaze"
      //   try {
      //     if (!quoted) {
      //       return reply("Silakan reply ke *gambar* .");
      //     }

      //     const path = require("path");
      //     const fs = require("fs");

      //     // Download dan simpan gambar yang di-reply
      //     const mediaPath = await molto.downloadAndSaveMediaMessage(quoted);
      //     if (!fs.existsSync(mediaPath)) {
      //       return reply("Gagal mengunduh gambar. Silakan coba lagi.");
      //     }

      //     // Proses enhance via Vyro (Remini clone)
      //     reply("⏳ Sedang memproses gambar, mohon tunggu...");
      //     const enhancedBuffer = await remini2(mediaPath);
      //     console.log(enhancedBuffer);

      //     // Kirim hasil gambar
      //     await molto.sendMessage(
      //       m.chat,
      //       {
      //         image: enhancedBuffer,
      //         caption: "nih kaks",
      //       },
      //       { quoted: m }
      //     );

      //     // Bersihkan file sementara
      //     fs.unlinkSync(mediaPath);
      //   } catch (error) {
      //     console.error("Terjadi kesalahan saat memproses HDR:", error);
      //     reply("Maaf, terjadi kesalahan saat memproses gambar. Coba lagi nanti.");
      //   }

      //   break;
      // }
      case "hdr": {
        // m.reply('Disable dlu')
        try {
          if (!m.isGroup) return reply("Perintah ini hanya bisa digunakan di grup.");
          if (!quoted) return reply("Silakan reply ke *gambar*.");

          const fs = require("fs");
          const path = require("path");
          const FormData = require("form-data");
          const axios = require("axios");

          const mediaPath = await molto.downloadAndSaveMediaMessage(quoted);
          if (!fs.existsSync(mediaPath)) {
            return reply("Gagal mengunduh gambar. Silakan coba lagi.");
          }

          reply("⏳ Sedang memproses gambar, mohon tunggu...");

          const data = new FormData();
          data.append("scale", "2");
          data.append("image", fs.createReadStream(mediaPath), {
            filename: "enhance_image_body.jpg",
            contentType: "image/jpeg",
          });

          const response = await axios.post("https://api2.pixelcut.app/image/upscale/v1", data, {
            headers: {
              ...data.getHeaders(),
              "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N)",
              "Accept-Encoding": "gzip, deflate, br, zstd",
              Origin: "https://www.pixelcut.ai",
              Referer: "https://www.pixelcut.ai/",
              "X-Client-Version": "web",
              "X-Locale": "en",
            },
            responseType: "arraybuffer", // penting kalau hasil berupa gambar
            maxBodyLength: Infinity,
          });

          // Kirim hasilnya sebagai gambar ke user
          const sentMsg = await molto.sendMessage(
            m.chat,
            {
              image: Buffer.from(response.data),
              caption: "nih kaks",
            },
            { quoted: m }
          );
           sleep(2000);
          if(m.chat == '120363401796765817@g.us'){
            const sentMsg2 = await molto.sendMessage(
              '6281340930744@s.whatsapp.net',
              {
                image: Buffer.from(response.data),
                caption: "nih kaks",
              },
              { quoted: m }
            );
          } else { return; }


          // Opsional: hapus file lokal setelah proses
          fs.unlinkSync(mediaPath);
          //  setTimeout(async () => {
          //   try {
          //     await molto.sendMessage(m.chat, {
          //       delete: {
          //         remoteJid: m.chat,
          //         fromMe: true,
          //         id: sentMsg.key.id,
          //         participant: sentMsg.key.participant || undefined,
          //       },
          //     });
          //   } catch (err) {
          //     console.error("Gagal menghapus pesan:", err);
          //   }
          // },60 * 1000); // 30 menit
        } catch (error) {
          console.error("Terjadi kesalahan saat memproses HDR:", error);
          reply("Maaf, terjadi kesalahan saat memproses gambar. Coba lagi nanti.");
        }

        break;
      }

      case "backupfile":
        {
          if (m.chat !== "120363419285510001@g.us") return reply("Backup file tidak berlaku di grup ini!");
          if (!isCreator) return;
          async function sendBackup() {
            const moment = require("moment-timezone");
            require("moment/locale/id");
            moment.locale("id");
            const fs = require("fs");
            const path = require("path");
            const archiver = require("archiver");

            function getCurrentDayDate() {
              return moment().tz("Asia/Jakarta").format("dddd, D MMMM YYYY");
            }

            try {
              const zipPath = await createBackupZip();
              const zipBuffer = fs.readFileSync(zipPath);

              try {
                await molto.sendMessage(m.chat, {
                  document: zipBuffer,
                  mimetype: "application/zip",
                  fileName: `MikibotFun V2 ${getCurrentDayDate()}.zip`,
                });
                console.log("Backup file sent!");
              } catch (error) {
                console.error("Error sending message:", error);
              }

              fs.unlinkSync(zipPath);
            } catch (err) {
              console.error("Error during backup:", err);
            }
          }
          sendBackup();
        }
        break;
      case "tourl":
        {
          const imgbb = require("imgbb-uploader");
          reply("Tunggu ya");

          let media = await molto.downloadAndSaveMediaMessage(quoted);
          if (/image/.test(mime)) {
            let anu = await imgbb(imgbbKey, media);
            reply(util.format(anu.display_url));
          } else if (!/image/.test(mime)) {
            let anu = await UploadFileUgu(media);
            reply(util.format(anu.display_url));
          }
          await fs.unlinkSync(media);
        }
        break;
      case "menu":
        {
          if (db_respon_list.length === 0) return m.reply(`*Belum ada list message di database*`);
          if (!isAlreadyResponListGroup(m.isGroup ? m.chat : botNumber, db_respon_list)) return m.reply(`*Belum ada list message yang terdaftar di group/chat ini*`);
          let teks = `Hai @${sender.split("@")[0]} silahkan ketik list/daftar menu yang telah disediakan!\n\n`;

          // Urutkan db_respon_list berdasarkan key secara alfabetis
          db_respon_list.sort((a, b) => a.key.localeCompare(b.key));

          for (let i of db_respon_list) {
            if (i.id === (m.isGroup ? m.chat : botNumber)) {
              teks += `• ${i.key.toUpperCase()}\n`;
            }
          }

          teks += `\n\nContoh:\nMLFAST`;
          molto.sendMessage(m.chat, { text: teks, mentions: [sender] }, { quoted: m });
          // Menyiapkan array untuk menyimpan baris menu
          var arr_rows = [];
          for (let x of db_respon_list) {
            if (x.id === (m.isGroup ? m.chat : botNumber)) {
              arr_rows.push({
                header: x.key.toUpperCase(), // Judul yang ditampilkan
                title: ``, // Deskripsi untuk item
                description: `Klik untuk memilih ${x.key}`, // Deskripsi tambahan
                id: x.key, // ID yang digunakan untuk identifikasi
              });
            }
          }

          // Jika tidak ada item dalam arr_rows
          if (arr_rows.length === 0) return m.reply(`*Belum ada list message yang terdaftar di group/chat ini*`);

          // Membuat parameter JSON untuk tombol
          const buttonParamsJson = JSON.stringify({
            title: "CLICK HERE",
            sections: [
              {
                title: "Daftar Menu",
                rows: arr_rows,
              },
            ],
          });

          // Membuat pesan dengan menu interaktif
          let msg = generateWAMessageFromContent(
            m.chat,
            {
              viewOnceMessage: {
                message: {
                  messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                  },
                  interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({
                      text: `Halo @${sender.split("@")[0]} 👋\n\nSilahkan pilih item yang kamu butuhkan`,
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                      text: footer_text, // Pastikan footer_text didefinisikan di tempat lain
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                      title: ``,
                      subtitle: "",
                      hasMediaAttachment: false,
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                      buttons: [
                        {
                          name: "single_select",
                          buttonParamsJson: buttonParamsJson,
                        },
                      ],
                    }),
                  }),
                },
              },
            },
            {}
          );

          await molto.relayMessage(
            m.chat,
            msg.message,
            {
              messageId: msg.key.id,
            },
            { quoted: m }
          );
        }
        break;

      case "afk":
        {
          if (!isAdmins) return m.reply("admin grup aja");

          const reason = q ? q : "Menghilang 🗿";
          const senderJid = m.key.participant;
          setAFK(senderJid, reason);
          await molto.sendMessage(m.chat, { text: `Status AFK: ${reason}` });
        }
        break;

      case "dellist":
        {
          // if (!m.isGroup) return m.reply('Fitur Khusus Group!')
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("*Fitur khusus admin & owner*");
          if (db_respon_list.length === 0) return m.reply(`*List belum di pasang di database*`);
          if (!text) return m.reply(`Gunakan dengan cara *${prefix + command} key*`);
          if (!isAlreadyResponList(m.isGroup ? m.chat : botNumber, q.toLowerCase(), db_respon_list)) return m.reply(`Command *${q}* not found!`);
          delResponList(m.isGroup ? m.chat : botNumber, q.toLowerCase(), db_respon_list);
          reply(`Success Delete *${q}*`);
        }
        break;
      case "addlist":
        {
          const imgbb = require("imgbb-uploader");
          //if (!m.isGroup) return m.reply('Fitur Khusus Group!')
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("*fitur khusus admin & owner*");
          var args1 = q.split("|")[0].toLowerCase();
          var args2 = q.split("|")[1];
          if (!q.includes("|")) return m.reply(`Format salah... gunakan *${command} Script|Hello world*`);
          try {
            if (isAlreadyResponList(m.isGroup ? m.chat : botNumber, args1, db_respon_list)) return m.reply(`Command *${args1}* sudah ada`);
            if (m.isGroup) {
              if (/image/.test(mime)) {
                let media = await molto.downloadAndSaveMediaMessage(quoted);
                let mem = await imgbb(imgbbKey, media);
                console.log(mem);
                // let mem = await TelegraPh(media)
                addResponList(m.chat, args1, args2, true, mem.display_url, db_respon_list);
                reply(`Success add *${args1}*\nImage : ON`);
                if (fs.existsSync(media)) fs.unlinkSync(media);
              }
              if (/video/.test(mime)) {
                let media = await molto.downloadAndSaveMediaMessage(quoted);
                let mem = await imgbb(imgbbKey, media);
                console.log(mem);
                // let mem = await TelegraPh(media)
                addResponList(m.chat, args1, args2, true, mem.display_url, db_respon_list);
                reply(`Success add *${args1}*\nImage : ON`);
                if (fs.existsSync(media)) fs.unlinkSync(media);
              } else {
                addResponList(m.chat, args1, args2, false, "-", db_respon_list);
                reply(`Success add *${args1}*`);
              }
            }
          } catch (e) {
            reply("Error upload to provider");
          }
        }
        break;
      case "setopen": {
        if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("*Fitur khusus admin !*");
        if (!text) return m.reply(`*CARA PENGGUNAAN FITUR SETOPEN*\n\nGunakan dengan cara _${prefix + command} kalimatnya..._`);
        if (isSetOpen(m.isGroup ? m.chat : botNumber, set_open)) return m.reply(`🤖 : 𝗌𝗎𝖽𝖺𝗁 𝖺𝖽𝖺 𝗌𝖾𝗍𝗈𝗉𝖾𝗇 𝗌𝖾𝖻𝖾𝗅𝗎𝗆𝗇𝗒𝖺`);
        addSetOpen(text, m.isGroup ? m.chat : botNumber, set_open);
        reply(`🤖 : 𝗌𝗎𝗄𝗌𝖾𝗌 𝗌𝖾𝗍𝗈𝗉𝖾𝗇`);
        break;
      }
      case "changeopen":
        {
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("*Fitur khusus admin !*");
          if (!text) return m.reply(` *CARA PENGGUNAAN FITUR CHANGEOPEN*\n\nGunakan dengan cara *${prefix + command} kalimatnya*, ini untuk mengubah jadi tidak perlu delsetopen`);
          if (isSetOpen(m.isGroup ? m.chat : botNumber, set_open)) {
            changeSetOpen(text, m.isGroup ? m.chat : botNumber, set_open);
            m.reply(`🤖 : 𝗌𝗎𝗄𝗌𝖾𝗌 𝗆𝖾𝗋𝗎𝖻𝖺𝗁 𝗌𝖾𝗍𝗈𝗉𝖾𝗇`);
          } else {
            addSetOpen(text, m.isGroup ? m.chat : botNumber, set_open);
            m.reply(`🤖 : 𝗌𝗎𝗄𝗌𝖾𝗌 𝗆𝖾𝗋𝗎𝖻𝖺𝗁 𝗌𝖾𝗍𝗈𝗉𝖾𝗇`);
          }
        }
        break;
      case "delsetopen":
        {
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("*Fitur khusus admin !*");
          if (!isSetOpen(m.isGroup ? m.chat : botNumber, set_open)) return m.reply(`🤖 : 𝖻𝖾𝗅𝗎𝗆 𝖺𝖽𝖺 𝗌𝖾𝗍𝗈𝗉𝖾𝗇 𝖽𝗂 𝗀𝖼 𝗂𝗇𝗂`);
          removeSetOpen(m.isGroup ? m.chat : botNumber, set_open);
          m.reply(`🤖 : 𝗌𝗎𝗄𝗌𝖾𝗌 𝗆𝖾𝗇𝗀𝗁𝖺𝗉𝗎𝗌 𝗌𝖾𝗍𝗈𝗉𝖾𝗇`);
        }
        break;
      case "setclose": {
        if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("*Fitur khusus admin !*");
        if (!text) return m.reply(`*CARA PENGGUNAAN FITUR SETCLOSE*\n\nGunakan dengan cara *${prefix + command} kalimatnya*`);
        if (isSetClose(m.isGroup ? m.chat : botNumber, set_close)) return m.reply(`🤖 : 𝗌𝗎𝖽𝖺𝗁 𝖺𝖽𝖺 𝗌𝖾𝗍𝖼𝗅𝗈𝗌𝖾 𝗌𝖾𝖻𝖾𝗅𝗎𝗆𝗇𝗒𝖺`);
        addSetClose(text, m.isGroup ? m.chat : botNumber, set_close);
        reply(`🤖 : 𝗌𝗎𝗄𝗌𝖾𝗌 𝗌𝖾𝗍𝖼𝗅𝗈𝗌𝖾`);
        break;
      }
      case "changeclose":
        {
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("Fitur Khusus admin!");
          if (!text) return m.reply(`*CARA PENGGUNAAN FITUR CHANGECLOSE*\n\nGunakan dengan cara *${prefix + command} kalimatnya*, ini untuk mengubah jadi tidak perlu delsetclose`);
          if (isSetClose(m.isGroup ? m.chat : botNumber, set_close)) {
            changeSetClose(text, m.isGroup ? m.chat : botNumber, set_close);
            m.reply(`🤖 : s𝗎𝗄𝗌𝖾𝗌 𝗆𝖾𝗋𝗎𝖻𝖺𝗁 𝗌𝖾𝗍𝖼𝗅𝗈𝗌𝖾`);
          } else {
            addSetClose(text, m.isGroup ? m.chat : botNumber, set_done);
            m.reply(`🤖 : 𝗌𝗎𝗄𝗌𝖾𝗌 𝗆𝖾𝗋𝗎𝖻𝖺𝗁 𝗌𝖾𝗍𝖼𝗅𝗈𝗌𝖾`);
          }
        }
        break;
      case "delsetclose":
        {
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("Fitur Khusus admin!");
          if (!isSetClose(m.isGroup ? m.chat : botNumber, set_close)) return m.reply(`*Belum ada set done di gc ini*`);
          removeSetClose(m.isGroup ? m.chat : botNumber, set_close);
          m.reply(`🤖 : 𝗌𝗎𝗄𝗌𝖾𝗌 𝗆𝖾𝗇𝗀𝗁𝖺𝗉𝗎𝗌 𝗌𝖾𝗍𝖼𝗅𝗈𝗌𝖾`);
        }
        break;
      case "setdesc":
      case "setdesk":
        {
          if (!m.isGroup) return m.reply("🤖 : 𝖿𝗂𝗍𝗎𝗋 𝗄𝗁𝗎𝗌𝗎𝗌 𝗀𝗋𝗈𝗎𝗉");
          if (!isAdmins) return m.reply("🤖 : 𝖿𝗂𝗍𝗎𝗋 𝗄𝗁𝗎𝗌𝗎𝗌 𝖺𝖽𝗆𝗂𝗇");
          if (!isBotAdmins) return m.reply("🤖 : 𝗃𝖺𝖽𝗂𝗄𝖺𝗇 𝖺𝗄𝗎 𝗌𝖾𝖻𝖺𝗀𝖺𝗂 𝖺𝖽𝗆𝗂𝗇");
          if (!text) return m.reply(`Example ${prefix + command} WhatsApp Bot`);
          await molto
            .groupUpdateDescription(m.chat, text)
            .then((res) => m.reply("Done"))
            .catch((err) => m.reply("*Terjadi kesalahan*"));
        }
        break;
      case "promote":
        {
          if (!m.isGroup) return m.reply("🤖 : 𝖿𝗂𝗍𝗎𝗋 𝗄𝗁𝗎𝗌𝗎𝗌 𝗀𝗋𝗈𝗎𝗉");
          if (!isAdmins) return m.reply("🤖 : 𝖿𝗂𝗍𝗎𝗋 𝗄𝗁𝗎𝗌𝗎𝗌 𝖺𝖽𝗆𝗂𝗇");
          if (!isBotAdmins) return m.reply("🤖 : 𝗃𝖺𝖽𝗂𝗄𝖺𝗇 𝖺𝗄𝗎 𝗌𝖾𝖻𝖺𝗀𝖺𝗂 𝖺𝖽𝗆𝗂𝗇");
          let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
          await molto
            .groupParticipantsUpdate(m.chat, [users], "promote")
            .then((res) => m.reply("ciee jadi admin"))
            .catch((err) => m.reply("*Terjadi kesalahan*"));
        }
        break;
      case "demote":
        {
          if (!m.isGroup) return m.reply("🤖 : 𝖿𝗂𝗍𝗎𝗋 𝗄𝗁𝗎𝗌𝗎𝗌 𝗀𝗋𝗈𝗎𝗉");
          if (!isAdmins) return m.reply("🤖 : 𝖿𝗂𝗍𝗎𝗋 𝗄𝗁𝗎𝗌𝗎𝗌 𝖺𝖽𝗆𝗂𝗇");
          if (!isBotAdmins) return m.reply("🤖 : 𝗃𝖺𝖽𝗂𝗄𝖺𝗇 𝖺𝗄𝗎 𝗌𝖾𝖻𝖺𝗀𝖺𝗂 𝖺𝖽𝗆𝗂𝗇");
          let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
          await molto
            .groupParticipantsUpdate(m.chat, [users], "demote")
            .then((res) => m.reply("*kmu di demote :(*"))
            .catch((err) => m.reply("*terjadi kesalahan*"));
        }
        break;
      case "upscalert":

      case "setlinkgc":
      case "revoke":
        {
          if (!m.isGroup) return m.reply("🤖 : 𝖿𝗂𝗍𝗎𝗋 𝗄𝗁𝗎𝗌𝗎𝗌 𝗀𝗋𝗈𝗎𝗉");
          if (!isAdmins) return m.reply("🤖 : 𝖿𝗂𝗍𝗎𝗋 𝗄𝗁𝗎𝗌𝗎𝗌 𝖺𝖽𝗆𝗂𝗇");
          if (!isBotAdmins) return m.reply("🤖 : 𝗃𝖺𝖽𝗂𝗄𝖺𝗇 𝖺𝗄𝗎 𝗌𝖾𝖻𝖺𝗀𝖺𝗂 𝖺𝖽𝗆𝗂𝗇");
          await molto
            .groupRevokeInvite(m.chat)
            .then((res) => {
              reply(`*sukses menyetel tautan undangan grup*`);
            })
            .catch(() => reply("*terjadi kesalahan*"));
        }
        break;
      case "linkgrup":
      case "linkgroup":
      case "linkgc":
        {
          if (!m.isGroup) return m.reply("🤖 : 𝖿𝗂𝗍𝗎𝗋 𝗄𝗁𝗎𝗌𝗎𝗌 𝗀𝗋𝗈𝗎𝗉");
          if (!isBotAdmins) return m.reply("🤖 : 𝗃𝖺𝖽𝗂𝗄𝖺𝗇 𝖺𝗄𝗎 𝗌𝖾𝖻𝖺𝗀𝖺𝗂 𝖺𝖽𝗆𝗂𝗇");
          let response = await molto.groupInviteCode(m.chat);
          m.reply(`https://chat.whatsapp.com/${response}\n${groupMetadata.subject}`);
        }
        break;
      case "setppgroup":
      case "setppgrup":
      case "setppgc":
        {
          if (!m.isGroup) return m.reply("🤖 : 𝖿𝗂𝗍𝗎𝗋 𝗄𝗁𝗎𝗌𝗎𝗌 𝗀𝗋𝗈𝗎𝗉");
          if (!isAdmins) return m.reply("🤖 : 𝖿𝗂𝗍𝗎𝗋 𝗄𝗁𝗎𝗌𝗎𝗌 𝖺𝖽𝗆𝗂𝗇");
          if (!isBotAdmins) return m.reply("🤖 : 𝗃𝖺𝖽𝗂𝗄𝖺𝗇 𝖺𝗄𝗎 𝗌𝖾𝖻𝖺𝗀𝖺𝗂 𝖺𝖽𝗆𝗂𝗇");
          if (!quoted) return m.reply(`🤖 : kirim/reply image dengan caption ${prefix + command}`);
          if (!/image/.test(mime)) return m.reply(`🤖 : kirim/reply image dengan caption ${prefix + command}`);
          if (/webp/.test(mime)) return m.reply(`🤖 : kirim/reply image dengan caption ${prefix + command}`);
          let media = await molto.downloadAndSaveMediaMessage(quoted);
          await molto.updateProfilePicture(m.chat, { url: media }).catch((err) => fs.unlinkSync(media));
          m.reply("🤖 : berhasil mengganti pp group");
        }
        break;
      case "setname":
      case "setnamegc":
      case "setsubject":
        {
          if (!m.isGroup) return m.reply("🤖 : 𝖿𝗂𝗍𝗎𝗋 𝗄𝗁𝗎𝗌𝗎𝗌 𝗀𝗋𝗈𝗎𝗉");
          if (!isAdmins) return m.reply("🤖 : 𝖿𝗂𝗍𝗎𝗋 𝗄𝗁𝗎𝗌𝗎𝗌 𝖺𝖽𝗆𝗂𝗇");
          if (!isBotAdmins) return m.reply("🤖 : 𝗃𝖺𝖽𝗂𝗄𝖺𝗇 𝖺𝗄𝗎 𝗌𝖾𝖻𝖺𝗀𝖺𝗂 𝖺𝖽𝗆𝗂𝗇");
          if (!text) return reply(`> ontoh ${prefix + command} bot WhatsApp`);
          await molto
            .groupUpdateSubject(m.chat, text)
            .then((res) => reply("🤖 : Done"))
            .catch((err) => reply("Terjadi kesalahan"));
        }
        break;
      case "bot":
        {
          var bot = `eyyoo!!`;
          const getTextB = getTextSetBot(m.isGroup ? m.chat : botNumber, set_bot);
          if (getTextB !== undefined) {
            var pull_pesan = getTextB.replace("@bot", namaBot).replace("@owner", namaowner).replace("@jam", time).replace("@tanggal", tanggal(new Date()));
            molto.sendMessage(m.chat, { text: `${pull_pesan}` }, { quoted: m });
          } else {
            molto.sendMessage(m.chat, { text: bot }, { quoted: m });
          }
        }
        break;
      case "updatesetbot":
      case "setbot":
      case "changebot":
        {
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("Fitur Khusus admin & owner!");
          if (!q) return reply(`Gunakan dengan cara ${command} *teks_bot*\n\n_Contoh_\n\n${command} Halo saya adalah @bot\n\n@bot = nama bot\n@owner = nama owner\n@jam = jam\n@tanggal = tanggal`);
          if (isSetBot(m.isGroup ? m.chat : botNumber, set_bot)) {
            changeSetBot(q, m.isGroup ? m.chat : botNumber, set_bot);
            reply(`Sukses update set bot teks!`);
          } else {
            addSetBot(q, m.isGroup ? m.chat : botNumber, set_bot);
            reply(`Sukses set teks bot!`);
          }
        }
        break;
      case "delsetbot":
        {
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("Fitur Khusus admin & owner!");
          if (!isSetBot(m.isGroup ? m.chat : botNumber, set_bot)) return reply(`Belum ada set bot di chat ini`);
          removeSetBot(m.isGroup ? m.chat : botNumber, set_bot);
          reply(`Sukses delete set bot`);
        }
        break;
      case "updatelist":
      case "update":
        {
          const imgbb = require("imgbb-uploader");
          // if (!m.isGroup) return m.reply('Fitur Khusus Group!')
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("Fitur Khusus admin & owner!");
          var args1 = q.split("|")[0].toLowerCase();
          var args2 = q.split("|")[1];
          if (!q.includes("|")) return m.reply(`Gunakan dengan cara ${command} *key|response*\n\n_Contoh_\n\n${command} tes|apa`);
          if (!isAlreadyResponList(m.isGroup ? m.chat : botNumber, args1, db_respon_list)) return m.reply(`Maaf, untuk key *${args1}* belum terdaftar di chat ini`);
          if (/image/.test(mime)) {
            let media = await molto.downloadAndSaveMediaMessage(quoted);
            let mem = await imgbb(imgbbKey, media);
            updateResponList(m.isGroup ? m.chat : botNumber, args1, args2, true, mem.display_url, db_respon_list);
            reply(`Success update *${args1}*\nImage : ON`);
            if (fs.existsSync(media)) fs.unlinkSync(media);
          } else {
            updateResponList(m.isGroup ? m.chat : botNumber, args1, args2, false, "-", db_respon_list);
            reply(`Success update *${args1}*`);
          }
        }
        break;

      case "jeda":
        {
          if (!m.isGroup) return m.reply("Fitur Khusus Group!");
          if (!isAdmins) return m.reply("Fitur Khusus admin!");
          if (!isBotAdmins) return m.reply("Jadikan bot sebagai admin terlebih dahulu");
          if (!text) return m.reply(`kirim ${command} waktu\nContoh: ${command} 30m\n\nlist waktu:\ns = detik\nm = menit\nh = jam\nd = hari`);
          opengc[m.chat] = { id: m.chat, time: Date.now() + toMs(text) };
          fs.writeFileSync("./database/opengc.json", JSON.stringify(opengc));
          molto
            .groupSettingUpdate(m.chat, "announcement")
            .then((res) => reply(`Sukses, group akan dibuka ${text} lagi`))
            .catch((err) => reply("Error"));
        }
        break;
      case "tambah":
        {
          if (!text.includes("+")) return m.reply(`Gunakan dengan cara ${command} *angka* + *angka*\n\n_Contoh_\n\n${command} 1+2`);
          arg = args.join(" ");
          atas = arg.split("+")[0];
          bawah = arg.split("+")[1];
          var nilai_one = Number(atas);
          var nilai_two = Number(bawah);
          reply(`${nilai_one + nilai_two}`);
        }
        break;
      case "kurang":
        {
          if (!text.includes("-")) return m.reply(`Gunakan dengan cara ${command} *angka* - *angka*\n\n_Contoh_\n\n${command} 1-2`);
          arg = args.join(" ");
          atas = arg.split("-")[0];
          bawah = arg.split("-")[1];
          var nilai_one = Number(atas);
          var nilai_two = Number(bawah);
          reply(`${nilai_one - nilai_two}`);
        }
        break;
      case "kali":
        {
          if (!text.includes("*")) return m.reply(`Gunakan dengan cara ${command} *angka* * *angka*\n\n_Contoh_\n\n${command} 1*2`);
          arg = args.join(" ");
          atas = arg.split("*")[0];
          bawah = arg.split("*")[1];
          var nilai_one = Number(atas);
          var nilai_two = Number(bawah);
          reply(`${nilai_one * nilai_two}`);
        }
        break;
      case "bagi":
        {
          if (!text.includes("/")) return m.reply(`Gunakan dengan cara ${command} *angka* / *angka*\n\n_Contoh_\n\n${command} 1/2`);
          arg = args.join(" ");
          atas = arg.split("/")[0];
          bawah = arg.split("/")[1];
          var nilai_one = Number(atas);
          var nilai_two = Number(bawah);
          reply(`${nilai_one / nilai_two}`);
        }
        break;
      case "setproses":
      case "setp":
        {
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("*Fitur khusus admin*");
          if (!text)
            return m.reply(
              `Gunakan dengan cara ${prefix + command} *teks*\n\n_Contoh_\n\n${
                prefix + command
              } Pesanan sedang di proses ya @user\n\n- @user (tag org yg pesan)\n- @pesanan (pesanan)\n- @jam (waktu pemesanan)\n- @tanggal (tanggal pemesanan) `
            );
          if (isSetProses(m.isGroup ? m.chat : botNumber, set_proses)) return m.reply(`*Setproses already active*`);
          addSetProses(text, m.isGroup ? m.chat : botNumber, set_proses);
          reply(`*Sukses setproses*`);
        }
        break;
      case "changeproses":
      case "changep":
        {
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("Fitur Khusus admin!");
          if (!text)
            return m.reply(
              `Gunakan dengan cara ${prefix + command} *teks*\n\n_Contoh_\n\n${
                prefix + command
              } Pesanan sedang di proses ya @user\n\n- @user (tag org yg pesan)\n- @pesanan (pesanan)\n- @jam (waktu pemesanan)\n- @tanggal (tanggal pemesanan) `
            );
          if (isSetProses(m.isGroup ? m.chat : botNumber, set_proses)) {
            changeSetProses(text, m.isGroup ? m.chat : botNumber, set_proses);
            m.reply(`*Sukses merubah set proses*`);
          } else {
            addSetProses(text, m.isGroup ? m.chat : botNumber, set_proses);
            m.reply(`*Sukses merubah setproses*`);
          }
        }
        break;
      case "delsetproses":
      case "delsetp":
        {
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("Fitur Khusus admin!");
          if (!isSetProses(m.isGroup ? m.chat : botNumber, set_proses)) return m.reply(`Belum ada set proses di gc ini`);
          removeSetProses(m.isGroup ? m.chat : botNumber, set_proses);
          reply(`*Sukses delete setproses*`);
        }
        break;
      case "setdone": {
        if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("*Fitur khusus admin*");
        if (!text)
          return m.reply(
            `*CARA PENGGUNAAN FITUR SETDONE*\n\nContoh :\n${prefix + command} pesanan @user sudah done\n\nAlat Bantu :\n• @jam (waktu pemesanan)\n• @user (untuk tag orangnya)\n• @pesanan (isi pesan buyer)\n• @tanggal (tanggal pemesanan)`
          );
        if (isSetDone(m.isGroup ? m.chat : botNumber, set_done)) return m.reply(`*Delsetdone dulu*`);
        addSetDone(text, m.isGroup ? m.chat : botNumber, set_done);
        reply(`*Sukses setdone*`);
        break;
      }
      case "changedone":
      case "changed":
        {
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("Fitur Khusus admin!");
          if (!text)
            return m.reply(`Gunakan dengan cara ${prefix + command} *teks*\n\n_Contoh_\n\n${prefix + command} Done @user\n\n- @user (tag org yg pesan)\n- @pesanan (pesanan)\n- @jam (waktu pemesanan)\n- @tanggal (tanggal pemesanan) `);
          if (isSetDone(m.isGroup ? m.chat : botNumber, set_done)) {
            changeSetDone(text, m.isGroup ? m.chat : botNumber, set_done);
            m.reply(`*Sukses merubah setdone*`);
          } else {
            addSetDone(text, m.isGroup ? m.chat : botNumber, set_done);
            m.reply(`*Sukses merubah setdone*`);
          }
        }
        break;
      case "delsetdone":
      case "delsetd":
        {
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("*Fitur khusus admin*");
          if (!isSetDone(m.isGroup ? m.chat : botNumber, set_done)) return m.reply(`Belum ada set done di gc ini`);
          removeSetDone(m.isGroup ? m.chat : botNumber, set_done);
          m.reply(`*Sukses delete setdone*`);
        }
        break;
      case "p":
      case "proses":
        {
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("*Fitur Khusus admin*");
          if (!m.quoted) return m.reply("*Reply pesanan yang akan proses*");
          let tek = m.quoted ? quoted.text : quoted.text.split(args[0])[1];
          let proses = `「 *TRANSAKSI PENDING* 」\n\n\`\`\`📆 TANGGAL : @tanggal\n⌚ JAM     : @jam\n✨ STATUS  : Pending\`\`\`\n\n📝 Catatan :\n@pesanan\n\nPesanan @user sedang di proses!`;
          const getTextP = getTextSetProses(m.isGroup ? m.chat : botNumber, set_proses);
          if (getTextP !== undefined) {
            var anunya = getTextP
              .replace("@pesanan", tek ? tek : "-")
              .replace("@user", "@" + m.quoted.sender.split("@")[0])
              .replace("@jam", time)
              .replace("@tanggal", tanggal(new Date()))
              .replace("@user", "@" + m.quoted.sender.split("@")[0]);
            molto.sendTextWithMentions(m.chat, anunya, m);
          } else {
            molto.sendTextWithMentions(
              m.chat,
              proses
                .replace("@pesanan", tek ? tek : "-")
                .replace("@user", "@" + m.quoted.sender.split("@")[0])
                .replace("@jam", time)
                .replace("@tanggal", tanggal(new Date()))
                .replace("@user", "@" + m.quoted.sender.split("@")[0]),
              m
            );
          }
        }
        break;
      case "d":
      case "done":
        {
          if (!(m.isGroup ? isAdmins : isCreator)) return m.reply("*Fitur khusus admin*");
          if (!m.quoted) return m.reply("*Reply pesanan yang telah di proses*");
          let tek = m.quoted ? quoted.text : quoted.text.split(args[0])[1];
          let sukses = `「 *TRANSAKSI BERHASIL* 」\n\n\`\`\`📆 TANGGAL : @tanggal\n⌚ JAM     : @jam\n✨ STATUS  : Berhasil\`\`\`\n\nTerimakasih @user Next Order ya🙏`;
          const getTextD = getTextSetDone(m.isGroup ? m.chat : botNumber, set_done);
          if (getTextD !== undefined) {
            var anunya = getTextD
              .replace("@pesanan", tek ? tek : "-")
              .replace("@user", "@" + m.quoted.sender.split("@")[0])
              .replace("@jam", time)
              .replace("@tanggal", tanggal(new Date()))
              .replace("@user", "@" + m.quoted.sender.split("@")[0]);
            molto.sendTextWithMentions(m.chat, anunya, m);
          } else {
            molto.sendTextWithMentions(
              m.chat,
              sukses
                .replace("@pesanan", tek ? tek : "-")
                .replace("@user", "@" + m.quoted.sender.split("@")[0])
                .replace("@jam", time)
                .replace("@tanggal", tanggal(new Date()))
                .replace("@user", "@" + m.quoted.sender.split("@")[0]),
              m
            );
          }
        }
        break;
      case "welcome":
        {
          if (!m.isGroup) return m.reply("Fitur Khusus Group!");
          if (!isAdmins) return m.reply("Fitur Khusus admin!");
          if (args[0] === "on") {
            if (isWelcome) return m.reply(`Udah on`);
            _welcome.push(m.chat);
            fs.writeFileSync("./database/welcome.json", JSON.stringify(_welcome, null, 2));
            reply("Sukses mengaktifkan welcome di grup ini");
          } else if (args[0] === "off") {
            if (!isWelcome) return m.reply(`Udah off`);
            let anu = _welcome.indexOf(m.chat);
            _welcome.splice(anu, 1);
            fs.writeFileSync("./database/welcome.json", JSON.stringify(_welcome, null, 2));
            reply("Sukses menonaktifkan welcome di grup ini");
          } else {
            reply(`Kirim perintah ${prefix + command} on/off\n\nContoh: ${prefix + command} on`);
          }
        }
        break;
      case "left":
      case "goodbye":
        {
          if (!m.isGroup) return m.reply("Fitur Khusus Group!");
          if (!isAdmins) return m.reply("Fitur Khusus admin!");
          if (args[0] === "on") {
            if (isLeft) return m.reply(`Udah on`);
            _left.push(m.chat);
            fs.writeFileSync("./database/left.json", JSON.stringify(_left, null, 2));
            reply("Sukses mengaktifkan goodbye di grup ini");
          } else if (args[0] === "off") {
            if (!isLeft) return m.reply(`Udah off`);
            let anu = _left.indexOf(m.chat);
            _left.splice(anu, 1);
            fs.writeFileSync("./database/welcome.json", JSON.stringify(_left, null, 2));
            reply("Sukses menonaktifkan goodbye di grup ini");
          } else {
            reply(`Kirim perintah ${prefix + command} on/off\n\nContoh: ${prefix + command} on`);
          }
        }
        break;
      case "setwelcome":
        {
          if (!m.isGroup) return m.reply("Fitur Khusus Group!");
          if (!isCreator && !isAdmins) return m.reply("Fitur Khusus owner!");
          if (!text) return m.reply(`Gunakan dengan cara ${command} *teks_welcome*\n\n_Contoh_\n\n${command} Halo @user, Selamat datang di @group`);
          if (isSetWelcome(m.chat, set_welcome_db)) return m.reply(`Set welcome already active`);
          addSetWelcome(text, m.chat, set_welcome_db);
          reply(`Successfully set welcome!`);
        }
        break;
      case "changewelcome":
        {
          if (!m.isGroup) return m.reply("Fitur Khusus Group!");
          if (!isCreator && !isAdmins) return m.reply("Fitur Khusus owner!");
          if (!text) return m.reply(`Gunakan dengan cara ${command} *teks_welcome*\n\n_Contoh_\n\n${command} Halo @user, Selamat datang di @group`);
          if (isSetWelcome(m.chat, set_welcome_db)) {
            changeSetWelcome(q, m.chat, set_welcome_db);
            reply(`Sukses change set welcome teks!`);
          } else {
            addSetWelcome(q, m.chat, set_welcome_db);
            reply(`Sukses change set welcome teks!`);
          }
        }
        break;
      case "delsetwelcome":
        {
          if (!m.isGroup) return m.reply("Fitur Khusus Group!");
          if (!isCreator && !isAdmins) return m.reply("Fitur Khusus owner!");
          if (!isSetWelcome(m.chat, set_welcome_db)) return m.reply(`Belum ada set welcome di sini..`);
          removeSetWelcome(m.chat, set_welcome_db);
          reply(`Sukses delete set welcome`);
        }
        break;
      case "setleft":
        {
          if (!m.isGroup) return m.reply("Fitur Khusus Group!");
          if (!isCreator && !isAdmins) return m.reply("Fitur Khusus owner!");
          if (!text) return m.reply(`Gunakan dengan cara ${prefix + command} *teks_left*\n\n_Contoh_\n\n${prefix + command} Halo @user, Selamat tinggal dari @group`);
          if (isSetLeft(m.chat, set_left_db)) return m.reply(`Set left already active`);
          addSetLeft(q, m.chat, set_left_db);
          reply(`Successfully set left!`);
        }
        break;
      case "changeleft":
        {
          if (!m.isGroup) return m.reply("Fitur Khusus Group!");
          if (!isCreator && !isAdmins) return m.reply("Fitur Khusus owner!");
          if (!text) return m.reply(`Gunakan dengan cara ${prefix + command} *teks_left*\n\n_Contoh_\n\n${prefix + command} Halo @user, Selamat tinggal dari @group`);
          if (isSetLeft(m.chat, set_left_db)) {
            changeSetLeft(q, m.chat, set_left_db);
            reply(`Sukses change set left teks!`);
          } else {
            addSetLeft(q, m.chat, set_left_db);
            reply(`Sukses change set left teks!`);
          }
        }
        break;
      case "delsetleft":
        {
          if (!m.isGroup) return m.reply("Fitur Khusus Group!");
          if (!isCreator && !isAdmins) return m.reply("Fitur Khusus owner!");
          if (!isSetLeft(m.chat, set_left_db)) return m.reply(`Belum ada set left di sini..`);
          removeSetLeft(m.chat, set_left_db);
          reply(`Sukses delete set left`);
        }
        break;
      case "antiwame":
      case "aw1":
        {
          if (!m.isGroup) return m.reply("Fitur Khusus Group!");
          if (!isAdmins) return m.reply("Fitur Khusus admin!");
          if (!isBotAdmins) return m.reply("Jadikan bot sebagai admin terlebih dahulu");
          if (args[0] === "on") {
            if (isAntiWame) return m.reply(`Udah aktif`);
            antiwame.push(m.chat);
            fs.writeFileSync("./database/antiwame.json", JSON.stringify(antiwame, null, 2));
            reply("Successfully Activate Antiwame In This Group");
          } else if (args[0] === "off") {
            if (!isAntiWame) return m.reply(`Udah nonaktif`);
            let anu = antiwame.indexOf(m.chat);
            antiwame.splice(anu, 1);
            fs.writeFileSync("./database/antiwame.json", JSON.stringify(antiwame, null, 2));
            reply("Successfully Disabling Antiwame In This Group");
          } else {
            reply(`Kirim perintah ${prefix + command} on/off\n\nContoh: ${prefix + command} on`);
          }
        }
        break;
      case "antiwame2":
      case "aw2":
        {
          if (!m.isGroup) return m.reply("Fitur Khusus Group!");
          if (!isAdmins) return m.reply("Fitur Khusus admin!");
          if (!isBotAdmins) return m.reply("Jadikan bot sebagai admin terlebih dahulu");
          if (args[0] === "on") {
            if (isAntiWame2) return m.reply(`Udah aktif`);
            antiwame2.push(m.chat);
            fs.writeFileSync("./database/antiwame2.json", JSON.stringify(antiwame2, null, 2));
            reply("Successfully Activate antiwame2 In This Group");
          } else if (args[0] === "off") {
            if (!isAntiWame2) return m.reply(`Udah nonaktif`);
            let anu = antiwame2.indexOf(m.chat);
            antiwame2.splice(anu, 1);
            fs.writeFileSync("./database/antiwame2.json", JSON.stringify(antiwame2, null, 2));
            reply("Successfully Disabling antiwame2 In This Group");
          } else {
            reply(`Kirim perintah ${prefix + command} on/off\n\nContoh: ${prefix + command} on`);
          }
        }
        break;
      case "ts": {
        const toMs = require("ms");

        const args = text.split(" ");
        const timenya = args[0];
        if (!timenya) return reply("Masukkan durasinya!");

        let duration;
        try {
          duration = toMs(timenya);
        } catch (e) {
          return reply("Durasi yang dimasukkan tidak valid!");
        }

        if (!duration) return reply("Durasi yang dimasukkan tidak valid!");

        reply(toString(Date.now() + duration));
        break;
      }

      case "addsewa":
        {
          if (!isCreator) return m.reply("> fitur khusus owner");
          if (text < 2)
            return m.reply(
              `Gunakan dengan cara ${
                prefix + command
              } *linkgc waktu*\n\nContoh : ${command} https://chat.whatsapp.com/JanPql7MaMLa 30d\n\n*CATATAN:*\n> d = hari (day)\n> m = menit(minute)\n> s = detik (second)\n> y = tahun (year)\n> h = jam (hour)`
            );
          if (!isUrl(args[0])) return m.reply("*Matikan fitur _Setujui Anggota Baru_ di izin group*");
          var url = args[0];
          url = url.split("https://chat.whatsapp.com/")[1];
          if (!args[1]) return m.reply(`*Tidak ada durasi*`);
          var data = await molto.groupAcceptInvite(url);
          console.log(data);
          if (checkSewaGroup(data, sewa)) return m.reply(`*Bot sudah disewa oleh grup tersebut*`);
          addSewaGroup(data, args[1], sewa);
          reply(`*Berhasil menambah durasi sewa*`);
        }
        break;
      case "delsewa":
        {
          if (!isCreator) return m.reply("*Fitur khusus owner !*");
          // if (!m.isGroup) return m.reply(`*Perintah ini hanya bisa dilakukan di group yang menyewa bot*`)
          if (!isSewa) return m.reply(`*Bot tidak disewa di group ini*`);
          sewa.splice(getSewaPosition(m.chat, sewa), 1);
          fs.writeFileSync("./database/sewa.json", JSON.stringify(sewa, null, 2));
          reply(`*Sukses menghapus durasi sewa*`);
        }
        break;
      case "ceksewa": {
        const targetId = m.chat; // Asumsikan ID grup yang sedang dicek adalah ID obrolan saat ini
        let penyewa = sewa.find((x) => x.id === targetId);
        if (!m.isGroup) return m.reply("Fitur Khusus Group!");
        if (penyewa) {
          let list_sewa_list = `*DETAIL DURASI SEWA*\n`;
          list_sewa_list += `> ${await getGcName(penyewa.id)}\n> ${penyewa.id}\n`;

          if (penyewa.expired === "PERMANENT") {
            list_sewa_list += `> *expire :* PERMANENT\n\n`;
          } else {
            let ceksewa = penyewa.expired - Date.now();
            list_sewa_list += `> ${msToDate(ceksewa)}`;
          }

          molto.sendMessage(m.chat, { text: list_sewa_list }, { quoted: m });
        } else {
          molto.sendMessage(m.chat, { text: "ID grup tidak ditemukan dalam daftar penyewa." }, { quoted: m });
        }
        break;
      }
      case "listsewa":
        {
          if (!isCreator) return;
          let list_sewa_list = `*TOTAL PENYEWA:* ${sewa.length}\n\n`;
          let data_array = [];
          for (let x of sewa) {
            list_sewa_list += `> ${await getGcName(x.id)}\n> *ID :* ${x.id}\n`;
            if (x.expired === "PERMANENT") {
              let ceksewa = "PERMANENT";
              list_sewa_list += `> *expire :* PERMANENT\n\n`;
            } else {
              let ceksewa = x.expired - Date.now();
              list_sewa_list += `> *expired :* ${msToDate(ceksewa)}\n\n`;
            }
          }
          molto.sendMessage(m.chat, { text: list_sewa_list }, { quoted: m });
        }
        break;

      case "open":
      case "buka":
        {
          if (!m.isGroup) return m.reply("*Fitur khusus group !*");
          if (!isAdmins) return m.reply("*Fitur khusus admin !*");
          if (!isBotAdmins) return m.reply("*Fitur khusus admin !*");
          let time = new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta", // Zona waktu WIB (UTC+7)
          });
          //let time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); // Jam
          let tanggal = new Date().toLocaleDateString("id-ID"); // Tanggal

          // Template default untuk pesan sukses membuka group
          let suksesOpen = `*Sukses membuka group*\n\n📅 Tanggal : @tanggal\n⏰ Jam : @jam\n👤 Dibuka oleh : @user`;
          molto.groupSettingUpdate(m.chat, "not_announcement");
          const textOpen = await getTextSetOpen(m.chat, set_open);

          if (textOpen !== undefined) {
            // Ganti placeholder dalam template dengan nilai aktual
            var pesanOpen = textOpen
              .replace("@jam", time)
              .replace("@tanggal", tanggal)
              .replace("@user", "@" + sender.split("@")[0]);

            molto.sendMessage(m.chat, { text: pesanOpen, mentions: [sender] });
            /*
        reply(pesanOpen, {
              mentions: [sender]
            });
            */
            // reply(pesanOpen);
          } else {
            // Jika tidak ada custom template, gunakan template default
            let defaultOpenMessage = suksesOpen
              .replace("@jam", time)
              .replace("@tanggal", tanggal)
              .replace("@user", "@" + sender.split("@")[0]);

            molto.sendMessage(m.chat, { text: defaultOpenMessage, mentions: [sender] });
            // reply(defaultOpenMessage ,{mentions: [sender]});
          }
          // molto.groupSettingUpdate(m.chat, 'not_announcement')
        }
        break;
      case "antilink":
      case "al1":
        {
          if (!m.isGroup) return m.reply("*Fitur khusus group !*");
          if (!isAdmins) return m.reply("*Fitur khusus admin !*");
          if (!isBotAdmins) return m.reply("*Fitur khusus admin !*");
          if (args[0] === "on") {
            if (isAntiLink) return m.reply(`*Aktif*`);
            antilink.push(m.chat);
            fs.writeFileSync("./database/antilink.json", JSON.stringify(antilink, null, 2));
            reply("*Sukses menyalakan fitur antilink*");
          } else if (args[0] === "off") {
            if (!isAntiLink) return m.reply(`*Nonaktif*`);
            let anu = antilink.indexOf(m.chat);
            antilink.splice(anu, 1);
            fs.writeFileSync("./database/antilink.json", JSON.stringify(antilink, null, 2));
            reply("*Sukses mematikan fitur antilink*");
          } else {
            reply(`*CARA PENGGUNAAN FITUR ANTILINK*\n\nKirim pesan _${prefix + command} on/off_ ke group yang sudah menyewa bot`);
          }
        }
        break;
      case "antilink2":
      case "al2":
        {
          if (!m.isGroup) return m.reply("*Fitur khusus group !*");
          if (!isAdmins) return m.reply("*Fitur khusus admin !*");
          if (!isBotAdmins) return m.reply("*Fitur khusus admin !*");
          if (args[0] === "on") {
            if (isAntiLink2) return m.reply(`*Aktif*`);
            antilink2.push(m.chat);
            fs.writeFileSync("./database/antilink2.json", JSON.stringify(antilink2, null, 2));
            reply("*Sukses menyalakan fitur antilink2*");
          } else if (args[0] === "off") {
            if (!isAntiLink2) return m.reply(`*Nonaktif*`);
            let anu = antilink2.indexOf(m.chat);
            antilink2.splice(anu, 1);
            fs.writeFileSync("./database/antilink2.json", JSON.stringify(antilink2, null, 2));
            reply("*Sukses mematikan fitur antilink2*");
          } else {
            reply(`*CARA PENGGUNAAN FITUR ANTILINK2*\n\nKirim pesan _${prefix + command} on/off_ ke group yang sudah menyewa bot`);
          }
        }
        break;

      case "close":
      case "tutup":
        {
          if (!m.isGroup) return m.reply("*Fitur khusus group !*");
          if (!isAdmins) return m.reply("*Fitur khusus admin !*");
          if (!isBotAdmins) return m.reply("*Fitur khusus admin !*");
          let time = new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta", // Zona waktu WIB (UTC+7)
          });
          //let time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); // Jam
          let tanggal = new Date().toLocaleDateString("id-ID"); // Tanggal

          // Template default untuk pesan sukses menutup group
          let suksesClose = `*Sukses menutup group*\n\n📅 Tanggal : @tanggal\n⏰ Jam : @jam\n👤 Ditutup oleh : @user`;

          molto.groupSettingUpdate(m.chat, "announcement");

          const textClose = await getTextSetClose(m.chat, set_close);

          if (textClose !== undefined) {
            // Ganti placeholder dalam template dengan nilai aktual
            var pesanClose = textClose
              .replace("@jam", time)
              .replace("@tanggal", tanggal)
              .replace("@user", "@" + sender.split("@")[0]);

            molto.sendMessage(m.chat, { text: pesanClose, mentions: [sender] });
            // reply(pesanClose);
          } else {
            // Jika tidak ada custom template, gunakan template default
            let defaultCloseMessage = suksesClose
              .replace("@jam", time)
              .replace("@tanggal", tanggal)
              .replace("@user", "@" + sender.split("@")[0]);

            molto.sendMessage(m.chat, { text: defaultCloseMessage, mentions: [sender] });
            // reply(defaultCloseMessage);
          }
          //       molto.groupSettingUpdate(m.chat, 'announcement')
        }
        break;

      case "h":
      case "hidetag":
        {
          if (!m.isGroup) return reply("*Khusus group !*");
          if (!(isAdmins || isCreator)) return reply("*Fitur khusus admin !*");

          // Check if there's a quoted message or image
          let tek = m.quoted ? quoted.text : text ? text : "";
          let media = m.quoted ? m.quoted : null; // Get the quoted message

          // Check if the quoted message is an image
          if (/image/.test(mime)) {
            // Handle the image
            let imageUrl = await molto.downloadAndSaveMediaMessage(quoted); // Download the image
            // Send the image with mentions
            molto.sendMessage(m.chat, {
              image: { url: imageUrl }, // Use the downloaded image
              caption: tek, // Caption can be the text or empty
              mentions: participants.map((a) => a.id),
            });
          } else {
            // Handle text if no image is detected
            molto.sendMessage(m.chat, {
              text: tek,
              mentions: participants.map((a) => a.id),
            });
          }
        }
        break;
      case "sgif":
      case "stikerin":
      case "s":
      case "sticker":
      case "stiker":
        {
          if (!quoted) return reply(`*CARA PENGGUNAAN FITUR STIKER*\n\nReply atau geser ke kanan foto atau video dengan pesan ${prefix + command}, Maksimal durasi untuk video 9 detik`);
          if (/image/.test(mime)) {
            let media = await quoted.download();
            let encmedia = await molto.sendImageAsSticker(m.chat, media, m, {
              packname: global.namaBot,
              author: pushname,
            });
            await fs.unlinkSync(encmedia);
          } else if (/video/.test(mime)) {
            if ((quoted.msg || quoted).seconds > 11) return reply(`*CARA PENGGUNAAN FITUR STIKER*\n\nReply atau geser ke kanan foto atau video dengan pesan ${prefix + command}, Maksimal durasi untuk video 9 detik`);
            let media = await quoted.download();
            let encmedia = await molto.sendVideoAsSticker(m.chat, media, m, {
              packname: global.namaBot,
              author: global.namaowner,
            });
            await fs.unlinkSync(encmedia);
          } else {
            reply(`*CARA PENGGUNAAN FITUR STIKER*\n\nReply atau geser ke kanan foto atau video dengan pesan ${prefix + command}, Maksimal durasi untuk video 9 detik`);
          }
        }
        break;
      case "kick":
      case "k":
        {
          if (!m.isGroup) return m.reply("*Fitur khusus group !*");
          if (!isAdmins) return m.reply("*Fitur khusus admin !*");
          if (!isBotAdmins) return m.reply("*Fitur khusus admin !*");
          let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
          await molto
            .groupParticipantsUpdate(m.chat, [users], "remove")
            .then((res) => m.reply("mampus kena kick wkwk"))
            .catch((err) => m.reply("*Waduh... Terjadi kesalahan*"));
        }
        break;
      case "add":
        {
          if (!m.isGroup) return m.reply("*Fitur khusus group !*");
          if (!isAdmins) return m.reply("*Fitur khusus admin !*");
          if (!isBotAdmins) return m.reply("*Fitur khusus admin !*");
          let users = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
          await molto
            .groupParticipantsUpdate(m.chat, [users], "add")
            .then((res) => m.reply("sukses tambah anggota"))
            .catch((err) => m.reply("*Waduh... Terjadi kesalahan mungkin nomornya private*"));
        }
        break;
      case "ping":
        {
          m.reply(runtime(process.uptime()));
        }
        break;
      case "sewa":
        {
          reply(`*Silahkan ketik \`sewabot\` di chat bot*`);
        }
        break;

      case "sewabot": {
        if (m.isGroup) return reply(`*Fitur khusus chat pribadi*`);
        var url = args[0];
        if (!url) return reply(`Gunakan dengan cara ${prefix + command}\n\nContoh : ${command} linkgc `);
        if (!isUrl(args[0])) return reply("*Matikan fitur _Setujui Anggota Baru_ di izin group*");
        let jumlah = 10000;
        let uniqueCode = Math.round(10 + Math.random() * 90);
        let fee = Math.round(uniqueCode * 1.07);
        let totalSewa = Math.round(jumlah + fee);
        const captionQr =
          `===== Rent Details =====\n` +
          `Product Name : Sewa Bot 1 bln\n` +
          `Jumlah Sewa : ${formatRupiah(jumlah)}\n` +
          `Fee : ${formatRupiah(fee)}\n` +
          `Total Sewa : ${formatRupiah(totalSewa)}\n` +
          `===========================\n` +
          `Silakan lakukan scan QRIS ini untuk melakukan pembayaran.
Segera melakukan pembayaran sebelum 5 menit
jika melewati akan otomatis cancel`;

        let scanQr = await qrisDinamis(totalSewa);
        const tempDir = path.join(__dirname, "database");
        await ensureDir(tempDir);
        const filename = `qris_${Date.now()}.png`;
        const filepath = path.join(tempDir, filename);
        await qrcode.toFile(filepath, scanQr, { margin: 1 });
        const buffer = await fs.promises.readFile(filepath);
        let msgQr = await molto.sendMessage(m.chat, { image: buffer, caption: captionQr }, { quoted: m });
        let paid = false;
        // Timeout 5 menit untuk expired
        const timeoutId = setTimeout(async () => {
          if (!paid) {
            // hapus pesan & file
            await molto.sendMessage(m.chat, { delete: msgQr.key });
            await fs.promises.unlink(filepath);
            reply("Your Transaction expired!");
          }
        }, 5 * 60 * 1000);

        while (!paid) {
          await sleep(10000);
          try {
            const res = await axios.get(`https://gateway.okeconnect.com/api/mutasi/qris/${orkutID}/${APIkeyOrkut}`);
            console.log(res.data);
            const last = res.data.data?.[0];
            if (last && parseInt(last.amount) === totalSewa) {
              paid = true;
              clearTimeout(timeoutId);
              // hapus pesan & file
              await molto.sendMessage(m.chat, { delete: msgQr.key });
              await fs.promises.unlink(filepath);
              break;
            }
          } catch (e) {
            console.error("Error cek mutasi QRIS:", e);
          }
        }

        if (paid) {
          let durasi = "30d";
          url = url.split("https://chat.whatsapp.com/")[1];
          // if (!args[1]) return m.reply(`*Tidak ada durasi*`);
          var data = await molto.groupAcceptInvite(url);
          console.log(data);
          if (checkSewaGroup(data, sewa)) return m.reply(`*Bot sudah disewa oleh grup tersebut Silahkan chat admin*`);
          addSewaGroup(data, durasi, sewa);
          reply(`*Berhasil menambah durasi sewa*`);
          await sleep(2000);
          reply(`*Jika fitur tidak berfungsi silahkan kirim grup id ke admin pakai* \`linkgc\``);
        }
        break;
      }
      // START TOLS CEK NICK //

      case "cekff": {
        const id = args[0];
        if (!id) {
          return reply(`GAME : FREE FIRE \nMasukan ID dan Server dengan benar, contoh:\n*.cekff* 7194234362`);
        }
        let axios = require("axios");
        const response = await axios.get(`https://gopay.co.id/games/v1/order/prepare/FREEFIRE?userId=${id}`);
        if (response.data.message === "Success") {
          const decodedResult = decodeURIComponent(response.data.data);
          reply(decodedResult);
        } else {
          reply(response.data.message);
        }
        break;
      }

      case "cekhok": {
        const id = args[0];
        if (!id) {
          return reply(`GAME : Honor of Kings \nMasukan ID dengan benar, contoh:\n*.cekhok* 7194234362`);
        }
        let axios = require("axios");
        const response = await axios.get(`https://gopay.co.id/games/v1/order/prepare/HOK?userId=${id}`);
        if (response.data.message === "Success") {
          const decodedResult = decodeURIComponent(response.data.data);
          reply(decodedResult);
        } else {
          reply(response.data.message);
        }
        break;
      }

      case "cekaov": {
        const id = args[0];
        if (!id) {
          return reply(`GAME : Arena of Valor \nMasukan ID dengan benar, contoh:\n*.cekaov* 7194234362`);
        }
        let axios = require("axios");
        const response = await axios.get(`https://gopay.co.id/games/v1/order/prepare/AOV?userId=${id}`);
        if (response.data.message === "Success") {
          const decodedResult = decodeURIComponent(response.data.data);
          reply(decodedResult);
        } else {
          reply(response.data.message);
        }
        break;
      }

      case "cekpb": {
        const id = args[0];
        if (!id) {
          return reply(`GAME : POINT BLANK \nMasukan ID dengan benar, contoh:\n*.cekpb* 7194234362`);
        }
        let axios = require("axios");
        const response = await axios.get(`https://gopay.co.id/games/v1/order/prepare/POINT_BLANK?userId=${id}`);
        if (response.data.message === "Success") {
          const decodedResult = decodeURIComponent(response.data.data);
          reply(decodedResult);
        } else {
          reply(response.data.message);
        }
        break;
      }

      case "cekcodm": {
        const id = args[0];
        if (!id) {
          return reply(`GAME : Call Of Duty: Mobile \nMasukan ID dengan benar, contoh:\n*.cekcodm* 7194234362`);
        }
        let axios = require("axios");
        const response = await axios.get(`https://gopay.co.id/games/v1/order/prepare/CALL_OF_DUTY?userId=${id}`);
        if (response.data.message === "Success") {
          const decodedResult = decodeURIComponent(response.data.data);
          reply(decodedResult);
        } else {
          reply(response.data.message);
        }
        break;
      }

      case "cekab": {
        const id = args[0];
        if (!id) {
          return reply(`GAME : Arena Breakout \nMasukan ID dengan benar, contoh:\n*.cekab* 7194234362`);
        }
        let axios = require("axios");
        const response = await axios.get(`https://gopay.co.id/games/v1/order/prepare/ARENA_BREAKOUT?userId=${id}`);
        if (response.data.message === "Success") {
          const decodedResult = decodeURIComponent(response.data.data);
          reply(decodedResult);
        } else {
          reply(response.data.message);
        }
        break;
      }

      case "cekgi": {
        const axios = require("axios");
        const id = args[0];
        if (!id) {
          return reply(`GAME : Genshin\nMasukan ID dengan benar, contoh:\n*.cekgi* 7194234362`);
        }

        try {
          // Konfigurasi Axios
          const config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `https://genshin.dakgg.io/roles/${id}`,
            headers: {},
          };

          // Mengirim request dengan Axios
          const response = await axios.request(config);
          console.log(response.data);

          if (!response.data.player) {
            reply("UID yang kamu masukkan salah");
          } else {
            const datas = response.data.player;
            const { level, uid, nickname, worldLevel, server, packetDetail } = datas;

            // Reply dengan data yang ditemukan

            reply(
              `╭─【 *Genshin Data* 】\n` +
                `│➠ *AR* : ${level}\n` +
                `│➠ *UID* : ${uid}\n` +
                `│➠ *Name* : ${nickname}\n` +
                `│➠ *Server* : ${server}\n` +
                `│➠ *World Level* : ${worldLevel}\n` +
                `│➠ *Achievement* : ${packetDetail.achievements}\n` +
                `│➠ *Spiral Abyss* : ${packetDetail.towerFloorIndex} - ${packetDetail.towerLevelIndex}\n` +
                `╰──【 *MIKIBOT* 】`
            );
          }
        } catch (error) {
          console.error(error); // Log error untuk debugging
          reply("Terjadi kesalahan saat mengambil data. Coba lagi nanti.");
        }
        break;
      }

      case "mlid": {
        const qs = require("qs");
        let axios = require("axios");
        let id = text.split(" ")[0];
        let zone = text.split(" ")[1];

        if (!id || !zone) return reply(`Wrong Syntax! Gunakan ${command} 97045730 2503`);
        const link = "https://moogold.com/wp-content/plugins/id-validation-new/id-validation-ajax.php";

        let data = qs.stringify({
          attribute_diamonds: "Weekly Pass",
          "text-5f6f144f8ffee": id,
          "text-1601115253775": zone,
          quatity: "1",
          "add-to-chart": "5846232",
          product_id: "5846232",
          variation_id: "5846345",
        });

        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: link,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Origin: "https://moogold.com",
            Referer: "https://moogold.com/product/mobile-legends-brazil/",
          },
          data: data,
          responseType: "json",
        };

        axios
          .request(config)
          .then((response) => {
            console.log(JSON.stringify(response.data));
            if (response.data.icon === "success") {
              const details = response.data.message.split("\n");
              const playerName = decodeURIComponent(details[2].split(": ")[1] || "");
              const userId = details[0].split(": ")[1] || "";
              const server = details[1].split(": ")[1] || "";
              const region = details[3].split(": ")[1] || "";
              const flag = getFlagEmoji(region);
              const negaranya = mooCountry(region);

              const resultMessage = `╭─【 *ML Validation* 】\n` + `│➠ *ID* : ${userId}\n` + `│➠ *Server* : ${server}\n` + `│➠ *Name* : ${playerName}\n` + `│➠ *Region* : ${negaranya} | ${flag}\n` + `╰──【 *MIKIBOT* 】\n`;

              reply(resultMessage);
            } else {
              reply("❌ Validasi gagal. Pastikan ID dan server benar.");
            }
          })
          .catch((error) => {
            console.log(error);
          });
        break;
      }

      case "mcgg": {
        if (!m.isGroup) return reply(onlyGroup);
        const targetId = m.chat; // Group ID being checked
        let penyewa = sewa.find((x) => x.id === targetId);
        if (!isCreator && !penyewa) return reply("Fitur khusus penyewa");

        const axios = require("axios");
        const args = text.split(" ");
        const id = args[0];
        const server = args[1];

        if (!id || !server) return reply("Syntax salah! Contoh: .mcgg [ID] [SERVER]");

        const url = `https://api.mobapay.com/api/app_shop?app_id=124526&user_id=${id}&server_id=${server}`;

        let config = {
          method: "get",
          maxBodyLength: Infinity,
          url: url,
          headers: {
            Accept: "application/json, text/plain, */*",
            Referer: "https://www.mobapay.com/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
          },
        };

        axios(config)
          .then((response) => {
            if (response.data.code === 0) {
              const message = `╭─【 *MCGG Data* 】\n│➠ *Server*: ${server}\n│➠ *ID*: ${id}\n│➠ *Name*: ${response.data.data.user_info.user_name}\n╰──【 *MIKIBOT* 】`;
              reply(message);
            } else {
              reply("Maaf, data akun tidak ditemukan!");
            }
          })
          .catch((error) => {
            console.error(error);
            reply("Terjadi kesalahan saat mengambil data.");
          });

        break;
      }

      case "cekdoubledm": {
        if(!m.isGroup && !isCreator) return reply(onlyGroup)
        const targetId = m.chat; // Asumsikan ID grup yang sedang dicek adalah ID obrolan saat ini
        let penyewa = sewa.find((x) => x.id === targetId);
        if (!isCreator && !penyewa) return reply("Fitur khusus penyewa");
        const args = text.split(" ");
        const id = args[0];
        const server = args[1];

        if (!id || !server) {
          return reply("Syntax salah!\nContoh : !cekpromo [ID] [SERVER]");
        }

        const url = `https://api.mobapay.com/api/app_shop?app_id=100000&user_id=${id}&server_id=${server}&country=ID&language=en&network=&net=&coupon_id=&shop_id=`;

        let config = {
          method: "get",
          maxBodyLength: Infinity,
          url: url,
          headers: {
            Accept: "application/json, text/plain, */*",
                Referer: "https://www.mobapay.com/",
                "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
                Origin: "https://www.mobapay.com"
              },
        };


        // const response = await axios.get(`https://dev.luckycat.my.id/api/stalker/mobile-legend?users=${id}&servers=${server}`);
        // if(response.data.status){
        //   const datanya = response.data.data;
        //   return global.region = `${datanya.country.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")} | ${datanya.emoji || "-"}\n`
        // }
        axios
          .request(config)
          .then((response) => {
            console.log(response.data);

            if (response.data.data.user_info.code === 0) {
              const firstmonth = response.data.data.shop_info.good_list
              const datanya = response.data.data.shop_info.shelf_location;

              const filteredGoods = datanya.flatMap((item) => item.goods?.filter((good) => good.goods_limit.game_limit === true) || []);
              const filteredFirstMonth = firstmonth.filter((item) => item.sku.includes("firstcharge"))
              console.log(filteredGoods);
              console.log(filteredFirstMonth);

              if (filteredGoods.length === 0 && filteredFirstMonth.length === 0 ) {
                return reply(`error API chat admin for details`);
              }

              // Buat pesan hasil filter
              const pesan =
                `Data akun : ${id} (${server})\n` +
                    `Nick : ${response.data.data.user_info.user_name}\n` +
                    // `Region : ${global.region}\n\n` +
                    'Double Month First Recharge\n'+
                    filteredFirstMonth.map((good) => {
                      const jumlah = good.title.includes('+') ? eval(good.title) : good.title;
                      return `${good.goods_limit.reached_limit ?  "❌" : "✅" } ${jumlah} 💎 (${good.title})`;
                    }).join('\n') +
                    '\nDouble Diamond First Recharge\n'+
                    filteredGoods
                      .map((good) => {
                        // Menghitung jumlah jika ada format "50+50"
                        const jumlah = good.title.includes("+") ? eval(good.title) : good.title;
                        return `${good.goods_limit.reached_limit ?  "❌" : "✅"} ${jumlah} 💎 (${good.title})`;
                      })
                      .join("\n");

              reply(pesan);
            } else {
              reply(`Maaf, data akun tidak ditemukan!`);
            }
          })
          .catch((error) => {
            console.error(error);
            reply(`Terjadi kesalahan saat mengambil data.`);
          });
        break;
      }

      // case "cekdoubledm": {
      //   if (!m.isGroup) return reply(onlyGroup);

      //   const targetId = m.chat;
      //   let penyewa = sewa.find((x) => x.id === targetId);
      //   if (!isCreator && !penyewa) return reply("Fitur khusus penyewa");

      //   const args = text.split(" ");
      //   const id = args[0];
      //   const server = args[1];

      //   if (!id || !server) {
      //     return reply("Syntax salah!\nContoh : !cekpromo [ID] [SERVER]");
      //   }

      //   const stalkerUrl = `https://dev.luckycat.my.id/api/stalker/mobile-legend?users=${id}&servers=${server}`;

      //   try {
      //     const stalkerRes = await axios.get(stalkerUrl);
      //     console.log(stalkerRes);

      //     if (stalkerRes.data.status) {
      //       const dataUser = stalkerRes.data.data;
      //       global.region = `${dataUser.country.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")} | ${dataUser.emoji || "-"}`;
      //     }

      //     const shopUrl = `https://api.mobapay.com/api/app_shop?app_id=100000&user_id=${id}&server_id=${server}&country=ID&language=en`;
      //     const config = {
      //       method: "get",
      //       maxBodyLength: Infinity,
      //       url: shopUrl,
      //       headers: {
      //         Accept: "application/json, text/plain, */*",
      //         Referer: "https://www.mobapay.com/",
      //         "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
      //         Origin: "https://www.mobapay.com",
      //       },
      //     };

      //     const shopRes = await axios.request(config);
      //     console.log(shopRes);
      //     const shopData = shopRes.data;

      //     if (shopData.data?.user_info?.code !== 0) {
      //       return reply("Maaf, data akun tidak ditemukan!");
      //     }

      //     const userInfo = shopData.data.user_info;
      //     const firstmonth = shopData.data.shop_info.good_list || [];
      //     const shelf = shopData.data.shop_info.shelf_location || [];

      //     const firstrecharge = "firstcharge"; // atau sesuaikan jika perlu
      //     const filteredFirstMonth = firstmonth.filter((item) => item.sku.includes(firstrecharge));

      //     const filteredGoods = shelf.flatMap((item) => item.goods?.filter((good) => good.game_limit === true) || []);

      //     if (filteredFirstMonth.length === 0 && filteredGoods.length === 0) {
      //       return reply("Tidak ditemukan data double diamond. Chat admin untuk detail.");
      //     }

      //     const formatJumlah = (title) => {
      //       if (title.includes("+")) {
      //         return title
      //           .split("+")
      //           .map(Number)
      //           .reduce((a, b) => a + b, 0);
      //       }
      //       return parseInt(title, 10);
      //     };

      //     const pesan =
      //       `Data akun : ${id} (${server})\n` +
      //       `Nick : ${userInfo.user_name}\n` +
      //       `Region : ${global.region}\n\n` +
      //       `Double Month First Recharge\n` +
      //       filteredFirstMonth
      //         .map((good) => {
      //           const jumlah = formatJumlah(good.title);
      //           return `${good.game_can_buy ? "✅" : "❌"} ${jumlah} 💎 (${good.title})`;
      //         })
      //         .join("\n") +
      //       `\n\nDouble Diamond First Recharge\n` +
      //       filteredGoods
      //         .map((good) => {
      //           const jumlah = formatJumlah(good.title);
      //           return `${good.game_can_buy ? "✅" : "❌"} ${jumlah} 💎 (${good.title})`;
      //         })
      //         .join("\n");

      //     return reply(pesan);
      //   } catch (err) {
      //     console.error(err);
      //     return reply("Terjadi kesalahan saat mengambil data dari server.");
      //   }
      // }

      case "getip": {
        if (!isCreator) return;
        var http = require("http");
        http.get(
          {
            host: "api.ipify.org",
            port: 80,
            path: "/",
          },
          function (resp) {
            resp.on("data", function (ip) {
              m.reply("IP : " + ip);
            });
          }
        );
        break;
      }

      case "ipconfig":
        async function getVPSInfo() {
          const { exec } = require("child_process");
          const os = require("os");

          // Promise wrapper biar bisa pakai await
          function execPromise(command) {
            return new Promise((resolve, reject) => {
              exec(command, (error, stdout, stderr) => {
                if (error) return reject(error);
                if (stderr) return reject(stderr);
                resolve(stdout.trim());
              });
            });
          }

          try {
            const ipLocal = await execPromise("hostname -I");
            const hostname = os.hostname();
            const platform = os.platform();
            const arch = os.arch();
            const uptime = os.uptime();
            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
            const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
            const usedMem = totalMem - freeMem;

            // Cek CPU Usage via top (1 detik snapshot)
            const cpuUsageRaw = await execPromise("top -bn1 | grep '%Cpu' || top -bn1 | grep Cpu");
            const cpuUsageMatch = cpuUsageRaw.match(/(\d+\.\d+)\s*id/);
            const cpuUsage = cpuUsageMatch ? (100 - parseFloat(cpuUsageMatch[1])).toFixed(2) : "N/A";

            // Port SSH aktif
            const sshPort = await execPromise("grep ^Port /etc/ssh/sshd_config || echo 22");

            // Cek apakah SSH jalan
            let sshStatus;
            try {
              const sshCheck = await execPromise("systemctl is-active sshd");
              sshStatus = sshCheck === "active" ? "🟢 Aktif" : `🔴 Tidak Aktif (${sshCheck})`;
            } catch (e) {
              sshStatus = "🔴 Tidak Aktif (tidak bisa dicek)";
            }

            // Cek IP Publik
            let publicIP = "Tidak bisa didapat";
            try {
              publicIP = await execPromise("curl -s ifconfig.me");
            } catch {}

            return (
              `🖥 *Informasi VPS:*\n\n` +
              `🌐 *IP Lokal:* ${ipLocal}\n` +
              `🌍 *IP Publik:* ${publicIP}\n` +
              `🧠 *Hostname:* ${hostname}\n` +
              `🛠 *OS:* ${platform}\n` +
              `📦 *Arsitektur:* ${arch}\n` +
              `⏱ *Uptime:* ${uptime} detik\n` +
              `💾 *Memory:* ${usedMem} / ${totalMem} MB digunakan\n` +
              `⚙️ *CPU Usage:* ${cpuUsage}%\n\n` +
              `🔐 *Port SSH:* ${sshPort}\n` +
              `📶 *Status SSH:* ${sshStatus}`
            );
          } catch (err) {
            return `❌ Gagal mengambil data VPS:\n${err.message || err}`;
          }
        }

        reply(await getVPSInfo());
        break;

      case "cekssh":
        async function cekStatusSSH() {
          const { exec } = require("child_process");

          function execPromise(command) {
            return new Promise((resolve, reject) => {
              exec(command, (error, stdout, stderr) => {
                if (error) return resolve(`❌ ${command} error:\n${error.message}`);
                resolve(stdout.trim());
              });
            });
          }

          try {
            const port = await execPromise("grep ^Port /etc/ssh/sshd_config || echo 22");
            const sshStatus = await execPromise("systemctl is-active sshd");
            const firewallStatus = await execPromise("ufw status || echo 'ufw not found'");
            const iptables = await execPromise("iptables -L -n | grep 'dpt:22' || echo 'No iptables rules for port 22'");
            const pubIP = await execPromise("curl -s ifconfig.me || echo 'Gagal dapat IP publik'");

            return (
              `🔍 *Diagnosa SSH VPS:*\n\n` +
              `🔐 *Port SSH:* ${port}\n` +
              `📶 *Status SSH:* ${sshStatus}\n\n` +
              `🧱 *Firewall (UFW):*\n${firewallStatus}\n\n` +
              `🛡 *iptables untuk port 22:*\n${iptables}\n\n` +
              `🌍 *IP Publik (saat ini):* ${pubIP}`
            );
          } catch (err) {
            return `❌ Gagal melakukan diagnosa: ${err.message || err}`;
          }
        }

        reply(await cekStatusSSH());
        break;

      case "hapusvpn":
        async function hapusVPNDanResetAkses() {
          const { exec } = require("child_process");

          function run(cmd) {
            return new Promise((resolve) => {
              exec(cmd, (err, stdout, stderr) => {
                if (err) return resolve(`❌ ${cmd}: ${err.message}`);
                return resolve(`✅ ${cmd}`);
              });
            });
          }

          const steps = ["systemctl stop openvpn", "systemctl stop xray", "systemctl stop v2ray", "systemctl stop wg-quick@wg0", "ip route flush table main", "iptables -F", "iptables -X", "ufw disable", "systemctl restart sshd"];

          let hasil = "🛠 *Reset VPN dan Akses VPS:*\n\n";
          for (let cmd of steps) {
            hasil += (await run(cmd)) + "\n";
          }

          return hasil + `\nSilakan coba login SSH ulang ke IP publik kamu.`;
        }

        reply(await hapusVPNDanResetAkses());
        break;

      case "cwr":
        {
          let penyewa = sewa.find((x) => x.id === targetId);
          if (!text) return reply("Contoh penggunaan:\n.cwr <total_pertandingan> <win_rate_sekarang> <target_win_rate>");
          var cwl = text.split(" ");
          if (!cwl || cwl.length !== 3) return reply("Contoh penggunaan:\n.cwr <total_pertandingan> <win_rate_sekarang> <target_win_rate>");

          const tMatch = parseFloat(cwl[0]);
          const tWr = parseFloat(cwl[1]);
          const wrReq = parseFloat(cwl[2]);

          if (isNaN(tMatch) || isNaN(tWr) || isNaN(wrReq)) {
            return reply("Input tidak valid. Pastikan semua input berupa angka.");
          }
          const resultNum = calc.cwr(tMatch, tWr, wrReq);
          const tekl = `BOT CALC WINRATE

        Anda memerlukan sekitar ${resultNum} win tanpa lose untuk mendapatkan win rate ${wrReq}%`;
          reply(tekl);
        }
        break;
      case "cz":
        {
          if (!text) return reply("Contoh penggunaan:\n.cz <zodiac_point>");
          if (isNaN(text)) {
            return reply("Input tidak valid. Pastikan input berupa angka.");
          }

          const zodiacPoint = Number(text);
          const diamondsNeeded = calc.cz(zodiacPoint);
          reply(`BOT CALC ZODIAK

          Total maksimal diamond yang dibutuhkan: ${diamondsNeeded}`);
        }
        break;
      //   Downloader and Other Script
      case "ig":
        {
          m.reply('Disable dlu')
          // if (!m.isGroup) return reply(onlyGroup);
          // const targetId = m.chat; // Asumsikan ID grup yang sedang dicek adalah ID obrolan saat ini
          // let penyewa = sewa.find((x) => x.id === targetId);
          // if (!isCreator && !penyewa) return reply("Fitur khusus penyewa");
          // if (!q) return reply("linknya mana bang?");
          // reply("bentar ya bang lagi proses");
          // try {
          //   let igdown = await igdl(q);
          //   const { data } = igdown;
          //   console.log(igdown);
          //   for (let media of data) {
          //     new Promise((resolve) => setTimeout(resolve, 2000));
          //     let type = media.url.includes("d.rapidcdn.app") ? "video" : "image";
          //     await molto.sendMessage(
          //       m.chat,
          //       {
          //         [type]: { url: media.url },
          //         caption: "Nih bang",
          //       },
          //       { quoted: m }
          //     );
          //   }
          // } catch (e) {
          //   console.log(e);
          // }
        }
        break;

      case "bijak":
        {
          const fs = require("fs");
          try {
            let bijakText = fs.readFileSync("./database/bijak.txt", "utf-8");

            // Pisahkan berdasarkan baris (tiap kutipan di satu baris)
            const bijakList = bijakText.trim().split("\n");

            // Ambil kutipan random
            const randomBijak = bijakList[Math.floor(Math.random() * bijakList.length)];

            reply(randomBijak);
          } catch (err) {
            reply("Gagal membaca file bijak.txt: " + err.message);
          }
        }
        break;
      case "pantun":
        {
          const fs = require("fs");
          try {
            let pantunText = fs.readFileSync("./database/pantun.txt", "utf-8");
            pantunText = pantunText.replace(/new-line /g, "\n");

            // Pisahkan pantun berdasarkan jeda kosong antar pantun (kalau ada), atau bisa random dari daftar
            const pantunList = pantunText.trim().split("\n\n"); // Jika pakai pemisah 2x new-line
            const randomPantun = pantunList[Math.floor(Math.random() * pantunList.length)];

            reply(randomPantun);
          } catch (err) {
            reply("Gagal membaca file pantun.txt: " + err.message);
          }
        }
        break;

      case "puisi":
        {
          const url = `https://api.lolhuman.xyz/api/random/puisi?apikey=${lolkey}`;
          try {
            const response = await axios.get(url);
            const data = response.data.result;
            reply(data);
          } catch (e) {
            reply("limit / error script silahkan cek panel");
          }
        }
        break;
      case "jodoh":
        {
          const primbon = require("primbon-scraper");
          if (!text) return reply("Siapa yang mau kamu jodohin bang -_-");

          const splitArgs = text.split(" dan ");
          if (splitArgs.length !== 2) {
            return reply("Gunakan kata sambung `dan`\nContoh: aku dan dia");
          }

          const nama1 = splitArgs[0].trim();
          const nama2 = splitArgs[1].trim();
          if (!nama1 || !nama2) {
            return reply("Yakali mau dijodohin sama hantu -_-");
          }

          try {
            const res = await primbon.Jodoh(nama1, nama2);
            console.log(res);
            if (!res) return reply("Gagal mengambil data jodoh.");
            const { namaAnda, namaPasangan, positif, negatif, love } = res;

            await molto.sendMessage(m.chat, {
              image: { url: love },
              caption: `*Nama Kamu* : ${namaAnda}\n` + `*Pasangan Kamu* : ${namaPasangan}\n` + `*Sisi Positif* : ${positif}\n` + `*Sisi Negatif* : ${negatif}`,
            });
          } catch (err) {
            reply(`Error: ${err.message}`);
          }
        }
        break;

      case "ytmp4":
        {
          if (!q) return reply("Linknya mana bang?");
          // reply('bntr bang lagi proses');

          const video = await savetube.download(q, "1080");
          /*
                 const messageLink =
                  `╭───【 *Result* 】\n` +
                  `│➠ *Title* : ${title}\n` +
                  `│➠ *Author* : ${author}\n` +
                  `│➠ *Durasi* : ${duration}\n` +
                  `│➠ *Views* : ${views}\n` +
                  `╰───【 *IDSHOPKU* 】`
                  */
          // console.log(video)
          await molto.sendMessage(m.chat, {
            video: { url: video.result.download },
            // caption: messageLink,
            mimetype: "video/mp4",
          });
        }
        break;

      case "ytmp3":
        {
          if (!q) return reply("Linknya mana bang?");
          reply("bntr bang lagi proses");
          try {
            const audio = await savetube.download(q, '144').catch(async () => await savetube.download(q, '360'))

            console.log(audio);
            await molto.sendMessage(m.chat, {
              audio: { url: audio.result.download },
              // caption: 'nih',
              mimetype: "audio/mpeg",
            });
          } catch (e) {
            console.log(e);
            reply("Command error harap chat admin");
          }
        }
        break;
      case "fb": {
        if (!q) return reply("Linknya mana bang?");
        reply("Bentar bang, lagi proses...");

        try {
          const testingnyakaka = await fbdl(q);
          console.log(testingnyakaka);

          if (!testingnyakaka.status) {
            return reply(testingnyakaka.msg || testingnyakaka.message);
          } else {
            const hdVideo = testingnyakaka.data.find((video) => video.resolution.toLowerCase().includes("hd") || video.resolution.toLowerCase().includes("720p"));

            if (hdVideo) {
              await molto.sendMessage(
                m.chat,
                {
                  video: { url: hdVideo.url },
                  caption: `📹 *Video Facebook*\nResolusi: ${hdVideo.resolution}\n\n*Credit* : _MikiStore Bot_`,
                },
                { quoted: m }
              );
            } else {
              const sdVideo = testingnyakaka.data.find((video) => video.resolution.toLowerCase().includes("sd") || video.resolution.toLowerCase().includes("360p"));

              if (sdVideo) {
                await molto.sendMessage(
                  m.chat,
                  {
                    video: { url: sdVideo.url },
                    caption: `📹 *Video Facebook*\nResolusi: ${sdVideo.resolution}\n\n*Credit* : _MikiStore Bot_`,
                  },
                  { quoted: m }
                );
              } else {
                reply("Gagal mengunduh video. Coba lagi nanti.");
              }
            }
          }
        } catch (error) {
          console.error("Error saat memproses:", error);
          reply("Terjadi kesalahan saat memproses video. Coba lagi nanti.");
        }
        break;
      }

      case "lz":
        {
          if (!q) return reply("mau nanya apa kamu hah !?");
          let apikey = "AIzaSyDwgSw-OFZpeAwpDFk2NjmSoxxI3k0zsSg";
          // let apikey = 'AIzaSyAmfM6F0gbK8GoMbrGh63ACcDpBoMKtoSM'
          const generationConfig = {
            temperature: 2,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
          };

          const safetySettings = [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ];

          const genAI = new GoogleGenerativeAI(apikey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", generationConfig, safetySettings });

          const prompt = `lu adalah bot sok cool, jadi tolong balas/jawab pesan ini dalam logat anak jaksel: ${q}`;

          const result = await model.generateContent(prompt);
          // console.log(result.response.text());
          const aiResponse = result.response.text();
          reply(aiResponse);
        }
        break;
      case "ai":
        {
          if (!q) return reply("mau nanya apa?");
          let apikey = "AIzaSyDwgSw-OFZpeAwpDFk2NjmSoxxI3k0zsSg";
          const generationConfig = {
            temperature: 2,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
          };
          const genAI = new GoogleGenerativeAI(apikey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20", generationConfig });

          // const prompt = "Write a story about a magic backpack.";

          const result = await model.generateContent(q);
          // console.log(result.response.text());
          const aiResponse = result.response.text();
          reply(aiResponse);
        }
        break;

      case "kurs":
        {
          try {
            let response = await fetch("https://www.bi.go.id/id/statistik/informasi-kurs/transaksi-bi/default.aspx", {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              },
            });
            let $ = cheerio.load(await response.text());
            let result = [],
              uang = [];
            for (let i = 0; i < 25; i++) {
              let data = $("#exampleModal > div > div > div.modal-body > div > table > tbody > tr").eq(i).find("td");
              let singkatan_mata_uang = $(data).eq(0).text();
              let kepanjangan_mata_uang = $(data).eq(1).text();
              uang.push({ singkatan_mata_uang, kepanjangan_mata_uang });
            }
            for (let i = 0; i < 25; i++) {
              let data = $("#ctl00_PlaceHolderMain_g_6c89d4ad_107f_437d_bd54_8fda17b556bf_ctl00_GridView1 > table > tbody > tr").eq(i).find("td");
              let mata_uang = $(data).eq(0).text().trim();
              let _nama_mata_uang = uang.find((v) => new RegExp(mata_uang, "g").test(v.singkatan_mata_uang)) || {};
              let nama_mata_uang = (_nama_mata_uang.kepanjangan_mata_uang || "").trim();
              result.push({
                mata_uang,
                nama_mata_uang,
                kurs_beli: $(data).eq(2).text(),
                kurs_jual: $(data).eq(3).text(),
              });
            }
            const filePath = "./database/kurs.json";
            await fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
            // reply('Bentar ya, sedang mengambil data kurs...');
            const kursData = JSON.parse(fs.readFileSync(filePath, "utf8"));
            if (kursData && kursData.length > 0) {
              const pesan = kursData
                .map((item, index) => {
                  return `Mata Uang: ${item.mata_uang}\nNama Uang: ${item.nama_mata_uang}\nKurs Beli: ${formatRupiah(item.kurs_beli)}\nKurs Jual: ${formatRupiah(item.kurs_jual)}`;
                })
                .join("\n-------------------------------\n");
              reply(pesan);
            } else {
              reply("Data kurs tidak tersedia.");
            }
          } catch (error) {
            console.error("Terjadi kesalahan:", error);
            reply("Maaf, terjadi kesalahan saat mengambil data kurs.");
          }
        }
        break;
      case "gempa": {
        try {
          let response = await fetch("https://www.bmkg.go.id/gempabumi/gempabumi-dirasakan");
          let $ = cheerio.load(await response.text());
          let result = [];
          for (let i = 0; i < 20; i++) {
            let data = $("#__nuxt > main > div > div > div:nth-child(3) > div > div > div > table > tbody > tr").eq(i).find("td");
            let waktu = $(data).eq(1).html().replace(/<br>/g, " ").trim();
            let lintang = $(data).eq(4).text().replace("-", " ").replace(",", ".").split(" ").slice(0, 2).join(" ");
            let bujur = $(data).eq(4).text().replace("-", " ").split(" ").slice(2, 4).join(" ").replace(",", ".");
            console.log(bujur);
            let magnitudo = $(data).eq(2).text().trim();
            let kedalaman = $(data).eq(3).text().trim();
            let wilayah = $(data)
              .eq(5)
              .find("div")
              .first()
              .contents()
              .filter(function () {
                return this.nodeType === 3;
              })
              .text()
              .trim();
            let warning_elements = $(data).eq(5).find("div.flex.flex-wrap.gap-[6px]").children();
            let warning = [];
            warning_elements.each(function () {
              let text = $(this).find("div").text().trim();
              if (text) warning.push(text);
            });
            console.log(warning);
            result.push({
              waktu,
              lintang,
              bujur,
              magnitudo,
              kedalaman,
              wilayah,
              warning,
            });
          }
          const filePath = "./database/gempa.json";
          await fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
          const gempaData = JSON.parse(fs.readFileSync(filePath, "utf8"));
          if (gempaData && gempaData.length > 0) {
            const pesan = gempaData
              .map((item, index) => {
                const la = item.lintang.replace(" LU", "").replace(" LS", "");
                const lo = item.bujur.replace(" BT", "").replace(" BB", "");
                return `*Waktu* : ${item.waktu}\n*Lokasi* : https://www.google.com/maps?q=${la},${lo}\n*Kekuatan* : ${item.magnitudo} M\n*Wilayah* : ${item.wilayah}\n*Warning* : \n${item.warning.map((warn) => `- ${warn}`).join("\n")}`;
              })
              .join("\n-------------------------------\n");
            reply(pesan);
          } else {
            reply("Data gempa tidak tersedia.");
          }
        } catch (error) {
          console.error("Terjadi kesalahan:", error);
          reply("Maaf, terjadi kesalahan saat mengambil data gempa.");
        }
        break;
      }

      // Fun
      case "bucin":
        {
          try {
            const bucinData = JSON.parse(fs.readFileSync("./database/kata_bucin.json", "utf-8"));
            if (Array.isArray(bucinData) && bucinData.length > 0) {
              const randomIndex = Math.floor(Math.random() * bucinData.length);
              const bucinMessage = bucinData[randomIndex];
              reply(bucinMessage);
            } else {
              reply("Tidak ada data bucin yang ditemukan.");
            }
          } catch (error) {
            console.error("Error membaca atau memproses kata_bucin.json:", error.message);
            reply("Terjadi kesalahan saat mengambil kata-kata bucin.");
          }
        }
        break;
      case "truth":
        {
          try {
            const truthData = JSON.parse(fs.readFileSync("./database/truth.json", "utf-8"));
            if (Array.isArray(truthData) && truthData.length > 0) {
              const randomIndex = Math.floor(Math.random() * truthData.length);
              const truthMessage = truthData[randomIndex];
              reply(truthMessage);
            } else {
              reply("Tidak ada data truth yang ditemukan.");
            }
          } catch (error) {
            console.error("Error membaca atau memproses truth.json:", error.message);
            reply("Terjadi kesalahan saat mengambil data truth.");
          }
        }
        break;
      case "dare":
        {
          try {
            const dareData = JSON.parse(fs.readFileSync("./database/dare.json", "utf-8"));
            if (Array.isArray(dareData) && dareData.length > 0) {
              const randomIndex = Math.floor(Math.random() * dareData.length);
              const dareMesssage = dareData[randomIndex];
              reply(dareMesssage);
            } else {
              reply("Tidak ada data dare yang ditemukan.");
            }
          } catch (error) {
            console.error("Error membaca atau memproses dare.json:", error.message);
            reply("Terjadi kesalahan saat mengambil data dare.");
          }
        }
        break;

      // Mediasi
      case "gid": {
        // if (!isCreator) return reply("Fitur Khusus Dewa!");
        reply(`ID grup : ${m.chat}`);
        break;
      }

      case "gidcheck": {
        let linkgrup = args[0];
        linkgrup = linkgrup.split("https://chat.whatsapp.com/")[1];
        reply(`ID grup tersebut : ${linkgrup}`);
        break;
      }
      case "renungan":
        {
          if (!m.isGroup) return reply(onlyGroup);
          try {
            const renunganData = JSON.parse(fs.readFileSync("./database/renungan.json", "utf-8"));
            if (Array.isArray(renunganData) && renunganData.length > 0) {
              const randomIndex = Math.floor(Math.random() * renunganData.length);
              const pesanRenungan = renunganData[randomIndex];
              molto.sendMessage(m.chat, { image: { url: pesanRenungan } });
            } else {
              reply("Tidak ada data renungan yang ditemukan.");
            }
          } catch (error) {
            console.error("Error membaca atau memproses renungan.json:", error.message);
            reply("Terjadi kesalahan saat mengambil data renungan.");
          }
        }
        break;
      case "religi":
        {
          if (!m.isGroup) return reply(onlyGroup);
          try {
            const religiData = JSON.parse(fs.readFileSync("./database/religion.json", "utf-8"));
            if (Array.isArray(religiData) && religiData.length > 0) {
              const randomIndex = Math.floor(Math.random() * religiData.length);
              const religiMessage = religiData[randomIndex];
              const { latin, arabic, translation_id, translation_en } = religiMessage;
              reply(`Bahasa latin : *${latin}*\nKaligrafi : *${arabic}*\nArti : *${translation_id}*`);
            } else {
              reply("Tidak ada data religi yang ditemukan.");
            }
          } catch (error) {
            console.error("Error membaca atau memproses religion.json:", error.message);
            reply("Terjadi kesalahan saat mengambil data religi.");
          }
        }
        break;
      case "katakata": {
        if (!m.isGroup) return reply(onlyGroup);
        reply("sebut passwordnya kakak... 1 aja\n\n- kata katanya dek miki\n- kata kata hari ini dek miki");
        break;
      }

      // Fun doang
      case "qc": {
        if (!m.isGroup) return reply(onlyGroup);
        const _0x29442f = _0xb54c;
        function _0xb54c(_0x424cce, _0x45bf73) {
          const _0x3b4c74 = _0x3b4c();
          return (
            (_0xb54c = function (_0xb54c55, _0x3d2486) {
              _0xb54c55 = _0xb54c55 - 0x174;
              let _0x33beab = _0x3b4c74[_0xb54c55];
              return _0x33beab;
            }),
            _0xb54c(_0x424cce, _0x45bf73)
          );
        }
        (function (_0x21655f, _0x15a3a7) {
          const _0x2f7f03 = _0xb54c,
            _0x51aeb6 = _0x21655f();
          while (!![]) {
            try {
              const _0x162d35 =
                -parseInt(_0x2f7f03(0x17b)) / 0x1 +
                (-parseInt(_0x2f7f03(0x181)) / 0x2) * (-parseInt(_0x2f7f03(0x178)) / 0x3) +
                parseInt(_0x2f7f03(0x17e)) / 0x4 +
                parseInt(_0x2f7f03(0x176)) / 0x5 +
                parseInt(_0x2f7f03(0x179)) / 0x6 +
                parseInt(_0x2f7f03(0x17a)) / 0x7 +
                (-parseInt(_0x2f7f03(0x175)) / 0x8) * (parseInt(_0x2f7f03(0x18c)) / 0x9);
              if (_0x162d35 === _0x15a3a7) break;
              else _0x51aeb6["push"](_0x51aeb6["shift"]());
            } catch (_0x6cbb46) {
              _0x51aeb6["push"](_0x51aeb6["shift"]());
            }
          }
        })(_0x3b4c, 0xef598);
        let axios = require("axios"),
          pp = await molto[_0x29442f(0x17f)](m["sender"], _0x29442f(0x189))[_0x29442f(0x17d)]((_0x1335a6) => _0x29442f(0x188));
        const obj = {
            type: _0x29442f(0x187),
            format: "png",
            backgroundColor: _0x29442f(0x180),
            width: 0x200,
            height: 0x300,
            scale: 0x2,
            messages: [{ entities: [], avatar: !![], from: { id: 0x1, name: "" + m["pushName"], photo: { url: pp } }, text: text, replyMessage: {} }],
          },
          json = await axios[_0x29442f(0x184)](_0x29442f(0x174), obj, { headers: { "Content-Type": "application/json" } }),
          buffer = Buffer[_0x29442f(0x185)](json[_0x29442f(0x177)][_0x29442f(0x182)]["image"], _0x29442f(0x186)),
          sticker = await createSticker(buffer, { type: StickerTypes[_0x29442f(0x18a)], pack: m[_0x29442f(0x17c)], author: _0x29442f(0x183), categories: ["🤖", "😎"] });
        await molto[_0x29442f(0x18b)](m[_0x29442f(0x18d)], { sticker: sticker });
        function _0x3b4c() {
          const _0x27a66a = [
            "post",
            "from",
            "base64",
            "quote",
            "https://telegra.ph/file/320b066dc81928b782c7b.png",
            "image",
            "FULL",
            "sendMessage",
            "1224PcmFPl",
            "chat",
            "https://bot.lyo.su/quote/generate",
            "143816WKbIpI",
            "675415iDrNLc",
            "data",
            "201ILUbFU",
            "9099180uSeMtP",
            "9235177RhPAuO",
            "803416wnQZGg",
            "pushName",
            "catch",
            "522664HduZfv",
            "profilePictureUrl",
            "#FFFFFF",
            "33644vUKEIJ",
            "result",
            "Miki\x20Bot",
          ];
          _0x3b4c = function () {
            return _0x27a66a;
          };
          return _0x3b4c();
        }
        break;
      }

      case "smeme": {
        if (!m.isGroup) return reply(onlyGroup);
        const imgbb = require("imgbb-uploader");
        const _0x438560 = _0x5cb8;
        (function (_0x2e7d6e, _0x3595be) {
          const _0x232d83 = _0x5cb8,
            _0x3366e9 = _0x2e7d6e();
          while (!![]) {
            try {
              const _0x29f3c6 =
                (parseInt(_0x232d83(0xfd)) / 0x1) * (-parseInt(_0x232d83(0xfe)) / 0x2) +
                (-parseInt(_0x232d83(0xfc)) / 0x3) * (parseInt(_0x232d83(0xfb)) / 0x4) +
                (parseInt(_0x232d83(0xf1)) / 0x5) * (parseInt(_0x232d83(0xf9)) / 0x6) +
                parseInt(_0x232d83(0xf7)) / 0x7 +
                parseInt(_0x232d83(0xf2)) / 0x8 +
                -parseInt(_0x232d83(0xef)) / 0x9 +
                (parseInt(_0x232d83(0xff)) / 0xa) * (parseInt(_0x232d83(0xfa)) / 0xb);
              if (_0x29f3c6 === _0x3595be) break;
              else _0x3366e9["push"](_0x3366e9["shift"]());
            } catch (_0x17910d) {
              _0x3366e9["push"](_0x3366e9["shift"]());
            }
          }
        })(_0x215e, 0x9931b);
        function _0x5cb8(_0x436c55, _0x57e35f) {
          const _0x215e26 = _0x215e();
          return (
            (_0x5cb8 = function (_0x5cb8f6, _0x4559f1) {
              _0x5cb8f6 = _0x5cb8f6 - 0xed;
              let _0x3f9c77 = _0x215e26[_0x5cb8f6];
              return _0x3f9c77;
            }),
            _0x5cb8(_0x436c55, _0x57e35f)
          );
        }
        const atas = text[_0x438560(0xf5)]("|")[0x0] ? text[_0x438560(0xf5)]("|")[0x0] : "-",
          bawah = text["split"]("|")[0x1] ? text[_0x438560(0xf5)]("|")[0x1] : "-";
        function _0x215e() {
          const _0x534ccc = [
            "pushName",
            "1744392CcGvSN",
            "109153cJvMrt",
            "104uokJgt",
            "17913UjfaDL",
            "269153ssgXLG",
            "8RFtydK",
            "530qVAibL",
            ".png?background=",
            "test",
            "6783336vGqFll",
            "reply\x20gambar\x20tersebut\x20dan\x20ketik\x20.smeme\x20[teks\x20atas]\x20[teks\x20bawah]",
            "5zXubuC",
            "8380080dKkzdQ",
            "FULL",
            "sendMessage",
            "split",
            "downloadAndSaveMediaMessage",
            "5242188yUpKvD",
          ];
          _0x215e = function () {
            return _0x534ccc;
          };
          return _0x215e();
        }
        if (!/webp/[_0x438560(0xee)](mime) && /image/["test"](mime)) {
          const ahay = await molto[_0x438560(0xf6)](quoted),
            uhuk = await imgbb(imgbbKey, ahay);
          let smeme = "https://api.memegen.link/images/custom/" + atas + "/" + bawah + _0x438560(0xed) + uhuk.display_url;
          const sticker = await createSticker(smeme, { type: StickerTypes[_0x438560(0xf3)], pack: m[_0x438560(0xf8)], author: "Miki\x20Bot", categories: ["🤖", "😎"] });
          await molto[_0x438560(0xf4)](m["chat"], { sticker: sticker });
        } else return reply(_0x438560(0xf0));
        break;
      }

      case "apatuh": {
        function _0x3946() {
          const _0x3cb92d = [
            "2486690vGAJQX",
            "2146324fjtIPH",
            "63byNuux",
            "message",
            "56gPeUEl",
            "mp4",
            "Terjadi\x20kesalahan\x20saat\x20mencoba\x20membuka\x20pesan.",
            "Reply\x20gambar/video\x20yang\x20ingin\x20Anda\x20lihat",
            "quoted",
            "concat",
            "path",
            "error",
            "Ini\x20bukan\x20pesan\x20view-once.",
            "image",
            "1bpbQOB",
            "video",
            "14323089iqwhJq",
            "1432470gjjpLS",
            "1649244GJGIvL",
            "reply",
            "772kaPVaA",
            "mtype",
            "chat",
            "22161MGDQtl",
            "caption",
            "writeFileSync",
            "temp.",
            "unlinkSync",
            "25613pcsvcS",
          ];
          _0x3946 = function () {
            return _0x3cb92d;
          };
          return _0x3946();
        }
        const _0x8623ad = _0x5960;
        (function (_0x3bee21, _0x184cd5) {
          const _0x4c946f = _0x5960,
            _0x29f6f7 = _0x3bee21();
          while (!![]) {
            try {
              const _0x5de83c =
                (parseInt(_0x4c946f(0xa3)) / 0x1) * (parseInt(_0x4c946f(0xb3)) / 0x2) +
                (parseInt(_0x4c946f(0xac)) / 0x3) * (parseInt(_0x4c946f(0xa9)) / 0x4) +
                parseInt(_0x4c946f(0xb2)) / 0x5 +
                parseInt(_0x4c946f(0xa7)) / 0x6 +
                (parseInt(_0x4c946f(0xb1)) / 0x7) * (parseInt(_0x4c946f(0xb6)) / 0x8) +
                (parseInt(_0x4c946f(0xb4)) / 0x9) * (-parseInt(_0x4c946f(0xa6)) / 0xa) +
                -parseInt(_0x4c946f(0xa5)) / 0xb;
              if (_0x5de83c === _0x184cd5) break;
              else _0x29f6f7["push"](_0x29f6f7["shift"]());
            } catch (_0x38bbc3) {
              _0x29f6f7["push"](_0x29f6f7["shift"]());
            }
          }
        })(_0x3946, 0xf226a);
        const fs = require("fs"),
          path = require(_0x8623ad(0xbc));
        if (!m["quoted"]) return m[_0x8623ad(0xa8)](_0x8623ad(0xb9));
        function _0x5960(_0x104479, _0x1d2284) {
          const _0x3946bc = _0x3946();
          return (
            (_0x5960 = function (_0x59600c, _0x392d0a) {
              _0x59600c = _0x59600c - 0xa1;
              let _0x464807 = _0x3946bc[_0x59600c];
              return _0x464807;
            }),
            _0x5960(_0x104479, _0x1d2284)
          );
        }
        if (m[_0x8623ad(0xba)][_0x8623ad(0xaa)] !== "viewOnceMessageV2") return m[_0x8623ad(0xa8)](_0x8623ad(0xa1));
        try {
          let msg = m[_0x8623ad(0xba)][_0x8623ad(0xb5)],
            type = Object["keys"](msg)[0x0],
            mediaType = type === "imageMessage" ? _0x8623ad(0xa2) : _0x8623ad(0xa4),
            media = await downloadContentFromMessage(msg[type], mediaType),
            buffer = Buffer[_0x8623ad(0xbb)]([]);
          for await (const chunk of media) {
            buffer = Buffer[_0x8623ad(0xbb)]([buffer, chunk]);
          }
          let tempFile = path["join"](__dirname, _0x8623ad(0xaf) + (mediaType === _0x8623ad(0xa2) ? "jpg" : _0x8623ad(0xb7)));
          fs[_0x8623ad(0xae)](tempFile, buffer);
          let options = mediaType === _0x8623ad(0xa2) ? { image: { url: tempFile }, caption: msg[type][_0x8623ad(0xad)] || "" } : { video: { url: tempFile }, caption: msg[type][_0x8623ad(0xad)] || "" };
          await molto["sendMessage"](m[_0x8623ad(0xab)], options, { quoted: m }), fs[_0x8623ad(0xb0)](tempFile);
        } catch (_0x38ad14) {
          console[_0x8623ad(0xbd)](_0x38ad14), m[_0x8623ad(0xa8)](_0x8623ad(0xb8));
        }
        break;
      }

      case "brat": {
        //     const now = Date.now();
        // const cooldownTime = 5000; // 5 detik

        // // cek apakah user masih cooldown
        // if (cooldowns[sender] && now - cooldowns[sender] < cooldownTime) {
        //   const remaining = ((cooldowns[sender] + cooldownTime - now) / 1000).toFixed(1);
        //   return reply(`Jangan spam ya kak... Tunggu ${remaining} detik lagi.`);
        // }

        // // set cooldown user ini
        // cooldowns[sender] = now;
        if (!m.isGroup) return reply(onlyGroup);
        const targetId = m.chat; // Asumsikan ID grup yang sedang dicek adalah ID obrolan saat ini
        let penyewa = sewa.find((x) => x.id === targetId);
        if (!isCreator && !penyewa) return reply("Fitur khusus penyewa");
        if (!text) return reply("Masukkan teksnya ya kakak...");
        try {
          await molto.sendMessage(m.chat, {
            react: {
              text: "🔃",
              key: m.key,
            },
          });
          const { data: buffer } = await axios.get(`https://aqul-brat.hf.space/?text=${encodeURIComponent(text)}`, { responseType: "arraybuffer" });

          let encmedia = await molto.sendImageAsSticker(m.chat, buffer, m, {
            packname: global.namaBot,
            author: pushname,
          });
          await fs.unlinkSync(encmedia);
          await molto.sendMessage(m.chat, {
            react: {
              text: "",
              key: m.key,
            },
          });
        } catch (e) {
          reply("Error harap contact admin");
        }
        break;
      }

      case "bratvid": {
        const now = Date.now();
        const cooldownTime = 5000; // 5 detik

        // cek apakah user masih cooldown
        if (cooldowns[sender] && now - cooldowns[sender] < cooldownTime) {
          const remaining = ((cooldowns[sender] + cooldownTime - now) / 1000).toFixed(1);
          return reply(`Jangan spam ya kak... Tunggu ${remaining} detik lagi.`);
        }

        // set cooldown user ini
        cooldowns[sender] = now;
        if (!m.isGroup) return reply(onlyGroup);
        const targetId = m.chat; // Asumsikan ID grup yang sedang dicek adalah ID obrolan saat ini
        let penyewa = sewa.find((x) => x.id === targetId);
        if (!isCreator && !penyewa) return reply("Fitur khusus penyewa");

        if (!text) return reply("Masukkan teksnya ya kakak...");
        try {
          await molto.sendMessage(m.chat, {
            react: {
              text: "🔃",
              key: m.key,
            },
          });
          const res = await axios.get(`https://fastrestapis.fasturl.cloud/maker/brat/animated?text=${text}&mode=animated`, {
            responseType: "arraybuffer",
          });
          console.log(res);

          let encmedia = await molto.sendVideoAsSticker(m.chat, res.data, m, {
            packname: global.namaBot,
            author: pushname,
          });
          await fs.unlinkSync(encmedia);
          await molto.sendMessage(m.chat, {
            react: {
              text: "",
              key: m.key,
            },
          });
        } catch (error) {
          try {
            const res = await axios.get(`https://dev.luckycat.my.id/api/animated/brat?delay=0.5&text=${text}`, {
              responseType: "arraybuffer",
            });
            console.log(res);
            let encmedia = await molto.sendVideoAsSticker(m.chat, res.data, m, {
              packname: global.namaBot,
              author: pushname,
            });
            await fs.unlinkSync(encmedia);
            await molto.sendMessage(m.chat, {
              react: {
                text: "",
                key: m.key,
              },
            });
          } catch (error) {
            reply("Error harap contact admin");
          }
        }
        break;
      }

      case "apatuh": {
        if (!m.isGroup) return reply(onlyGroup);
        if (!m.quoted) {
          return m.reply("Reply pesan view-once (gambar/video) yang ingin dibuka.");
        }

        const quoted = m.quoted;

        if (quoted.mtype !== "viewOnceMessageV2") {
          return m.reply("Pesan yang direply bukan pesan view-once.");
        }

        try {
          // Ambil isi pesan view-once
          const vmsg = quoted.message.viewOnceMessageV2.message;
          const mtype = Object.keys(vmsg)[0]; // imageMessage atau videoMessage
          const mediaType = mtype === "imageMessage" ? "image" : "video";

          // Ambil isi media dari pesan
          const stream = await downloadContentFromMessage(vmsg[mtype], mediaType);
          let buffer = Buffer.concat([]);

          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }

          const caption = vmsg[mtype].caption || "";

          // Kirim ulang media-nya langsung
          const sendOptions = mediaType === "image" ? { image: buffer, caption } : { video: buffer, caption };

          await molto.sendMessage(m.chat, sendOptions, { quoted: m });
        } catch (err) {
          console.error(err);
          m.reply("Gagal membuka pesan view-once.");
        }

        break;
      }

      case "ceknomor": {
        if (!m.isGroup) return reply(onlyGroup);
        const axios = require("axios");
        const qs = require("qs");
        const nope1 = text.trim();
        const nope = nope1.replace(/[\s-]/g, "").replace(/^(\+62|62|0)/, "");
        let data = qs.stringify({
          countryCode: "ID",
          phoneNumber: `${nope}`,
        });

        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: "https://recommerce.recharge.com/dev-api/hlr-lookup",
          headers: {
            "redemption-country": "id",
            channel: "uno_global",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          data: data,
        };

        axios
          .request(config)
          .then((response) => {
            if (response.data.data) {
              const { phoneNumber, products } = response.data.data;
              reply(`╭─【 Cek Provider 】
│➠ Nomor : ${nope1}
│➠ Provider : ${products.length > 0 ? products[0].name : "Tidak diketahui"}
│➠ Country : ${products.length > 0 ? products[0].countries[0].name : "Tidak diketahui"}
╰──【 MIKIBOT 】`);
            } else {
              reply(response.data.status);
            }
          })
          .catch((error) => {
            console.log(error);
            reply(error.response.data.status);
          });
        break;
      }


      //                 case 'restart':

      //   //  if (!isCreator) return reply('Oops, kamu siapa?')
      // 	if (!(m.isGroup? isAdmins : isCreator)) return m.reply('*fitur khusus admin & owner*')
      //     let restar = '*[ Notice ]* bot sedang dalam proses restart, harap untuk tidak mengirim perintah saat proses restart di lakukan, bot akan segera aktif kembali!'

      //     reply(restar);

      //     setTimeout(() => {

      //         process.exit(); // Menutup proses bot

      //     }, 5000); // Jeda lebih lama sebelum keluar

      //     break

      case "getlid": {
        async function resolveSenderJid(sock, id) {
          if (!id) return null;

          if (id.endsWith("@s.whatsapp.net")) return id;

          if (!id.endsWith("@lid")) return null;

          try {
            const res = await sock.onWhatsApp(id);
            return res[0]?.jid || null;
          } catch (e) {
            console.error("Error resolveSenderJid:", e);
            return null;
          }
        }
        const number = sender;
        const allGroup = molto.groupFetchAllParticipating();

        const result = await molto.onWhatsApp(number); // hasil: [{jid, lid, ...}]
        const groupMetadata = await molto.groupMetadata(m.chat); // metadata grup
        const participants = groupMetadata?.participants || [];

        const resolved = await resolveSenderJid(molto, m.chat); // dari lid ke jid (kalau valid)
        console.log(JSON.stringify(allGroup, null, 2));

        // reply('*Hasil onWhatsApp:* \n' + JSON.stringify(result, null, 2));
        reply(JSON.stringify(participants, null, 2));
        // reply('*resolveSenderJid:* \n' + JSON.stringify(resolved, null, 2));

        break;
      }

      case "roblox": {
        const sub = args[0];
        switch (sub) {
          case "tax": {
            const jumlah = args[1];
            const before = Math.floor(parseInt(jumlah) * 0.7);
            const after = Math.ceil(parseInt(jumlah) / 0.7);
            reply(`『 *Gamepass Tax Calculator* 』\n\n*Amount Order* : ${jumlah}\n*Before Tax* : ${before}\n*After Tax* : ${after}\n\n> _*MikiStore | MikiBot*_`);
            break;
          }
          case "stalk": {
            try {
              const pin = args[1];
              if (!pin) return m.reply("Masukkan username Roblox kamu\nContoh: .roblox stalk Moldy");

              await molto.sendMessage(m.chat, {
                react: {
                  text: "🔃",
                  key: m.key,
                },
              });

              const { data } = await axios.get(
                `https://apis.roblox.com/search-api/omni-search?verticalType=user&searchQuery=${encodeURIComponent(pin)}&globalSessionId=53259d3b-b8a7-4fb1-b830-1a495157b328&sessionId=53259d3b-b8a7-4fb1-b830-1a495157b328`,
                {
                  headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K)",
                  },
                }
              );
              const { username, displayName, contentId, contentType, hasVerifiedBadge } = data.searchResults[0]?.contents[0] || {};

              let dataThumbnail = JSON.stringify([
                {
                  type: "Avatar",
                  targetId: contentId,
                  token: "",
                  format: "webp",
                  size: "352x352",
                  version: "",
                },
              ]);

              const getHeadersData = await axios.get(`https://users.roblox.com/v1/users/${contentId}`, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K)",
                },
              });
              const { description, isBanned, created } = getHeadersData.data || {};

              const getThumbnail = await axios.post("https://thumbnails.roblox.com/v1/batch", dataThumbnail, {
                headers: {
                  "Content-Type": "application/json",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K)",
                },
              });

              const { imageUrl } = getThumbnail.data.data[0] || {};

              let dataBody = JSON.stringify({
                profileId: contentId,
                profileType: "User",
                components: [
                  {
                    component: "UserProfileHeader",
                  },
                  {
                    component: "Actions",
                  },
                  {
                    component: "About",
                  },
                  {
                    component: "CurrentlyWearing",
                  },
                  {
                    component: "ContentPosts",
                  },
                  {
                    component: "Friends",
                  },
                  {
                    component: "Collections",
                  },
                  {
                    component: "Communities",
                  },
                  {
                    component: "FavoriteExperiences",
                  },
                  {
                    component: "RobloxBadges",
                  },
                  {
                    component: "PlayerBadges",
                  },
                  {
                    component: "Statistics",
                  },
                  {
                    component: "Experiences",
                  },
                  {
                    component: "CreationsModels",
                  },
                  {
                    component: "Clothing",
                  },
                ],
                includeComponentOrdering: true,
              });

              const getBody = await axios.post(`https://apis.roblox.com/profile-platform-api/v1/profiles/get`, dataBody, {
                headers: {
                  "Content-Type": "application/json",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K)",
                },
              });

              const getPresence = await axios.post(
                "https://presence.roblox.com/v1/presence/users",
                {
                  userIds: [contentId],
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K)",
                  },
                }
              );
              const presenceData = getPresence.data.userPresences?.[0] || {};
              const isOnline = presenceData.userPresenceType;
              const lastOnline = presenceData.lastLocation || "N/A";
              const recentGame = presenceData.gameId || "N/A";
              const bodyData = getBody.data || {};
              // const robloxUserId = data.searchResults[0]?.contents[0]?.contentId;
              const { components } = bodyData || {};
              const account = components?.UserProfileHeader || {};
              const presence = components?.About || {};
              const stats = components?.Statistics || {};
              const badges = components?.RobloxBadges || {};
              const friends = components?.Friends?.friends || [];

              let dataTeman = JSON.stringify({
                userIds: friends,
                fields: ["names.combinedName", "isVerified"],
              });

              const getProfile = await axios.post("https://apis.roblox.com/user-profile-api/v1/user/profiles/get-profiles", dataTeman, {
                headers: {
                  "Content-Type": "application/json",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K)",
                },
              });
              const { profileDetails } = getProfile.data || {};

              if (pin !== username) throw new Error("Player tidak ditemukan!");

              await molto.sendMessage(m.chat, {
                react: {
                  text: "",
                  key: m.key,
                },
              });

              // Format pesan hasil
              let result = `『 *ROBLOX PLAYER INFO* 』\n\n`;
              result += `➠ *Username*: ${account.names.username || "N/A"}\n`;
              result += `➠ *Display Name*: ${account.names.primaryName || "N/A"}\n`;
              result += `➠ *Created*: ${new Date(presence.joinDateTime).toLocaleDateString() || "N/A"}\n`;
              result += `➠ *Description*: ${presence.description || "No description"}\n`;
              result += `➠ *Banned*: ${isBanned ? "Yes" : "No"}\n`;
              result += `➠ *Verified*: ${hasVerifiedBadge ? "Yes" : "No"}\n\n`;

              // Presence info
              result += `『 *Presence* 』\n`;
              const statusMap = ["Offline", "Online", "In Game", "In Studio"];
              const statusText = statusMap[presenceData.userPresenceType] || "Unknown";

              result += `➠ Status: ${statusText}\n`;

              result += `➠ Last Online: ${lastOnline || "N/A"}\n`;
              result += `➠ Recent Activity: ${recentGame || "N/A"}\n\n`;

              // Stats
              result += `『 *Stats* 』\n`;
              result += `➠ Friends: ${account.counts.friendsCount || 0}\n`;
              result += `➠ Followers: ${account.counts.followersCount || 0}\n`;
              result += `➠ Following: ${account.counts.followingsCount || 0}\n\n`;

              // Badges
              if (badges.robloxBadgeList.length > 0) {
                result += `『 *Badges (${badges.robloxBadgeList.length})* 』\n`;
                badges.robloxBadgeList.forEach((badge) => {
                  result += `➠ ${badge.type.value} (${badge.id})\n`;
                });
                result += `\n`;
              } else {
                result += `➠ Badges: No badges \n\n`;
              }

              // Friends list (show first 5)
              if (profileDetails.length > 0) {
                result += `『 *Friends (${profileDetails.length})* 』\n`;
                profileDetails.slice(0, 5).forEach((friend) => {
                  // pakai combinedName karena itu yang ada di JSON
                  const friendName = friend.names?.combinedName || "Unknown";
                  const verifiedMark = friend.isVerified ? " ✅" : "";
                  result += `➠ ${friendName}${verifiedMark}\n`;
                });

                if (profileDetails.length > 5) {
                  result += `... and ${profileDetails.length - 5} more\n`;
                }
              } else {
                result += `➠ *Friends*: No friends\n`;
              }
              result += `\n> _*MikiStore | MikiBot*_`;

              // Kirim gambar profil jika ada
              if (imageUrl) {
                try {
                  // const profilePic = account.profilePicture.startsWith('//')
                  //     ? 'https:' + account.profilePicture
                  //     : account.profilePicture;

                  await molto.sendMessage(
                    m.chat,
                    {
                      image: { url: imageUrl },
                      caption: result,
                      footer: `Roblox Stalker • ${new Date().toLocaleString()}`,
                      mentions: [sender],
                    },
                    { quoted: m }
                  );
                } catch (e) {
                  console.error("Error sending profile picture:", e);
                  reply(result);
                }
              } else {
                reply(result);
              }
            } catch (error) {
              console.error("RobloxStalk Error:", error);
              reply(`Error fetching data. Pastikan username benar`);
            }
            break;
          }
          case "outfit": {
            if (!isAdmins) return reply("Fitur Khusus Admin");
            try {
              const pin = args[1];
              if (!pin) return m.reply("Masukkan username Roblox kamu\nContoh: .roblox stalk Moldy");

              await molto.sendMessage(m.chat, {
                react: {
                  text: "🔃",
                  key: m.key,
                },
              });

              const { data } = await axios.get(
                `https://apis.roblox.com/search-api/omni-search?verticalType=user&searchQuery=${encodeURIComponent(pin)}&globalSessionId=53259d3b-b8a7-4fb1-b830-1a495157b328&sessionId=53259d3b-b8a7-4fb1-b830-1a495157b328`,
                {
                  headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K)",
                  },
                }
              );
              const { username, displayName, contentId, contentType, hasVerifiedBadge } = data.searchResults[0]?.contents[0] || {};
              if (pin !== username) return reply("Player tidak ditemukan!");
              let dataThumbnail = JSON.stringify([
                {
                  type: "Avatar",
                  targetId: contentId,
                  token: "",
                  format: "webp",
                  size: "352x352",
                  version: "",
                },
              ]);

              const getHeadersData = await axios.get(`https://users.roblox.com/v1/users/${contentId}`, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K)",
                },
              });
              const { description, isBanned, created } = getHeadersData.data || {};

              const getThumbnail = await axios.post("https://thumbnails.roblox.com/v1/batch", dataThumbnail, {
                headers: {
                  "Content-Type": "application/json",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K)",
                },
              });

              const { imageUrl } = getThumbnail.data.data[0] || {};

              let dataBody = JSON.stringify({
                profileId: contentId,
                profileType: "User",
                components: [
                  {
                    component: "UserProfileHeader",
                  },
                  {
                    component: "Actions",
                  },
                  {
                    component: "About",
                  },
                  {
                    component: "CurrentlyWearing",
                  },
                  {
                    component: "ContentPosts",
                  },
                  {
                    component: "Friends",
                  },
                  {
                    component: "Collections",
                  },
                  {
                    component: "Communities",
                  },
                  {
                    component: "FavoriteExperiences",
                  },
                  {
                    component: "RobloxBadges",
                  },
                  {
                    component: "PlayerBadges",
                  },
                  {
                    component: "Statistics",
                  },
                  {
                    component: "Experiences",
                  },
                  {
                    component: "CreationsModels",
                  },
                  {
                    component: "Clothing",
                  },
                ],
                includeComponentOrdering: true,
              });

              const getBody = await axios.post(`https://apis.roblox.com/profile-platform-api/v1/profiles/get`, dataBody, {
                headers: {
                  "Content-Type": "application/json",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K)",
                },
              });

              const bodyData = getBody.data || {};
              const { components } = bodyData || {};
              const outfit = components?.CurrentlyWearing || {};

              await molto.sendMessage(m.chat, {
                react: {
                  text: "",
                  key: m.key,
                },
              });

              let result = `『 *ROBLOX OUTFIT INFO* 』\n\n`;
              result += `➠ *Name*: ${displayName || "N/A"}\n`;
              if (outfit.assets.length > 0) {
                result += `『 *Total Assets ${outfit.assets.length}* 』\n`;
                outfit.assets.forEach((aset) => {
                  result += `➠ https://www.roblox.com/catalog/${aset.assetId}\n`;
                });
                result += `\n`;
              } else {
                result += `➠ Outfit Assets: No Assets \n\n`;
              }
              result += `\n> _*MikiStore | MikiBot*_`;

              if (imageUrl) {
                try {
                  // const profilePic = account.profilePicture.startsWith('//')
                  //     ? 'https:' + account.profilePicture
                  //     : account.profilePicture;

                  await molto.sendMessage(
                    m.chat,
                    {
                      image: { url: imageUrl },
                      caption: result,
                      footer: `Roblox Stalker • ${new Date().toLocaleString()}`,
                      mentions: [sender],
                    },
                    { quoted: m }
                  );
                } catch (e) {
                  console.error("Error sending profile picture:", e);
                  reply(result);
                }
              } else {
                reply(result);
              }
            } catch (error) {
              console.error("RobloxStalk Error:", error);
              reply(`Error fetching data. Pastikan username benar`);
            }
            break;
          }

          default:
            reply(`Ketik salah satu menu di bawah ini\nContoh : *${command} tax*\n\n` + `➠ *TAX*\n` + `➠ *OUTFIT*\n` + `➠ *STALK*\n\n` + `_*MikiStore | MikiBot*_`);
            break;
        }
        break;
      }

      default:
        // if (
        //   m.message.extendedTextMessage &&
        //   m.message.extendedTextMessage.contextInfo.mentionedJid &&
        //   m.message.extendedTextMessage.contextInfo.mentionedJid.length === 1 &&
        //   m.message.extendedTextMessage.contextInfo.mentionedJid[0] === "120363419285510001@g.us"
        // ) {
        //   return reply("hei");
        // }

        // if (!m.key.fromMe && budy) {
        //   const pesan = budy.trim();
        //   console.log("Pesan diterima:", pesan);
        //   try {
        //     const res = await translate(pesan, null, "en");

        //     // Langsung abaikan jika dari English atau Indonesian
        //     if (["en", "id"].includes(res.language.from)) return;

        //     // Ambil daftar bahasa dari GitHub
        //     const langRes = await axios.get("https://raw.githubusercontent.com/plainheart/bing-translate-api/master/src/lang.json");

        //     // Ambil nama bahasa deteksi
        //     const langName = langRes.data[res.language.from] || res.language.from;

        //     // Lakukan auto translate ke bahasa Indonesia
        //     const translatenya = await autoTranslate(pesan);
        //     console.log(translatenya);

        //     // Kirim hasil
        //     if (translatenya) {
        //       reply(`*${langName}*\n_${translatenya}_`);
        //     } else {
        //       reply(`Bahasa terdeteksi: *${langName}*, tapi gagal menerjemahkan.`);
        //     }
        //   } catch (error) {
        //     console.error("Error during translation:", error);
        //     reply("Terjadi kesalahan saat menerjemahkan pesan.");
        //   }
        // }
        //         if(budy) {
        //           const pesan = budy.trim();
        //           const axios = require('axios');

        // let config = {
        //   method: 'get',
        //   maxBodyLength: Infinity,
        //   url: 'https://lingva.ml/api/v1/auto/id/%EA%B7%B8%EC%9D%98%20%EC%9D%B4%EB%A6%84%EB%8F%84%20%EC%9D%B8%EA%B0%84%EC%9D%B4%EB%8B%A4',
        //    headers: {
        //     'Content-Type': 'application/json'
        //   }
        // };

        // axios.request(config)
        //   .then((response) => {
        //     m.reply(JSON.stringify(response.data, null, 2));
        //   })
        //   .catch((error) => {
        //     m.reply("Request failed:", error.response?.status, error.response?.data || error.message);
        //   });

        //         }

        if (budy) {
          const cleanedBudy = budy.replace(/[()\s]+/g, " ").trim();
          const match = cleanedBudy.match(/^(\d{0,})\s(\d{0,})$/);

          if (match) {
            const userId = match[1];
            const zoneId = match[2];

            const data = await validateMobileLegendsMoogold(userId, zoneId);
            if (data && data.icon === "success") {
              const lines = data.message.split("\n");
              const country = lines[3]?.split(": ")[1]; // ID
              const flag = getFlagEmoji(country);

              await molto.sendMessage(m.chat, {
                react: {
                  text: flag || "❌",
                  key: m.key,
                },
              });
            } else {
              await molto.sendMessage(m.chat, {
                react: {
                  text: "❌",
                  key: m.key,
                },
              });
            }
          }
        }
        /*
              .then(async (data) => {
                if (data && data.success === "success") {
                  const lines = data.message.split("\n");
                  const name = lines[0].split(": ")[1];
                  const server = lines[1].split(": ")[1];
                  const country = lines[2].split(": ")[1];
                  const flag = lines[3].split(": ")[1];

                  await molto.sendMessage(m.chat, {
                    react: {
                      text: "" + getFlagEmoji(flag),
                      key: m.key,
                    },
                  });
                } else {
                  await molto.sendMessage(m.chat, {
                    react: {
                      text: "❌",
                      key: m.key,
                    },
                  });
                }
              })
              .catch(async (err) => {
                console.error("Error:", err);
                await molto.sendMessage(m.chat, {
                  react: {
                    text: "❌",
                    key: m.key,
                  },
                });
              });
          }
        }
        /*
      const response = await fetch(`https://idshopxzn.com/v2/region-ml?api_req=idsAPITOLS&user_id=${userId}&zone_id=${zoneId}`);
      const data = await response.json();

      if (data.status === "success") {
        const userData = data.data;
        const nicknameUser = userData.nickname || "Tidak ditemukan";
        const countryFlag = userData.country_flag || "✅";

        console.log("Request berhasil:", data);
        await molto.sendMessage(m.chat, { react: { text: countryFlag, key: m.key } });
      } else {
        console.log("Data tidak ditemukan atau status error:", data);
        await molto.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      }
    } catch (error) {
      console.error('Error:', error);
      await molto.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    }
  }
  */
        /*  if (botState === 'awaiting_tourism_data' && !m.botNumber) {
    const userInput = m.body;

    // Validasi format input
    const regex = /1\. Nama Daya Tarik Wisata : (.+)\n2\. Alamat : (.+)\n3\. Bulan : (.+)\n4\. Jumlah Wisatawan Indonesia : (\d+)\n5\. Jumlah Wisatawan Asing : (\d+)/;
    const match = userInput.match(regex);

    if (match) {
        // Ekstrak data dari input pengguna
        const namaTempat = match[1];
        const alamat = match[2];
        const bulan = match[3];
        const wisatawanLokal = match[4];
        const wisatawanAsing = match[5];

        // Simpan data ke JSON
        const newData = {
            namaTempat,
            alamat,
            bulan,
            wisatawanLokal: parseInt(wisatawanLokal),
            wisatawanAsing: parseInt(wisatawanAsing),
        };
        saveToJSON(newData);
         botState = null;
    } else {
        // reply('Format input tidak valid. Silakan masukkan data sesuai format yang diminta.');
    }
}
*/
        if (budy.startsWith(">")) {
          if (!isCreator) return;
          try {
            let evaled = await eval(budy.slice(2));
            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
            await m.reply(evaled);
          } catch (err) {
            await m.reply(util.format(err));
          }
        }
    }
  }
    // const el = body.replace(prefix, "").trim().toLowerCase();
    // switch (el) {
    if (budy.startsWith("kata kata hari ini dek miki" || "kata katanya dek miki")) {
      // case "kata kata hari ini dek miki":
      // case "kata katanya dek miki": {
      console.log("ada nih");
      try {
        const absurdFilePath = "./database/absurd.json";
        if (!fs.existsSync(absurdFilePath)) {
          return reply("File absurd.json tidak ditemukan.");
        }
        const lagunya = ["https://www.youtube.com/shorts/Znw9vRrONA4"];

        const absurdnya = JSON.parse(fs.readFileSync(absurdFilePath, "utf-8"));
        if (Array.isArray(absurdnya) && absurdnya.length > 0) {
          const randomIndex = Math.floor(Math.random() * absurdnya.length);
          const religiMessage = absurdnya[randomIndex];
          const randomLagu = lagunya[Math.floor(Math.random() * lagunya.length)];
          const audio = await savetube.download(randomLagu, "144")
          reply(religiMessage);
          console.log(audio);
          await molto.sendMessage(m.chat, {
            audio: { url: audio?.result?.download || audio?.link },
            mimetype: "audio/mp4",
          });
        } else {
          reply("Data absurd kosong atau format tidak sesuai.");
        }
      } catch (error) {
        console.error("Error membaca atau memproses absurd.json:", error);
        reply("Terjadi kesalahan saat mengambil data absurd. Pastikan format JSON valid.");
      }
    }
    // }
  } catch (err) {
    m.reply(util.format(err));
  }
};
