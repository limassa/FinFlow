import React from 'react';
import { getBancoById } from '../utils/banks';

/**
 * Logo do banco (SVG) com fallback para iniciais coloridas.
 */
function BankLogo({ banco, bancoId, className = '', size = 28, title }) {
  const data = banco || (bancoId ? getBancoById(bancoId) : null);
  if (!data) return null;

  const tip = title ?? data.nome;

  if (data.logo) {
    return (
      <img
        src={`${process.env.PUBLIC_URL || ''}/bank-logos/${data.logo}`}
        alt={tip}
        title={tip}
        className={`bank-logo ${className}`.trim()}
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`bank-badge ${className}`.trim()}
      style={{ backgroundColor: data.cor }}
      title={tip}
    >
      {data.abbr}
    </span>
  );
}

export default BankLogo;
