import React from 'react';
import '../App.css';

function AuthBanner({ children, title, subtitle }) {
  return (
    <div className="auth-container">
      <div className="auth-banner">
        <div className="banner-left">
          <div className="banner-logo">
            <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bannerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#4a67af', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#2d199c', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              
              <circle cx="40" cy="40" r="36" fill="url(#bannerGradient)" stroke="none"/>
              
              <path d="M 16 30 L 40 16 L 64 30 L 40 44 Z" fill="white" opacity="0.9"/>
              <path d="M 16 50 L 40 64 L 64 50 L 40 36 Z" fill="white" opacity="0.7"/>
              
              <path d="M 40 16 L 40 64" stroke="white" strokeWidth="4" fill="none" opacity="0.8"/>
            </svg>
          </div>
          
          <div className="banner-content">
            <h1 className="banner-title">FinFlow</h1>
            <h2 className="banner-subtitle">Controle Financeiro Simplificado</h2>
            <p className="banner-description">
              {title === "Fale Conosco" 
                ? "Sua opinião é muito importante para nós. Entre em contato e ajude-nos a melhorar o FinFlow."
                : "Gerencie suas receitas e despesas de forma inteligente e eficiente. Tenha controle total sobre suas finanças pessoais."
              }
            </p>
            
            <div className="banner-features">
              {title === "Fale Conosco" ? (
                <>
                  <div className="feature-item">
                    <span className="feature-icon">💬</span>
                    <span>Sugestões</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">❓</span>
                    <span>Dúvidas</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🐛</span>
                    <span>Reportar Problemas</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="feature-item">
                    <span className="feature-icon">💰</span>
                    <span>Controle de Receitas</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💸</span>
                    <span>Gestão de Despesas</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📊</span>
                    <span>Relatórios Detalhados</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="banner-company">
              <span>Desenvolvido por</span>
              <strong>Liz Softwares</strong>
            </div>
          </div>
        </div>
        
        <div className="banner-right">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h3>{title}</h3>
              <p>{subtitle}</p>
            </div>
            
            <div className="auth-form-content">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthBanner; 