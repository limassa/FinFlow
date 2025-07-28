import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Home from './pages/Home';  
import Principal from './pages/Principal';
import Receita from './pages/Receita';
import Despesa from './pages/Despesa';
import FaleConosco from './pages/FaleConosco';
import Contas from './pages/Contas';
import Layout from './pages/Layout';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/fale-conosco" element={<FaleConosco />} />
        <Route path="/app" element={<App />}/>
        <Route path="/" element={<Layout />}>
          <Route path="/principal" element={<Principal />} />
          <Route path="/receita" element={<Receita />} />
          <Route path="/despesa" element={<Despesa />} />
          <Route path="/contas" element={<Contas />} />
          <Route path="/fale-conosco" element={<FaleConosco />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
