import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { getIconForTipo } from '../utils/categoryIcons';
import '../App.css';

/**
 * Select customizado com ícones nas opções.
 * @param {string[]} options - Lista de opções (ex: tiposDespesa, tiposReceita, tiposConta)
 * @param {string} value - Valor selecionado
 * @param {function} onChange - (value) => void
 * @param {string} categoria - 'conta' | 'despesa' | 'receita'
 * @param {string} placeholder - Texto quando nada selecionado
 * @param {boolean} required - Campo obrigatório
 */
function SelectWithIcons({ options = [], value, onChange, categoria = 'despesa', placeholder = 'Selecione', required = false }) {
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

  const selectedLabel = value || placeholder;
  const IconSelected = value ? getIconForTipo(value, categoria) : null;

  return (
    <div className="select-with-icons-wrap" ref={ref}>
      <button
        type="button"
        className={`select-with-icons-trigger ${open ? 'open' : ''} ${required && !value ? 'required' : ''}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="select-with-icons-value">
          {IconSelected && <IconSelected className="category-icon" />}
          {selectedLabel}
        </span>
        <FaChevronDown className="select-with-icons-chevron" />
      </button>
      {open && (
        <ul className="select-with-icons-dropdown" role="listbox">
          {!required && (
            <li
              role="option"
              aria-selected={!value}
              className={`select-with-icons-option ${!value ? 'selected' : ''}`}
              onClick={() => { onChange(''); setOpen(false); }}
            >
              {placeholder}
            </li>
          )}
          {options.map((opt) => {
            const Icon = getIconForTipo(opt, categoria);
            return (
              <li
                key={opt}
                role="option"
                aria-selected={value === opt}
                className={`select-with-icons-option ${value === opt ? 'selected' : ''}`}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                <Icon className="category-icon" />
                {opt}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default SelectWithIcons;
