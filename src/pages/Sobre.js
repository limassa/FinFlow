import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import '../App.css';

function Sobre() {
  const navigate = useNavigate();

  return (
    <div className="configuracoes-container" style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <button onClick={() => navigate(-1)} className="btn-voltar-config">
        <FaArrowLeft /> Voltar
      </button>
      <div className="config-section">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <FaInfoCircle /> Sobre o Claricash
        </h2>
        <p style={{ lineHeight: 1.6, color: '#333', marginBottom: 16 }}>
          O <strong>Claricash</strong> é um sistema de controle financeiro pessoal para você gerenciar receitas, despesas, contas e ter visão clara das suas finanças.
        </p>
        <h3 style={{ marginTop: 24, marginBottom: 8 }}>Funcionalidades</h3>
        <ul style={{ lineHeight: 1.8, color: '#444', paddingLeft: 20 }}>
          <li>Controle de receitas e despesas</li>
          <li>Gestão de contas bancárias</li>
          <li>Calendário de vencimentos</li>
          <li>Relatórios e gráficos</li>
          <li>Calculadoras financeiras</li>
          <li>Lembretes por e-mail</li>
        </ul>
        <h3 style={{ marginTop: 24, marginBottom: 8 }}>Desenvolvido por</h3>
        <p style={{ lineHeight: 1.6, color: '#333' }}>
          <strong>Liz Software</strong> – soluções em software para sua empresa.
        </p>
        <p style={{ marginTop: 24, fontSize: 14, color: '#666' }}>
          © {new Date().getFullYear()} Liz Software. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

export default Sobre;
