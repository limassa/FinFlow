import React from 'react';
import '../App.css';

/**
 * Confirmação simples de exclusão: Sim / Não.
 */
export default function ConfirmacaoExclusao({ mensagem, onSim, onCancelar }) {
  return (
    <div className="modal-overlay-confirm" onClick={onCancelar}>
      <div className="modal-confirm-content" onClick={(e) => e.stopPropagation()}>
        <p className="modal-confirm-mensagem">{mensagem}</p>
        <div className="modal-confirm-botoes modal-confirm-botoes--simples">
          <button type="button" className="btn-confirm-sim" onClick={onSim}>
            Sim
          </button>
          <button type="button" className="btn-confirm-cancelar" onClick={onCancelar}>
            Não
          </button>
        </div>
      </div>
    </div>
  );
}
