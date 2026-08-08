import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaFileContract } from 'react-icons/fa';
import '../App.css';
import './PrivacyPolicy.css';

function TermsOfUse() {
  const navigate = useNavigate();

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
            <FaFileContract className="privacy-icon" />
            <h1>Termos de Uso do Claricash</h1>
            <p className="privacy-subtitle">Liz Software</p>
          </div>
        </div>

        <div className="privacy-body">
          <div className="privacy-section">
            <div className="privacy-last-updated">
              <strong>Última atualização:</strong> Agosto de 2026
            </div>

            <div className="privacy-section-item">
              <h2>1. Sobre o Claricash</h2>
              <p>
                O Claricash é uma plataforma de controle e organização financeira desenvolvida pela
                Liz Software.
              </p>
              <p>
                O serviço foi criado para ajudar pessoas a registrar, organizar e acompanhar suas
                informações financeiras de maneira simples, prática e intuitiva.
              </p>
              <p>Entre os recursos disponibilizados podem estar:</p>
              <ul>
                <li>cadastro de receitas e despesas;</li>
                <li>gerenciamento de contas;</li>
                <li>controle de cartões de crédito;</li>
                <li>acompanhamento de contas a pagar e receber;</li>
                <li>categorias financeiras;</li>
                <li>orçamentos e metas;</li>
                <li>calendários e agendas;</li>
                <li>relatórios e gráficos;</li>
                <li>calculadoras financeiras;</li>
                <li>notificações e lembretes;</li>
                <li>outras funcionalidades disponibilizadas pela plataforma.</li>
              </ul>
              <p>
                Os recursos podem ser modificados, aprimorados ou descontinuados ao longo do
                desenvolvimento do Claricash.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>2. Aceitação dos Termos</h2>
              <p>
                Ao criar uma conta ou utilizar o Claricash, o usuário declara que leu e concorda com
                estes Termos de Uso e com a <Link to="/privacy-policy">Política de Privacidade</Link>.
              </p>
              <p>
                Caso não concorde com estes termos, o usuário deverá interromper a utilização do
                serviço.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>3. Cadastro e conta do usuário</h2>
              <p>
                Para utilizar determinadas funcionalidades do Claricash, poderá ser necessário criar
                uma conta.
              </p>
              <p>O usuário é responsável por:</p>
              <ul>
                <li>fornecer informações verdadeiras e atualizadas;</li>
                <li>manter seus dados cadastrais atualizados;</li>
                <li>proteger sua senha;</li>
                <li>não compartilhar suas credenciais de acesso;</li>
                <li>comunicar qualquer suspeita de acesso não autorizado.</li>
              </ul>
              <p>
                O usuário é responsável pelas atividades realizadas utilizando sua conta.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>4. Informações financeiras</h2>
              <p>O Claricash permite que o usuário registre informações financeiras, como:</p>
              <ul>
                <li>receitas;</li>
                <li>despesas;</li>
                <li>contas;</li>
                <li>cartões;</li>
                <li>categorias;</li>
                <li>valores;</li>
                <li>datas;</li>
                <li>metas;</li>
                <li>orçamentos;</li>
                <li>outras informações relacionadas à organização financeira.</li>
              </ul>
              <p>Essas informações são fornecidas pelo próprio usuário.</p>
              <p>
                O Claricash não garante que os dados inseridos estejam corretos e não se
                responsabiliza por erros decorrentes de informações cadastradas incorretamente pelo
                usuário.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>5. O Claricash não é consultoria financeira</h2>
              <p>
                O Claricash é uma ferramenta de organização e acompanhamento financeiro.
              </p>
              <p>
                Informações, gráficos, indicadores, dicas, insights e cálculos apresentados pela
                plataforma possuem finalidade informativa e de organização.
              </p>
              <p>
                O Claricash não presta consultoria financeira, contábil, jurídica ou de
                investimentos.
              </p>
              <p>Decisões financeiras tomadas pelo usuário são de sua responsabilidade.</p>
            </div>

            <div className="privacy-section-item">
              <h2>6. Notificações e lembretes</h2>
              <p>
                O Claricash poderá oferecer notificações no aplicativo, no dispositivo móvel e/ou
                por e-mail, conforme os recursos disponíveis e as preferências configuradas pelo
                usuário.
              </p>
              <p>O usuário poderá configurar determinadas preferências de notificação.</p>
              <p>
                A entrega de uma notificação pode depender de fatores externos, incluindo conexão
                com a internet, configurações do dispositivo, sistemas operacionais, provedores de
                e-mail e outros serviços de terceiros.
              </p>
              <p>
                Por esse motivo, uma notificação não deve ser considerada como garantia de que o
                usuário será avisado sobre determinado vencimento.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>7. Disponibilidade do serviço</h2>
              <p>
                A Liz Software busca manter o Claricash disponível e funcionando corretamente.
              </p>
              <p>Entretanto, o serviço poderá ficar temporariamente indisponível em razão de:</p>
              <ul>
                <li>manutenção;</li>
                <li>atualizações;</li>
                <li>falhas técnicas;</li>
                <li>problemas de infraestrutura;</li>
                <li>indisponibilidade de serviços de terceiros;</li>
                <li>problemas de conexão;</li>
                <li>eventos fora do controle da Liz Software.</li>
              </ul>
              <p>
                Sempre que possível, serão adotadas medidas para reduzir impactos ao usuário.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>8. Segurança</h2>
              <p>
                A Liz Software adota medidas técnicas e administrativas destinadas a proteger os
                dados dos usuários contra acessos não autorizados, perda, alteração ou divulgação
                indevida.
              </p>
              <p>
                Entretanto, nenhum sistema conectado à internet pode garantir segurança absoluta.
              </p>
              <p>
                O usuário também deve adotar medidas de segurança, especialmente mantendo sua senha
                protegida e utilizando dispositivos confiáveis.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>9. Privacidade e proteção de dados</h2>
              <p>
                O tratamento de dados pessoais realizado pelo Claricash está descrito na sua{' '}
                <Link to="/privacy-policy">Política de Privacidade</Link>.
              </p>
              <p>O usuário poderá consultar a Política de Privacidade a qualquer momento.</p>
              <p>
                A Liz Software respeita os direitos dos titulares previstos na legislação aplicável,
                incluindo a LGPD.
              </p>
              <p>
                A ANPD reconhece, entre outros, direitos de acesso, correção, eliminação,
                portabilidade e informações sobre o tratamento de dados pessoais.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>10. Exclusão da conta</h2>
              <p>
                O usuário poderá solicitar a exclusão de sua conta por meio da funcionalidade
                disponibilizada no Claricash ou pelos canais de atendimento.
              </p>
              <p>
                A exclusão será realizada de acordo com a{' '}
                <Link to="/account-deletion-policy">Política de Exclusão de Conta e Dados</Link>.
              </p>
              <p>
                Determinadas informações poderão ser mantidas quando houver obrigação legal,
                necessidade de cumprimento de obrigação, exercício regular de direitos ou outra
                hipótese permitida pela legislação.
              </p>
              <p>
                A LGPD prevê hipóteses em que determinados dados podem precisar ser conservados
                mesmo diante de um pedido de eliminação.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>11. Propriedade intelectual</h2>
              <p>
                O Claricash, sua identidade visual, marca, código, interfaces, textos, elementos
                gráficos, funcionalidades e demais componentes pertencem à Liz Software ou são
                utilizados mediante autorização/licença.
              </p>
              <p>
                É proibida a reprodução, cópia, modificação, distribuição ou exploração não
                autorizada do serviço ou de seus componentes.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>12. Uso proibido</h2>
              <p>O usuário não poderá utilizar o Claricash para:</p>
              <ul>
                <li>praticar atividades ilícitas;</li>
                <li>tentar obter acesso não autorizado ao sistema;</li>
                <li>comprometer a segurança da plataforma;</li>
                <li>distribuir código malicioso;</li>
                <li>tentar interferir no funcionamento do serviço;</li>
                <li>utilizar a plataforma para finalidade fraudulenta;</li>
                <li>violar direitos de terceiros.</li>
              </ul>
            </div>

            <div className="privacy-section-item">
              <h2>13. Alterações no serviço</h2>
              <p>
                A Liz Software poderá alterar, atualizar ou aprimorar funcionalidades do Claricash.
              </p>
              <p>
                Quando houver alterações relevantes nestes Termos de Uso, a nova versão poderá ser
                disponibilizada no aplicativo, site ou por outros meios adequados.
              </p>
              <p>A data da última atualização será indicada no documento.</p>
            </div>

            <div className="privacy-section-item">
              <h2>14. Alterações nos Termos</h2>
              <p>
                Estes Termos poderão ser atualizados para refletir alterações legais, técnicas,
                comerciais ou funcionais.
              </p>
              <p>Quando necessário, o usuário será informado sobre alterações relevantes.</p>
            </div>

            <div className="privacy-section-item">
              <h2>15. Encerramento da conta</h2>
              <p>A conta poderá ser encerrada pelo próprio usuário.</p>
              <p>
                A Liz Software também poderá suspender ou encerrar uma conta em situações de uso
                indevido, fraude, violação destes Termos ou quando necessário para proteção do
                serviço e de seus usuários, respeitando a legislação aplicável.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>16. Legislação aplicável</h2>
              <p>Estes Termos são regidos pelas leis da República Federativa do Brasil.</p>
              <p>
                Eventuais questões relacionadas à utilização do Claricash serão tratadas de acordo
                com a legislação brasileira aplicável.
              </p>
            </div>

            <div className="privacy-section-item">
              <h2>17. Contato</h2>
              <p>Para dúvidas, suporte ou solicitações relacionadas ao Claricash:</p>
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

            <div className="privacy-footer">
              <h2 style={{ marginBottom: 12 }}>18. Aceite</h2>
              <p>
                Ao criar uma conta e utilizar o Claricash, o usuário declara que leu, compreendeu e
                concorda com estes Termos de Uso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfUse;
