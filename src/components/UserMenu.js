import React, { useState, useEffect } from 'react';
import { FaUser, FaBell, FaBellSlash, FaCog, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { logout } from '../functions/auth';
import './UserMenu.css';

function UserMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [lembretesAtivos, setLembretesAtivos] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    console.log('UserMenu - userData:', userData);
    if (userData) {
      setUser(userData);
      // Buscar configuração de lembretes do usuário
      fetchLembretesConfig(userData.id);
    } else {
      console.log('UserMenu - Nenhum usuário encontrado no localStorage');
    }
  }, []);

  const fetchLembretesConfig = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/user/lembretes?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setLembretesAtivos(data.lembretesAtivos || false);
      }
    } catch (error) {
      console.error('Erro ao buscar configuração de lembretes:', error);
    }
  };

  const toggleLembretes = async () => {
    if (!user) return;

    try {
      const response = await fetch('http://localhost:3001/api/user/lembretes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          lembretesAtivos: !lembretesAtivos
        }),
      });

      if (response.ok) {
        setLembretesAtivos(!lembretesAtivos);
        // Mostrar feedback
        alert(lembretesAtivos ? 'Lembretes desativados!' : 'Lembretes ativados!');
      }
    } catch (error) {
      console.error('Erro ao atualizar lembretes:', error);
      alert('Erro ao atualizar configuração de lembretes');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="user-menu-container">
        <div className="user-info">
          <FaUser className="user-icon" />
          <span className="user-name">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="user-menu-container">
      <button 
        className="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-info">
          <FaUser className="user-icon" />
          <span className="user-name">{user.nome}</span>
          <FaChevronDown className={`chevron ${isOpen ? 'rotated' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="menu-header">
            <FaUser />
            <span>{user.nome}</span>
          </div>

          <div className="menu-item" onClick={toggleLembretes}>
            {lembretesAtivos ? <FaBell /> : <FaBellSlash />}
            <span>
              {lembretesAtivos ? 'Desativar Lembretes' : 'Ativar Lembretes'}
            </span>
          </div>

          <div className="menu-item" onClick={() => navigate('/configuracoes')}>
            <FaCog />
            <span>Configurações</span>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-item logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Sair</span>
          </div>
        </div>
      )}

      {/* Overlay para fechar o menu */}
      {isOpen && (
        <div 
          className="menu-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default UserMenu; 