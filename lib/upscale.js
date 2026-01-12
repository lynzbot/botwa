// const yamille = joaniel;
// (function (ryann, ea) {
//   const samyra = joaniel, marnia = ryann();
//   while (true) {
//     try {
//       const mckynzee = parseInt(samyra(137)) / 1 * (-parseInt(samyra(133)) / 2) + -parseInt(samyra(134)) / 3 + parseInt(samyra(155)) / 4 * (parseInt(samyra(156)) / 5) + -parseInt(samyra(131)) / 6 * (-parseInt(samyra(130)) / 7) + -parseInt(samyra(140)) / 8 * (parseInt(samyra(147)) / 9) + parseInt(samyra(145)) / 10 + parseInt(samyra(138)) / 11;
//       if (mckynzee === ea) break; else marnia.push(marnia.shift());
//     } catch (beril) {
//       marnia.push(marnia.shift());
//     }
//   }
// }(altavious, 888830));
// const FormData = require("form-data"), Jimp = require(yamille(154));
// function joaniel(wendolyne, nyier) {
//   const enalina = altavious();
//   return joaniel = function (laurae, mekelle) {
//     laurae = laurae - 127;
//     let ralphine = enalina[laurae];
//     return ralphine;
//   }, joaniel(wendolyne, nyier);
// }
// function altavious() {
//   const jaylenn = ["inferenceengine", "push", "21AoSGqU", "225006xOkcNu", "concat", "472390FPofBK", "4809828vvqtte", "data", "model_version", "3NUOcvQ", "14047187eKUyBb", "error", "3013792ZhnCJd", "okhttp/4.9.3", ".ai/", "enhance_image_body.jpg", "from", "10610670esKiBu", "append", "18nRsxLl", "submit", "https", "image", ".vyro", "image/jpeg", "enhance", "jimp", "24448HhNNWt", "1230ttmiGH", "Keep-Alive"];
//   altavious = function () {
//     return jaylenn;
//   };
//   return altavious();
// }
// async function remini(kyoko, tysa) {
//   return new Promise(async (majeed, tamicko) => {
//     const deamber = joaniel;
//     let milahn = [deamber(153), "recolor", "dehaze"];
//     milahn.includes(tysa) ? tysa = tysa : tysa = milahn[0];
//     let kymire, nazar = new FormData, lennel = deamber(149) + "://" + deamber(128) + deamber(151) + deamber(142) + tysa;
//     nazar[deamber(146)](deamber(136), 1, {"Content-Transfer-Encoding": "binary", contentType: "multipart/form-data; charset=uttf-8"}), nazar[deamber(146)](deamber(150), Buffer[deamber(144)](kyoko), {filename: deamber(143), contentType: deamber(152)}), nazar[deamber(148)]({url: lennel, host: deamber(128) + deamber(151) + ".ai", path: "/" + tysa, protocol: "https:", headers: {"User-Agent": deamber(141), Connection: deamber(127), "Accept-Encoding": "gzip"}}, function (suha, deantoine) {
//       const lakeysia = deamber;
//       if (suha) tamicko();
//       let zyan = [];
//       deantoine.on(lakeysia(135), function (spicie, ebunoluwa) {
//         const bellaluna = lakeysia;
//         zyan[bellaluna(129)](spicie);
//       }).on("end", () => {
//         const camden = lakeysia;
//         majeed(Buffer[camden(132)](zyan));
//       }), deantoine.on(lakeysia(139), shady => {
//         tamicko();
//       });
//     });
//   });
// }
// module.exports.remini = remini;

const FormData = require("form-data");
const fs = require("fs");
const https = require("https");

async function remini(imagePath, mode = "enhance") {
  return new Promise((resolve, reject) => {
    const availableModes = ["enhance", "recolor", "dehaze"];
    if (!availableModes.includes(mode)) {
      mode = "enhance";
    }

    const form = new FormData();
    form.append("model_version", "1");
    form.append("image", fs.createReadStream(imagePath), {
      filename: "enhance_image_body.jpg",
      contentType: "image/jpeg",
    });

    const options = {
      method: "POST",
      hostname: "inferenceengine.vyro.ai",
      path: `/${mode}`,
      headers: {
        ...form.getHeaders(),
        "User-Agent": "okhttp/4.9.3",
        Connection: "Keep-Alive",
        "Accept-Encoding": "gzip",
      },
    };

    const req = https.request(options, (res) => {
      const dataChunks = [];

      res.on("data", (chunk) => {
        dataChunks.push(chunk);
      });

      res.on("end", () => {
        const buffer = Buffer.concat(dataChunks);
        resolve(buffer); // Berhasil, kirim buffer hasil gambar
      });

      res.on("error", (err) => {
        reject(err); // Error saat response
      });
    });

    req.on("error", (err) => {
      reject(err); // Error saat request
    });

    form.pipe(req);
  });
}
async function remini2(imagePath) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("scale", "2");
    form.append("image", fs.createReadStream(imagePath), {
      filename: "enhance_image_body.jpg",
      contentType: "image/jpeg",
    });

    const options = {
      method: "POST",
      hostname: "api2.pixelcut.app",
      path: `/image/upscale/v1`,
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryQzAxBDHobT3jxc1P",
        Origin: "https://www.pixelcut.ai",
        Referer: "https://www.pixelcut.ai/",
        "X-Client-Version": "web",
        "X-Locale": "en",
      },
    };

    const req = https.request(options, (res) => {
      const dataChunks = [];

      res.on("data", (chunk) => {
        dataChunks.push(chunk);
      });
      console.log(req);

      res.on("end", () => {
        const buffer = Buffer.concat(dataChunks);
        resolve(buffer); // Berhasil, kirim buffer hasil gambar
      });

      res.on("error", (err) => {
        reject(err); // Error saat response
      });
    });

    req.on("error", (err) => {
      reject(err); // Error saat request
    });

    form.pipe(req);
  });
}

module.exports = { remini, remini2 };
