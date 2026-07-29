import React, { useMemo } from 'react';
import '../App.css';
import { getUsuarioLogado } from '../functions/auth';
import UserMenu from './UserMenu';
import NotificationCenter from './NotificationCenter';

function extrairPrimeiroNome(usuario) {
  const nome = usuario?.nome || usuario?.usuario_nome || '';
  const primeiro = String(nome).trim().split(/\s+/)[0] || '';
  if (!primeiro) return '';
  return primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase();
}

function saudacaoPorHorario() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function Header() {
  const usuario = getUsuarioLogado();
  const saudacao = useMemo(() => {
    const base = saudacaoPorHorario();
    const primeiroNome = extrairPrimeiroNome(usuario);
    return primeiroNome ? `${base}, ${primeiroNome}` : base;
  }, [usuario]);

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-container logo-container--compact">
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-label="Claricash">
            <defs>
              <linearGradient id="claricashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#4F46E5', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#2563EB', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="18" fill="url(#claricashGradient)" stroke="none"/>
            <path d="M12 15 L20 12 L28 15 L20 18 Z" fill="white" opacity="0.9"/>
            <path d="M12 20 L20 17 L28 20 L20 23 Z" fill="white" opacity="0.7"/>
            <path d="M12 25 L20 22 L28 25 L20 28 Z" fill="white" opacity="0.5"/>
            <text x="20" y="18" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">$</text>
          </svg>
          <p className="header-greeting">{saudacao}</p>
        </div>
        <div className="user-info">
          <NotificationCenter />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

export default Header;
