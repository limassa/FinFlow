const validator = require('validator');

class PasswordValidator {
  static validatePassword(password) {
    const errors = [];
    
    // Verificar comprimento mínimo
    if (password.length < 8) {
      errors.push('A senha deve ter pelo menos 8 caracteres');
    }
    
    // Verificar se contém pelo menos uma letra maiúscula
    if (!/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }
    
    // Verificar se contém pelo menos uma letra minúscula
    if (!/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula');
    }
    
    // Verificar se contém pelo menos um número
    if (!/\d/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }
    
    // Verificar se contém pelo menos um caractere especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('A senha deve conter pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    }
    
    // Verificar se não contém sequências comuns
    const commonSequences = ['123', 'abc', 'qwe', 'asd', 'zxc'];
    const passwordLower = password.toLowerCase();
    for (const sequence of commonSequences) {
      if (passwordLower.includes(sequence)) {
        errors.push('A senha não deve conter sequências comuns (123, abc, etc.)');
        break;
      }
    }
    
    // Verificar se não contém caracteres repetidos em sequência
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        errors.push('A senha não deve conter caracteres repetidos em sequência');
        break;
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      strength: this.calculateStrength(password)
    };
  }
  
  static calculateStrength(password) {
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
    if (score <= 2) return 'fraca';
    if (score <= 4) return 'média';
    if (score <= 6) return 'forte';
    return 'muito forte';
  }
  
  static getPasswordRequirements() {
    return {
      minLength: 8,
      requirements: [
        'Pelo menos 8 caracteres',
        'Pelo menos uma letra maiúscula',
        'Pelo menos uma letra minúscula',
        'Pelo menos um número',
        'Pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;:,.<>?)',
        'Não pode conter sequências comuns (123, abc, etc.)',
        'Não pode conter caracteres repetidos em sequência'
      ]
    };
  }
}

module.exports = PasswordValidator; 