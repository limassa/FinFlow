import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { BANCOS, getBancoById } from '../utils/banks';
import BankLogo from './BankLogo';
import '../App.css';

/**
 * Seletor de banco com logo (fallback: iniciais)
 */
function BankSelector({ value, onChange, placeholder = 'Selecione o banco', required = false }) {
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

  const selectedBanco = value ? getBancoById(value) : null;

  return (
    <div className="bank-selector-wrap" ref={ref}>
      <button
        type="button"
        className={`bank-selector-trigger ${open ? 'open' : ''} ${required && !value ? 'required' : ''}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="bank-selector-value">
          {selectedBanco ? <BankLogo banco={selectedBanco} size={28} /> : null}
          {selectedBanco ? selectedBanco.nome : placeholder}
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
          {BANCOS.map((banco) => (
            <li
              key={banco.id}
              className={`bank-selector-option ${value === banco.id ? 'selected' : ''}`}
              onClick={() => { onChange(banco.id); setOpen(false); }}
            >
              <BankLogo banco={banco} size={28} />
              {banco.nome}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BankSelector;
