import React from 'react';
import '../App.css';

/**
 * Modal para confirmar se deve replicar alterações para itens recorrentes não pagos
 */
export default function ConfirmacaoEdicaoRecorrente({ mensagem, onSim, onNao, onCancelar = () => {} }) {
  return (
    <div className="modal-overlay-confirm" onClick={onCancelar}>
      <div className="modal-confirm-content" onClick={e => e.stopPropagation()}>
        <p className="modal-confirm-mensagem">{mensagem}</p>
        <div className="modal-confirm-botoes">
          <button type="button" className="btn-confirm-sim" onClick={onSim}>
            Sim, replicar para não pagos
          </button>
          <button type="button" className="btn-confirm-todas btn-confirm-apenas" onClick={onNao}>
            Não, apenas este item
          </button>
          <button type="button" className="btn-confirm-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
