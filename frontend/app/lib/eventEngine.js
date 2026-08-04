// ===== Motor de Emissões de Eventos (Evento Neutro) =====
// Estimativa para eventos: deslocamento de participantes + energia do local + resíduos.
// TODAS as premissas são estimativas médias documentadas (status: estimativa) —
// nunca cotação técnica. Fatores alinhados ao motor principal (SIN 0,0461 t/MWh;
// DEFRA 2024 resíduos 0,497 t/t).

export const EVENTO_PREMISSAS = {
  transporte: {
    fator: 0.00015, unidade: 'tCO₂e/km/participante',
    premissa: 'Mix médio de deslocamento (carro 0,2 kg/km, ônibus ~0,09 kg/km, metrô ~0,03 kg/km) — participante médio ~0,15 kg CO₂e/km',
  },
  energia: {
    fator: 0.0000461, unidade: 'tCO₂e/kWh',
    premissa: 'Fator SIN 2025 (MCTI/SIRENE — mesmo fator do motor principal, auditado)',
  },
  residuos: {
    fator: 0.000497, unidade: 'tCO₂e/kg',
    premissa: 'DEFRA 2024 — resíduo misto domiciliar → aterro (497 kgCO₂e/t)',
  },
};

export const EVENTO_PRECOS = {
  base: 990,          // R$ fixo até 5 t (diagnóstico + certificado + até 5t)
  porTonelada: 90,    // R$/t excedente
  limiteBase: 5,      // toneladas incluídas na base
  porToneladaVolume: 80, // R$/t acima de 50 t (desconto por volume)
  limiteVolume: 50,
};

export function calculateEventEmissions(data = {}) {
  const participantes = Math.max(0, Number(data.participantes) || 0);
  const kmMedio = Math.max(0, Number(data.kmMedio) || 0);
  const energiaKwh = Math.max(0, Number(data.energiaKwh) || 0);
  const residuosKg = Math.max(0, Number(data.residuosKg) || 0);

  const transporte = participantes * kmMedio * EVENTO_PREMISSAS.transporte.fator;
  const energia = energiaKwh * EVENTO_PREMISSAS.energia.fator;
  const residuos = residuosKg * EVENTO_PREMISSAS.residuos.fator;
  const total = transporte + energia + residuos;

  // Precificação transparente: R$ 990 base (até 5t) + R$ 90/t excedente (80/t acima de 50t)
  let valor = EVENTO_PRECOS.base;
  if (total > EVENTO_PRECOS.limiteBase) {
    const excedente = total - EVENTO_PRECOS.limiteBase;
    if (excedente <= (EVENTO_PRECOS.limiteVolume - EVENTO_PRECOS.limiteBase)) {
      valor += excedente * EVENTO_PRECOS.porTonelada;
    } else {
      const ate50 = (EVENTO_PRECOS.limiteVolume - EVENTO_PRECOS.limiteBase);
      valor += ate50 * EVENTO_PRECOS.porTonelada + (excedente - ate50) * EVENTO_PRECOS.porToneladaVolume;
    }
  }

  return {
    totalEmissao: round2(total),
    transporte: round3(transporte),
    energia: round3(energia),
    residuos: round3(residuos),
    participantes,
    valorTotal: Math.round(valor),
    valorBase: EVENTO_PRECOS.base,
    valorPorTonelada: total > EVENTO_PRECOS.limiteBase ? EVENTO_PRECOS.porTonelada : 0,
    premissas: EVENTO_PREMISSAS,
  };
}

function round2(n) { return Math.round(n * 100) / 100; }
function round3(n) { return Math.round(n * 1000) / 1000; }
