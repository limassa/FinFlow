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
                <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#4a67af', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#2d199c', stopOpacity: 1}} />
                </linearGradient>
              </defs>
            
            <circle cx="20" cy="20" r="18" fill="url(#headerGradient)" stroke="none"/>
            
            <path d="M 8 15 L 20 8 L 32 15 L 20 22 Z" fill="white" opacity="0.9"/>
            <path d="M 8 25 L 20 32 L 32 25 L 20 18 Z" fill="white" opacity="0.7"/>
            
            <path d="M 20 8 L 20 32" stroke="white" strokeWidth="2" fill="none" opacity="0.8"/>
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