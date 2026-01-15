const fs = require('fs');
const path = require('path');

const files = [
  'src/screens/ReceitaScreen.js',
  'src/screens/DespesaScreen.js',
  'src/screens/ContasScreen.js',
  'src/screens/CalendarioScreen.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    // Lê como buffer para detectar BOM
    let content = fs.readFileSync(filePath);
    
    // Remove BOM (0xEF 0xBB 0xBF)
    if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
      content = content.slice(3);
      console.log(`✅ BOM removido de ${file}`);
    }
    
    // Converte para string e reescreve sem BOM
    const contentStr = content.toString('utf8');
    // Remove qualquer caractere BOM que possa ter sobrado
    const cleanContent = contentStr.replace(/^\uFEFF/, '');
    
    // Reescreve o arquivo sem BOM
    fs.writeFileSync(filePath, cleanContent, { encoding: 'utf8' });
    console.log(`✅ ${file} reescrito sem BOM`);
  } else {
    console.log(`❌ Arquivo não encontrado: ${file}`);
  }
});

console.log('\n✅ Processo concluído!');

