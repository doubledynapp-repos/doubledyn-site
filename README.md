# 🌿 DoubleDyn

> **Transformamos cultura local em impacto ambiental real.**

Plataforma brasileira de **Ecotoken / ReFi** para empresas: inventário de gases de efeito estufa (GEE), cálculo de emissões, compensação de carbono e **certificação on-chain** com NFTs verificáveis.

**Site:** [doubledyn.com](https://doubledyn.com) · **Metodologia:** [doubledyn.com/metodologia](https://doubledyn.com/metodologia)

---

## 🧭 O que é

A DoubleDyn ajuda empresas de todos os portes a:

1. **Calcular** seu impacto ambiental em ~2 minutos (calculadora gratuita)
2. **Reduzir** com plano de ação em 3 passos (eficiência + gestão + compensação)
3. **Certificar** com prova pública e verificável na blockchain (Polygon)

Referências metodológicas: **GHG Protocol Brasil**, **IPCC AR6**, **MCTI/SIRENE** (fatores oficiais) e **Lei 15.042/2024 (SBCE)**.

---

## 📁 Estrutura deste repositório (parte pública)

| Caminho | Conteúdo |
|---|---|
| [`site/`](site/) | Landing page estática + calculadora (versão clássica) |
| [`site-v3/`](site-v3/) | Variação da landing |
| [`frontend/`](frontend/) | Aplicação Next.js (site atual em produção) |
| [`frontend_v2_dapp/`](frontend_v2_dapp/) | DApp Web3 (protótipo: mercado, portfólio, DeFi) |
| [`contracts/`](contracts/) | Smart contracts Solidity (token DBD, certificados NFT, retirements) |
| [`test/`](test/) | Testes Hardhat dos contratos |
| [`pitch-deck/`](pitch-deck/) | Apresentação institucional |
| [`preview/`](preview/) | Pré-visualizações |

> 🔒 Backend, infraestrutura e documentos estratégicos vivem no repositório **privado** da plataforma.

---

## 🧮 Calculadora de Impacto

A calculadora gratuita coleta dados de consumo (energia, frota, instalações, resíduos) e gera:

- Total de emissões em **tCO₂e/ano** (com margem de segurança de 15%)
- **DQS Score** (DoubleDyn Quality Score, 0–1000) e selo Bronze/Prata/Ouro
- Exposição regulatória estimada (Lei 15.042/2024 — SBCE)
- **Benchmark setorial** (você vs. média do seu setor)
- **Plano de Ação** em 3 passos

Quando o visitante não sabe os dados de consumo, o sistema **estima pela média setorial** (marcado explicitamente como estimativa).

---

## ⛓️ Contratos

| Contrato | Descrição |
|---|---|
| `DoubleDynToken.sol` | Token DBD (OpenZeppelin) |
| `CertificateNFT.sol` | Certificado NFT ERC-721 |
| `DoubleDynOfficialSeal.sol` | Selo oficial DoubleDyn |
| `DoubleDynPCRSeal.sol` | Selo PCR (Protocolo DoubleDyn) |
| `CarbonRetire.sol` | Queima/retirement de créditos |
| `WalletFactory.sol` | Factory de carteiras |

**Caso de referência:** Prefeitura Municipal de Ingaí-MG — 100 tCO₂e compensados e certificados em NFT ERC-721 na **Polygon Mainnet** (ver [memorial técnico](https://doubledyn.com/memorial_tecnico_ingai.html)).

---

## 📜 Licenciamento

- **Motor de cálculo** (`frontend/app/lib/carbonEngine.js`, `benchmark.js`, `actionPlan.js`, `methodologyData.js`, `calcSchema.js`, `dqsEngine.js` e `frontend/scripts/parity-test.mjs`): **MIT License** — ver [`LICENSE.md`](LICENSE.md)
- **Site, design, marca, imagens, contratos e demais conteúdo:** **todos os direitos reservados** — ver [`NOTICE.md`](NOTICE.md)

> O motor é aberto por transparência metodológica e para se tornar um padrão do mercado. A plataforma completa (backend, dashboard, certificação) é um produto fechado — saiba mais em [doubledyn.com](https://doubledyn.com).

---

## 🚀 Desenvolvimento

```bash
# Frontend (Next.js)
cd frontend
npm install
npm run dev        # desenvolvimento
npm run build      # build de produção
npm test           # testes de paridade da calculadora

# Contratos (Hardhat)
npm install
npx hardhat test
```

---

## 📜 Licença e uso

Este repositório contém a parte pública do projeto DoubleDyn. Para dúvidas, parcerias ou acesso à plataforma:

- **E-mail:** DoubleDynaapp@gmail.com
- **WhatsApp:** +55 11 92452-6590
- **Instagram:** [@doubledynapp](https://instagram.com/doubledynapp)

© 2026 DoubleDyn Ecotoken. Todos os direitos reservados.
