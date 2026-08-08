import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaCog, FaInfoCircle, FaShieldAlt, FaSignOutAlt, FaChevronDown, FaCamera, FaChartLine, FaFileContract } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { logout } from '../functions/auth';
import { API_ENDPOINTS } from '../config/api';
import './UserMenu.css';

function UserMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userFoto, setUserFoto] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      if (userData.foto) setUserFoto(userData.foto);
      fetchUserFoto(userData.id);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.foto) setUserFoto(e.detail.foto);
    };
    window.addEventListener('userFotoUpdated', handler);
    return () => window.removeEventListener('userFotoUpdated', handler);
  }, []);

  const fetchUserFoto = async (userId) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.USER_FOTO}?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.foto) {
          setUserFoto(data.foto);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar foto do usuário:', error);
    }
  };

  const handleFotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.');
      return;
    }

    setUploadingFoto(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;

        const response = await fetch(API_ENDPOINTS.USER_FOTO, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, foto: base64 }),
        });

        if (response.ok) {
          setUserFoto(base64);
        } else {
          alert('Erro ao salvar foto.');
        }
        setUploadingFoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      alert('Erro ao fazer upload da foto.');
      setUploadingFoto(false);
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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFotoChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <button className="user-menu-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="user-info">
          {userFoto ? (
            <img src={userFoto} alt="Foto" className="user-foto" />
          ) : (
            <FaUser className="user-icon" />
          )}
          <span className="user-name">{user.nome}</span>
          <FaChevronDown className={`chevron ${isOpen ? 'rotated' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="menu-header">
            <div className="menu-foto-container" onClick={handleFotoClick}>
              {userFoto ? (
                <img src={userFoto} alt="Foto" className="menu-user-foto" />
              ) : (
                <FaUser className="menu-user-icon" />
              )}
              <div className="foto-overlay">
                <FaCamera />
              </div>
              {uploadingFoto && <div className="foto-loading">...</div>}
            </div>
            <span>{user.nome}</span>
          </div>

          <div
            className="menu-item"
            onClick={() => {
              setIsOpen(false);
              navigate('/layout/dashboard');
            }}
          >
            <FaChartLine />
            <span>Dashboard</span>
          </div>

          <div
            className="menu-item"
            onClick={() => {
              setIsOpen(false);
              navigate('/layout/configuracoes');
            }}
          >
            <FaCog />
            <span>Configurações</span>
          </div>

          <div
            className="menu-item"
            onClick={() => {
              setIsOpen(false);
              navigate('/layout/sobre');
            }}
          >
            <FaInfoCircle />
            <span>Sobre</span>
          </div>

          <div
            className="menu-item"
            onClick={() => {
              setIsOpen(false);
              navigate('/privacy-policy');
            }}
          >
            <FaShieldAlt />
            <span>Política de Privacidade</span>
          </div>

          <div
            className="menu-item"
            onClick={() => {
              setIsOpen(false);
              navigate('/terms-of-use');
            }}
          >
            <FaFileContract />
            <span>Termos de Uso</span>
          </div>

          <div className="menu-divider" />

          <div
            className="menu-item logout"
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
          >
            <FaSignOutAlt />
            <span>Sair</span>
          </div>
        </div>
      )}

      {isOpen && <div className="menu-overlay" onClick={() => setIsOpen(false)} />}
    </div>
  );
}

export default UserMenu;
