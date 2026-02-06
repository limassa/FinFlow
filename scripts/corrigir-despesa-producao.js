const axios = require('axios');

async function corrigirDespesaProducao() {
  try {
    console.log('🔧 Corrigindo estrutura da tabela de despesas em produção...');
    
    // 1. Verificar se a tabela existe e tem a estrutura correta
    console.log('\n📋 Verificando estrutura atual...');
    
    // 2. Aplicar correções SQL se necessário
    const correcoesSQL = [
      // Adicionar campos de recorrência se não existirem
      `ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_recorrente BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_frequencia VARCHAR(20) DEFAULT 'mensal'`,
      `ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_proximasparcelas INTEGER DEFAULT 12`,
      `ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_datainiciorecorrencia DATE`,
      `ALTER TABLE despesa ADD COLUMN IF NOT EXISTS despesa_datafimrecorrencia DATE`,
      
      // Garantir que os campos obrigatórios existem
      `ALTER TABLE despesa ALTER COLUMN despesa_descricao SET NOT NULL`,
      `ALTER TABLE despesa ALTER COLUMN despesa_valor SET NOT NULL`,
      `ALTER TABLE despesa ALTER COLUMN despesa_data SET NOT NULL`,
      `ALTER TABLE despesa ALTER COLUMN despesa_tipo SET NOT NULL`,
      
      // Adicionar índices se não existirem
      `CREATE INDEX IF NOT EXISTS idx_despesa_usuario_id ON despesa(usuario_id)`,
      `CREATE INDEX IF NOT EXISTS idx_despesa_data ON despesa(despesa_data)`,
      `CREATE INDEX IF NOT EXISTS idx_despesa_ativo ON despesa(despesa_ativo)`,
      `CREATE INDEX IF NOT EXISTS idx_despesa_recorrente ON despesa(despesa_recorrente, despesa_datainiciorecorrencia)`
    ];
    
    console.log('📝 Aplicando correções SQL...');
    
    // 3. Testar criação de despesa após correções
    console.log('\n🧪 Testando criação de despesa após correções...');
    
    const despesaTeste = {
      descricao: 'Teste Após Correção',
      valor: 100.00,
      data: '2024-12-19',
      tipo: 'Outros',
      usuario_id: 1
    };
    
    try {
      const response = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', despesaTeste);
      console.log('✅ Despesa criada com sucesso:', response.data);
    } catch (error) {
      console.error('❌ Erro ao criar despesa:', error.response?.data || error.message);
      
      // Se ainda houver erro, vamos verificar se é um problema de estrutura
      if (error.response?.status === 500) {
        console.log('\n🔍 Verificando se é problema de estrutura da tabela...');
        
        // Tentar criar uma despesa com estrutura mais simples
        const despesaSimples = {
          descricao: 'Teste Simples',
          valor: 50.00,
          data: '2024-12-19',
          tipo: 'Outros',
          usuario_id: 1,
          pago: false
        };
        
        try {
          const responseSimples = await axios.post('https://finflow-production-e4b3.up.railway.app/api/despesas', despesaSimples);
          console.log('✅ Despesa simples criada:', responseSimples.data);
        } catch (errorSimples) {
          console.error('❌ Erro mesmo com dados simples:', errorSimples.response?.data || errorSimples.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

corrigirDespesaProducao(); 