const fs = require("fs");
const path = require("path");
const sharp = require("d:/Negocios/Projetos/Web/projeto-web/mobile/node_modules/sharp");

const W = 1080;
const H = 1080;
const dir = __dirname;
const officialIcon = "d:/Negocios/Projetos/Web/projeto-web/mobile/assets/icon.png";

const C = {
  bg: "#0B1220",
  bg2: "#111827",
  blue: "#2563EB",
  blueLight: "#60A5FA",
  blueGlow: "rgba(37, 99, 235, 0.35)",
  white: "#FFFFFF",
  muted: "#94A3B8",
  green: "#22C55E",
  red: "#EF4444",
  card: "#1E293B",
  cardBorder: "#334155",
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

function phoneMockSvg() {
  const px = 560;
  const py = 130;
  const pw = 430;
  const ph = 780;
  const screenX = px + 18;
  const screenY = py + 52;
  const screenW = pw - 36;
  const screenH = ph - 92;

  return `
  <g transform="rotate(8, ${px + pw / 2}, ${py + ph / 2})">
    <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="42" fill="#020617" stroke="#334155" stroke-width="4"/>
    <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="28" fill="#F8FAFC"/>

    <rect x="${screenX + 24}" y="${screenY + 20}" width="120" height="28" rx="8" fill="${C.blue}"/>
    <text x="${screenX + 84}" y="${screenY + 39}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="#fff">Claricash</text>

    <text x="${screenX + 24}" y="${screenY + 72}" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="700" fill="#0F172A">Resumo do mês</text>

    <rect x="${screenX + 24}" y="${screenY + 84}" width="${(screenW - 60) / 2}" height="72" rx="12" fill="#fff" stroke="#E2E8F0"/>
    <text x="${screenX + 36}" y="${screenY + 106}" font-family="Segoe UI, Arial, sans-serif" font-size="11" fill="#64748B">Entradas</text>
    <text x="${screenX + 36}" y="${screenY + 132}" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="${C.green}">R$ 8.420</text>

    <rect x="${screenX + 36 + (screenW - 60) / 2}" y="${screenY + 84}" width="${(screenW - 60) / 2}" height="72" rx="12" fill="#fff" stroke="#E2E8F0"/>
    <text x="${screenX + 48 + (screenW - 60) / 2}" y="${screenY + 106}" font-family="Segoe UI, Arial, sans-serif" font-size="11" fill="#64748B">Saídas</text>
    <text x="${screenX + 48 + (screenW - 60) / 2}" y="${screenY + 132}" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="${C.red}">R$ 5.180</text>

    <rect x="${screenX + 24}" y="${screenY + 168}" width="${screenW - 48}" height="56" rx="12" fill="${C.blue}" opacity="0.12"/>
    <text x="${screenX + 36}" y="${screenY + 190}" font-family="Segoe UI, Arial, sans-serif" font-size="11" fill="#64748B">Saldo do mês</text>
    <text x="${screenX + 36}" y="${screenY + 214}" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700" fill="${C.blue}">R$ 3.240</text>

    <text x="${screenX + 24}" y="${screenY + 252}" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="700" fill="#0F172A">Próximas contas</text>

    ${[
      { color: C.blue, title: "Aluguel", sub: "Vence dia 05", y: 268 },
      { color: C.green, title: "Salário", sub: "Recebimento dia 10", y: 322 },
      { color: "#A855F7", title: "Consulta", sub: "Agenda · 14:00", y: 376 },
      { color: "#F97316", title: "Cartão", sub: "Fatura dia 20", y: 430 },
    ]
      .map(
        (item) => `
      <rect x="${screenX + 24}" y="${screenY + item.y}" width="${screenW - 48}" height="46" rx="12" fill="#fff" stroke="#E2E8F0"/>
      <circle cx="${screenX + 42}" cy="${screenY + item.y + 23}" r="6" fill="${item.color}"/>
      <text x="${screenX + 58}" y="${screenY + item.y + 20}" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="700" fill="#0F172A">${svgEscape(item.title)}</text>
      <text x="${screenX + 58}" y="${screenY + item.y + 36}" font-family="Segoe UI, Arial, sans-serif" font-size="11" fill="#64748B">${svgEscape(item.sub)}</text>`
      )
      .join("")}

    <rect x="${screenX + 24}" y="${screenY + screenH - 72}" width="${screenW - 48}" height="48" rx="24" fill="${C.blue}"/>
    <text x="${screenX + screenW / 2}" y="${screenY + screenH - 42}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="#fff">+ Nova despesa</text>
  </g>`;
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

  <g id="logo-slot" transform="translate(56, 56)"></g>
  <text x="132" y="92" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="800" fill="${C.white}">Claricash</text>

  <text x="56" y="148" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="2.5" fill="${C.blueLight}">GESTÃO FINANCEIRA PESSOAL</text>

  <text x="56" y="220" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="800" fill="${C.white}">Do registro ao resumo,</text>
  <text x="56" y="278" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="800" fill="${C.white}">suas finanças</text>
  <text x="56" y="336" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="800" fill="${C.blueLight}">sob controle.</text>

  <text x="56" y="392" font-family="Segoe UI, Arial, sans-serif" font-size="19" fill="${C.muted}">
    <tspan x="56" dy="0">Receitas, despesas, cartão e agenda</tspan>
    <tspan x="56" dy="28">no mesmo app — Web, Android e iOS.</tspan>
  </text>

  <rect x="56" y="468" width="290" height="58" rx="29" fill="${C.blue}"/>
  <text x="86" y="504" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="#fff">Comece grátis!</text>
  <path d="M318 497l18 0M330 497l-8-8M330 497l-8 8" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  ${phoneMockSvg()}
  ${featureCols}
</svg>`;
}

async function run() {
  const svg = buildSvg();
  const base = sharp(Buffer.from(svg)).png();
  const icon = await roundedIcon(64);
  await base
    .composite([{ input: icon, left: 56, top: 56 }])
    .toFile(path.join(dir, "feed-06-hero-controle.png"));
  console.log("ok feed-06-hero-controle.png");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
