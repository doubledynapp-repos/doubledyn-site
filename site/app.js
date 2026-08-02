// ===== DoubleDyn App.js — v3.0 (5 Melhorias CEO) =====

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initCalc();
    initCNPJLookup();
    initFaturamentoMask();
    initCounters();
    initReveal();
    initContactForm();
    initTooltips();
});

// ===== MÁSCARA CONTÁBIL FATURAMENTO =====
function initFaturamentoMask() {
    const input = document.getElementById('faturamento');
    if (!input) return;

    input.addEventListener('input', (e) => {
        let raw = e.target.value.replace(/\D/g, '');
        if (raw === '') { e.target.value = ''; return; }
        // Limitar a 15 dígitos (trilhões)
        if (raw.length > 15) raw = raw.slice(0, 15);
        // Converter para centavos
        let cents = parseInt(raw, 10);
        // Formatar como BRL
        let formatted = (cents / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2
        });
        e.target.value = formatted;
    });

    // Ao colar, também formatar
    input.addEventListener('paste', (e) => {
        setTimeout(() => {
            input.dispatchEvent(new Event('input'));
        }, 10);
    });
}

// Parsear valor formatado "R$ 10.000.000,00" → 10000000
function parseBRL(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const raw = el.value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(raw) || 0;
}

// ===== NAVBAR =====
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        toggle.classList.toggle('active');
    });

    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.classList.remove('active');
        });
    });
}

// ===== MÉDIAS SETORIAIS (tCO₂e/ano por funcionário) =====
const MEDIA_SETOR = {
    industria: 8.5,
    comercio: 2.1,
    servicos: 1.8,
    agro: 12.0,
    construcao: 6.5,
    logistica: 9.0,
    tecnologia: 1.2,
    saude: 3.5,
    alimenticio: 4.0,
    mineracao: 15.0,
    educacao: 1.5,
    outro: 3.0
};

// ===== MAPEAMENTO CNAE → SETOR DOUBLEDYN =====
const CNAE_TO_SETOR = {
    '01': 'agro', '02': 'agro', '03': 'agro',
    '05': 'mineracao', '06': 'mineracao', '07': 'mineracao', '08': 'mineracao', '09': 'mineracao',
    '10': 'alimenticio', '11': 'alimenticio', '12': 'alimenticio',
    '13': 'industria', '14': 'industria', '15': 'industria', '16': 'industria', '17': 'industria',
    '18': 'industria', '19': 'industria', '20': 'industria', '21': 'industria', '22': 'industria',
    '23': 'industria', '24': 'industria', '25': 'industria', '26': 'industria', '27': 'industria',
    '28': 'industria', '29': 'industria', '30': 'industria', '31': 'industria', '32': 'industria',
    '33': 'industria', '35': 'industria',
    '41': 'construcao', '42': 'construcao', '43': 'construcao',
    '45': 'comercio', '46': 'comercio', '47': 'comercio',
    '49': 'logistica', '50': 'logistica', '51': 'logistica', '52': 'logistica', '53': 'logistica',
    '62': 'tecnologia', '63': 'tecnologia',
    '85': 'educacao',
    '86': 'saude', '87': 'saude', '88': 'saude'
};

const PORTE_MAP = {
    'ME': 'Microempresa',
    'EPP': 'Empresa de Pequeno Porte',
    'DEMAIS': 'Médio/Grande Porte'
};

const RISCO_SETOR = {
    mineracao: { nivel: 'ALTO', msg: 'Mineração é um dos setores mais regulados. Emissão média de 15 tCO₂e/funcionário/ano.' },
    industria: { nivel: 'ALTO', msg: 'Indústria será diretamente afetada pelo SBCE. Emissão média de 8.5 tCO₂e/funcionário/ano.' },
    logistica: { nivel: 'ALTO', msg: 'Logística e transporte respondem por grande parte das emissões de Escopo 1.' },
    agro: { nivel: 'MODERADO', msg: 'Agronegócio tem alta exposição regulatória com o SBCE e COP30.' },
    construcao: { nivel: 'MODERADO', msg: 'Construção civil enfrenta novas exigências de certificação ambiental.' },
    alimenticio: { nivel: 'MODERADO', msg: 'Setor alimentício tem cadeia de frio e resíduos com alto impacto.' },
    saude: { nivel: 'MODERADO', msg: 'Hospitais e clínicas geram resíduos perigosos que exigem destinação certificada.' },
    comercio: { nivel: 'BAIXO', msg: 'Comércio tem menor exposição, mas exigências ESG de fornecedores crescem.' },
    servicos: { nivel: 'BAIXO', msg: 'Serviços têm impacto menor, mas empresas ESG ganham vantagem competitiva.' },
    tecnologia: { nivel: 'BAIXO', msg: 'TI tem baixa emissão, mas data centers e cloud têm pegada crescente.' },
    educacao: { nivel: 'BAIXO', msg: 'Instituições de ensino podem se beneficiar da certificação ambiental para captação.' },
    outro: { nivel: 'MODERADO', msg: 'Recomendamos uma avaliação personalizada do seu setor.' }
};

// ===== DADOS REAIS DE MERCADO (fontes verificáveis) =====
const DADOS_MERCADO = {
    pctGrandesEmpresasESG: 93,
    pctMetasReducao: 89,
    pctMercadoCapitaisCDP: 86,
    pctLogisticaInventario: 77,
    pctNetZeroAlinhado: 23,
    empresasGHGProtocol: 673,
    inventariosPublicados: 1300,
    empresasReguladasSBCE: 5000,
    precoCarbonEUETS: 80.56,
    markupCBAM2026: 0.10,
    cotacaoEURBRL: 6.10
};

// CBAM - Emissões embutidas médias por setor (tCO2e/tonelada de produto)
const CBAM_EMISSOES_EMBUTIDAS = {
    ferro_aco: 1.85,
    aluminio: 8.40,
    cimento: 0.62,
    fertilizantes: 2.90,
    hidrogenio: 9.00,
    outro: 1.50
};

// Dados setoriais específicos para comparativo
const DADOS_SETORIAIS = {
    logistica: { pct: 77, texto: 'das empresas de logística já possuem inventário GEE', fonte: 'ABOL 2025' },
    mineracao: { pct: 86, texto: 'do setor de mineração reporta ao CDP', fonte: 'CDP/IBRAM 2025' },
    industria: { pct: 89, texto: 'das indústrias já estabeleceram metas de redução', fonte: 'CDP 2025' },
    agro: { pct: 74, texto: 'do agronegócio de exportação já monitora emissões', fonte: 'CNA/SEEG 2024' },
    construcao: { pct: 65, texto: 'das construtoras buscam certificação LEED/AQUA', fonte: 'CBIC 2024' },
    alimenticio: { pct: 70, texto: 'do setor alimentício já monitora pegada de carbono', fonte: 'ABIA 2024' }
};

// ===== CNPJ RAIO-X =====
let _cnpjDebounceTimer = null;

function initCNPJLookup() {
    const cnpjInput = document.getElementById('cnpj');
    const btnBuscar = document.getElementById('btnBuscarCNPJ');
    if (!cnpjInput || !btnBuscar) return;

    // Máscara CNPJ + debounce auto-busca
    cnpjInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 14) v = v.slice(0, 14);
        if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
        else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
        else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
        else if (v.length > 2) v = v.replace(/^(\d{2})(\d{1,3})/, '$1.$2');
        e.target.value = v;

        // Auto-busca com debounce de 300ms
        const digits = v.replace(/\D/g, '');
        if (digits.length === 14) {
            clearTimeout(_cnpjDebounceTimer);
            _cnpjDebounceTimer = setTimeout(() => buscarCNPJ(digits), 300);
        }
    });

    btnBuscar.addEventListener('click', () => {
        const digits = cnpjInput.value.replace(/\D/g, '');
        if (digits.length === 14) buscarCNPJ(digits);
        else showCnpjHint('Digite os 14 dígitos do CNPJ', 'warn');
    });
}

function showCnpjHint(msg, type) {
    const hint = document.getElementById('cnpjHint');
    hint.textContent = msg;
    hint.className = 'cnpj-hint cnpj-hint-' + type;
    hint.style.display = 'block';
}

async function buscarCNPJ(cnpj) {
    const loading = document.getElementById('cnpjLoading');
    const raioxCard = document.getElementById('raioxCard');
    const hint = document.getElementById('cnpjHint');

    loading.style.display = 'flex';
    raioxCard.style.display = 'none';
    hint.style.display = 'none';

    try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        if (!res.ok) throw new Error(res.status === 404 ? 'CNPJ não encontrado' : 'Erro na consulta');
        const d = await res.json();

        loading.style.display = 'none';

        if (d.situacao_cadastral !== 'ATIVA' && d.descricao_situacao_cadastral !== 'ATIVA') {
            showCnpjHint('Empresa com situação: ' + (d.descricao_situacao_cadastral || d.situacao_cadastral), 'warn');
        }

        // Auto-preencher campos
        const nomeEmpresa = d.nome_fantasia || d.razao_social;
        document.getElementById('empresa').value = nomeEmpresa;

        const cidade = d.municipio ? (d.municipio + (d.uf ? ' - ' + d.uf : '')) : '';
        if (cidade) document.getElementById('cidade').value = cidade;

        // Mapear CNAE → Setor
        const cnaeCod = String(d.cnae_fiscal || '').slice(0, 2);
        const setorMapeado = CNAE_TO_SETOR[cnaeCod] || 'outro';
        const setorSelect = document.getElementById('setor');
        for (let opt of setorSelect.options) {
            if (opt.value === setorMapeado) { opt.selected = true; break; }
        }

        // Preencher Raio-X Card
        document.getElementById('raioxCompany').innerHTML = `
            <div class="raiox-company-name">${d.razao_social}</div>
            ${d.nome_fantasia ? `<div class="raiox-company-fantasy">${d.nome_fantasia}</div>` : ''}
            <div class="raiox-company-cnpj">CNPJ: ${cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}</div>
        `;

        const statusOk = d.situacao_cadastral === 'ATIVA' || d.descricao_situacao_cadastral === 'ATIVA';
        document.getElementById('raioxStatus').innerHTML = statusOk
            ? '<span class="status-ativa">ATIVA</span>'
            : `<span class="status-inativa">${d.descricao_situacao_cadastral || d.situacao_cadastral}</span>`;

        document.getElementById('raioxCnae').textContent = d.cnae_fiscal_descricao || 'Não informado';
        document.getElementById('raioxLocal').textContent = cidade || 'Não informado';
        document.getElementById('raioxPorte').textContent = PORTE_MAP[d.porte] || d.porte || 'Não informado';

        const anoInicio = d.data_inicio_atividade ? d.data_inicio_atividade.slice(0, 4) : '';
        if (anoInicio) {
            const anosOp = new Date().getFullYear() - parseInt(anoInicio);
            document.getElementById('raioxDesde').textContent = `${anoInicio} (${anosOp} anos)`;
        } else {
            document.getElementById('raioxDesde').textContent = 'Não informado';
        }

        // Alerta de risco setorial
        const risco = RISCO_SETOR[setorMapeado] || RISCO_SETOR.outro;
        const alertEl = document.getElementById('raioxAlert');
        const alertColors = { 'ALTO': '#e74c3c', 'MODERADO': '#f39c12', 'BAIXO': '#2ecc71' };
        alertEl.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${alertColors[risco.nivel]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Risco regulatório <strong style="color:${alertColors[risco.nivel]}">${risco.nivel}</strong> — ${risco.msg}</span>
        `;

        raioxCard.style.display = 'block';
        raioxCard.style.animation = 'fadeInUp 0.4s ease';

    } catch (err) {
        loading.style.display = 'none';
        showCnpjHint(err.message || 'Erro ao buscar CNPJ. Preencha manualmente.', 'error');
    }
}

// ===== CALCULADORA =====
function initCalc() {
    let currentStep = 1;
    const totalSteps = 6;
    const form = document.getElementById('calcForm');
    const btnNext = document.getElementById('btnNext');
    const btnPrev = document.getElementById('btnPrev');
    const btnSubmit = document.getElementById('btnSubmit');
    const progressBar = document.getElementById('progressBar');
    const resultDiv = document.getElementById('calcResult');
    const btnRecalc = document.getElementById('btnRecalc');

    function showStep(n) {
        currentStep = n;
        document.querySelectorAll('.calc-step').forEach(s => s.classList.remove('active'));
        const step = document.querySelector(`.calc-step[data-step="${n}"]`);
        if (step) step.classList.add('active');

        progressBar.style.setProperty('--progress', `${(n / totalSteps) * 100}%`);
        document.querySelectorAll('.progress-step').forEach(ps => {
            const sn = parseInt(ps.dataset.step);
            ps.classList.remove('active', 'done');
            if (sn === n) ps.classList.add('active');
            else if (sn < n) ps.classList.add('done');
        });

        btnPrev.style.display = n > 1 ? 'inline-flex' : 'none';
        btnNext.style.display = n < totalSteps ? 'inline-flex' : 'none';
        btnSubmit.style.display = n === totalSteps ? 'inline-flex' : 'none';

        // Scroll to top of calculator on step change
        const calcSection = document.getElementById('calculadora');
        if (calcSection) {
            setTimeout(() => {
                calcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }

    // Navegar clicando nos números dos steps (volta pra qualquer step já visitado)
    document.querySelectorAll('.progress-step').forEach(ps => {
        ps.style.cursor = 'pointer';
        ps.addEventListener('click', () => {
            const targetStep = parseInt(ps.dataset.step);
            if (targetStep && targetStep >= 1 && targetStep <= totalSteps) {
                showStep(targetStep);
            }
        });
    });

    // Toggle CBAM sector field based on exportaUE selection
    const exportaUESelect = document.getElementById('exportaUE');
    if (exportaUESelect) {
        exportaUESelect.addEventListener('change', () => {
            const cbamGroup = document.getElementById('setorCBAMGroup');
            if (cbamGroup) cbamGroup.style.display = exportaUESelect.value === 'sim' ? 'block' : 'none';
        });
    }

    // Validação dos campos obrigatórios do step atual
    function validateStep(step) {
        const stepEl = document.querySelector(`.calc-step[data-step="${step}"]`);
        if (!stepEl) return true;
        const requiredFields = stepEl.querySelectorAll('[required]');
        let valid = true;
        requiredFields.forEach(field => {
            if (!field.value || field.value.trim() === '') {
                field.classList.add('field-error');
                valid = false;
                field.addEventListener('input', () => field.classList.remove('field-error'), { once: true });
            } else {
                field.classList.remove('field-error');
            }
        });
        return valid;
    }

    btnNext.addEventListener('click', () => {
        if (!validateStep(currentStep)) return;
        if (currentStep < totalSteps) showStep(currentStep + 1);
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) showStep(currentStep - 1);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateStep(currentStep)) return;
        calculate();
    });

    // Fix: submit via click handler to bypass native validation on hidden required fields
    btnSubmit.addEventListener('click', (e) => {
        e.preventDefault();
        if (!validateStep(currentStep)) return;
        calculate();
    });

    btnRecalc.addEventListener('click', () => {
        resultDiv.style.display = 'none';
        form.style.display = 'block';
        document.querySelector('.calc-progress').style.display = 'block';
        document.querySelector('.calc-actions').style.display = 'flex';
        // Esconder Raio-X card ao recalcular
        const raioxCard = document.getElementById('raioxCard');
        if (raioxCard) raioxCard.style.display = 'none';
        showStep(1);
    });

    // ===== CÁLCULO COMPLETO =====
    function calculate() {
      try {
        // ====== FATORES DE EMISSÃO (GHG Protocol Brasil + IPCC) ======

        // Eletricidade
        const FATOR_ELETRICIDADE = 0.0817; // tCO2/MWh (grid BR 2024)

        // Combustíveis estacionários
        const FATOR_GLP = 2.983;        // kgCO2/kg
        const FATOR_GAS_NATURAL = 2.07; // kgCO2/m³
        const FATOR_DIESEL_EST = 2.603; // kgCO2/litro (gerador)
        const FATOR_LENHA = 1460;       // kgCO2/tonelada (biomassa não-renovável)

        // Combustíveis veiculares
        const FATOR_GASOLINA = 2.212;   // kgCO2/litro
        const FATOR_DIESEL = 2.603;     // kgCO2/litro
        const FATOR_ETANOL = 0.0;       // neutro (biocombustível)
        const FATOR_GNV = 2.07;         // kgCO2/m³

        // Viagens aéreas
        const FATOR_AEREO_DOM = 0.133;  // kgCO2/km/passageiro
        const FATOR_AEREO_INT = 0.102;  // kgCO2/km/passageiro
        const DIST_MEDIA_DOM = 1500;    // km trecho médio doméstico
        const DIST_MEDIA_INT = 8000;    // km trecho médio internacional

        // Outros
        const FATOR_AGUA = 0.708;       // kgCO2/m³ (tratamento + distribuição)
        const FATOR_PAPEL = 3.0;        // kgCO2/resma (500 folhas A4)
        const FATOR_AR_COND = 0.05;     // tCO2/unidade/ano (vazamento refrigerante R-410A)
        const FATOR_REFRIG = { nenhuma: 0, pequena: 0.5, media: 2.0, grande: 5.0 }; // tCO2/ano
        const FATOR_RESIDUOS = 0.5;     // tCO2/tonelada aterro
        const FATOR_RESIDUOS_PERIG = 1.2; // kgCO2/kg (incineração perigosos)

        // ====== LEITURA DOS INPUTS ======

        // Step 1: Empresa
        const empresa = document.getElementById('empresa').value || 'Sua Empresa';
        const setor = document.getElementById('setor').value || 'outro';
        const funcionarios = parseFloat(document.getElementById('funcionarios').value) || 1;

        // Step 2: Energia
        const eletricidade = v('eletricidade');
        const fonteEnergia = document.getElementById('fonteEnergia').value;
        const glp = v('glp');
        const gasNatural = v('gasNatural');
        const dieselGerador = v('dieselGerador');
        const lenha = v('lenha');

        // Step 3: Frota
        const gasolinaLitros = v('gasolinaLitros');
        const dieselLitros = v('dieselLitros');
        const etanolLitros = v('etanolLitros');
        const gnvM3 = v('gnvM3');
        const viagensDom = v('viagensDomesticas');
        const viagensInt = v('viagensInternacionais');

        // Step 4: Instalações
        const aguaM3 = v('aguaM3');
        const arCondicionado = v('arCondicionado');
        const refrigeracao = document.getElementById('refrigeracao').value;
        const papelResmas = v('papelResmas');

        // Step 5: Resíduos
        const residuos = v('residuos');
        const reciclagem = v('reciclagem');
        const residuosPerigosos = v('residuosPerigosos');

        // ====== CÁLCULOS POR CATEGORIA (tCO2e/ano) ======

        // --- ENERGIA ---
        let fatorEletrico = FATOR_ELETRICIDADE;
        if (fonteEnergia === 'solar' || fonteEnergia === 'eolica') fatorEletrico *= 0.05;
        else if (fonteEnergia === 'biomassa') fatorEletrico *= 0.15;
        else if (fonteEnergia === 'misto') fatorEletrico *= 0.55;

        const emEletricidade = (eletricidade / 1000) * fatorEletrico * 12;
        const emGLP = (glp * FATOR_GLP / 1000) * 12;
        const emGasNatural = (gasNatural * FATOR_GAS_NATURAL / 1000) * 12;
        const emDieselGerador = (dieselGerador * FATOR_DIESEL_EST / 1000) * 12;
        const emLenha = (lenha * FATOR_LENHA / 1000) * 12;
        const emissaoEnergia = emEletricidade + emGLP + emGasNatural + emDieselGerador + emLenha;

        // --- TRANSPORTE ---
        const emGasolina = (gasolinaLitros * FATOR_GASOLINA / 1000) * 12;
        const emDieselFrota = (dieselLitros * FATOR_DIESEL / 1000) * 12;
        const emEtanol = (etanolLitros * FATOR_ETANOL / 1000) * 12;
        const emGNV = (gnvM3 * FATOR_GNV / 1000) * 12;
        const emAereoDom = (viagensDom * DIST_MEDIA_DOM * FATOR_AEREO_DOM) / 1000;
        const emAereoInt = (viagensInt * DIST_MEDIA_INT * FATOR_AEREO_INT) / 1000;
        const emissaoTransporte = emGasolina + emDieselFrota + emEtanol + emGNV + emAereoDom + emAereoInt;

        // --- INSTALAÇÕES ---
        const homeOffice = v('homeOffice') / 100; // 0 a 1
        const fatorPresencial = 1 - (homeOffice * 0.7); // Home office reduz até 70% das emissões de instalações
        const emAgua = (aguaM3 * FATOR_AGUA / 1000) * 12 * fatorPresencial;
        const emAr = arCondicionado * FATOR_AR_COND * fatorPresencial;
        const emRefrig = FATOR_REFRIG[refrigeracao] || 0;
        const emPapel = (papelResmas * FATOR_PAPEL / 1000) * 12 * fatorPresencial;
        const emissaoInstalacoes = emAgua + emAr + emRefrig + emPapel;

        // --- RESÍDUOS ---
        const emResiduosSolidos = (residuos * (1 - reciclagem / 100) * FATOR_RESIDUOS) * 12;
        const emResiduosPerig = (residuosPerigosos * FATOR_RESIDUOS_PERIG / 1000) * 12;
        const emissaoResiduos = emResiduosSolidos + emResiduosPerig;

        // --- TOTAL & MARGEM DE SEGURANÇA ---
        const emissaoBase = emissaoEnergia + emissaoTransporte + emissaoInstalacoes + emissaoResiduos;
        const margemSeguranca = emissaoBase * 0.15; // 15% de margem para Escopo 3 Indireto não mapeado
        const totalEmissao = emissaoBase + margemSeguranca;

        // --- IMPACTO EMOCIONAL (Árvores) ---
        const arvoresPreservadas = Math.round(totalEmissao * 6.25);

        // ====== CUSTOS DO MERCADO TRADICIONAL ======
        const custoTradicional = 8500 + (totalEmissao * 120);

        // ====== MELHORIA 1: SELO DE RISCO REGULATÓRIO ======
        let risco, riscoCor, riscoMsg;
        if (totalEmissao < 10) {
            risco = 'BAIXO';
            riscoCor = '#2ecc71';
            riscoMsg = 'está em conformidade básica, mas a regulamentação pode endurecer.';
        } else if (totalEmissao < 50) {
            risco = 'MODERADO';
            riscoCor = '#f1c40f';
            riscoMsg = 'precisa de atenção — novas regras podem exigir compensação obrigatória.';
        } else if (totalEmissao < 200) {
            risco = 'ALTO';
            riscoCor = '#e67e22';
            riscoMsg = 'corre risco real de multas e restrições a partir de 2027.';
        } else {
            risco = 'CRÍTICO';
            riscoCor = '#e74c3c';
            riscoMsg = 'pode enfrentar multas severas, perda de contratos e restrições operacionais.';
        }

        const riskBadge = document.getElementById('riskBadge');
        riskBadge.className = 'risk-badge risk-' + risco.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        riskBadge.style.setProperty('--risk-color', riscoCor);
        document.getElementById('riskLevel').textContent = 'RISCO REGULATÓRIO: ' + risco;
        document.getElementById('riskDesc').textContent = 'Com a Lei SBCE (15.042/2024), sua empresa ' + riscoMsg;

        // ====== ÍNDICE DE EXPOSIÇÃO AO SBCE (0-10) ======
        const faturamento = parseBRL('faturamento');
        const exportaUE = document.getElementById('exportaUE').value;
        const jaFazInventario = document.getElementById('jaFazInventario').value;
        const setorCBAM = document.getElementById('setorCBAM').value;

        // Calcular score de exposição
        let exposureScore = 0;

        // Fator 1: Emissão total vs limites SBCE (peso 3)
        if (totalEmissao >= 25000) exposureScore += 3.0;
        else if (totalEmissao >= 10000) exposureScore += 2.5;
        else if (totalEmissao >= 5000) exposureScore += 2.0;
        else if (totalEmissao >= 1000) exposureScore += 1.5;
        else if (totalEmissao >= 100) exposureScore += 0.8;
        else exposureScore += 0.3;

        // Fator 2: Setor de risco (peso 2)
        const setorRiscoMap = { mineracao: 2.0, industria: 1.8, logistica: 1.8, agro: 1.5, construcao: 1.3, alimenticio: 1.2, saude: 1.0, comercio: 0.6, servicos: 0.5, tecnologia: 0.4, educacao: 0.3, outro: 1.0 };
        exposureScore += setorRiscoMap[setor] || 1.0;

        // Fator 3: Exporta pra UE? (peso 2)
        if (exportaUE === 'sim') exposureScore += 2.0;

        // Fator 4: Já faz inventário? (peso 1.5)
        if (jaFazInventario === 'nao') exposureScore += 1.5;

        // Fator 5: Porte / Faturamento (peso 1.5)
        if (faturamento >= 50000000) exposureScore += 1.5;
        else if (faturamento >= 10000000) exposureScore += 1.0;
        else if (faturamento >= 1000000) exposureScore += 0.5;

        // Normalizar para 0-10
        exposureScore = Math.min(10, Math.max(0, parseFloat(exposureScore.toFixed(1))));

        // Multa potencial (Lei 15.042/2024 — 3% do faturamento bruto)
        const multaPotencial = faturamento * 0.03;

        // CBAM
        let custoCBAM = 0;
        if (exportaUE === 'sim') {
            const emissaoEmbutida = CBAM_EMISSOES_EMBUTIDAS[setorCBAM] || 1.50;
            custoCBAM = totalEmissao * DADOS_MERCADO.precoCarbonEUETS * DADOS_MERCADO.cotacaoEURBRL;
            if (jaFazInventario === 'nao') custoCBAM *= (1 + DADOS_MERCADO.markupCBAM2026);
        }

        // ====== RENDERIZAR PAINEL DE EXPOSIÇÃO ======
        const exposurePanel = document.getElementById('riskExposurePanel');
        if (exposurePanel) {
            // Score value + bar
            document.getElementById('exposureScoreValue').textContent = exposureScore.toFixed(1);
            const exposurePct = (exposureScore / 10) * 100;
            document.getElementById('exposureBarFill').style.width = exposurePct + '%';
            document.getElementById('exposureBarPointer').style.left = exposurePct + '%';

            // Color based on score
            let exposureColor;
            if (exposureScore <= 3) exposureColor = '#2ecc71';
            else if (exposureScore <= 5) exposureColor = '#f1c40f';
            else if (exposureScore <= 7) exposureColor = '#e67e22';
            else exposureColor = '#e74c3c';
            document.getElementById('exposureBarFill').style.background = exposureColor;
            document.getElementById('exposureScoreValue').style.color = exposureColor;

            // Compliance seal
            const sealEl = document.getElementById('complianceSeal');
            if (exposureScore >= 6) {
                document.getElementById('sealIcon').textContent = '⚠️';
                document.getElementById('sealText').textContent = 'NÃO CONFORME — AÇÃO NECESSÁRIA';
                sealEl.className = 'compliance-seal seal-danger';
            } else if (exposureScore >= 4) {
                document.getElementById('sealIcon').textContent = '🔶';
                document.getElementById('sealText').textContent = 'EM RISCO — ADEQUAÇÃO RECOMENDADA';
                sealEl.className = 'compliance-seal seal-warning';
            } else {
                document.getElementById('sealIcon').textContent = '✅';
                document.getElementById('sealText').textContent = 'BAIXO RISCO — MANTER MONITORAMENTO';
                sealEl.className = 'compliance-seal seal-ok';
            }

            // Multa
            if (faturamento > 0) {
                document.getElementById('multaPotencialValue').textContent = formatBRL(multaPotencial);
                document.getElementById('multaPotencialDetail').textContent = `Até 3% de ${formatBRL(faturamento)} (Lei 15.042/2024, Art. 29)`;
            } else {
                document.getElementById('multaPotencialValue').textContent = 'Informe o faturamento';
                document.getElementById('multaPotencialDetail').textContent = 'Multa pode chegar a 3% do faturamento bruto anual';
            }

            // CBAM
            const cbamCard = document.getElementById('cbamCard');
            if (exportaUE === 'sim') {
                cbamCard.style.display = 'block';
                document.getElementById('cbamValue').textContent = formatBRL(custoCBAM);
                const markupText = jaFazInventario === 'nao' ? ' (inclui markup +10% por falta de dados verificados)' : '';
                document.getElementById('cbamDetail').textContent = `Baseado em €${DADOS_MERCADO.precoCarbonEUETS}/tCO₂ × ${totalEmissao.toFixed(0)} tCO₂e${markupText}`;
            } else {
                cbamCard.style.display = 'none';
            }

            // Obrigações SBCE
            const oblRelato = document.getElementById('obligationRelato');
            const oblConciliacao = document.getElementById('obligationConciliacao');
            if (totalEmissao >= 10000) {
                oblRelato.style.display = 'flex';
                if (totalEmissao >= 25000) oblConciliacao.style.display = 'flex';
                else oblConciliacao.style.display = 'none';
            } else {
                oblRelato.style.display = 'none';
                oblConciliacao.style.display = 'none';
            }

            // Comparativo setorial
            const bulletSetorial = document.getElementById('bulletSetorial');
            const dadoSetor = DADOS_SETORIAIS[setor];
            if (dadoSetor) {
                bulletSetorial.style.display = 'flex';
                document.getElementById('bulletSetorialPct').textContent = dadoSetor.pct + '%';
                document.getElementById('bulletSetorialText').innerHTML = dadoSetor.texto + ' <span class="bullet-source">(' + dadoSetor.fonte + ')</span>';
            } else {
                bulletSetorial.style.display = 'none';
            }
        }

        // ====== MELHORIA 2: ÍNDICE DE DESPERDÍCIO AMBIENTAL ======
        // Compara emissão per capita da empresa vs média do setor
        const mediaPerCapita = MEDIA_SETOR[setor] || 3.0; // tCO2e/ano por funcionário
        const emissaoPerCapita = totalEmissao / Math.max(funcionarios, 1);
        const ratio = emissaoPerCapita / Math.max(mediaPerCapita, 0.1);

        // Escala logarítmica calibrada:
        // ratio 0.25 (75% abaixo da média) → índice ~2.0 (Bom)
        // ratio 0.5  (50% abaixo da média) → índice ~3.5 (Bom)
        // ratio 1.0  (igual à média)       → índice  5.0 (Atenção)
        // ratio 2.0  (dobro da média)      → índice ~6.5 (Alto)
        // ratio 4.0+ (4x a média)          → índice ~8.0+ (Crítico)
        let indiceDesperdicio;
        if (ratio <= 0) {
            indiceDesperdicio = 0;
        } else {
            indiceDesperdicio = Math.min(10, Math.max(0,
                parseFloat((5 + (Math.log2(ratio) * 2.15)).toFixed(1))
            ));
        }

        let classDesperdicio;
        if (indiceDesperdicio <= 3) classDesperdicio = 'Bom';
        else if (indiceDesperdicio <= 5) classDesperdicio = 'Atenção';
        else if (indiceDesperdicio <= 7) classDesperdicio = 'Alto';
        else classDesperdicio = 'Crítico';

        document.getElementById('wasteIndexValue').textContent = indiceDesperdicio.toFixed(1);
        document.getElementById('wasteIndexClass').textContent = classDesperdicio;
        const pointerPct = (indiceDesperdicio / 10) * 100;
        document.getElementById('wasteIndexPointer').style.left = pointerPct + '%';
        document.getElementById('wasteIndexFill').style.width = pointerPct + '%';

        // Cor do card de desperdício
        const wasteCard = document.getElementById('wasteIndexCard');
        if (indiceDesperdicio <= 3) wasteCard.setAttribute('data-level', 'bom');
        else if (indiceDesperdicio <= 5) wasteCard.setAttribute('data-level', 'atencao');
        else if (indiceDesperdicio <= 7) wasteCard.setAttribute('data-level', 'alto');
        else wasteCard.setAttribute('data-level', 'critico');

        // Descrição dinâmica com comparativo per capita
        const pctVsMedia = Math.round((ratio - 1) * 100);
        let descComparativo;
        if (pctVsMedia <= -30) descComparativo = `Sua empresa emite ${emissaoPerCapita.toFixed(1)} tCO₂e/funcionário — ${Math.abs(pctVsMedia)}% abaixo da média do setor (${mediaPerCapita} t). Excelente!`;
        else if (pctVsMedia <= 10) descComparativo = `Sua empresa emite ${emissaoPerCapita.toFixed(1)} tCO₂e/funcionário — próximo da média do setor (${mediaPerCapita} t).`;
        else if (pctVsMedia <= 100) descComparativo = `Sua empresa emite ${emissaoPerCapita.toFixed(1)} tCO₂e/funcionário — ${pctVsMedia}% acima da média do setor (${mediaPerCapita} t).`;
        else descComparativo = `Sua empresa emite ${emissaoPerCapita.toFixed(1)} tCO₂e/funcionário — ${pctVsMedia}% acima da média do setor (${mediaPerCapita} t). Ação urgente recomendada.`;
        document.getElementById('wasteIndexDesc').textContent = descComparativo;

        // ====== EXIBIR RESULTADO ======
        form.style.display = 'none';
        document.querySelector('.calc-progress').style.display = 'none';
        document.querySelector('.calc-actions').style.display = 'none';
        resultDiv.style.display = 'block';

        document.getElementById('resultEmpresa').textContent = empresa;
        animateNumber('resultTotal', totalEmissao, 1);
        animateNumber('arvoresCount', arvoresPreservadas, 0);

        // Breakdown bars (4 categorias)
        const maxVal = Math.max(emissaoEnergia, emissaoTransporte, emissaoInstalacoes, emissaoResiduos, 0.1);
        
        setBr('barEnergia', 'valEnergia', emissaoEnergia, maxVal);
        setBr('barTransporte', 'valTransporte', emissaoTransporte, maxVal);
        setBr('barInstalacoes', 'valInstalacoes', emissaoInstalacoes, maxVal);
        setBr('barResiduos', 'valResiduos', emissaoResiduos, maxVal);

        // Costs
        document.getElementById('custoSem').textContent = formatBRL(custoTradicional);

        // ====== MELHORIA 3: PROJEÇÃO DE CUSTO DA INAÇÃO (5 ANOS) ======
        const custoAnual = custoTradicional;
        const projecao = [custoAnual]; // Ano 0 (atual) incluído
        for (let i = 1; i <= 5; i++) {
            projecao.push(custoAnual * Math.pow(1.15, i));
        }
        const custoTotal5Anos = projecao.reduce((a, b) => a + b, 0);

        const timelineEl = document.getElementById('projectionTimeline');
        timelineEl.innerHTML = '';
        const maxProj = projecao[projecao.length - 1]; // Ano 5 é o maior
        projecao.forEach((val, i) => {
            const pct = (val / maxProj) * 100;
            const yearEl = document.createElement('div');
            yearEl.className = 'projection-year';
            yearEl.innerHTML = `
                <span class="projection-year-label">${i === 0 ? 'Atual' : 'Ano ' + i}</span>
                <div class="projection-bar-track">
                    <div class="projection-bar-fill" style="width: ${pct}%"></div>
                </div>
                <span class="projection-year-value">${formatBRL(val)}</span>
            `;
            timelineEl.appendChild(yearEl);
        });
        document.getElementById('projectionTotalValue').textContent = formatBRL(custoTotal5Anos);

        // ====== MELHORIA 4: MINI-INSIGHT ESTRATÉGICO ======
        const categorias = [
            { nome: 'Energia', valor: emissaoEnergia, icone: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', insight: 'Sua principal oportunidade de redução está no consumo de energia. Empresas similares conseguiram reduzir até 20% com auditoria energética e migração para fontes renováveis.' },
            { nome: 'Frota', valor: emissaoTransporte, icone: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>', insight: 'Sua frota é o maior emissor. A substituição gradual por veículos flex ou elétricos pode reduzir até 35% das emissões de transporte.' },
            { nome: 'Instalações', valor: emissaoInstalacoes, icone: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/></svg>', insight: 'Suas instalações têm alto potencial de otimização. Retrofit de climatização e eficiência hídrica podem reduzir até 25% das emissões.' },
            { nome: 'Resíduos', valor: emissaoResiduos, icone: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>', insight: 'A gestão de resíduos é seu ponto crítico. Programas estruturados de reciclagem e compostagem podem reduzir até 40% das emissões nesta categoria.' }
        ];
        const maiorCategoria = categorias.sort((a, b) => b.valor - a.valor)[0];
        document.getElementById('insightIcon').innerHTML = maiorCategoria.icone;
        document.getElementById('insightText').textContent = maiorCategoria.insight;

        // ====== COLETA DE TODOS OS DADOS ======
        const nomeContato = document.getElementById('nomeContato').value || '';
        const emailContato = document.getElementById('emailContato').value || '';
        const telefone = document.getElementById('telefone').value || '';
        const cargoContato = document.getElementById('cargo').value || '';
        const cnpj = document.getElementById('cnpj').value || '';
        const areaM2 = document.getElementById('areaM2').value || '';
        const cidade = document.getElementById('cidade').value || '';
        const fonteEnergiaLabel = document.getElementById('fonteEnergia').selectedOptions[0].text;
        const tratamentoAgua = document.getElementById('tratamentoAgua').selectedOptions[0].text;
        const refrigeracaoLabel = document.getElementById('refrigeracao').selectedOptions[0].text;
        const destinacao = document.getElementById('destinacao').selectedOptions[0].text;
        const certificacao = document.getElementById('certificacao').selectedOptions[0].text;
        const compensaAtual = document.getElementById('compensaAtual').selectedOptions[0].text;

        // Função auxiliar pra só mostrar se tiver valor
        function ln(emoji, label, val, unit) {
            const n = parseFloat(val);
            if (!n || n === 0) return '';
            return `${emoji} ${label}: ${val} ${unit || ''}`;
        }

        // ====== WHATSAPP COM DADOS COMPLETOS ======
        const waMsg = [
            `*RELATÓRIO DoubleDyn - Impacto Ambiental*`,
            ``,
            `━━━ DADOS DA EMPRESA ━━━`,
            `- *Empresa:* ${empresa}`,
            cnpj ? `- *CNPJ:* ${cnpj}` : '',
            `- *Setor:* ${setor}`,
            `- *Funcionários:* ${funcionarios}`,
            areaM2 ? `- *Área:* ${areaM2} m²` : '',
            cidade ? `- *Cidade:* ${cidade}` : '',
            ``,
            `━━━ CONTATO ━━━`,
            `- *Nome:* ${nomeContato}`,
            `- *Email:* ${emailContato}`,
            telefone ? `- *WhatsApp:* ${telefone}` : '',
            cargoContato ? `- *Cargo:* ${cargoContato}` : '',
            ``,
            `━━━ ENERGIA (Escopo 2) ━━━`,
            ln('-', 'Eletricidade', eletricidade, 'kWh/mês'),
            `- *Fonte:* ${fonteEnergiaLabel}`,
            ``,
            `━━━ FROTA (Escopo 1) ━━━`,
            ln('-', 'Gasolina', gasolinaLitros, 'L/mês'),
            ln('-', 'Diesel', dieselLitros, 'L/mês'),
            ln('-', 'Etanol', etanolLitros, 'L/mês'),
            ln('-', 'GNV', gnvM3, 'm³/mês'),
            ln('-', 'Voos Dom.', viagensDom, 'viagens/ano'),
            ln('-', 'Voos Int.', viagensInt, 'viagens/ano'),
            ``,
            `━━━ INSTALAÇÕES (Escopo 1) ━━━`,
            ln('-', 'GLP', glp, 'kg/mês'),
            ln('-', 'Gás Natural', gasNatural, 'm³/mês'),
            ln('-', 'Diesel Gerador', dieselGerador, 'L/mês'),
            ln('-', 'Lenha', lenha, 'ton/mês'),
            ln('-', 'Água', aguaM3, 'm³/mês'),
            `- *Esgoto:* ${tratamentoAgua}`,
            ln('-', 'Ar Condicionado', arCondicionado, 'unids'),
            `- *Câmaras Frias:* ${refrigeracaoLabel}`,
            ln('-', 'Papel', papelResmas, 'resmas/mês'),
            ln('-', 'Home Office', v('homeOffice'), '%'),
            ``,
            `━━━ RESÍDUOS (Escopo 3) ━━━`,
            ln('-', 'Resíduos', residuos, 'ton/mês'),
            ln('-', 'Reciclado', reciclagem, '%'),
            `- *Destinação:* ${destinacao}`,
            ln('-', 'Perigosos', residuosPerigosos, 'kg/mês'),
            `- *Certificação:* ${certificacao}`,
            `- *Já compensa:* ${compensaAtual}`,
            ``,
            `━━━ EXPOSIÇÃO REGULATÓRIA ━━━`,
            `> *Índice de Exposição SBCE:* ${exposureScore.toFixed(1)}/10`,
            faturamento > 0 ? `> *Multa Potencial (Lei 15.042):* ${formatBRL(multaPotencial)}` : '',
            exportaUE === 'sim' ? `> *Taxa CBAM (UE):* ${formatBRL(custoCBAM)}` : '',
            `> *Faz Inventário:* ${jaFazInventario === 'sim' ? 'Sim' : 'Não'}`,
            exportaUE === 'sim' ? `> *Exporta UE:* Sim (${setorCBAM})` : '',
            ``,
            `━━━ RESULTADO ━━━`,
            `> *Risco Regulatório:* ${risco}`,
            `> *Índice de Desperdício:* ${indiceDesperdicio.toFixed(1)}/10 (${classDesperdicio})`,
            `> *Emissões Base:* ${emissaoBase.toFixed(1)} tCO2e`,
            `> *Margem de Segurança Escopo 3:* +${margemSeguranca.toFixed(1)} tCO2e`,
            `> *IMPACTO TOTAL:* *${totalEmissao.toFixed(1)} tCO2e/ano*`,
            `> *Impacto Equivalente:* Preservação de ~${arvoresPreservadas} árvores`,
            `> *Maior Emissor:* ${maiorCategoria.nome}`,
            ``,
            `━━━ FINANCEIRO ━━━`,
            `> Mercado Tradicional (Consultoria Inventário + Créditos): ${formatBRL(custoTradicional)}`,
            `> Projeção 5 anos (inação): ${formatBRL(custoTotal5Anos)}`,
            `> Pacote DoubleDyn (Relatório Automatizado + Créditos Tokenizados): *Sob Consulta*`,
            `> *Economia Estimada: Até 70%*`,
            ``,
            `Gostaria de agendar uma Call de Diagnóstico com um especialista para analisar esse cenário.`,
        ].filter(l => l !== '').join('\n');

        // ====== MELHORIA 5: LINK WHATSAPP NO CTA ======
        const waURL = `https://wa.me/5511924526590?text=${encodeURIComponent(waMsg)}`;
        const btnWA = document.getElementById('btnWhatsAppCTA');
        if (btnWA) btnWA.href = waURL;

        // Salvar dados no LocalStorage para a página de Agendamento (Reserva Pix)
        localStorage.setItem('ddyn_empresa', empresa);
        localStorage.setItem('ddyn_wa_msg', waMsg);

        // ====== ENVIAR LEAD COMPLETO POR EMAIL (Formsubmit) ======
        const leadData = new FormData();
        // Contato
        leadData.append('01_EMPRESA', empresa);
        leadData.append('02_CNPJ', cnpj || '-');
        leadData.append('03_SETOR', setor);
        leadData.append('04_FUNCIONARIOS', funcionarios);
        leadData.append('05_AREA_M2', areaM2 || '-');
        leadData.append('06_CIDADE', cidade || '-');
        leadData.append('07_CONTATO_NOME', nomeContato);
        leadData.append('08_CONTATO_EMAIL', emailContato);
        leadData.append('09_CONTATO_WHATSAPP', telefone || '-');
        leadData.append('10_CONTATO_CARGO', cargoContato || '-');
        // Energia
        leadData.append('11_ELETRICIDADE_KWH', eletricidade + ' kWh/mês');
        leadData.append('12_FONTE_ENERGIA', fonteEnergiaLabel);
        leadData.append('13_GLP_KG', glp + ' kg/mês');
        leadData.append('14_GAS_NATURAL_M3', gasNatural + ' m³/mês');
        leadData.append('15_DIESEL_GERADOR_L', dieselGerador + ' L/mês');
        leadData.append('16_LENHA_TON', lenha + ' ton/mês');
        // Frota
        leadData.append('17_GASOLINA_L', gasolinaLitros + ' L/mês');
        leadData.append('18_DIESEL_FROTA_L', dieselLitros + ' L/mês');
        leadData.append('19_ETANOL_L', etanolLitros + ' L/mês');
        leadData.append('20_GNV_M3', gnvM3 + ' m³/mês');
        leadData.append('21_VEICULOS', v('numVeiculos'));
        leadData.append('22_KM_MES', v('kmMes') + ' km');
        leadData.append('23_VOOS_DOMESTICOS', viagensDom + ' trechos/ano');
        leadData.append('24_VOOS_INTERNACIONAIS', viagensInt + ' trechos/ano');
        // Instalações
        leadData.append('25_AGUA_M3', aguaM3 + ' m³/mês');
        leadData.append('26_TRATAMENTO_EFLUENTES', tratamentoAgua);
        leadData.append('27_AR_CONDICIONADO', arCondicionado + ' unidades');
        leadData.append('28_REFRIGERACAO', refrigeracaoLabel);
        leadData.append('29_PAPEL_RESMAS', papelResmas + ' resmas/mês');
        leadData.append('30_HOME_OFFICE', v('homeOffice') + '%');
        // Resíduos
        leadData.append('31_RESIDUOS_TON', residuos + ' ton/mês');
        leadData.append('32_RECICLAGEM', reciclagem + '%');
        leadData.append('33_DESTINACAO', destinacao);
        leadData.append('34_RESIDUOS_PERIGOSOS', residuosPerigosos + ' kg/mês');
        leadData.append('35_CERTIFICACAO', certificacao);
        leadData.append('36_JA_COMPENSA', compensaAtual);
        // Resultados
        leadData.append('37_EMISSAO_TOTAL', totalEmissao.toFixed(1) + ' tCO2e/ano');
        leadData.append('38_EMISSAO_ENERGIA', emissaoEnergia.toFixed(1) + ' t');
        leadData.append('39_EMISSAO_TRANSPORTE', emissaoTransporte.toFixed(1) + ' t');
        leadData.append('40_EMISSAO_INSTALACOES', emissaoInstalacoes.toFixed(1) + ' t');
        leadData.append('41_EMISSAO_RESIDUOS', emissaoResiduos.toFixed(1) + ' t');
        leadData.append('42_CUSTO_MERCADO_TRADICIONAL', formatBRL(custoTradicional));
        leadData.append('43_PACOTE_DOUBLEDYN', 'Sob consulta');
        leadData.append('44_RISCO_REGULATORIO', risco);
        leadData.append('45_INDICE_DESPERDICIO', indiceDesperdicio.toFixed(1) + '/10 (' + classDesperdicio + ')');
        leadData.append('46_PROJECAO_5_ANOS', formatBRL(custoTotal5Anos));
        leadData.append('47_MAIOR_EMISSOR', maiorCategoria.nome);
        leadData.append('48_INDICE_EXPOSICAO_SBCE', exposureScore.toFixed(1) + '/10');
        leadData.append('49_FATURAMENTO', faturamento > 0 ? formatBRL(faturamento) : '-');
        leadData.append('50_MULTA_POTENCIAL', faturamento > 0 ? formatBRL(multaPotencial) : '-');
        leadData.append('51_EXPORTA_UE', exportaUE);
        leadData.append('52_CBAM', exportaUE === 'sim' ? formatBRL(custoCBAM) : 'N/A');
        leadData.append('53_FAZ_INVENTARIO', jaFazInventario);
        // Config Formsubmit
        leadData.append('_subject', '🌿 LEAD Calculadora - ' + empresa);
        leadData.append('_template', 'table');
        leadData.append('_captcha', 'false');

        fetch('https://formsubmit.co/ajax/DoubleDynaapp@gmail.com', {
            method: 'POST',
            body: leadData
        }).then(res => {
            if (!res.ok) console.warn('[DoubleDyn] Falha ao enviar lead por email:', res.status);
        }).catch(err => {
            console.warn('[DoubleDyn] Erro ao enviar lead por email:', err.message);
        });

        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {
        console.error('[DoubleDyn] Erro no cálculo:', err);
        alert('Erro ao calcular. Por favor tente novamente.');
      }
    }

    function v(id) {
        return parseFloat(document.getElementById(id).value) || 0;
    }

    function setBr(barId, valId, val, maxVal) {
        document.getElementById(barId).style.setProperty('--pct', `${(val / maxVal) * 100}%`);
        document.getElementById(valId).textContent = val.toFixed(1) + ' t';
    }
}

function animateNumber(id, target, decimals) {
    const el = document.getElementById(id);
    const duration = 1500;
    const start = performance.now();
    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function formatBRL(val) {
    return 'R$ ' + val.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ===== COUNTERS =====
function initCounters() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('[data-count]').forEach(c => {
                    const target = parseInt(c.dataset.count);
                    const duration = 2000;
                    const start = performance.now();
                    function update(now) {
                        const p = Math.min((now - start) / duration, 1);
                        c.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
                        if (p < 1) requestAnimationFrame(update);
                    }
                    requestAnimationFrame(update);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) observer.observe(statsSection);
}

// ===== REVEAL ON SCROLL =====
function initReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

// ===== CONTACT FORM =====
function initContactForm() {
    // Contact form uses native Formsubmit.co action (POST redirect)
    // No JS override needed - the form submits to Formsubmit and redirects back
}

// ===== TOOLTIPS (mobile tap support) =====
function initTooltips() {
    document.querySelectorAll('.tooltip-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            // Close all other tooltips
            document.querySelectorAll('.tooltip-trigger.tooltip-active').forEach(t => {
                if (t !== trigger) t.classList.remove('tooltip-active');
            });
            trigger.classList.toggle('tooltip-active');
        });
    });
    // Close tooltips when clicking elsewhere
    document.addEventListener('click', () => {
        document.querySelectorAll('.tooltip-trigger.tooltip-active').forEach(t => {
            t.classList.remove('tooltip-active');
        });
    });
}

// ===== PRÉ-RELATÓRIO INLINE =====
document.addEventListener('DOMContentLoaded', () => {
    const btnAgendar = document.getElementById('btnAgendarConsultoria');
    if (!btnAgendar) return;

    btnAgendar.addEventListener('click', () => {
        const preReport = document.getElementById('preReportSection');
        if (!preReport) return;

        // Preencher dados dinâmicos do pré-relatório
        const empresa = document.getElementById('resultEmpresa').textContent;
        const total = document.getElementById('resultTotal').textContent;
        const arvores = document.getElementById('arvoresCount').textContent;
        const risco = document.getElementById('riskLevel').textContent;
        const desperdicio = document.getElementById('wasteIndexValue').textContent;
        const desperdicioClass = document.getElementById('wasteIndexClass').textContent;
        const desperdicioDesc = document.getElementById('wasteIndexDesc').textContent;
        const insight = document.getElementById('insightText').textContent;
        const custoTradicional = document.getElementById('custoSem').textContent;
        const custoProjecao = document.getElementById('projectionTotalValue').textContent;

        // Breakdown
        const valEnergia = document.getElementById('valEnergia').textContent;
        const valTransporte = document.getElementById('valTransporte').textContent;
        const valInstalacoes = document.getElementById('valInstalacoes').textContent;
        const valResiduos = document.getElementById('valResiduos').textContent;

        // Data atual
        const now = new Date();
        const dataRelatorio = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

        // Preencher campos
        document.getElementById('prEmpresa').textContent = empresa;
        document.getElementById('prData').textContent = dataRelatorio;
        document.getElementById('prTotal').textContent = total + ' tCO\u2082e/ano';
        document.getElementById('prArvores').textContent = arvores + ' \u00e1rvores';
        document.getElementById('prRisco').textContent = risco.replace('RISCO REGULAT\u00d3RIO: ', '');
        document.getElementById('prDesperdicio').textContent = desperdicio + '/10 (' + desperdicioClass + ')';
        document.getElementById('prDesperdicioDesc').textContent = desperdicioDesc;
        document.getElementById('prEnergia').textContent = valEnergia;
        document.getElementById('prTransporte').textContent = valTransporte;
        document.getElementById('prInstalacoes').textContent = valInstalacoes;
        document.getElementById('prResiduos').textContent = valResiduos;
        document.getElementById('prInsight').textContent = insight;
        document.getElementById('prCustoTradicional').textContent = custoTradicional;
        document.getElementById('prCustoProjecao').textContent = custoProjecao;

        // Mostrar seção
        preReport.style.display = 'block';
        preReport.style.animation = 'fadeInUp 0.6s ease';

        // Scroll to it
        setTimeout(() => {
            preReport.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);

        // Mudar botão pra 'enviado'
        btnAgendar.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Pré-Relatório Gerado!';
        btnAgendar.disabled = true;
        btnAgendar.style.opacity = '0.7';

        // Enviar pré-relatório simplificado por email (Formsubmit)
        const emailContato = document.getElementById('emailContato')?.value || '';
        const nomeContato = document.getElementById('nomeContato')?.value || '';
        if (emailContato) {
            const reportData = new FormData();
            reportData.append('_subject', '\ud83c\udf3f Pré-Relatório DoubleDyn - ' + empresa);
            reportData.append('_template', 'table');
            reportData.append('_captcha', 'false');
            reportData.append('_replyto', emailContato);
            reportData.append('01_EMPRESA', empresa);
            reportData.append('02_CONTATO', nomeContato + ' <' + emailContato + '>');
            reportData.append('03_EMISSAO_TOTAL', total + ' tCO2e/ano');
            reportData.append('04_RISCO', risco);
            reportData.append('05_DESPERDICIO', desperdicio + '/10 (' + desperdicioClass + ')');
            reportData.append('06_ENERGIA', valEnergia);
            reportData.append('07_TRANSPORTE', valTransporte);
            reportData.append('08_INSTALACOES', valInstalacoes);
            reportData.append('09_RESIDUOS', valResiduos);
            reportData.append('10_INSIGHT', insight);
            reportData.append('11_CUSTO_TRADICIONAL', custoTradicional);
            reportData.append('12_PROJECAO_5ANOS', custoProjecao);
            reportData.append('13_ARVORES_EQUIVALENTE', arvores);

            fetch('https://formsubmit.co/ajax/DoubleDynaapp@gmail.com', {
                method: 'POST',
                body: reportData
            }).catch(err => console.warn('[DoubleDyn] Erro email pre-report:', err));
        }
    });
});
