import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import './PasswordStrength.css';

const PasswordStrength = ({ password, onPasswordChange, showRequirements = true }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [requirements, setRequirements] = useState([]);

  useEffect(() => {
    // Buscar requisitos do backend
    fetch('${API_ENDPOINTS.PASSWORD_REQUIREMENTS}')
      .then(response => response.json())
      .then(data => {
        setRequirements(data.requirements);
      })
      .catch(error => {
        console.error('Erro ao buscar requisitos de senha:', error);
        // Requisitos padrão caso a API falhe
        setRequirements([
          'Pelo menos 8 caracteres',
          'Pelo menos uma letra maiúscula',
          'Pelo menos uma letra minúscula',
          'Pelo menos um número',
          'Pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;:,.<>?)',
          'Não pode conter sequências comuns (123, abc, etc.)',
          'Não pode conter caracteres repetidos em sequência'
        ]);
      });
  }, []);

  const validatePassword = (password) => {
    const validations = [];
    
    // Verificar comprimento mínimo
    validations.push({
      text: 'Pelo menos 8 caracteres',
      valid: password.length >= 8
    });
    
    // Verificar se contém pelo menos uma letra maiúscula
    validations.push({
      text: 'Pelo menos uma letra maiúscula',
      valid: /[A-Z]/.test(password)
    });
    
    // Verificar se contém pelo menos uma letra minúscula
    validations.push({
      text: 'Pelo menos uma letra minúscula',
      valid: /[a-z]/.test(password)
    });
    
    // Verificar se contém pelo menos um número
    validations.push({
      text: 'Pelo menos um número',
      valid: /\d/.test(password)
    });
    
    // Verificar se contém pelo menos um caractere especial
    validations.push({
      text: 'Pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;:,.<>?)',
      valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
    
    // Verificar se não contém sequências comuns
    const commonSequences = ['123', 'abc', 'qwe', 'asd', 'zxc'];
    const passwordLower = password.toLowerCase();
    const hasCommonSequence = commonSequences.some(sequence => passwordLower.includes(sequence));
    validations.push({
      text: 'Não pode conter sequências comuns (123, abc, etc.)',
      valid: !hasCommonSequence
    });
    
    // Verificar se não contém caracteres repetidos em sequência
    let hasRepeatedChars = false;
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        hasRepeatedChars = true;
        break;
      }
    }
    validations.push({
      text: 'Não pode conter caracteres repetidos em sequência',
      valid: !hasRepeatedChars
    });
    
    return validations;
  };

  const calculateStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    
    // Pontos por comprimento
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Pontos por tipos de caracteres
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    
    // Determinar força baseada no score
    if (score <= 2) return { score, label: 'Fraca', color: '#ff4757' };
    if (score <= 4) return { score, label: 'Média', color: '#ffa502' };
    if (score <= 6) return { score, label: 'Forte', color: '#2ed573' };
    return { score, label: 'Muito Forte', color: '#1e90ff' };
  };

  const validations = validatePassword(password);
  const strength = calculateStrength(password);
  const isValid = validations.every(v => v.valid);

  return (
    <div className="password-strength-container">
      <div className="password-input-container">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Digite sua senha"
          className="password-input"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="password-toggle-btn"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {password && (
        <div className="strength-indicator">
          <div className="strength-bar">
            <div 
              className="strength-fill"
              style={{ 
                width: `${(strength.score / 7) * 100}%`,
                backgroundColor: strength.color
              }}
            />
          </div>
          <span className="strength-label" style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>
      )}

      {showRequirements && password && (
        <div className="requirements-list">
          <h4>Requisitos de Segurança:</h4>
          {validations.map((validation, index) => (
            <div key={index} className={`requirement-item ${validation.valid ? 'valid' : 'invalid'}`}>
              {validation.valid ? <FaCheck className="check-icon" /> : <FaTimes className="times-icon" />}
              <span>{validation.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrength; 