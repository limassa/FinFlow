import React, { useEffect } from 'react';

const AD_CLIENT = 'ca-pub-5034102059523026';

/**
 * Bloco de anúncio do Google AdSense.
 * Troque o slot pelo ID da unidade criada no painel do AdSense.
 * @param {string} slot - ID do slot (ex: 1234567890). Crie em AdSense > Anúncios > Por nome.
 * @param {string} format - 'auto' | 'rectangle' | 'horizontal' | 'vertical'
 * @param {string} className - Classes CSS adicionais
 * @param {object} style - Estilos inline
 */
function AdSense({ slot, format = 'auto', className = '', style = {} }) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn('AdSense push:', e);
    }
  }, [slot]);

  if (!slot || slot === 'YOUR_AD_SLOT_ID') return null;

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

export default AdSense;
