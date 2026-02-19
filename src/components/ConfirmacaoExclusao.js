import React from 'react';
import '../App.css';

/**
 * Modal de confirmação com 3 opções para exclusão de itens recorrentes
 * SIM = Somente em aberto (não pagos/não recebidos)
 * Todas = Todas do grupo
 * Cancelar = Retorna sem excluir
 */
export default function ConfirmacaoExclusao({ mensagem, onSim, onTodas, onCancelar }) {
  return (
    <div className="modal-overlay-confirm" onClick={onCancelar}>
      <div className="modal-confirm-content" onClick={e => e.stopPropagation()}>
        <p className="modal-confirm-mensagem">{mensagem}</p>
        <div className="modal-confirm-botoes">
          <button type="button" className="btn-confirm-sim" onClick={onSim}>
            SIM (Somente em aberto)
          </button>
          <button type="button" className="btn-confirm-todas" onClick={onTodas}>
            Todas (do grupo)
          </button>
          <button type="button" className="btn-confirm-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
