import React from 'react';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.lizsoftwares.finflow';
const APP_STORE_URL = 'https://apps.apple.com/br/app/id6787544258';

const badgeBase = (process.env.PUBLIC_URL || '') + '/badges';

/**
 * Badges oficiais das lojas (App Store / Google Play).
 */
function StoreBadges({ className = '' }) {
  return (
    <div className={`store-badges ${className}`.trim()}>
      <a
        className="store-badges__link"
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Baixar na App Store"
      >
        <img
          src={`${badgeBase}/app-store-badge.svg`}
          alt="Baixar na App Store"
          className="store-badges__img store-badges__img--apple"
        />
      </a>
      <a
        className="store-badges__link"
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Disponível no Google Play"
      >
        <img
          src={`${badgeBase}/google-play-badge-pt-br.svg`}
          alt="Disponível no Google Play"
          className="store-badges__img store-badges__img--google"
        />
      </a>
    </div>
  );
}

export default StoreBadges;
