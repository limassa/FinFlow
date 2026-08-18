const fs = require("fs");
const path = require("path");
const sharp = require("d:/Negocios/Projetos/Web/projeto-web/mobile/node_modules/sharp");

const W = 1080;
const H = 1080;
const dir = __dirname;
const officialIcon = "d:/Negocios/Projetos/Web/projeto-web/mobile/assets/icon.png";
const appScreenshot = path.join(dir, "app-screenshot-home.png");

const C = {
  bg: "#0B1220",
  bg2: "#111827",
  blue: "#2563EB",
  blueLight: "#60A5FA",
  blueGlow: "rgba(37, 99, 235, 0.35)",
  white: "#FFFFFF",
  muted: "#94A3B8",
  card: "#1E293B",
  cardBorder: "#334155",
};

const PHONE = {
  left: 548,
  top: 118,
  width: 440,
  height: 800,
  screenPadX: 16,
  screenPadTop: 48,
  screenPadBottom: 36,
  screenRadius: 30,
  frameRadius: 44,
  rotate: 8,
};

async function roundedIcon(size) {
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

function svgEscape(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function featureIcon(type, x, y) {
  const icons = {
    wallet: `<path d="M${x + 6} ${y + 8}h14a2 2 0 012 2v10a2 2 0 01-2 2H${x + 6}a2 2 0 01-2-2V${y + 10}a2 2 0 012-2z" fill="none" stroke="${C.blueLight}" stroke-width="2"/><path d="M${x + 20} ${y + 14}h4a2 2 0 012 2v2a2 2 0 01-2 2h-4" fill="none" stroke="${C.blueLight}" stroke-width="2"/>`,
    chart: `<path d="M${x + 4} ${y + 20}V${y + 10}M${x + 10} ${y + 20}V${y + 6}M${x + 16} ${y + 20}V${y + 12}M${x + 22} ${y + 20}V${y + 8}" stroke="${C.blueLight}" stroke-width="2.2" stroke-linecap="round"/>`,
    calendar: `<rect x="${x + 4}" y="${y + 6}" width="18" height="16" rx="2" fill="none" stroke="${C.blueLight}" stroke-width="2"/><path d="M${x + 4} ${y + 11}h18M${x + 9} ${y + 4}v4M${x + 17} ${y + 4}v4" stroke="${C.blueLight}" stroke-width="2" stroke-linecap="round"/>`,
    card: `<rect x="${x + 3}" y="${y + 7}" width="20" height="14" rx="2.5" fill="none" stroke="${C.blueLight}" stroke-width="2"/><path d="M${x + 3} ${y + 12}h20" stroke="${C.blueLight}" stroke-width="2"/>`,
  };
  return icons[type] || "";
}

async function buildPhoneLayer() {
  const { width: fw, height: fh, screenPadX, screenPadTop, screenPadBottom, screenRadius, frameRadius } =
    PHONE;
  const sw = fw - screenPadX * 2;
  const sh = fh - screenPadTop - screenPadBottom;

  const screenMask = Buffer.from(
    `<svg width="${sw}" height="${sh}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${sw}" height="${sh}" rx="${screenRadius}" ry="${screenRadius}" fill="white"/>
    </svg>`
  );

  const screen = await sharp(appScreenshot)
    .resize(sw, sh, { fit: "cover", position: "top" })
    .composite([{ input: screenMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const frameSvg = Buffer.from(
    `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="${fw - 4}" height="${fh - 4}" rx="${frameRadius}" ry="${frameRadius}"
        fill="#020617" stroke="#334155" stroke-width="4"/>
    </svg>`
  );

  const phone = await sharp({
    create: { width: fw, height: fh, channels: 4, background: { r: 2, g: 6, b: 23, alpha: 1 } },
  })
    .composite([
      { input: frameSvg, left: 0, top: 0 },
      { input: screen, left: screenPadX, top: screenPadTop },
    ])
    .png()
    .toBuffer();

  const rotated = await sharp(phone)
    .rotate(PHONE.rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const meta = await sharp(rotated).metadata();
  const left = Math.round(PHONE.left - (meta.width - fw) / 2);
  const top = Math.round(PHONE.top - (meta.height - fh) / 2);
  return { buffer: rotated, left, top };
}

function buildSvg() {
  const features = [
    { icon: "wallet", title: "Receitas e despesas", sub: "registradas" },
    { icon: "card", title: "Cartão de crédito", sub: "controlado" },
    { icon: "calendar", title: "Agenda pessoal", sub: "organizada" },
    { icon: "chart", title: "Panorama do mês", sub: "em segundos" },
  ];

  const featureCols = features
    .map((f, i) => {
      const colX = 48 + i * 246;
      return `
      <g transform="translate(${colX}, 900)">
        <rect x="0" y="0" width="52" height="52" rx="14" fill="${C.card}" stroke="${C.cardBorder}"/>
        <g transform="translate(14, 14)">${featureIcon(f.icon, 0, 0)}</g>
        <text x="0" y="78" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="700" fill="${C.white}">${svgEscape(f.title)}</text>
        <text x="0" y="100" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="${C.muted}">${svgEscape(f.sub)}</text>
      </g>`;
    })
    .join("");

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="72%" cy="28%" r="55%">
      <stop offset="0%" stop-color="${C.blueGlow}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.bg}"/>
      <stop offset="100%" stop-color="${C.bg2}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <rect x="0" y="860" width="${W}" height="220" fill="rgba(15, 23, 42, 0.72)"/>
  <line x1="48" y1="860" x2="1032" y2="860" stroke="${C.cardBorder}" stroke-width="1"/>

  <text x="132" y="92" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="800" fill="${C.white}">Claricash</text>

  <text x="56" y="148" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="2.5" fill="${C.blueLight}">GESTÃO FINANCEIRA PESSOAL</text>

  <text x="56" y="220" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="800" fill="${C.white}">Do registro ao resumo,</text>
  <text x="56" y="278" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="800" fill="${C.white}">suas finanças</text>
  <text x="56" y="336" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="800" fill="${C.blueLight}">sob controle.</text>

  <text x="56" y="392" font-family="Segoe UI, Arial, sans-serif" font-size="19" fill="${C.muted}">
    <tspan x="56" dy="0">Receitas, despesas, cartão e agenda</tspan>
    <tspan x="56" dy="28">no mesmo app — Web e Android.</tspan>
  </text>

  <rect x="56" y="468" width="290" height="58" rx="29" fill="${C.blue}"/>
  <text x="86" y="504" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="#fff">Comece grátis!</text>
  <path d="M318 497l18 0M330 497l-8-8M330 497l-8 8" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  ${featureCols}
</svg>`;
}

async function run() {
  if (!fs.existsSync(appScreenshot)) {
    throw new Error("Screenshot não encontrado: " + appScreenshot);
  }

  const svg = buildSvg();
  const icon = await roundedIcon(64);
  const phone = await buildPhoneLayer();

  await sharp(Buffer.from(svg))
    .composite([
      { input: phone.buffer, left: phone.left, top: phone.top },
      { input: icon, left: 56, top: 56 },
    ])
    .png()
    .toFile(path.join(dir, "feed-06-hero-controle.png"));

  console.log("ok feed-06-hero-controle.png");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
