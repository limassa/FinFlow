import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { getBancoById } from '../utils/banks';
import BankLogo from './BankLogo';
import '../App.css';

/**
 * Seletor de conta com logo do banco + nome da conta
 */
function AccountSelector({ value, onChange, contas = [], placeholder = 'Selecione uma conta', required = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedConta = contas.find(c => String(c.conta_id || c.Conta_Id) === String(value));
  const banco = selectedConta ? getBancoById(selectedConta.conta_banco || selectedConta.Conta_Banco) : null;

  return (
    <div className="bank-selector-wrap account-selector-wrap" ref={ref}>
      <button
        type="button"
        className={`bank-selector-trigger account-selector-trigger ${open ? 'open' : ''} ${required && !value ? 'required' : ''}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="bank-selector-value">
          {selectedConta && banco ? <BankLogo banco={banco} size={28} /> : null}
          {selectedConta ? (selectedConta.conta_nome || selectedConta.Conta_Nome) : placeholder}
        </span>
        <FaChevronDown className="bank-selector-chevron" />
      </button>
      {open && (
        <ul className="bank-selector-dropdown">
          {!required && (
            <li
              className={`bank-selector-option ${!value ? 'selected' : ''}`}
              onClick={() => { onChange(''); setOpen(false); }}
            >
              {placeholder}
            </li>
          )}
          {contas.map((conta) => {
            const b = getBancoById(conta.conta_banco || conta.Conta_Banco);
            const id = conta.conta_id || conta.Conta_Id;
            return (
              <li
                key={id}
                className={`bank-selector-option ${String(value) === String(id) ? 'selected' : ''}`}
                onClick={() => { onChange(id); setOpen(false); }}
              >
                <BankLogo banco={b} size={28} />
                {conta.conta_nome || conta.Conta_Nome}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AccountSelector;
