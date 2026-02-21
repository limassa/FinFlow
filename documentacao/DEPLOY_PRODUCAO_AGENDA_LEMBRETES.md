# Deploy para Produção - Agenda e Lembretes de Eventos

## Resumo das alterações

### 1. Lembretes de Eventos
- **Web**: Pop-up no sistema a cada 60 segundos quando houver evento com lembrete no horário (sem email/WhatsApp)
- **Mobile**: Notificação local no aparelho (expo-notifications) - sem consumo de créditos

### 2. Nova tela Agenda (Web e Mobile)
- Visualização tipo Kanban da semana
- Horários 00:00 - 23:30 em intervalos de 30 min
- Clique em slot abre modal para criar evento
- Eventos preenchem o slot quando único; dividem espaço quando múltiplos

### 3. Tabelas necessárias
A tabela **evento** já está no script `criar-tabelas-novas-funcionalidades.js`. Se ainda não foi executada em produção:

```bash
cd backend/scripts
node criar-tabelas-novas-funcionalidades.js
```

Configure `config.env` ou variáveis de ambiente para apontar ao banco de produção (DATABASE_PUBLIC_URL ou DATABASE_URL).

**Colunas da tabela evento:**
- evento_id, usuario_id, evento_titulo, evento_descricao, evento_data
- evento_hora_inicio, evento_hora_fim, evento_tipo, evento_cor
- evento_recorrente, evento_frequencia
- **evento_lembrete** (BOOLEAN)
- **evento_lembrete_minutos** (INTEGER)
- receita_id, despesa_id, evento_ativo, evento_criado_em, evento_atualizado_em

### 4. Nova rota API (Backend)
- `GET /api/eventos/lembretes-pendentes?userId=X` - Retorna eventos cujo lembrete deve ser exibido (janela de 2 min antes até 1 min após)

### 5. Layout de Produção
As alterações não modificam o layout principal do sistema. Novos itens:
- **Web**: Menu "Agenda" na sidebar (entre Calendário e Cartões)
- **Mobile**: Menu "Agenda" no drawer (entre Calendário e Contas)

### 6. Checklist de Deploy

1. **Backend**
   - [ ] Rodar `criar-tabelas-novas-funcionalidades.js` se tabela evento não existir
   - [ ] Fazer deploy do backend com a nova rota `/api/eventos/lembretes-pendentes`

2. **Web (Netlify)**
   - [ ] Build e deploy do frontend
   - [ ] Verificar que `API_ENDPOINTS.EVENTOS_LEMBRETES` aponta para o backend de produção

3. **Mobile**
   - [ ] `expo-notifications` já está em package.json
   - [ ] Build do APK/IPA inclui permissão de notificações
   - [ ] Configurar `EXPO_PUBLIC_API_URL` para produção se necessário

4. **Testes**
   - [ ] Criar evento com lembrete (ex: 5 min antes)
   - [ ] Web: Aguardar ~60s e verificar pop-up
   - [ ] Mobile: Verificar notificação local no horário do lembrete
   - [ ] Agenda: Verificar visualização kanban e criação de eventos

### 7. Observações
- Lembretes de **vencimentos** (despesas) continuam usando email/WhatsApp conforme configuração do usuário
- Lembretes de **eventos** usam apenas pop-up (web) e notificação local (mobile)
- O pop-up web faz polling a cada 60 segundos
- O mobile agenda notificações locais ao carregar a tela Agenda (até 10 eventos)
