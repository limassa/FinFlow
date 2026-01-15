// Script para replicar dados de produção (Railway) para teste
// Banco de produção usa tabelas em MINÚSCULAS
const { Pool } = require('pg');

const RAILWAY_DB_URL = 'postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway';

const poolProducao = new Pool({
  connectionString: RAILWAY_DB_URL,
  ssl: { rejectUnauthorized: false }
});

const poolTeste = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'FinFlowTeste',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

async function replicarDados() {
  console.log('🔄 Replicando dados de produção (Railway) para teste...\n');
  
  try {
    // 1. Conectar à produção
    console.log('🔍 Conectando à produção...');
    await poolProducao.query('SELECT 1');
    console.log('✅ Conectado à produção\n');
    
    // 2. Listar usuários disponíveis
    console.log('📋 Usuários disponíveis na produção:');
    const usuariosProd = await poolProducao.query(`
      SELECT usuario_id, usuario_email, usuario_nome 
      FROM usuario 
      ORDER BY usuario_id 
      LIMIT 10
    `);
    
    if (usuariosProd.rows.length === 0) {
      console.log('❌ Nenhum usuário encontrado na produção');
      return;
    }
    
    usuariosProd.rows.forEach((u, i) => {
      console.log(`   ${i + 1}. ID: ${u.usuario_id} - ${u.usuario_nome} (${u.usuario_email})`);
    });
    console.log('');
    
    // 3. Encontrar usuário com mais dados
    console.log('🔍 Encontrando usuário com mais dados...');
    const usuariosComDados = await poolProducao.query(`
      SELECT 
        u.usuario_id,
        u.usuario_nome,
        u.usuario_email,
        COUNT(DISTINCT c.conta_id) as total_contas,
        COUNT(DISTINCT r.receita_id) as total_receitas,
        COUNT(DISTINCT d.despesa_id) as total_despesas
      FROM usuario u
      LEFT JOIN conta c ON c.usuario_id = u.usuario_id AND c.conta_ativo = TRUE
      LEFT JOIN receita r ON r.usuario_id = u.usuario_id AND r.receita_ativo = TRUE
      LEFT JOIN despesa d ON d.usuario_id = u.usuario_id AND d.despesa_ativo = TRUE
      GROUP BY u.usuario_id, u.usuario_nome, u.usuario_email
      HAVING (COUNT(DISTINCT c.conta_id) + COUNT(DISTINCT r.receita_id) + COUNT(DISTINCT d.despesa_id)) > 0
      ORDER BY (COUNT(DISTINCT c.conta_id) + COUNT(DISTINCT r.receita_id) + COUNT(DISTINCT d.despesa_id)) DESC
      LIMIT 1
    `);
    
    if (usuariosComDados.rows.length === 0) {
      console.log('⚠️  Nenhum usuário com dados encontrado');
      return;
    }
    
    const usuarioId = usuariosComDados.rows[0].usuario_id;
    const usuario = usuariosComDados.rows[0];
    
    console.log(`✅ Usuário selecionado: ID ${usuarioId} - ${usuario.usuario_nome}`);
    console.log(`   Contas: ${usuario.total_contas} | Receitas: ${usuario.total_receitas} | Despesas: ${usuario.total_despesas}\n`);
    
    // Buscar dados completos do usuário
    const usuarioCompleto = await poolProducao.query('SELECT * FROM usuario WHERE usuario_id = $1', [usuarioId]);
    const usuarioData = usuarioCompleto.rows[0];
    
    console.log(`📋 Replicando dados do usuário ID ${usuarioId} (${usuario.usuario_nome})...\n`);
    
    // 4. Verificar/criar usuário no teste
    console.log('📋 Verificando usuário no teste...');
    let usuarioTeste = await poolTeste.query('SELECT * FROM "Usuario" WHERE "Usuario_Id" = $1', [usuarioId]);
    
    if (usuarioTeste.rows.length === 0) {
      console.log('   Criando usuário no teste...');
      await poolTeste.query(`
        INSERT INTO "Usuario" 
          ("Usuario_Id", "Usuario_Email", "Usuario_Senha", "Usuario_Nome", "Usuario_Telefone", "Usuario_Ativo")
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        usuarioData.usuario_id, usuarioData.usuario_email, usuarioData.usuario_senha,
        usuarioData.usuario_nome, usuarioData.usuario_telefone || null, true
      ]);
      console.log('   ✅ Usuário criado\n');
    } else {
      console.log('   ✅ Usuário já existe\n');
    }
    
    // 5. Replicar Contas (com mapeamento de IDs)
    console.log('📋 Replicando contas...');
    const contasProd = await poolProducao.query(`
      SELECT * FROM conta 
      WHERE usuario_id = $1 AND conta_ativo = TRUE
    `, [usuarioId]);
    
    console.log(`   Encontradas ${contasProd.rows.length} contas`);
    
    const mapeamentoContas = {}; // Mapeia conta_id_producao -> conta_id_teste
    
    for (const conta of contasProd.rows) {
      try {
        // Verificar se já existe
        const contaExistente = await poolTeste.query(`
          SELECT "Conta_Id" FROM "Conta" 
          WHERE "Conta_Nome" = $1 AND "Usuario_Id" = $2
        `, [conta.conta_nome, usuarioId]);
        
        if (contaExistente.rows.length > 0) {
          mapeamentoContas[conta.conta_id] = contaExistente.rows[0].Conta_Id;
          console.log(`   ✅ ${conta.conta_nome} (já existe)`);
        } else {
          const result = await poolTeste.query(`
            INSERT INTO "Conta" 
              ("Conta_Nome", "Conta_Tipo", "Conta_Saldo", "Usuario_Id", "Conta_Ativo")
            VALUES ($1, $2, $3, $4, $5)
            RETURNING "Conta_Id"
          `, [
            conta.conta_nome, conta.conta_tipo, conta.conta_saldo,
            usuarioId, conta.conta_ativo !== false
          ]);
          mapeamentoContas[conta.conta_id] = result.rows[0].Conta_Id;
          console.log(`   ✅ ${conta.conta_nome} (ID: ${result.rows[0].Conta_Id})`);
        }
      } catch (err) {
        console.log(`   ⚠️  Erro: ${err.message.split('\n')[0]}`);
      }
    }
    console.log('');
    
    // 6. Replicar Receitas
    console.log('📋 Replicando receitas...');
    const receitasProd = await poolProducao.query(`
      SELECT * FROM receita 
      WHERE usuario_id = $1 AND receita_ativo = TRUE
    `, [usuarioId]);
    
    console.log(`   Encontradas ${receitasProd.rows.length} receitas`);
    
    for (const receita of receitasProd.rows) {
      try {
        // Mapear conta_id se existir
        const contaIdTeste = receita.conta_id ? mapeamentoContas[receita.conta_id] : null;
        
        await poolTeste.query(`
          INSERT INTO "Receita" 
            ("Receita_Descricao", "Receita_Valor", "Receita_Data", "Receita_Tipo", 
             "Usuario_Id", "Receita_Recebido", "Conta_id", "Receita_Ativo")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT DO NOTHING
        `, [
          receita.receita_descricao, receita.receita_valor, receita.receita_data,
          receita.receita_tipo, receita.usuario_id, receita.receita_recebido || false,
          contaIdTeste, receita.receita_ativo !== false
        ]);
        console.log(`   ✅ ${receita.receita_descricao} - R$ ${receita.receita_valor}`);
      } catch (err) {
        console.log(`   ⚠️  Erro: ${err.message.split('\n')[0]}`);
      }
    }
    console.log('');
    
    // 7. Replicar Despesas
    console.log('📋 Replicando despesas...');
    const despesasProd = await poolProducao.query(`
      SELECT * FROM despesa 
      WHERE usuario_id = $1 AND despesa_ativo = TRUE
    `, [usuarioId]);
    
    console.log(`   Encontradas ${despesasProd.rows.length} despesas`);
    
    for (const despesa of despesasProd.rows) {
      try {
        // Mapear conta_id se existir
        const contaIdTeste = despesa.conta_id ? mapeamentoContas[despesa.conta_id] : null;
        
        await poolTeste.query(`
          INSERT INTO "Despesa" 
            ("Despesa_Descricao", "Despesa_Valor", "Despesa_Data", "Despesa_DtVencimento",
             "Despesa_Tipo", "Despesa_Pago", "Conta_id", "Usuario_Id", "Despesa_Ativo")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT DO NOTHING
        `, [
          despesa.despesa_descricao, despesa.despesa_valor, despesa.despesa_data,
          despesa.despesa_dtvencimento || null, despesa.despesa_tipo,
          despesa.despesa_pago || false, contaIdTeste, despesa.usuario_id,
          despesa.despesa_ativo !== false
        ]);
        console.log(`   ✅ ${despesa.despesa_descricao} - R$ ${despesa.despesa_valor}`);
      } catch (err) {
        console.log(`   ⚠️  Erro: ${err.message.split('\n')[0]}`);
      }
    }
    console.log('');
    
    console.log('✅ Replicação concluída!\n');
    
    // Verificar dados replicados
    console.log('📊 Dados replicados no teste:');
    const contasTeste = await poolTeste.query('SELECT COUNT(*) as total FROM "Conta" WHERE "Usuario_Id" = $1', [usuarioId]);
    const receitasTeste = await poolTeste.query('SELECT COUNT(*) as total FROM "Receita" WHERE "Usuario_Id" = $1', [usuarioId]);
    const despesasTeste = await poolTeste.query('SELECT COUNT(*) as total FROM "Despesa" WHERE "Usuario_Id" = $1', [usuarioId]);
    
    console.log(`   Contas: ${contasTeste.rows[0].total}`);
    console.log(`   Receitas: ${receitasTeste.rows[0].total}`);
    console.log(`   Despesas: ${despesasTeste.rows[0].total}\n`);
    
    console.log(`💡 Usuário replicado: ID ${usuarioId} - ${usuario.usuario_nome}`);
    console.log(`   Email: ${usuario.usuario_email}\n`);
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
    if (err.detail) {
      console.error('   Detalhes:', err.detail);
    }
  } finally {
    await poolProducao.end();
    await poolTeste.end();
  }
}

replicarDados().catch(console.error);

