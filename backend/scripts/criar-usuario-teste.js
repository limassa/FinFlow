// Script para criar usuário de teste e dados de exemplo
const pool = require('../src/database/connection');
const bcrypt = require('bcrypt');

async function criarUsuarioTeste() {
  console.log('🔧 Criando usuário de teste e dados de exemplo...\n');
  
  try {
    // 1. Criar usuário
    console.log('📋 Criando usuário de teste...');
    const senhaCriptografada = await bcrypt.hash('123456', 10);
    
    const usuario = await pool.query(`
      INSERT INTO "Usuario" 
        ("Usuario_Email", "Usuario_Senha", "Usuario_Nome", "Usuario_Telefone", "Usuario_Ativo")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING "Usuario_Id", "Usuario_Email", "Usuario_Nome"
    `, ['teste@finflow.com', senhaCriptografada, 'Usuário Teste', '11999999999', true]);
    
    const userId = usuario.rows[0].Usuario_Id;
    console.log(`✅ Usuário criado: ID ${userId} - ${usuario.rows[0].Usuario_Nome}`);
    console.log(`   Email: ${usuario.rows[0].Usuario_Email}`);
    console.log(`   Senha: 123456\n`);
    
    // 2. Criar conta
    console.log('📋 Criando conta de teste...');
    const conta = await pool.query(`
      INSERT INTO "Conta" 
        ("Conta_Nome", "Conta_Tipo", "Conta_Saldo", "Usuario_Id", "Conta_Ativo")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING "Conta_Id", "Conta_Nome", "Conta_Saldo"
    `, ['Conta Corrente', 'Corrente', 1000.00, userId, true]);
    
    const contaId = conta.rows[0].Conta_Id;
    console.log(`✅ Conta criada: ${conta.rows[0].Conta_Nome} - R$ ${conta.rows[0].Conta_Saldo}\n`);
    
    // 3. Criar receitas de exemplo
    console.log('📋 Criando receitas de exemplo...');
    const receitas = [
      { descricao: 'Salário', valor: 5000.00, data: '2026-01-05', tipo: 'Salário', recebido: true },
      { descricao: 'Freelance', valor: 1500.00, data: '2026-01-10', tipo: 'Trabalho', recebido: true },
      { descricao: 'Venda', valor: 800.00, data: '2026-01-15', tipo: 'Venda', recebido: false }
    ];
    
    for (const receita of receitas) {
      await pool.query(`
        INSERT INTO "Receita" 
          ("Receita_Descricao", "Receita_Valor", "Receita_Data", "Receita_Tipo", 
           "Receita_Recebido", "Conta_id", "Usuario_Id", "Receita_Ativo")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        receita.descricao, receita.valor, receita.data, receita.tipo,
        receita.recebido, contaId, userId, true
      ]);
    }
    console.log(`✅ ${receitas.length} receitas criadas\n`);
    
    // 4. Criar despesas de exemplo
    console.log('📋 Criando despesas de exemplo...');
    const despesas = [
      { descricao: 'Aluguel', valor: 1200.00, data: '2026-01-05', dataVencimento: '2026-01-10', tipo: 'Moradia', pago: true },
      { descricao: 'Supermercado', valor: 450.00, data: '2026-01-08', dataVencimento: '2026-01-15', tipo: 'Alimentação', pago: false },
      { descricao: 'Internet', valor: 99.90, data: '2026-01-10', dataVencimento: '2026-01-12', tipo: 'Serviços', pago: false }
    ];
    
    for (const despesa of despesas) {
      await pool.query(`
        INSERT INTO "Despesa" 
          ("Despesa_Descricao", "Despesa_Valor", "Despesa_Data", "Despesa_DtVencimento",
           "Despesa_Tipo", "Despesa_Pago", "Conta_id", "Usuario_Id", "Despesa_Ativo")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        despesa.descricao, despesa.valor, despesa.data, despesa.dataVencimento,
        despesa.tipo, despesa.pago, contaId, userId, true
      ]);
    }
    console.log(`✅ ${despesas.length} despesas criadas\n`);
    
    console.log('✅ Dados de teste criados com sucesso!\n');
    console.log('📋 Resumo:');
    console.log(`   - Usuário ID: ${userId}`);
    console.log(`   - Email: teste@finflow.com`);
    console.log(`   - Senha: 123456`);
    console.log(`   - 1 conta criada`);
    console.log(`   - ${receitas.length} receitas criadas`);
    console.log(`   - ${despesas.length} despesas criadas\n`);
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
    if (err.detail) {
      console.error('   Detalhes:', err.detail);
    }
  } finally {
    await pool.end();
  }
}

criarUsuarioTeste().catch(console.error);

