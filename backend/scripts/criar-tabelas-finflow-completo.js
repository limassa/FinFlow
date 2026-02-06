// Script para criar as tabelas do FinFlow no banco de dados
const pool = require('../src/database/connection');

async function criarTabelas() {
  console.log('🔧 Criando tabelas do FinFlow...\n');
  
  try {
    // 1. Criar tabela Usuario
    console.log('📋 Criando tabela Usuario...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Usuario" (
        "Usuario_Id" SERIAL PRIMARY KEY,
        "Usuario_Email" VARCHAR(255) UNIQUE NOT NULL,
        "Usuario_Senha" VARCHAR(255) NOT NULL,
        "Usuario_Nome" VARCHAR(255) NOT NULL,
        "Usuario_Telefone" VARCHAR(20),
        "Usuario_DtCriacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Usuario_DtAtualizacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Usuario_Ativo" BOOLEAN DEFAULT TRUE,
        "Usuario_ResetToken" VARCHAR(255),
        "Usuario_ResetExpiry" TIMESTAMP,
        "Usuario_LembretesAtivos" BOOLEAN DEFAULT FALSE,
        "Usuario_LembretesEmail" BOOLEAN DEFAULT FALSE,
        "Usuario_LembretesWhatsApp" BOOLEAN DEFAULT FALSE,
        "Usuario_LembretesDiasAntes" INTEGER DEFAULT 5,
        "Usuario_LembretesHorario" TIME
      )
    `);
    console.log('✅ Tabela Usuario criada\n');
    
    // 2. Criar tabela Conta
    console.log('📋 Criando tabela Conta...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Conta" (
        "Conta_Id" SERIAL PRIMARY KEY,
        "Conta_Nome" VARCHAR(100) NOT NULL,
        "Conta_Tipo" VARCHAR(50) NOT NULL,
        "Conta_Saldo" DECIMAL(10,2) DEFAULT 0.00,
        "Usuario_Id" INTEGER NOT NULL,
        "Conta_Ativo" BOOLEAN DEFAULT true,
        "Conta_DtCriacao" TIMESTAMP DEFAULT NOW(),
        "Conta_DtAtualizacao" TIMESTAMP DEFAULT NOW(),
        "Conta_DtDelete" TIMESTAMP NULL,
        FOREIGN KEY ("Usuario_Id") REFERENCES "Usuario"("Usuario_Id")
      )
    `);
    console.log('✅ Tabela Conta criada\n');
    
    // 3. Criar tabela Receita
    console.log('📋 Criando tabela Receita...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Receita" (
        "Receita_Id" SERIAL PRIMARY KEY,
        "Receita_Descricao" VARCHAR(255) NOT NULL,
        "Receita_Valor" DECIMAL(10,2) NOT NULL,
        "Receita_Data" DATE NOT NULL,
        "Receita_Tipo" VARCHAR(50) NOT NULL,
        "Usuario_Id" INTEGER REFERENCES "Usuario"("Usuario_Id") ON DELETE CASCADE,
        "Receita_Ativo" BOOLEAN DEFAULT TRUE,
        "Receita_DtDelete" TIMESTAMP,
        "Receita_UsuarioDelete" INTEGER REFERENCES "Usuario"("Usuario_Id"),
        "Receita_DtCriacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Receita_DtAtualizacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Conta_id" INTEGER NULL REFERENCES "Conta"("Conta_Id"),
        "Receita_Recebido" BOOLEAN DEFAULT FALSE,
        "Receita_Recorrente" BOOLEAN DEFAULT FALSE,
        "Receita_Frequencia" VARCHAR(50) DEFAULT 'mensal',
        "Receita_ProximasParcelas" INTEGER DEFAULT 12
      )
    `);
    console.log('✅ Tabela Receita criada\n');
    
    // 4. Criar tabela Despesa
    console.log('📋 Criando tabela Despesa...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Despesa" (
        "Despesa_Id" SERIAL PRIMARY KEY,
        "Despesa_Descricao" VARCHAR(255) NOT NULL,
        "Despesa_Valor" DECIMAL(10,2) NOT NULL,
        "Despesa_Data" DATE NOT NULL,
        "Despesa_Tipo" VARCHAR(50) NOT NULL,
        "Usuario_Id" INTEGER REFERENCES "Usuario"("Usuario_Id") ON DELETE CASCADE,
        "Despesa_Ativo" BOOLEAN DEFAULT TRUE,
        "Despesa_DtDelete" TIMESTAMP,
        "Despesa_UsuarioDelete" INTEGER REFERENCES "Usuario"("Usuario_Id"),
        "Despesa_DtCriacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Despesa_DtAtualizacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Despesa_Pago" BOOLEAN DEFAULT FALSE,
        "Despesa_DtVencimento" DATE,
        "Conta_id" INTEGER NULL REFERENCES "Conta"("Conta_Id"),
        "Despesa_Recorrente" BOOLEAN DEFAULT FALSE,
        "Despesa_Frequencia" VARCHAR(50) DEFAULT 'mensal',
        "Despesa_ProximasParcelas" INTEGER DEFAULT 12
      )
    `);
    console.log('✅ Tabela Despesa criada\n');
    
    // 5. Criar índices
    console.log('📋 Criando índices...');
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_Receita_Usuario_Id ON "Receita"("Usuario_Id")',
      'CREATE INDEX IF NOT EXISTS idx_Receita_Receita_Data ON "Receita"("Receita_Data")',
      'CREATE INDEX IF NOT EXISTS idx_Receita_Receita_Ativo ON "Receita"("Receita_Ativo")',
      'CREATE INDEX IF NOT EXISTS idx_Despesa_Usuario_Id ON "Despesa"("Usuario_Id")',
      'CREATE INDEX IF NOT EXISTS idx_Despesa_Despesa_Data ON "Despesa"("Despesa_Data")',
      'CREATE INDEX IF NOT EXISTS idx_Despesa_Despesa_Ativo ON "Despesa"("Despesa_Ativo")'
    ];
    
    for (const indexQuery of indices) {
      try {
        await pool.query(indexQuery);
      } catch (err) {
        console.log(`⚠️  Índice: ${err.message.split('\n')[0]}`);
      }
    }
    console.log('✅ Índices criados\n');
    
    console.log('✅ Todas as tabelas criadas com sucesso!\n');
    
    // Verificar tabelas
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('Usuario', 'Receita', 'Despesa', 'Conta')
      ORDER BY table_name
    `);
    
    if (result.rows.length > 0) {
      console.log('📋 Tabelas encontradas:');
      result.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

criarTabelas().catch(console.error);

