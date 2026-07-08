# FinanceFlow

SaaS de finanças pessoais com IA. O usuário nunca organiza nada manualmente:
importa extratos, e a IA categoriza, detecta assinaturas, gera insights e
responde perguntas em linguagem natural sobre o próprio dinheiro.

Este repositório é um **scaffold de produção**: a arquitetura, os contratos de
API, os modelos de dados e a UI principal estão implementados e funcionando
com dados de exemplo. Os pontos que dependem de segredos externos (chave da
OpenAI, provedor OAuth, bucket de storage) estão isolados atrás de interfaces
(`services/`) para que você plugue as credenciais reais sem reescrever nada.

## Stack

| Camada       | Tecnologia |
|--------------|------------|
| Frontend     | Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui + Framer Motion + Recharts |
| Backend      | Python 3.11 + FastAPI + Pydantic v2 |
| Banco        | SQLite (local de desenvolvimento) |
| ORM          | SQLAlchemy |
| Auth         | JWT próprio + OAuth (Google) |
| IA           | OpenAI-compatible API (categorização, insights, chat) |
| OCR          | pytesseract + pdfplumber para extratos em PDF |
| Deploy       | Vercel (frontend) · Railway (backend) |

## Estrutura

```
financeflow/
├── backend/                # API FastAPI
│   └── app/
│       ├── core/           # config, segurança, conexão com banco
│       ├── models/         # modelos SQLAlchemy
│       ├── schemas/        # Pydantic (request/response)
│       ├── api/v1/         # rotas HTTP
│       └── services/       # regras de negócio e integração com IA/OCR
└── frontend/                # Next.js
    ├── app/                # rotas (App Router), grupos (auth) e (dashboard)
    ├── components/         # UI (shadcn + componentes de dashboard)
    └── lib/                # client de API, utils
```

## Como rodar localmente

Usando o script automatizado (PowerShell no Windows):

```powershell
.\start-dev.ps1
```

Manualmente (Qualquer sistema):

```bash
# 1. Copiar as variáveis de ambiente
cp .env.example .env

# 2. Configurar e rodar o backend
cd backend
python -m venv .venv

# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 3. Configurar e rodar o frontend (em outra janela do terminal)
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend (docs Swagger): http://localhost:8000/docs

## Roadmap de implementação (o que já está pronto vs. o que falta plugar)

| Área | Status |
|---|---|
| Auth JWT (registro/login) | ✅ funcional |
| OAuth Google | 🔌 endpoint pronto, precisa de client id/secret reais |
| Upload de extratos (PDF/CSV/XLSX/OFX) | ✅ parsers CSV/OFX funcionais · PDF via OCR (stub, precisa `pytesseract`) |
| Categorização automática | ✅ heurística por regras + hook para LLM |
| Insights em linguagem natural | ✅ gerador baseado em regras + hook para LLM |
| Chat assistant | 🔌 endpoint pronto, precisa de `OPENAI_API_KEY` |
| Detecção de assinaturas | ✅ funcional (detecção por recorrência) |
| Metas (goals) | ✅ CRUD completo |
| Forecast de saldo | ✅ modelo simples de projeção linear + sazonalidade |
| Dashboard (UI) | ✅ completo, com dados mockados quando a API não responde |
| Dark/Light mode | ✅ |
| i18n (PT-BR/EN) | 🔧 estrutura pronta, hoje só PT-BR está preenchido (ver `lib/i18n.ts`) |

Este é um ponto de partida sólido, não um produto pronto para produção sem
revisão: antes de ir ao ar, revise políticas de segurança, LGPD/GDPR para
dados financeiros, e faça auditoria de segurança dos endpoints.
