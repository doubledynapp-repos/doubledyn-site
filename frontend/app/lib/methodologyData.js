// ===== Nota Metodológica — Dados (fonte única de conteúdo) =====
// Valores idênticos aos fatores usados no carbonEngine.js (consistência obrigatória).
// STATUS: auditoria de fontes individuais em andamento — não publicar externamente antes da validação.

export const META = {
  versao: '1.0',
  dataRevisao: '2026-08-01',
  statusAuditoria: 'Em auditoria interna — fatores e fontes individuais em validação antes da publicação externa.',
};

export const POSICIONAMENTO = [
  'A calculadora DoubleDyn é uma ferramenta de TRIAGEM e DIAGNÓSTICO ESTIMADO: converte dados operacionais informados pelo usuário em uma estimativa de emissões de GEE (tCO₂e/ano) com margem de segurança de +15%.',
  'Ela NÃO substitui um inventário formal de GEE conforme o GHG Protocol / ISO 14064, nem serve como base de relato regulatório (SBCE/CVM) sem o plano Enterprise, que aplica metodologia completa com dados auditados.',
  'O objetivo é dar ao usuário um ponto de partida confiável para priorizar ações de redução e compensação, com total transparência sobre como cada número é calculado.',
];

export const SCOPES = [
  { campo: 'GLP, gás natural, diesel de gerador, lenha', escopo: 'Escopo 1', obs: 'Combustão estacionária direta' },
  { campo: 'Gasolina, diesel, GNV (frota)', escopo: 'Escopo 1', obs: 'Combustão móvel direta' },
  { campo: 'Eletricidade comprada da rede', escopo: 'Escopo 2', obs: 'Método location-based, fator médio do SIN (MCTI)' },
  { campo: 'Refrigeração (gases refrigerantes)', escopo: 'Escopo 1 (fugas)', obs: 'Estimativa por porte do sistema' },
  { campo: 'Viagens aéreas a negócio', escopo: 'Escopo 3', obs: 'Distâncias médias doméstica/internacional' },
  { campo: 'Água, papel, resíduos (destinação)', escopo: 'Escopo 3', obs: 'Cadeia — simplificado para triagem' },
  { campo: 'Etanol (frota)', escopo: 'Neutro (bio)', obs: 'Fator 0 — biocombustível (análise de ciclo de vida não considerada)' },
];

export const FACTORS = [
  { fator: 'Eletricidade (rede — média anual)', valor: '0,0461', unidade: 'tCO₂/MWh', fonte: 'MCTI/SIRENE — fator médio anual do SIN, ano-base 2025 (atualizado 01/08/2026, auditoria R1)' },
  { fator: 'GLP', valor: '2,983', unidade: 'kgCO₂/kg', fonte: 'GHG Protocol Brasil / IPCC AR6' },
  { fator: 'Gás natural', valor: '2,07', unidade: 'kgCO₂/m³', fonte: 'GHG Protocol Brasil / IPCC AR6' },
  { fator: 'Diesel (estacionário e frota)', valor: '2,603', unidade: 'kgCO₂/litro', fonte: 'GHG Protocol Brasil / IPCC AR6' },
  { fator: 'Gasolina', valor: '2,212', unidade: 'kgCO₂/litro', fonte: 'GHG Protocol Brasil / IPCC AR6' },
  { fator: 'GNV', valor: '2,07', unidade: 'kgCO₂/m³', fonte: 'GHG Protocol Brasil / IPCC AR6' },
  { fator: 'Etanol', valor: '0 (neutro)', unidade: 'kgCO₂/litro', fonte: 'Biocombustível — sem fator (ciclo de vida não considerado)' },
  { fator: 'Lenha', valor: '1460', unidade: 'kgCO₂/tonelada', fonte: 'GHG Protocol Brasil / IPCC AR6' },
  { fator: 'Aéreo doméstico', valor: '0,133', unidade: 'kgCO₂/km/passageiro', fonte: 'GHG Protocol Brasil / IPCC AR6' },
  { fator: 'Aéreo internacional', valor: '0,102', unidade: 'kgCO₂/km/passageiro', fonte: 'GHG Protocol Brasil / IPCC AR6' },
  { fator: 'Água', valor: '0,708', unidade: 'kgCO₂/m³', fonte: 'GHG Protocol Brasil (energia embutida — simplificado)' },
  { fator: 'Papel', valor: '3,0', unidade: 'kgCO₂/resma', fonte: 'GHG Protocol Brasil (cadeia — simplificado)' },
  { fator: 'Ar-condicionado', valor: '0,05', unidade: 'tCO₂/unidade/ano', fonte: 'Estimativa operacional por equipamento' },
  { fator: 'Refrigeração (fugas)', valor: '0,5 / 2,0 / 5,0', unidade: 'tCO₂/ano (pequena/média/grande)', fonte: 'Estimativa por porte — auditoria pendente' },
  { fator: 'Resíduos (aterro)', valor: '0,5', unidade: 'tCO₂/tonelada', fonte: 'GHG Protocol Brasil — destinação em aterro (simplificado)' },
  { fator: 'Resíduos perigosos', valor: '1,2', unidade: 'kgCO₂/kg', fonte: 'GHG Protocol Brasil — tratamento (simplificado)' },
];

export const FORMULAS = [
  { nome: 'Energia (Escopo 1 + 2)', formula: '∑ consumo × fator × 12 meses. Eletricidade: kWh/1000 × fator × 12. Fontes renováveis: solar/eólica × 0,05; biomassa × 0,15; mista × 0,55.' },
  { nome: 'Frota (Escopo 1)', formula: '∑ litros/m³ × fator/1000 × 12. Aéreo: nº viagens × km médio (1500 dom / 8000 int) × fator / 1000.' },
  { nome: 'Instalações', formula: 'Água: m³ × 0,708/1000 × 12 × fator presencial. Ar-cond: nº × 0,05 × fator presencial. Refrigeração: tabela por porte. Papel: resmas × 3,0/1000 × 12 × fator presencial. Fator presencial = 1 − (home office % × 0,7).' },
  { nome: 'Resíduos', formula: 'Aterro: toneladas × (1 − % reciclagem) × 0,5 × 12. Perigosos: kg × 1,2/1000 × 12.' },
  { nome: 'Total', formula: 'Base = energia + frota + instalações + resíduos. Total = base × 1,15 (margem de segurança de 15% para incerteza de estimativa).' },
  { nome: 'Custo de exposição (referência)', formula: 'R$ 8.500 + (total tCO₂e × R$ 120) — valor de referência do relatório para priorização; não é cotação de mercado.' },
];

export const BENCHMARKS = [
  { setor: 'Agro', intensidade: 120, fonte: 'SEEG / GHG Protocol Brasil — intensidade tCO₂e por R$ 1 milhão de faturamento' },
  { setor: 'Mineração', intensidade: 180, fonte: 'SEEG / GHG Protocol Brasil' },
  { setor: 'Indústria', intensidade: 85, fonte: 'SEEG / GHG Protocol Brasil' },
  { setor: 'Logística', intensidade: 110, fonte: 'SEEG / GHG Protocol Brasil' },
  { setor: 'Construção', intensidade: 75, fonte: 'SEEG / GHG Protocol Brasil' },
  { setor: 'Serviços', intensidade: 12, fonte: 'SEEG / GHG Protocol Brasil' },
  { setor: 'Comércio', intensidade: 25, fonte: 'SEEG / GHG Protocol Brasil' },
  { setor: 'Outros', intensidade: 60, fonte: 'SEEG / GHG Protocol Brasil' },
];

export const DQS = {
  descricao: 'O DQS (DoubleDyn Quality Score, 0–1000) mede a eficiência carbônica da empresa frente à média do seu setor:',
  passos: [
    'Intensidade = emissões totais (tCO₂e) ÷ faturamento (R$ milhões)',
    'Razão = intensidade da empresa ÷ benchmark do setor',
    'Pontuação de intensidade (0–500): razão ≤ 0,3 → 500; escala decrescente até ≥ 2,0 → mínimo 20',
    'Pontuação de gestão (0–200): base 100 + 50 se energia renovável + 50 se política ESG',
    'Pontuação de compensação (0–300): % compensado × 300 (limitado a 100%)',
    'DQS = intensidade + gestão + compensação, limitado entre 50 e 1000',
  ],
  selos: [
    { nome: 'Ouro', faixa: '≥ 751' },
    { nome: 'Prata', faixa: '401 – 750' },
    { nome: 'Bronze', faixa: '≤ 400' },
  ],
};

export const LIMITACOES = [
  'Estimativas baseadas em médias nacionais e benchmarks setoriais — podem divergir da realidade específica da empresa.',
  'Escopos e fatores simplificados para triagem; classificação Escopo 3 é aproximada.',
  'Não substitui inventário formal (GHG Protocol / ISO 14064) nem relato regulatório (SBCE/CVM).',
  'A margem de +15% cobre incerteza de estimativa, não erros de dados informados.',
  'Fatores revisados periodicamente; versão e data de revisão publicadas acima.',
];
