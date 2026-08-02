'use client';
import { useState, useEffect } from 'react';

export default function LgpdBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('lgpd_consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('lgpd_consent', 'accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem('lgpd_consent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="lgpd-banner" id="lgpdBanner">
      <p>
        Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa{' '}
        <a href="/privacidade">Política de Privacidade</a>.
      </p>
      <div className="lgpd-actions">
        <button className="btn btn-primary btn-sm" id="lgpdAccept" onClick={accept}>Aceitar</button>
        <button className="btn btn-secondary btn-sm" id="lgpdReject" onClick={reject}>Rejeitar</button>
      </div>
    </div>
  );
}
