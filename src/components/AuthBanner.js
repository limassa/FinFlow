import React from 'react';
import '../App.css';

// Logo da empresa (mesmo arquivo da home - public/logo_nova.png)
const logoNova = process.env.PUBLIC_URL + '/logo_nova.png';

function AuthBanner({ children, title, subtitle }) {
  return (
    <div className="auth-container">
      <div className="auth-banner">
        <div className="banner-left">
          <div className="banner-logo">
            <img src={logoNova} alt="Claricash" />
          </div>
          
          <div className="banner-content">
            <h1 className="banner-title">Claricash</h1>
            <h2 className="banner-subtitle">Controle Financeiro Simplificado</h2>
            <p className="banner-description">
              {title === "Fale Conosco" 
                ? "Sua opinião é muito importante para nós. Entre em contato e ajude-nos a melhorar o Claricash."
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