// ===== Teste de Paridade + Sanidade — DoubleDyn Carbon Engine =====
// Roda com: npm test
// Verifica que o meter ao vivo (computePartialEstimates) produz EXATAMENTE
// os mesmos números do relatório final (calculateEmissions) — mesma fonte de
// verdade — e que o plano de ação gera 3 ações em todos os caminhos.
// Também trava o fator de eletricidade vigente (0,0461 MCTI/SIRENE 2025) para
// que uma regressão de fator seja detectada imediatamente.
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'dd-parity-'));

// Os libs são ESM, mas o package.json do app não tem "type":"module"
// (Next.js). Copiamos para um dir temporário com package.json próprio.
// O motor foi refatorado para fonte única em factors.js e usa imports
// relativos SEM extensão (padrão webpack) — aqui reescrevemos para .mjs
// para o Node ESM resolver.
fs.writeFileSync(path.join(TMP, 'package.json'), JSON.stringify({ type: 'module' }));
const LIBS = ['carbonEngine.js', 'actionPlan.js', 'benchmark.js', 'factors.js', 'roiSimulator.js'];
for (const f of LIBS) {
  const src = path.join(ROOT, 'app/lib', f);
  if (!fs.existsSync(src)) {
    console.error(`FALHA: app/lib/${f} não existe — o motor mudou de estrutura?`);
    process.exit(1);
  }
  let content = fs.readFileSync(src, 'utf8');
  content = content.replace(/from '\.\/([a-zA-Z0-9_-]+)'/g, "from './$1.mjs'");
  fs.writeFileSync(path.join(TMP, f.replace('.js', '.mjs')), content);
}

const engine = await import(path.join(TMP, 'carbonEngine.mjs'));
const actionPlan = await import(path.join(TMP, 'actionPlan.mjs'));
const benchmark = await import(path.join(TMP, 'benchmark.mjs'));
const roiSimulator = await import(path.join(TMP, 'roiSimulator.mjs'));

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS | ${name}${extra ? ' — ' + extra : ''}`); }
  else { fail++; console.log(`  FAIL | ${name}${extra ? ' — ' + extra : ''}`); }
};
const near = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

console.log('1) PARIDADE meter vs relatório (dados completos)');
const full = {
  empresa: 'Teste SA', setor: 'industria', funcionarios: '150', faturamento: '15000000',
  eletricidade: '8000', fonteEnergia: 'convencional', glp: '120', gasNatural: '600',
  dieselGerador: '250', lenha: '4',
  gasolinaLitros: '800', dieselLitros: '1500', etanolLitros: '300', gnvM3: '150',
  viagensDomesticas: '40', viagensInternacionais: '6',
  aguaM3: '300', arCondicionado: '20', refrigeracao: 'split', papelResmas: '50', homeOffice: '20',
  residuos: '15', reciclagem: '30', residuosPerigosos: '200',
};
const r = engine.calculateEmissions(full);
const m = engine.computePartialEstimates(full);
check('totalBase == emissaoBase', near(m.totalBase, r.emissaoBase));
check('totalComMargem == totalEmissao (15%)', near(m.totalComMargem, r.totalEmissao));
check('custoEstimado == custoTradicional', near(m.custoEstimado, r.custoTradicional));
check('categoria Energia', near(m.energia, r.emissaoEnergia));
check('categoria Frota', near(m.frota, r.emissaoTransporte));
check('categoria Instalações', near(m.instalacoes, r.emissaoInstalacoes));
check('categoria Resíduos', near(m.residuos, r.emissaoResiduos));

console.log('2) FATOR DE ELETRICIDADE vigente (MCTI/SIRENE 2025 = 0,0461)');
const umMwh = engine.computePartialEstimates({ eletricidade: '1000', fonteEnergia: 'convencional' });
check('1000 kWh/mês == 0,5532 t/ano', near(umMwh.energia, 0.0461 * 12, 1e-6), `${umMwh.energia.toFixed(4)} t`);
check('fator NÃO é o antigo (0,0817)', !near(umMwh.energia, 0.0817 * 12, 1e-3));

console.log('3) PLANO DE AÇÃO — 3 ações em todos os caminhos');
const est = engine.calculateEmissions({ empresa: 'X SA', setor: 'industria', funcionarios: '10', faturamento: '1000000' }, { estimarSeVazio: true });
const pEst = actionPlan.gerarPlanoDeAcao(est);
check('estimado: 3 ações', pEst.acoes.length === 3, `(${pEst.acoes.length})`);
check('estimado: A1 energia com aviso', pEst.acoes[0]?.id === 'a1_energia' && pEst.acoes[0]?.nota.includes('estimada'));
check('estimado: A1 sem economia fictícia', pEst.acoes[0]?.economiaAnual === null);
const real = engine.calculateEmissions({ empresa: 'Y SA', setor: 'logistica', funcionarios: '50', faturamento: '5000000', gasolinaLitros: '5000', dieselLitros: '8000' });
const pReal = actionPlan.gerarPlanoDeAcao(real);
check('real: 3 ações', pReal.acoes.length === 3, `(${pReal.acoes.length})`);
check('real: A1 ataca maior emissor', pReal.acoes[0]?.id === 'a1_frota');
check('real: A3 compensação sempre presente', pReal.acoes[2]?.id === 'a3_compensacao');

console.log('4) SANIDADE (casos-limite)');
const vazio = engine.computePartialEstimates({});
check('form vazio -> 0 e sem NaN', vazio.totalBase === 0 && !isNaN(vazio.totalBase));
const b = benchmark.computeBenchmark({ emissionsTotal: 500, revenueMillions: 5, sector: 'industria' });
check('benchmark ok com rank válido', b.ok && b.rank >= 1 && b.rank <= 99, `rank=${b.rank}`);

console.log('5) SIMULADOR DE ROI (cap, DQS, cenários, payback/retorno)');
const baseRoi = engine.calculateEmissions(full);
const planoRef = actionPlan.gerarPlanoDeAcao(baseRoi);
const invDefault = { a1: 1, a2: 1, a3: 1 };
const s = roiSimulator.simularROI(baseRoi, invDefault);
check('3 itens (uma por ação)', s.itens.length === 3, `(${s.itens.length})`);
check('investTotal == soma dos invests', near(s.investTotal, s.itens.reduce((a, i) => a + i.invest, 0)));
check('reducaoTotal == soma das reduções', near(s.reducaoTotal, s.itens.reduce((a, i) => a + i.reducao, 0)));
// Cap de redução: pct > 1 NÃO aumenta redução (100% é o teto)
const sOver = roiSimulator.simularROI(baseRoi, { a1: 1.5, a2: 1.5, a3: 1.5 });
check('cap: pct 1.5 não aumenta redução', sOver.itens.every((it, i) => near(it.reducao, Math.min(1.5, 1) * (planoRef.acoes[i].reducaoTonnes || 0))));
check('cap: redução com pct 1.5 == redução com pct 1', near(sOver.reducaoTotal, s.reducaoTotal));
// Clamp de pct: valores absurdos são limitados a [0, 1.5]
const sClamp = roiSimulator.simularROI(baseRoi, { a1: 99, a2: -5, a3: 1 });
check('clamp: 99 -> 1.5', near(sClamp.itens[0].pct, 1.5));
check('clamp: -5 -> 0', near(sClamp.itens[1].pct, 0));
// DQS nunca passa de 1000 e nunca cai
check('dqsFinal <= 1000', s.dqsFinal <= 1000);
check('dqsFinal >= dqsAtual', s.dqsFinal >= s.dqsAtual);
// Cenários ordenados (conservador <= médio <= otimista)
check('cenários ordenados', s.cenarios.conservador <= s.cenarios.medio && s.cenarios.medio <= s.cenarios.otimista);
check('banda conservador == 0.6x', near(s.cenarios.conservador, s.economiaTotal * 0.6));
check('banda otimista == 1.4x', near(s.cenarios.otimista, s.economiaTotal * 1.4));
// Payback e retorno coerentes
if (s.investTotal > 0 && s.economiaTotal > 0) {
  check('payback médio == (invest/economia)*12', near(s.paybackMedio, (s.investTotal / s.economiaTotal) * 12));
  check('retorno anual == (economia/invest)*100', near(s.retornoAnualPct, (s.economiaTotal / s.investTotal) * 100));
} else {
  check('payback médio computável', false, 'invest/economia = 0');
}
const sZero = roiSimulator.simularROI(baseRoi, { a1: 0, a2: 0, a3: 0 });
check('payback null quando economia = 0', sZero.paybackMedio === null);

console.log(`\nRESULTADO: ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
