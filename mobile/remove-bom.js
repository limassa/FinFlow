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
    let content = fs.readFileSync(filePath);
    
    // Remove BOM (0xEF 0xBB 0xBF)
    if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
      content = content.slice(3);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ BOM removido de ${file}`);
    } else {
      console.log(`ℹ️  ${file} não tinha BOM`);
    }
  } else {
    console.log(`❌ Arquivo não encontrado: ${file}`);
  }
});

console.log('\n✅ Processo concluído!');

