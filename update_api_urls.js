const fs = require('fs');
const path = require('path');

// Lista de arquivos que precisam ser atualizados
const filesToUpdate = [
  'src/pages/Home.js',
  'src/pages/Principal.js',
  'src/pages/Configuracoes.js',
  'src/pages/ForgotPassword.js',
  'src/pages/ResetPassword.js',
  'src/components/GraficosPizza.js',
  'src/components/GraficoEvolucaoMensal.js',
  'src/components/UserMenu.js',
  'src/components/PasswordStrength.js'
];

// Mapeamento de URLs antigas para novas
const urlMappings = {
  'http://localhost:3001/api/login': 'API_ENDPOINTS.LOGIN',
  'http://localhost:3001/api/cadastro': 'API_ENDPOINTS.CADASTRO',
  'http://localhost:3001/api/forgot-password': 'API_ENDPOINTS.FORGOT_PASSWORD',
  'http://localhost:3001/api/reset-password': 'API_ENDPOINTS.RESET_PASSWORD',
  'http://localhost:3001/api/user/perfil': 'API_ENDPOINTS.USER_PROFILE',
  'http://localhost:3001/api/user/lembretes': 'API_ENDPOINTS.USER_LEMBRETES',
  'http://localhost:3001/api/user/exportar': 'API_ENDPOINTS.USER_EXPORTAR',
  'http://localhost:3001/api/user/excluir': 'API_ENDPOINTS.USER_EXCLUIR',
  'http://localhost:3001/api/receitas': 'API_ENDPOINTS.RECEITAS',
  'http://localhost:3001/api/despesas': 'API_ENDPOINTS.DESPESAS',
  'http://localhost:3001/api/contas': 'API_ENDPOINTS.CONTAS',
  'http://localhost:3001/api/parcela-atual/receita': 'API_ENDPOINTS.PARCELA_ATUAL_RECEITA',
  'http://localhost:3001/api/parcela-atual/despesa': 'API_ENDPOINTS.PARCELA_ATUAL_DESPESA',
  'http://localhost:3001/api/password-requirements': 'API_ENDPOINTS.PASSWORD_REQUIREMENTS'
};

console.log('🚀 Iniciando atualização das URLs da API...');

filesToUpdate.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let updated = false;

    // Verificar se já tem o import da API_ENDPOINTS
    if (!content.includes('API_ENDPOINTS')) {
      // Adicionar import se não existir
      if (content.includes('import axios')) {
        content = content.replace(
          'import axios from \'axios\';',
          'import axios from \'axios\';\nimport { API_ENDPOINTS } from \'../config/api\';'
        );
        updated = true;
      } else if (content.includes('import fetch')) {
        content = content.replace(
          'import fetch from \'node-fetch\';',
          'import fetch from \'node-fetch\';\nimport { API_ENDPOINTS } from \'../config/api\';'
        );
        updated = true;
      }
    }

    // Substituir URLs
    Object.entries(urlMappings).forEach(([oldUrl, newUrl]) => {
      const regex = new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(oldUrl)) {
        content = content.replace(regex, `\${${newUrl}}`);
        updated = true;
        console.log(`✅ ${filePath}: ${oldUrl} → ${newUrl}`);
      }
    });

    if (updated) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Arquivo atualizado: ${filePath}`);
    } else {
      console.log(`ℹ️  Nenhuma alteração necessária: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
});

console.log('🎉 Atualização concluída!'); 