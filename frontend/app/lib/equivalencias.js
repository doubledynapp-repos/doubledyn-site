// ===== Equivalências ilustrativas de CO₂e =====
// Dão dimensão humana ao número de toneladas. TODAS são estimativas médias
// ilustrativas (status: estimativa) — nunca cotação técnica.
// Premissas documentadas abaixo para transparência total.

export const EQUIV_PREMISSAS = {
  arvores: { fator: 6.25, unidade: 'árvores/ano por tCO₂e', premissa: '0,16 tCO₂e absorvidas por árvore madura/ano (mesma base do motor de impacto emocional)' },
  carroKm: { fator: 5000, unidade: 'km por tCO₂e', premissa: 'carro médio a gasolina emite ~0,2 kg CO₂e/km' },
  trechos: { fator: 6.5, unidade: 'trechos domésticos por tCO₂e', premissa: 'trecho aéreo doméstico ~0,154 tCO₂e (DEFRA 2024 short-haul 0,10974 kg/km/pax × ~1.400 km + uplift)' },
  casas: { fator: 144.7, unidade: 'casas-mês por tCO₂e', premissa: '1 tCO₂e ≈ 21,7 MWh (fator SIN 0,0461 t/MWh); consumo médio residencial 150 kWh/mês' },
};

export function equivalenciasDe(tCO2e) {
  const t = Math.max(0, Number(tCO2e) || 0);
  if (t < 0.01) return [];
  const arvores = Math.max(1, Math.round(t * EQUIV_PREMISSAS.arvores.fator));
  const km = Math.round(t * EQUIV_PREMISSAS.carroKm.fator);
  const trechos = Math.max(1, Math.round(t * EQUIV_PREMISSAS.trechos.fator));
  const casas = Math.max(1, Math.round(t * EQUIV_PREMISSAS.casas.fator));
  const fmt = (n) => n.toLocaleString('pt-BR');
  return [
    { id: 'arvores', icon: 'leaf', texto: `${fmt(arvores)} árvores/ano para absorver` },
    { id: 'km', icon: 'car', texto: `${fmt(km)} km de carro rodados` },
    { id: 'trechos', icon: 'plane', texto: `${fmt(trechos)} trechos aéreos domésticos` },
    { id: 'casas', icon: 'bolt', texto: `${fmt(casas)} casas abastecidas por 1 mês` },
  ];
}
