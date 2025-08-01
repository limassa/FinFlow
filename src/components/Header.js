import React from 'react';
import '../App.css';
import { getUsuarioLogado } from '../functions/auth';
import UserMenu from './UserMenu'; 

function Header() {
  const usuario = getUsuarioLogado();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-container">
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pdvGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#4a67af', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#2d199c', stopOpacity: 1}} />
              </linearGradient>
            </defs>
          
            <circle cx="20" cy="20" r="18" fill="url(#pdvGradient)" stroke="none"/>
            
            <!-- Ícone de PDV/Caixa Registradora -->
            <rect x="12" y="12" width="16" height="12" rx="2" fill="white" opacity="0.9"/>
            <rect x="14" y="14" width="12" height="8" rx="1" fill="none" stroke="white" strokeWidth="1" opacity="0.7"/>
            
            <!-- Display do PDV -->
            <rect x="15" y="16" width="10" height="4" fill="white" opacity="0.8"/>
            
            <!-- Teclas do PDV -->
            <circle cx="17" cy="22" r="1" fill="white" opacity="0.6"/>
            <circle cx="20" cy="22" r="1" fill="white" opacity="0.6"/>
            <circle cx="23" cy="22" r="1" fill="white" opacity="0.6"/>
            
            <!-- Símbolo de dinheiro -->
            <text x="20" y="18" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">$</text>
          </svg>
          
          <div className="logo-text">
            <h1 className="app-title">Sistema PDV</h1>
            <span className="company-name">Liz Softwares</span>
          </div>
        </div>
        <div className="user-info">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

export default Header; 