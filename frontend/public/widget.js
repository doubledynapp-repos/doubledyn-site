/**
 * DoubleDyn Official Verified Widget v2.0
 * Embeddable Badge JS para o rodapé do site dos clientes B2B DoubleDyn
 * Conecta-se à API para renderizar o selo dinamicamente
 */

(function() {
  if (window.__DoubleDynWidgetLoaded) return;
  window.__DoubleDynWidgetLoaded = true;

  const scriptTag = document.currentScript || document.querySelector('script[data-cnpj]');
  const cnpj = scriptTag ? scriptTag.getAttribute('data-cnpj') : null;
  const theme = scriptTag ? scriptTag.getAttribute('data-theme') || 'dark' : 'dark';
  const position = scriptTag ? scriptTag.getAttribute('data-position') || 'bottom-right' : 'bottom-right';

  if (!cnpj) {
    console.error('[DoubleDyn Widget] Erro: CNPJ não fornecido na tag do script.');
    return;
  }

  // Estilos
  const style = document.createElement('style');
  style.innerHTML = `
    .doubledyn-badge-container {
      position: fixed;
      ${position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
      ${position.includes('left') ? 'left: 20px;' : 'right: 20px;'}
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .doubledyn-badge-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-radius: 50px;
      background: ${theme === 'dark' ? 'rgba(9, 20, 16, 0.92)' : 'rgba(255, 255, 255, 0.95)'};
      color: ${theme === 'dark' ? '#ecfdf5' : '#0F2B20'};
      border: 1px solid rgba(93, 217, 140, 0.4);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 0 15px rgba(93, 217, 140, 0.2);
      backdrop-filter: blur(12px);
      cursor: pointer;
      text-decoration: none;
      user-select: none;
    }
    .doubledyn-badge-pill:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35), 0 0 25px rgba(93, 217, 140, 0.4);
    }
    .doubledyn-badge-pill.inactive {
      border: 1px solid rgba(239, 68, 68, 0.4);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 0 15px rgba(239, 68, 68, 0.2);
    }
    .doubledyn-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
      animation: doubledyn-pulse 2s infinite;
    }
    .doubledyn-dot.inactive {
      background: #ef4444;
      box-shadow: 0 0 10px #ef4444;
      animation: none;
    }
    @keyframes doubledyn-pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    .doubledyn-text-main {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: -0.2px;
    }
    .doubledyn-text-sub {
      font-size: 10px;
      opacity: 0.8;
      font-weight: 600;
    }
    .doubledyn-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 1000000;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .doubledyn-modal-card {
      background: #091410;
      border: 1px solid rgba(93, 217, 140, 0.4);
      border-radius: 24px;
      padding: 32px;
      max-width: 440px;
      width: 100%;
      color: #ecfdf5;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
  `;
  document.head.appendChild(style);

  // Busca dados na API B2B DoubleDyn
  fetch(`http://localhost:3001/api/widget/status?cnpj=${cnpj}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error('[DoubleDyn Widget]', data.error);
        return; // Não renderiza nada se der erro ou não achar
      }

      const isActive = data.is_active;
      const score = data.dqs_score || 0;
      const seal = data.seal || 'Não Avaliado';
      
      let sealColor = '#f1c40f';
      if (seal === 'Prata') sealColor = '#bdc3c7';
      if (seal === 'Bronze') sealColor = '#cd7f32';
      
      const container = document.createElement('div');
      container.className = 'doubledyn-badge-container';
      
      if (isActive) {
        container.innerHTML = `
          <div class="doubledyn-badge-pill" id="doubledyn-badge-trigger">
            <div class="doubledyn-dot"></div>
            <div>
              <div class="doubledyn-text-main">🌿 EMPRESA VERIFICADA DOUBLE DYN</div>
              <div class="doubledyn-text-sub">DQS ${score} ${seal.toUpperCase()} • Polygon On-Chain</div>
            </div>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="doubledyn-badge-pill inactive" id="doubledyn-badge-trigger">
            <div class="doubledyn-dot inactive"></div>
            <div>
              <div class="doubledyn-text-main">⚠️ SELO DE SUSTENTABILIDADE EXPIRADO</div>
              <div class="doubledyn-text-sub">Neutralização pendente na DoubleDyn</div>
            </div>
          </div>
        `;
      }
      
      document.body.appendChild(container);

      // Modal
      document.getElementById('doubledyn-badge-trigger').addEventListener('click', function() {
        if (!isActive) {
          alert('O certificado de neutralidade desta empresa encontra-se expirado ou inativo.');
          return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'doubledyn-modal-overlay';
        modal.innerHTML = `
          <div class="doubledyn-modal-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
              <h3 style="margin:0; font-size:18px; font-weight:800; color:#fff;">🌿 Certificado de Neutralização</h3>
              <button id="doubledyn-modal-close" style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">✕</button>
            </div>
            <div style="background:rgba(93, 217, 140, 0.1); border:1px solid rgba(93, 217, 140, 0.3); padding:16px; border-radius:16px; margin-bottom:20px; text-align:center;">
              <span style="font-size:12px; color:#5DD98C; font-weight:700;">STATUS: MONITORAMENTO ATIVO LEI 15.042</span>
              <div style="font-size:36px; font-weight:900; color:${sealColor}; margin:6px 0;">DQS ${score} <span style="font-size:16px; color:#94a3b8;">/ 1000</span></div>
              <span style="background:${sealColor}; color:#111; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:800;">SELO ${seal.toUpperCase()} EXCELÊNCIA</span>
            </div>
            <div style="font-size:13px; color:#cbd5e1; line-height:1.6; margin-bottom:20px;">
              A <strong>${data.company_name}</strong> (CNPJ ${cnpj}) realiza o monitoramento contínuo das emissões e mantém créditos de carbono neutralizados com verificação imutável na blockchain Polygon.
            </div>
            <div style="display:flex; gap:10px;">
              <a href="https://polygonscan.com/" target="_blank" style="flex:1; text-align:center; padding:12px; background:#5DD98C; color:#0F2B20; border-radius:10px; font-weight:800; text-decoration:none; font-size:13px;">
                Ver Auditoria na Polygon
              </a>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('doubledyn-modal-close').addEventListener('click', function() {
          document.body.removeChild(modal);
        });
      });
    })
    .catch(err => console.error('[DoubleDyn Widget]', err));
})();
