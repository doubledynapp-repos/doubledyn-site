// SPDX-License-Identifier: MIT
// Copyright (c) 2026 DoubleDyn Ecotoken — MIT License (ver LICENSE.md)
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
fs.writeFileSync(path.join(TMP, 'package.json'), JSON.stringify({ type: 'module' }));
for (const f of ['carbonEngine.js', 'actionPlan.js', 'benchmark.js']) {
  fs.copyFileSync(path.join(ROOT, 'app/lib', f), path.join(TMP, f.replace('.js', '.mjs')));
}

const engine = await import(path.join(TMP, 'carbonEngine.mjs'));
const actionPlan = await import(path.join(TMP, 'actionPlan.mjs'));
const benchmark = await import(path.join(TMP, 'benchmark.mjs'));

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

console.log(`\nRESULTADO: ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
