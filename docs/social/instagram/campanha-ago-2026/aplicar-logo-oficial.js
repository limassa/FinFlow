const fs = require("fs");
const path = require("path");
const sharp = require("d:/Negocios/Projetos/Web/projeto-web/mobile/node_modules/sharp");

const dest = __dirname;
const src = "C:/Users/morei/.cursor/projects/d-Negocios-Projetos-Web-projeto-web/assets";
const officialIcon = "d:/Negocios/Projetos/Web/projeto-web/mobile/assets/icon.png";

async function roundedAppIcon(size) {
  const radius = Math.round(size * 0.2237);
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/>
    </svg>`
  );
  return sharp(officialIcon)
    .resize(size, size)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

const jobs = [
  { from: "feed-01-disponivel-nologo.png", to: "feed-01-disponivel.png", y: 48, size: 168 },
  { from: "feed-02-planilha-nologo.png", to: "feed-02-planilha.png", y: 36, size: 148 },
  { from: "feed-03-agenda-nologo.png", to: "feed-03-agenda.png", y: 36, size: 148 },
  { from: "feed-04-habitos-nologo.png", to: "feed-04-habitos.png", y: 36, size: 148 },
  { from: "feed-05-ios-nologo.png", to: "feed-05-ios.png", y: 40, size: 156 },
  { from: "ad-01-cta-nologo.png", to: "ad-01-cta-portrait.png", y: 36, size: 148 },
  { from: "story-01-claras-nologo.png", to: "story-01-claras.png", y: 64, size: 176 },
  { from: "story-02-contas-nologo.png", to: "story-02-contas.png", y: 64, size: 176 },
  { from: "story-03-comece-nologo.png", to: "story-03-comece.png", y: 64, size: 176 },
  { from: "reel-cover-sobrou-nologo.png", to: "reel-cover-sobrou.png", y: 72, size: 176 },
];

async function run() {
  const cache = new Map();
  for (const job of jobs) {
    const input = path.join(src, job.from);
    const output = path.join(dest, job.to);
    if (!fs.existsSync(input)) {
      throw new Error("Arquivo não encontrado: " + input);
    }
    if (!cache.has(job.size)) cache.set(job.size, await roundedAppIcon(job.size));
    const iconBuf = cache.get(job.size);
    const meta = await sharp(input).metadata();
    const left = Math.round((meta.width - job.size) / 2);
    await sharp(input)
      .composite([{ input: iconBuf, left, top: job.y }])
      .png()
      .toFile(output);
    console.log("ok", job.to);
  }
  fs.writeFileSync(path.join(dest, "logo-oficial-app.png"), await roundedAppIcon(512));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
