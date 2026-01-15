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
    // Lê como buffer
    let buffer = fs.readFileSync(filePath);
    
    // Remove BOM (0xEF 0xBB 0xBF)
    if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      buffer = buffer.slice(3);
      console.log(`✅ BOM removido de ${file}`);
    }
    
    // Converte para string
    let content = buffer.toString('utf8');
    
    // Remove qualquer BOM que possa estar no início da string
    content = content.replace(/^\uFEFF/, '');
    
    // Remove qualquer caractere inválido no início
    content = content.replace(/^[\uFEFF\u200B\u200C\u200D\u2060]/, '');
    
    // Reescreve o arquivo SEM BOM, usando writeFileSync com encoding utf8
    const fd = fs.openSync(filePath, 'w');
    fs.writeSync(fd, content, 0, Buffer.byteLength(content, 'utf8'));
    fs.closeSync(fd);
    
    console.log(`✅ ${file} reescrito sem BOM`);
  } else {
    console.log(`❌ Arquivo não encontrado: ${file}`);
  }
});

console.log('\n✅ Processo concluído!');

