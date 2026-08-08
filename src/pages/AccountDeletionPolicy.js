import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaUserSlash } from 'react-icons/fa';
import '../App.css';
import './PrivacyPolicy.css';

function AccountDeletionPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleVoltar = () => {
    if (window.history.length > 2) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        <div className="privacy-header">
          <button type="button" onClick={handleVoltar} className="privacy-back-button">
            <FaArrowLeft /> Voltar
          </button>
          <div className="privacy-title-section">
            <FaUserSlash className="privacy-icon" />
            <h1>Política de Exclusão de Conta e Dados</h1>
            <p className="privacy-subtitle">Claricash – Liz Software</p>
          </div>
        </div>

        <div className="privacy-body">
          <div className="privacy-section">
            <div className="privacy-last-updated">
              <strong>Última atualização:</strong> Agosto de 2026
            </div>

            <div className="privacy-section-item">
              <h2>1. Objetivo</h2>
              <p>
                Esta Política explica como o usuário pode solicitar a exclusão de sua conta do
                Claricash e o que acontece com seus dados após a solicitação.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>2. Como excluir minha conta?</h2>
              <p>O usuário poderá solicitar a exclusão da conta diretamente pelo Claricash.</p>
              <p>A opção está disponível em:</p>
              <p>
                <strong>Configurações → Privacidade → Excluir Conta</strong>
              </p>
              <p>
                Antes da confirmação, o Claricash deverá apresentar uma mensagem informando que a
                exclusão poderá remover os dados associados à conta.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>3. O que acontece quando excluo minha conta?</h2>
              <p>Após a confirmação da exclusão:</p>
              <ul>
                <li>a conta será desativada;</li>
                <li>o usuário perderá o acesso à conta;</li>
                <li>
                  os dados financeiros associados à conta serão excluídos dos sistemas ativos,
                  conforme o processo de eliminação adotado pelo Claricash;
                </li>
                <li>
                  dados pessoais associados à conta serão eliminados ou anonimizados quando
                  aplicável.
                </li>
              </ul>
            </div>

            <div className="privacy-section-item">
              <h2>4. Dados financeiros</h2>
              <p>Podem ser excluídos dados como:</p>
              <ul>
                <li>receitas;</li>
                <li>despesas;</li>
                <li>contas;</li>
                <li>cartões;</li>
                <li>categorias;</li>
                <li>orçamentos;</li>
                <li>metas;</li>
                <li>registros financeiros;</li>
                <li>relatórios associados à conta.</li>
              </ul>
              <p>
                Após a conclusão da exclusão, esses dados não deverão permanecer disponíveis para o
                usuário.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>5. Dados que podem precisar ser mantidos</h2>
              <p>
                A exclusão da conta não significa necessariamente que absolutamente todas as
                informações poderão ser eliminadas imediatamente.
              </p>
              <p>
                Determinados dados poderão ser conservados quando houver necessidade ou obrigação
                legal, para:
              </p>
              <ul>
                <li>cumprimento de obrigação legal ou regulatória;</li>
                <li>exercício regular de direitos;</li>
                <li>prevenção e investigação de fraudes;</li>
                <li>cumprimento de determinações judiciais;</li>
                <li>outras hipóteses permitidas pela legislação.</li>
              </ul>
              <p>
                A conservação será limitada ao necessário para a finalidade correspondente.
              </p>
              <p>
                A própria ANPD esclarece que o direito de exclusão possui exceções e que
                determinados dados podem precisar ser conservados por obrigação legal.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>6. Backups</h2>
              <p>
                Cópias de segurança poderão permanecer temporariamente em sistemas de backup após a
                exclusão da conta, conforme o ciclo técnico de retenção adotado pela Liz Software.
              </p>
              <p>
                Essas cópias não deverão ser utilizadas para reativar ou continuar tratando os dados
                do usuário, salvo quando necessário para segurança, recuperação de sistemas ou
                cumprimento de obrigação legal.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>7. Exclusão é permanente</h2>
              <p>
                Depois que o processo de exclusão for concluído, a conta não poderá ser recuperada.
              </p>
              <p>
                Caso o usuário queira utilizar novamente o Claricash, poderá ser necessário criar
                uma nova conta.
              </p>
              <p>Os dados financeiros anteriormente cadastrados não serão recuperados.</p>
            </div>

            <div className="privacy-section-item">
              <h2>8. Solicitação por atendimento</h2>
              <p>
                Caso o usuário não consiga utilizar a opção de exclusão disponível no aplicativo ou
                site, poderá solicitar auxílio pelo canal:
              </p>
              <p>
                <a href="mailto:contatolizsoftware@gmail.com">contatolizsoftware@gmail.com</a>
              </p>
              <p>
                A Liz Software poderá solicitar informações necessárias para confirmar a identidade
                do solicitante antes de realizar procedimentos relacionados aos dados.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>9. Direitos do usuário</h2>
              <p>
                O usuário possui os direitos previstos na legislação aplicável de proteção de dados
                pessoais.
              </p>
              <p>
                Entre eles estão direitos relacionados a acesso, correção, eliminação,
                portabilidade, informações sobre tratamento e revogação de consentimento, quando
                aplicável. Veja também a{' '}
                <Link to="/privacy-policy">Política de Privacidade</Link>.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>10. Atualizações</h2>
              <p>
                Esta Política poderá ser atualizada para refletir alterações no Claricash, na
                infraestrutura utilizada ou na legislação aplicável.
              </p>
              <p>A versão mais recente ficará disponível no site e/ou aplicativo.</p>
            </div>

            <div className="privacy-section-item">
              <h2>11. Contato</h2>
              <div className="privacy-contact-info">
                <p>
                  <strong>Liz Software</strong>
                </p>
                <p>
                  <strong>E-mail:</strong>{' '}
                  <a href="mailto:contatolizsoftware@gmail.com">contatolizsoftware@gmail.com</a>
                </p>
                <p>
                  <strong>Site:</strong>{' '}
                  <a href="https://claricash.com.br">claricash.com.br</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountDeletionPolicy;
