import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import '../App.css';

const FEATURES = [
  'Registrar receitas e despesas.',
  'Gerenciar contas bancárias.',
  'Controlar cartões de crédito.',
  'Acompanhar contas a pagar e receber.',
  'Visualizar gráficos e relatórios.',
  'Criar orçamentos e metas financeiras.',
  'Utilizar calculadoras financeiras.',
  'Receber lembretes para não esquecer vencimentos.',
];

function Sobre() {
  const navigate = useNavigate();

  return (
    <div className="configuracoes-container" style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <button onClick={() => navigate(-1)} className="btn-voltar-config">
        <FaArrowLeft /> Voltar
      </button>
      <div className="config-section">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <FaInfoCircle /> Sobre o ClariCash
        </h2>

        <p style={{ lineHeight: 1.7, color: '#333', marginBottom: 14 }}>
          O ClariCash foi criado para ajudar pessoas e pequenos empreendedores a entender melhor sua vida financeira de forma simples, intuitiva e segura.
        </p>
        <p style={{ lineHeight: 1.7, color: '#333', marginBottom: 14 }}>
          Nossa missão é ajudar você a organizar sua vida financeira para tomar melhores decisões, economizar mais e conquistar seus objetivos.
        </p>
        <p style={{ lineHeight: 1.7, color: '#333', marginBottom: 14 }}>
          Não importa se você deseja controlar os gastos do dia a dia, organizar as contas da família ou administrar as finanças do seu negócio: o ClariCash foi desenvolvido para acompanhar você nessa jornada.
        </p>

        <h3 style={{ marginTop: 28, marginBottom: 10 }}>O que você pode fazer com o ClariCash</h3>
        <ul style={{ lineHeight: 1.9, color: '#444', paddingLeft: 20 }}>
          {FEATURES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 style={{ marginTop: 28, marginBottom: 10 }}>Nosso compromisso</h3>
        <p style={{ lineHeight: 1.7, color: '#333', marginBottom: 14 }}>
          Na Liz Software acreditamos que a tecnologia deve simplificar a vida das pessoas.
        </p>
        <p style={{ lineHeight: 1.7, color: '#333', marginBottom: 14 }}>
          Por isso desenvolvemos aplicativos intuitivos, seguros e em constante evolução, sempre ouvindo nossos usuários para oferecer a melhor experiência possível.
        </p>

        <h3 style={{ marginTop: 28, marginBottom: 10 }}>Nosso propósito</h3>
        <p style={{ lineHeight: 1.7, color: '#333', marginBottom: 14 }}>
          Acreditamos que organizar as finanças é o primeiro passo para conquistar sonhos.
        </p>

        <h3 style={{ marginTop: 28, marginBottom: 8 }}>Desenvolvido por</h3>
        <p style={{ lineHeight: 1.7, color: '#333', marginBottom: 8 }}>
          <strong>Liz Software</strong>
        </p>
        <p style={{ lineHeight: 1.7, color: '#333' }}>
          Desenvolvemos soluções digitais que ajudam pessoas e empresas a organizar melhor suas finanças, seus negócios e sua rotina.
        </p>

        <p style={{ marginTop: 28, fontSize: 14, color: '#666' }}>
          © {new Date().getFullYear()} Liz Software. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

export default Sobre;
