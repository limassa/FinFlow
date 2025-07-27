// src/functions/auth.js

export function getUsuarioLogado() {
  const user = localStorage.getItem('user');
  console.log('Dados do localStorage:', user);
  const parsedUser = user ? JSON.parse(user) : null;
  console.log('Usuário parseado:', parsedUser);
  return parsedUser;
}

export function setUsuarioLogado(userData) {
  console.log('Salvando usuário no localStorage:', userData);
  localStorage.setItem('user', JSON.stringify(userData));
}

export function logout() {
  localStorage.removeItem('user');
}