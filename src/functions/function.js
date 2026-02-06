export const funcoes = {

  cadastrar: (nome, email, senha, telefone, senhaConfirm) => {
    if (nome === '' || telefone === '' || email === '' || senha === '' || senhaConfirm === '') {
      alert('Preencha todos os campos');
      return false;
    }else{
      alert('Usuário cadastrado com sucesso');
      return true;
    }

  },
  validarCampoBrancoLogin: (email, senha) => {
    if (email === '' || senha === '') {
      alert('Preencha todos os campos');
      return false;
    }
    return true;
  }
};

