'use client';
import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import Seal from '../components/Seal';

const DONE_KEY = 'doubledyn_onboarding_done';

// Onboarding guiado — primeiras ações do cliente no dashboard
// 1º diagnóstico → 2º relatório → 3º compensação & selo
export default function OnboardingChecklist({ calcData, hasOffsets, onPdf, onOffset }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem(DONE_KEY)) setDismissed(true); } catch (e) { /* ignore */ }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DONE_KEY, '1'); } catch (e) { /* ignore */ }
    setDismissed(true);
  };

  if (dismissed) return null;

  const steps = [
    {
      id: 1,
      titulo: 'Complete seu diagnóstico',
      desc: 'Calcule o impacto ambiental da sua operação — base de tudo.',
      done: !!calcData,
      cta: 'Fazer diagnóstico →',
      href: '/#calculadora',
    },
    {
      id: 2,
      titulo: 'Gere seu relatório PDF',
      desc: 'Documento profissional para comprovar emissões e estar pronto para o SBCE.',
      done: false, // atualizado via flag abaixo
      cta: 'Gerar relatório →',
      action: 'pdf',
    },
    {
      id: 3,
      titulo: 'Compense e ganhe seu selo',
      desc: 'Neutralize suas emissões e conquiste o certificado on-chain.',
      done: !!hasOffsets,
      cta: 'Compensar agora →',
      action: 'offset',
    },
  ];
  // passo 2: concluído se o PDF já foi gerado nesta conta (flag no localStorage)
  const [pdfDone, setPdfDone] = useState(false);
  useEffect(() => {
    try { if (localStorage.getItem('doubledyn_pdf_generated')) setPdfDone(true); } catch (e) { /* ignore */ }
  }, []);
  if (pdfDone) steps[1].done = true;

  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="onboarding-card">
      <div className="onboarding-head">
        <div>
          <div className="onboarding-title"><Icon name="target" size={16} inline />Suas primeiras ações</div>
          <div className="onboarding-sub">Guia rápido — {doneCount} de {steps.length} concluídas</div>
        </div>
        <div className="onboarding-progress" style={{ width: '120px' }}>
          <div className="onboarding-progress-track">
            <div className="onboarding-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span>{pct}%</span>
        </div>
        <button className="onboarding-dismiss" onClick={dismiss} aria-label="Dispensar onboarding">✕</button>
      </div>

      <div className="onboarding-steps">
        {steps.map((s) => (
          <div key={s.id} className={`onboarding-step${s.done ? ' done' : ''}`}>
            <span className="onboarding-step-seal">
              {s.done
                ? <Seal icon="checkCircle" tone="green" size={44} />
                : <Seal icon={s.id === 1 ? 'chart' : s.id === 2 ? 'docLeaf' : 'sprout'} tone="neutral" size={44} />}
            </span>
            <div className="onboarding-step-body">
              <div className="onboarding-step-title">{s.titulo}</div>
              <div className="onboarding-step-desc">{s.desc}</div>
            </div>
            {!s.done && (
              s.href
                ? <a className="onboarding-cta" href={s.href}>{s.cta}</a>
                : <button className="onboarding-cta" onClick={() => (s.action === 'pdf' ? onPdf() : onOffset())}>{s.cta}</button>
            )}
            {s.done && <span className="onboarding-done-label"><Icon name="check" size={13} inline />OK</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
