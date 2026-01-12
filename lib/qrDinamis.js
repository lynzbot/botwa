require("../owner-dan-menu");

function toCRC16(str) {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
      }
    }
    crc &= 0xffff;
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  async function qrisDinamis(nominal) {
    // QRIS String Statis
    let qris = global.qrisString;

    let qris2 = qris.slice(0, -4);
    let replaceQris = qris2.replace("010211", "010212");

    let pecahQris = replaceQris.split("5802ID");

    let tag54 = "54";
    let nominalStr = String(nominal);
    let tag54Length = nominalStr.length.toString().padStart(2, "0");
    let tag54Full = tag54 + tag54Length + nominalStr;

    let stringTanpaCRC = pecahQris[0] + tag54Full + "5802ID" + (pecahQris[1] || "");
    let crcFinal = toCRC16(stringTanpaCRC);
    let fullQRIS = stringTanpaCRC + crcFinal;

    return fullQRIS;
  }

    module.exports = { qrisDinamis };
