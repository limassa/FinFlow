import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { getIconForTipo, getIconComponentByName } from '../utils/categoryIcons';
import '../App.css';

/**
 * Select customizado com ícones nas opções.
 * @param {string[]} options - Lista de opções (ex: tiposDespesa, tiposReceita, tiposConta)
 * @param {string} value - Valor selecionado
 * @param {function} onChange - (value) => void
 * @param {string} categoria - 'conta' | 'despesa' | 'receita'
 * @param {string} placeholder - Texto quando nada selecionado
 * @param {boolean} required - Campo obrigatório
 * @param {Object} customIcons - Mapa de ícones customizados { nomeCat: 'FaIcon', ... }
 */
function SelectWithIcons({ options = [], value, onChange, categoria = 'despesa', placeholder = 'Selecione', required = false, customIcons = {} }) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calcular se deve abrir para cima ou para baixo
  const handleOpen = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = Math.min(options.length * 42 + 10, 250);
      
      // Se não houver espaço embaixo mas houver em cima, abre para cima
      setOpenUp(spaceBelow < dropdownHeight && spaceAbove > dropdownHeight);
    }
    setOpen(!open);
  };

  const getIcon = (tipo) => {
    if (customIcons[tipo]) {
      return getIconComponentByName(customIcons[tipo]);
    }
    return getIconForTipo(tipo, categoria);
  };

  const selectedLabel = value || placeholder;
  const IconSelected = value ? getIcon(value) : null;

  return (
    <div className="select-with-icons-wrap" ref={ref}>
      <button
        type="button"
        className={`select-with-icons-trigger ${open ? 'open' : ''} ${required && !value ? 'required' : ''}`}
        onClick={handleOpen}
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
        <ul 
          className={`select-with-icons-dropdown ${openUp ? 'open-up' : ''}`} 
          role="listbox"
          ref={dropdownRef}
        >
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
            const Icon = getIcon(opt);
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
