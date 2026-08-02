// SPDX-License-Identifier: MIT
// Copyright (c) 2026 DoubleDyn Ecotoken — MIT License (ver LICENSE.md)
// ===== Zod Schema — Calculadora DoubleDyn =====
// Validação por step. Cada step tem seu próprio schema parcial.

import { z } from 'zod';

// ── STEP 1: DADOS DA EMPRESA ──
export const step1Schema = z.object({
  cnpj: z.string().optional(),
  empresa: z.string().min(2, 'Informe o nome da empresa'),
  cidade: z.string().optional(),
  setor: z.enum([
    'industria', 'comercio', 'servicos', 'agro', 'construcao', 'logistica',
    'tecnologia', 'saude', 'alimenticio', 'mineracao', 'educacao', 'outro',
  ], { errorMap: () => ({ message: 'Selecione o setor de atuação' }) }),
  funcionarios: z.coerce.number().min(1, 'Informe o número de funcionários'),
  faturamento: z.string().optional(),
  areaM2: z.coerce.number().min(0).optional(),
  exportaUE: z.enum(['sim', 'nao']).optional().default('nao'),
  setorCBAM: z.string().optional().default('outro'),
  jaFazInventario: z.enum(['sim', 'nao']).optional().default('nao'),
});

// ── STEP 2: ENERGIA ──
export const step2Schema = z.object({
  eletricidade: z.coerce.number().min(0).optional(),
  fonteEnergia: z.enum(['convencional', 'solar', 'eolica', 'biomassa', 'misto']).optional().default('convencional'),
  glp: z.coerce.number().min(0).optional(),
  gasNatural: z.coerce.number().min(0).optional(),
  dieselGerador: z.coerce.number().min(0).optional(),
  lenha: z.coerce.number().min(0).optional(),
});

// ── STEP 3: FROTA ──
export const step3Schema = z.object({
  gasolinaLitros: z.coerce.number().min(0).optional(),
  dieselLitros: z.coerce.number().min(0).optional(),
  etanolLitros: z.coerce.number().min(0).optional(),
  gnvM3: z.coerce.number().min(0).optional(),
  numVeiculos: z.coerce.number().min(0).optional(),
  kmMes: z.coerce.number().min(0).optional(),
  viagensDomesticas: z.coerce.number().min(0).optional(),
  viagensInternacionais: z.coerce.number().min(0).optional(),
});

// ── STEP 4: INSTALAÇÕES ──
export const step4Schema = z.object({
  aguaM3: z.coerce.number().min(0).optional(),
  tratamentoAgua: z.enum(['rede', 'fossa', 'eta', 'nenhum']).optional().default('rede'),
  arCondicionado: z.coerce.number().min(0).optional(),
  refrigeracao: z.enum(['nenhuma', 'pequena', 'media', 'grande']).optional().default('nenhuma'),
  papelResmas: z.coerce.number().min(0).optional(),
  homeOffice: z.coerce.number().min(0).max(100).optional(),
});

// ── STEP 5: RESÍDUOS ──
export const step5Schema = z.object({
  residuos: z.coerce.number().min(0).optional(),
  reciclagem: z.coerce.number().min(0).max(100).optional(),
  destinacao: z.enum(['aterro', 'incineracao', 'compostagem', 'reciclagem_dest', 'misto_dest']).optional().default('aterro'),
  residuosPerigosos: z.coerce.number().min(0).optional(),
  certificacao: z.enum(['nenhuma', 'iso14001', 'bcorp', 'outra_cert']).optional().default('nenhuma'),
  compensaAtual: z.enum(['nao', 'parcial', 'sim']).optional().default('nao'),
});

// ── STEP 6: CONTATO ──
export const step6Schema = z.object({
  nomeContato: z.string().min(2, 'Informe seu nome'),
  emailContato: z.string().email('E-mail inválido'),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
});

// ── SCHEMA COMPLETO (todos os steps combinados) ──
export const calcFormSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema);

// ── SCHEMAS POR STEP ──
export const STEP_SCHEMAS = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
];
