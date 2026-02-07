import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt, FaLock, FaUserShield, FaEnvelope } from 'react-icons/fa';
import '../App.css';
import './PrivacyPolicy.css';

function PrivacyPolicy() {
  const navigate = useNavigate();

  const handleVoltar = () => {
    navigate(-1);
  };

  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        {/* Header */}
        <div className="privacy-header">
          <button onClick={handleVoltar} className="privacy-back-button">
            <FaArrowLeft /> Voltar
          </button>
          <div className="privacy-title-section">
            <FaShieldAlt className="privacy-icon" />
            <h1>Política de Privacidade</h1>
            <p className="privacy-subtitle">Claricash - Controle Financeiro Simplificado</p>
          </div>
        </div>

        {/* Content */}
        <div className="privacy-body">
          <div className="privacy-section">
            <div className="privacy-last-updated">
              <strong>Última atualização:</strong> Janeiro de 2026
            </div>

            <p className="privacy-intro">
              Esta Política de Privacidade descreve como o <strong>Claricash</strong> coleta, 
              usa e protege suas informações pessoais quando você utiliza nosso aplicativo 
              e serviços.
            </p>

            <div className="privacy-section-item">
              <h2>
                <FaLock /> 1. Informações que Coletamos
              </h2>
              <p>
                O Claricash coleta apenas as informações necessárias para fornecer nossos serviços:
              </p>
              <ul>
                <li>
                  <strong>Dados Financeiros:</strong> Informações sobre receitas, despesas, 
                  contas e transações que você insere no aplicativo.
                </li>
                <li>
                  <strong>Dados de Conta:</strong> Nome, endereço de e-mail e, opcionalmente, 
                  número de telefone para autenticação e comunicação.
                </li>
                <li>
                  <strong>Dados de Uso:</strong> Informações sobre como você utiliza o aplicativo 
                  para melhorar nossos serviços.
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
                <li>Enviar lembretes de vencimentos e notificações (se configurado por você).</li>
                <li>Melhorar e personalizar sua experiência no aplicativo.</li>
                <li>Prestar suporte técnico quando necessário.</li>
              </ul>
            </div>

            <div className="privacy-section-item">
              <h2>
                <FaLock /> 3. Proteção de Dados
              </h2>
              <p>
                Sua privacidade é nossa prioridade. Implementamos medidas de segurança 
                adequadas para proteger suas informações:
              </p>
              <ul>
                <li>
                  <strong>Criptografia:</strong> Todos os dados são transmitidos e armazenados 
                  de forma segura usando criptografia.
                </li>
                <li>
                  <strong>Acesso Restrito:</strong> Apenas você tem acesso aos seus dados 
                  financeiros através de autenticação segura.
                </li>
                <li>
                  <strong>Backup Seguro:</strong> Seus dados são armazenados em servidores 
                  seguros com backup regular.
                </li>
                <li>
                  <strong>Conexões Seguras:</strong> Utilizamos HTTPS para todas as 
                  comunicações entre o aplicativo e nossos servidores.
                </li>
              </ul>
            </div>

            <div className="privacy-section-item">
              <h2>
                <FaUserShield /> 4. Compartilhamento de Informações
              </h2>
              <p>
                <strong>Não compartilhamos suas informações pessoais ou financeiras com terceiros.</strong>
              </p>
              <p>
                Seus dados são privados e confidenciais. Eles não são vendidos, alugados ou 
                compartilhados para fins comerciais ou publicitários.
              </p>
              <p>
                Podemos divulgar informações apenas se exigido por lei ou ordem judicial, 
                ou para proteger nossos direitos e segurança.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>
                <FaShieldAlt /> 5. Seus Direitos
              </h2>
              <p>Você tem direito a:</p>
              <ul>
                <li>
                  <strong>Acesso:</strong> Solicitar informações sobre os dados que coletamos sobre você.
                </li>
                <li>
                  <strong>Correção:</strong> Atualizar ou corrigir suas informações a qualquer momento.
                </li>
                <li>
                  <strong>Exclusão:</strong> Solicitar a exclusão de sua conta e dados através do 
                  aplicativo ou entrando em contato conosco.
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
                Utilizamos tecnologias como cookies para melhorar sua experiência no aplicativo, 
                manter sua sessão ativa e analisar o uso do aplicativo. Você pode gerenciar 
                essas preferências nas configurações do seu dispositivo.
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
                Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta Política 
                de Privacidade ou ao tratamento de seus dados pessoais, entre em contato conosco:
              </p>
              <div className="privacy-contact-info">
                <p>
                  <strong>E-mail:</strong>{' '}
                  <a href="mailto:contatoLizSoftware@gmail.com" className="privacy-contact-link">
                    contatoLizSoftware@gmail.com
                  </a>
                </p>
                <p>
                  <strong>Desenvolvido por:</strong> Liz Softwares
                </p>
              </div>
            </div>

            <div className="privacy-footer">
              <p>
                Ao usar o Claricash, você concorda com os termos desta Política de Privacidade. 
                Se não concordar, por favor, não utilize nossos serviços.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;

