/**
 * Script para gerar imagens do Play Store
 * Requer: npm install canvas (ou usar node-canvas)
 * 
 * Alternativa: Execute este script ou use ferramentas online como Canva
 */

const fs = require('fs');
const path = require('path');

// Cores do FinFlow
const CORES = {
  azulPrincipal: '#4a67af',
  azulEscuro: '#2d199c',
  branco: '#ffffff',
  cinzaClaro: '#f5f7fa'
};

// Criar diretório de saída
const outputDir = path.join(__dirname, '../assets/play-store');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Gerando instruções para criar imagens do Play Store...\n');

// Criar arquivo HTML com Canvas para gerar as imagens no navegador
const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerador de Imagens - FinFlow Play Store</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #4a67af;
        }
        canvas {
            border: 2px solid #ddd;
            margin: 20px 0;
            display: block;
        }
        button {
            background: #4a67af;
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px 5px;
        }
        button:hover {
            background: #2d199c;
        }
        .info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Gerador de Imagens - FinFlow Play Store</h1>
        
        <div class="info">
            <h3>📐 Feature Graphic (1024x500px)</h3>
            <p>Clique no botão abaixo para gerar e baixar o recurso gráfico.</p>
            <canvas id="featureGraphic" width="1024" height="500"></canvas>
            <button onclick="gerarFeatureGraphic()">Gerar e Baixar Feature Graphic</button>
        </div>
        
        <div class="info">
            <h3>📱 Screenshots</h3>
            <p>Os screenshots devem ser capturados diretamente do app em execução.</p>
            <p><strong>Tamanho recomendado:</strong> 1080x1920px (vertical) ou 1920x1080px (horizontal)</p>
            <p><strong>Quantidade mínima:</strong> 2 screenshots</p>
            <p><strong>Recomendado:</strong> 4-8 screenshots</p>
        </div>
    </div>

    <script>
        function gerarFeatureGraphic() {
            const canvas = document.getElementById('featureGraphic');
            const ctx = canvas.getContext('2d');
            const width = 1024;
            const height = 500;
            
            // Limpar canvas
            ctx.clearRect(0, 0, width, height);
            
            // Criar gradiente de fundo
            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, '#4a67af');
            gradient.addColorStop(1, '#2d199c');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            
            // Texto principal "FinFlow"
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('FinFlow', 100, height / 2 - 60);
            
            // Subtítulo
            ctx.font = '40px Arial';
            ctx.fillText('Controle Financeiro Simplificado', 100, height / 2 + 20);
            
            // Ícones/emoji (usando texto)
            ctx.font = '40px Arial';
            ctx.fillText('💰  📊  📅  🔒', 100, height / 2 + 80);
            
            // Crédito (canto inferior direito)
            ctx.font = '20px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('Desenvolvido por Liz Software', width - 30, height - 30);
            
            // Baixar imagem
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'feature-graphic.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                alert('✅ Feature Graphic gerado e baixado!');
            });
        }
        
        // Gerar automaticamente ao carregar
        window.onload = function() {
            gerarFeatureGraphic();
        };
    </script>
</body>
</html>`;

// Salvar arquivo HTML
const htmlPath = path.join(outputDir, 'gerar-imagens.html');
fs.writeFileSync(htmlPath, htmlTemplate);
console.log(`✅ Arquivo HTML criado: ${htmlPath}`);
console.log('\n📝 INSTRUÇÕES:');
console.log('1. Abra o arquivo gerar-imagens.html no navegador');
console.log('2. A imagem será gerada e baixada automaticamente');
console.log('3. Use o arquivo feature-graphic.png no Play Console\n');

// Criar arquivo README com instruções
const readme = `# 🎨 Imagens para Play Store

## 📐 Feature Graphic (Recurso Gráfico)

**Especificações:**
- Tamanho: 1024px × 500px
- Formato: PNG
- Tamanho máximo: 15 MB

**Como gerar:**
1. Abra o arquivo \`gerar-imagens.html\` no navegador
2. A imagem será gerada e baixada automaticamente
3. Ou use ferramentas online como Canva (https://www.canva.com)

## 📱 Screenshots

**Especificações:**
- Tamanho: 1080x1920px (vertical) ou 1920x1080px (horizontal)
- Formato: PNG ou JPEG
- Quantidade mínima: 2
- Recomendado: 4-8 screenshots

**Screenshots necessários:**
1. Tela de Login
2. Dashboard/Principal (com gráficos)
3. Tela de Receitas
4. Tela de Despesas
5. Calendário de Vencimentos
6. Gráficos e Relatórios
7. Configurações
8. Calculadora

**Como capturar:**
- Use a função de screenshot do dispositivo Android
- Ou use emulador Android com ferramenta de screenshot
- Ou use: \`adb shell screencap\`

## ✅ Checklist

- [ ] Feature Graphic criado (1024x500px)
- [ ] Pelo menos 2 screenshots capturados
- [ ] Todas as imagens em formato PNG ou JPEG
- [ ] Tamanhos corretos
- [ ] Qualidade alta (sem pixelização)
`;

const readmePath = path.join(outputDir, 'README.md');
fs.writeFileSync(readmePath, readme);
console.log(`✅ README criado: ${readmePath}\n`);

console.log('✨ Arquivos criados com sucesso!');
console.log(`📁 Localização: ${outputDir}\n`);

