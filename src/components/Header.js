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
              <linearGradient id="finflowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#667eea', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#764ba2', stopOpacity: 1}} />
              </linearGradient>
            </defs>
          
            <circle cx="20" cy="20" r="18" fill="url(#finflowGradient)" stroke="none"/>
            
            {/* Símbolo de fluxo financeiro */}
            <path d="M12 15 L20 12 L28 15 L20 18 Z" fill="white" opacity="0.9"/>
            <path d="M12 20 L20 17 L28 20 L20 23 Z" fill="white" opacity="0.7"/>
            <path d="M12 25 L20 22 L28 25 L20 28 Z" fill="white" opacity="0.5"/>
            
            {/* Símbolo de dinheiro */}
            <text x="20" y="18" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">$</text>
          </svg>
          
          <div className="logo-text">
            <h1 className="app-title">FinFlow</h1>
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