import React from 'react';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.lizsoftwares.finflow';
// Reativar quando o app estiver publicado na App Store
const SHOW_APP_STORE = false;
const APP_STORE_URL = 'https://apps.apple.com/br/app/idSEU_APP_ID';

const badgeBase = (process.env.PUBLIC_URL || '') + '/badges';

/**
 * Badges oficiais das lojas (App Store / Google Play).
 * App Store fica oculto até SHOW_APP_STORE = true.
 */
function StoreBadges({ className = '' }) {
  return (
    <div className={`store-badges ${className}`.trim()}>
      {SHOW_APP_STORE ? (
        <a
          className="store-badges__link"
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Baixar na App Store"
        >
          <img
            src={`${badgeBase}/app-store-badge.svg`}
            alt="Download on the App Store"
            className="store-badges__img store-badges__img--apple"
          />
        </a>
      ) : null}
      <a
        className="store-badges__link"
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Disponível no Google Play"
      >
        <img
          src={`${badgeBase}/google-play-badge.png`}
          alt="Get it on Google Play"
          className="store-badges__img store-badges__img--google"
        />
      </a>
    </div>
  );
}

export default StoreBadges;
