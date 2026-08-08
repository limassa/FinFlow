import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt, FaLock, FaUserShield, FaEnvelope } from 'react-icons/fa';
import '../App.css';
import './PrivacyPolicy.css';

function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleVoltar = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        <div className="privacy-header">
          <button type="button" onClick={handleVoltar} className="privacy-back-button">
            <FaArrowLeft /> Voltar
          </button>
          <div className="privacy-title-section">
            <FaShieldAlt className="privacy-icon" />
            <h1>Política de Privacidade</h1>
            <p className="privacy-subtitle">Claricash - Controle Financeiro Simplificado</p>
          </div>
        </div>

        <div className="privacy-body">
          <div className="privacy-section">
            <div className="privacy-last-updated">
              <strong>Última atualização:</strong> Agosto de 2026
            </div>

            <p className="privacy-intro">
              Esta Política de Privacidade explica como o <strong>Claricash</strong> coleta,
              utiliza, armazena e protege dados pessoais durante a utilização dos serviços.
            </p>

            <div className="privacy-section-item">
              <h2>
                <FaLock /> 1. Informações que Coletamos
              </h2>
              <p>O Claricash coleta apenas as informações necessárias para fornecer nossos serviços:</p>
              <ul>
                <li>
                  <strong>Dados Financeiros:</strong> Informações sobre receitas, despesas, contas,
                  cartões e transações que você insere no aplicativo.
                </li>
                <li>
                  <strong>Dados de Conta:</strong> Nome, endereço de e-mail e, opcionalmente, número
                  de telefone para autenticação e comunicação.
                </li>
                <li>
                  <strong>Dados de Uso:</strong> Informações sobre como você utiliza o aplicativo
                  para melhorar nossos serviços (quando você autorizar).
                </li>
                <li>
                  <strong>Dados do Dispositivo:</strong> Informações técnicas básicas necessárias
                  para o funcionamento do app (sistema operacional, versão do app).
                </li>
              </ul>
            </div>

            <div className="privacy-section-item">
              <h2>
                <FaShieldAlt /> 2. Como Usamos suas Informações
              </h2>
              <p>Utilizamos suas informações para:</p>
              <ul>
                <li>Permitir que você gerencie suas finanças pessoais de forma eficiente.</li>
                <li>Gerar relatórios, gráficos e análises financeiras.</li>
                <li>
                  Enviar lembretes de vencimentos e notificações locais (se configurado por você).
                </li>
                <li>
                  Enviar lembretes por e-mail (somente se você ativar essa funcionalidade).
                </li>
                <li>Melhorar e personalizar sua experiência no aplicativo.</li>
                <li>Prestar suporte técnico quando necessário.</li>
              </ul>
            </div>

            <div className="privacy-section-item">
              <h2>
                <FaLock /> 3. Proteção de Dados
              </h2>
              <p>
                Sua privacidade é nossa prioridade. Implementamos medidas de segurança adequadas
                para proteger suas informações:
              </p>
              <ul>
                <li>
                  <strong>Criptografia em trânsito:</strong> Todos os dados são transmitidos via
                  HTTPS (TLS).
                </li>
                <li>
                  <strong>Controles de acesso:</strong> O acesso aos dados é protegido por
                  mecanismos de autenticação e controles de acesso, sendo limitado às finalidades
                  necessárias para a prestação, manutenção e segurança do serviço.
                </li>
                <li>
                  <strong>Armazenamento Seguro:</strong> Seus dados são armazenados em servidores
                  seguros com backup regular.
                </li>
                <li>
                  <strong>Autenticação:</strong> Utilizamos tokens seguros para manter sua sessão
                  protegida.
                </li>
              </ul>
            </div>

            <div className="privacy-section-item">
              <h2>
                <FaUserShield /> 4. Compartilhamento de Informações
              </h2>
              <p>
                <strong>
                  Não vendemos, alugamos ou compartilhamos suas informações pessoais ou financeiras
                  com terceiros para fins comerciais ou publicitários.
                </strong>
              </p>
              <p>
                Seus dados são privados e confidenciais. Podemos divulgar informações apenas se
                exigido por lei ou ordem judicial, ou para proteger nossos direitos e segurança.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>
                <FaShieldAlt /> 5. Seus Direitos (LGPD)
              </h2>
              <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
              <ul>
                <li>
                  <strong>Acesso:</strong> Solicitar informações sobre os dados que coletamos sobre
                  você.
                </li>
                <li>
                  <strong>Correção:</strong> Atualizar ou corrigir suas informações a qualquer
                  momento.
                </li>
                <li>
                  <strong>Exclusão:</strong> Solicitar a exclusão de sua conta e dados através do
                  aplicativo ou entrando em contato conosco. Consulte também a{' '}
                  <Link to="/account-deletion-policy">Política de Exclusão de Conta e Dados</Link>.
                </li>
                <li>
                  <strong>Portabilidade:</strong> Exportar seus dados financeiros quando desejar.
                </li>
                <li>
                  <strong>Revogação:</strong> Desativar notificações ou alterar preferências de
                  comunicação a qualquer momento.
                </li>
              </ul>
            </div>

            <div className="privacy-section-item">
              <h2>
                <FaShieldAlt /> 6. Cookies e Tecnologias Similares
              </h2>
              <p>
                No aplicativo móvel e no site, utilizamos tecnologias como tokens de sessão e
                armazenamento local para manter sua sessão ativa e melhorar sua experiência. Você
                pode gerenciar notificações e preferências nas configurações do aplicativo ou do
                seu dispositivo.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>
                <FaShieldAlt /> 7. Dados de Menores de Idade
              </h2>
              <p>
                O Claricash não é direcionado a menores de 13 anos. Não coletamos intencionalmente
                informações de crianças. Se você é pai ou responsável e acredita que seu filho
                forneceu informações, entre em contato conosco imediatamente.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>
                <FaShieldAlt /> 8. Alterações nesta Política
              </h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Quando houver
                alterações significativas, notificaremos você através do aplicativo ou por e-mail.
                A data da última atualização está indicada no topo desta página.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>
                <FaEnvelope /> 9. Contato
              </h2>
              <p>
                Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta Política de
                Privacidade ou ao tratamento de seus dados pessoais, entre em contato conosco:
              </p>
              <div className="privacy-contact-info">
                <p>
                  <strong>E-mail:</strong>{' '}
                  <a href="mailto:contatolizsoftware@gmail.com" className="privacy-contact-link">
                    contatolizsoftware@gmail.com
                  </a>
                </p>
                <p>
                  <strong>Desenvolvido por:</strong> Liz Software
                </p>
                <p>
                  <strong>Site:</strong>{' '}
                  <a href="https://claricash.com.br" className="privacy-contact-link">
                    claricash.com.br
                  </a>
                </p>
              </div>
            </div>

            <div className="privacy-footer">
              <p>
                Esta Política de Privacidade explica como o Claricash coleta, utiliza, armazena e
                protege dados pessoais durante a utilização dos serviços.
              </p>
              <p style={{ marginTop: 12 }}>
                Ao criar uma conta, o usuário declara ter lido e concordado com os{' '}
                <Link to="/terms-of-use">Termos de Uso</Link> e com esta Política de Privacidade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
