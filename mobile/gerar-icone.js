// Script para gerar ícone do app a partir do logo
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// SVG do ícone baseado no logo (apenas o círculo com símbolo)
// Usando as mesmas cores azuis do sistema web (#667eea para #764ba2)
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="finGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fundo -->
  <rect width="1024" height="1024" fill="url(#finGradient)"/>
  
  <!-- Círculo central -->
  <circle cx="512" cy="512" r="400" fill="white" opacity="0.15"/>
  <circle cx="512" cy="512" r="350" fill="white" opacity="0.2"/>
  
  <!-- Símbolo de fluxo financeiro (escalado) -->
  <g transform="translate(512, 512)">
    <!-- Seta para cima -->
    <path d="M -120 -150 L 0 -200 L 120 -150 L 0 -100 Z" fill="white" opacity="0.95"/>
    <!-- Seta para baixo -->
    <path d="M -120 150 L 0 200 L 120 150 L 0 100 Z" fill="white" opacity="0.75"/>
    <!-- Linha central -->
    <path d="M 0 -200 L 0 200" stroke="white" stroke-width="20" fill="none" opacity="0.9"/>
    <!-- Símbolo de dinheiro -->
    <text x="0" y="20" textAnchor="middle" fill="white" fontSize="180" fontWeight="bold" opacity="0.9">$</text>
  </g>
</svg>`;

async function gerarIcone() {
  try {
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const svgPath = path.join(assetsDir, 'icon.svg');
    const pngPath = path.join(assetsDir, 'icon.png');

    // Salvar SVG
    fs.writeFileSync(svgPath, iconSvg, 'utf8');
    console.log('✓ SVG do ícone criado');

    // Converter SVG para PNG 1024x1024
    await sharp(Buffer.from(iconSvg))
      .resize(1024, 1024)
      .png()
      .toFile(pngPath);

    console.log('✓ PNG do ícone gerado (1024x1024)');
    console.log('✓ Arquivo salvo em:', pngPath);
    console.log('');
    console.log('Agora configure o app.json para usar este ícone!');
  } catch (error) {
    console.error('Erro ao gerar ícone:', error.message);
    process.exit(1);
  }
}

gerarIcone();

