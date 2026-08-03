// ===== Fatores de Emissão — FONTE ÚNICA (auditados) =====
// Auditoria R1 (docs/auditoria-fatores-r1.md):
//  - Eletricidade: atualizado de 0,0817 (MCTI 2016, 10 anos defasado) para 0,0461 (MCTI 2025)
//  - Combustíveis: consistentes com IPCC 2006 (diferenças ≤3,3% explicadas por densidade)
// Regra: NENHUM fator é alterado aqui sem auditoria + aprovação (Rony/Diego).
// Status: 'oficial' | 'a_validar' (Rodada 2) | 'estimativa' (sem fonte oficial — rotulado)

export const FACTORS = {
  // ── Escopo 2 ──
  ELETRICIDADE: {
    valor: 0.0461, unidade: 'tCO₂/MWh',
    fonte: 'MCTI — Fator Médio Anual do SIN (inventários corporativos)',
    url: 'https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/sirene/dados-e-ferramentas/fatores-de-emissao',
    ano: 2025, metodo: 'Fator médio anual, método de inventário (location-based)',
    status: 'oficial',
  },

  // ── Escopo 1 — combustíveis (IPCC 2006, derivados) ──
  GLP: {
    valor: 2.983, unidade: 'kgCO₂/kg',
    fonte: 'IPCC 2006 Guidelines, Vol.2 Cap.2 (Table 2.2)',
    url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf',
    ano: 2006, metodo: 'NCV 47,3 TJ/Gg × fator 63,1 tCO₂/TJ',
    status: 'oficial',
  },
  GAS_NATURAL: {
    valor: 2.07, unidade: 'kgCO₂/m³',
    fonte: 'IPCC 2006 Guidelines, Vol.2 Cap.2 (Table 2.2)',
    url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf',
    ano: 2006, metodo: 'NCV 48,0 TJ/Gg × 56,1 tCO₂/TJ × densidade 0,77 kg/m³ (premissa)',
    status: 'oficial',
  },
  DIESEL_EST: {
    valor: 2.603, unidade: 'kgCO₂/litro',
    fonte: 'IPCC 2006 Guidelines, Vol.2 Cap.2 (Table 2.2)',
    url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf',
    ano: 2006, metodo: 'NCV 43,0 TJ/Gg × 74,1 tCO₂/TJ × densidade 0,817 kg/L (premissa)',
    status: 'oficial',
  },
  GASOLINA: {
    valor: 2.212, unidade: 'kgCO₂/litro',
    fonte: 'IPCC 2006 Guidelines, Vol.2 Cap.2 (Table 2.2)',
    url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf',
    ano: 2006, metodo: 'NCV 44,3 TJ/Gg × 69,3 tCO₂/TJ × densidade 0,72 kg/L (premissa)',
    status: 'oficial',
  },
  GNV: {
    valor: 2.07, unidade: 'kgCO₂/m³',
    fonte: 'IPCC 2006 Guidelines, Vol.2 Cap.2 (Table 2.2)',
    url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf',
    ano: 2006, metodo: 'idem GAS_NATURAL',
    status: 'oficial',
  },
  LENHA: {
    valor: 1460, unidade: 'kgCO₂/tonelada',
    fonte: 'IPCC 2006 Guidelines, Vol.2 Cap.2 (Table 2.2) — madeira seca ao ar',
    url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf',
    ano: 2006, metodo: '112 tCO₂/TJ × 15,6 TJ/Gg, ajustado ~16% umidade (premissa)',
    status: 'oficial',
  },
  ETANOL: {
    valor: 0, unidade: 'kgCO₂/litro',
    fonte: 'IPCC 2006 — CO₂ biogênico não contabilizado',
    ano: 2006, metodo: 'Carbono biogênico (neutro); CH₄/N₂O não considerados (triagem)',
    status: 'oficial',
  },

  // ── Transporte aéreo (Rodada 2 pendente) ──
  AEREO_DOM: { valor: 0.133, unidade: 'kgCO₂/km/passageiro', fonte: 'DEFRA-like — a validar (Rodada 2)', ano: null, metodo: 'Estimativa por passageiro-km', status: 'a_validar' },
  AEREO_INT: { valor: 0.102, unidade: 'kgCO₂/km/passageiro', fonte: 'DEFRA-like — a validar (Rodada 2)', ano: null, metodo: 'Estimativa por passageiro-km', status: 'a_validar' },

  // ── Instalações ──
  AGUA: { valor: 0.708, unidade: 'kgCO₂/m³', fonte: 'Estimativa — a validar (Rodada 2: DEFRA/Ecoinvent)', ano: null, metodo: 'Energia embutida, simplificado', status: 'a_validar' },
  PAPEL: { valor: 3.0, unidade: 'kgCO₂/resma', fonte: 'Estimativa — a validar (Rodada 2)', ano: null, metodo: 'Cadeia, simplificado', status: 'a_validar' },
  AR_COND: { valor: 0.05, unidade: 'tCO₂/unidade/ano', fonte: 'Estimativa operacional', ano: null, metodo: 'Por equipamento', status: 'estimativa' },
  REFRIG: { valor: { nenhuma: 0, pequena: 0.5, media: 2.0, grande: 5.0 }, unidade: 'tCO₂/ano', fonte: 'Estimativa por porte', ano: null, metodo: 'Fugas de refrigerante', status: 'estimativa' },

  // ── Resíduos ──
  RESIDUOS: { valor: 0.5, unidade: 'tCO₂/tonelada', fonte: 'GHG Protocol Brasil — aterro (simplificado)', ano: null, metodo: 'Destinação em aterro', status: 'a_validar' },
  RESIDUOS_PERIG: { valor: 1.2, unidade: 'kgCO₂/kg', fonte: 'Estimativa — a validar (Rodada 2)', ano: null, metodo: 'Tratamento', status: 'a_validar' },

  // ── Módulos setoriais (v1: agro + comércio) — premissas IPCC Tier 1, a validar na Rodada 2 ──
  METANO_ENTERIC: {
    valor: 1.6, unidade: 'tCO₂e/cabeça/ano',
    fonte: 'IPCC 2006/2019 Tier 1 — fermentação entérica bovina (56–64 kg CH₄/cab/ano × GWP 28)',
    ano: 2006, metodo: 'EF × GWP100 CH₄ (1,6 tCO₂e — valor médio da faixa)',
    status: 'a_validar',
  },
  N2O_FERTILIZANTE: {
    valor: 0.00416, unidade: 'tCO₂e/kg N',
    fonte: 'IPCC 2006 Tier 1 — N₂O de fertilizantes nitrogenados (EF 0,01 kg N₂O-N/kg N × 44/28 × GWP 265)',
    ano: 2006, metodo: 'EF direto de solos agrícolas (sem emissões indiretas)',
    status: 'a_validar',
  },
  QUEIMA_RESIDUOS_AGRO: {
    valor: 0.003, unidade: 'tCO₂e/tonelada queimada',
    fonte: 'IPCC 2006 Tier 1 — queima de resíduos agrícolas (CH₄ + N₂O; CO₂ biogênico não contabilizado)',
    ano: 2006, metodo: 'Aproximação Tier 1 (varia com o tipo de resíduo)',
    status: 'a_validar',
  },
  REFRIG_COMERCIAL: {
    valor: 0.35, unidade: 'tCO₂e/unidade/ano',
    fonte: 'Estimativa — fugas de refrigerante em refrigeração comercial (gôndola/câmara), a validar',
    ano: null, metodo: 'Por unidade de refrigeração comercial',
    status: 'a_validar',
  },
};

export const FACTORS_META = {
  versao: '1.1',
  dataRevisao: '2026-08-03',
  status: 'em auditoria',
  nota: 'Eletricidade: MCTI 2025 (ano-base explícito). Para inventário formal, usar fator do ano reportado (ex.: 2024 → 0,0545).',
};
