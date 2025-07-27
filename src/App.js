import logo from './images/image.png';
import './App.css';
import { funcoes } from './functions/function.js';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Bem vindo Teste!</h1>
        <input type='text' placeholder='E-mail ou Usuário:' id='usuario' />
        <br />
        <input type='password' placeholder='Senha:' id='senha' />
        <br /><br />
        <button onClick={funcoes.entrar}>Acessar</button>
        <br />
        <Link to="/cadastro" className="App-link">
          <h6>Cadastre-se Aqui!</h6>
        </Link>
      </header>
    </div>
  );
}

export default App;
