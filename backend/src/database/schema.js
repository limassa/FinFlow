/**
 * Padrão de nomenclatura do banco de dados
 * 
 * Este projeto utiliza PascalCase para tabelas e colunas.
 * Exemplo: "Usuario", "Despesa", "Receita", "Conta"
 * 
 * Em PostgreSQL, identificadores entre aspas duplas são case-sensitive.
 * Use sempre: SELECT * FROM "Usuario" (não FROM usuario)
 */

module.exports = {
  TABLES: {
    USUARIO: '"Usuario"',
    DESPESA: '"Despesa"',
    RECEITA: '"Receita"',
    CONTA: '"Conta"',
    ORCAMENTO_MENSAL: '"Orcamento_Mensal"'
  },
  // Colunas principais (para referência)
  COLS: {
    USUARIO: ['"Usuario_Id"', '"Usuario_Email"', '"Usuario_Nome"', '"Usuario_Senha"', '"Usuario_Ativo"'],
    DESPESA: ['"Despesa_Id"', '"Despesa_Descricao"', '"Despesa_Valor"', '"Despesa_Data"', '"Despesa_DtVencimento"', '"Despesa_Tipo"', '"Despesa_Pago"', '"Usuario_Id"', '"Despesa_Ativo"'],
    RECEITA: ['"Receita_Id"', '"Receita_Descricao"', '"Receita_Valor"', '"Receita_Data"', '"Receita_Tipo"', '"Receita_Recebido"', '"Usuario_Id"', '"Receita_Ativo"'],
    CONTA: ['"Conta_Id"', '"Conta_Nome"', '"Conta_Tipo"', '"Usuario_Id"', '"Conta_Ativo"'],
    ORCAMENTO: ['"Orcamento_Id"', '"Usuario_Id"', '"Orcamento_Categoria"', '"Orcamento_Valor"', '"Orcamento_Mes"', '"Orcamento_Ativo"']
  }
};
