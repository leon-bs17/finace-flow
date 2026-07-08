# ============================================================
# FinanceFlow ? Script de inicializa??o local (sem Docker)
# Uso: .\start-dev.ps1
# ============================================================
# Requisitos m?nimos:
#   - Node.js 18+ (https://nodejs.org)
#   - Python 3.11+ (https://python.org)
# ============================================================

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  FinanceFlow ? Iniciando ambiente de dev local" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# --- Verifica??es b?sicas ---
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERRO] Node.js nao encontrado. Instale em https://nodejs.org" -ForegroundColor Red
    exit 1
}
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[ERRO] Python nao encontrado. Instale em https://python.org" -ForegroundColor Red
    exit 1
}

# --- Backend: venv + install ---
Write-Host "[1/4] Configurando backend Python..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\backend"

if (-not (Test-Path ".venv")) {
    Write-Host "      Criando virtualenv..." -ForegroundColor Gray
    python -m venv .venv
}

Write-Host "      Instalando dependencias (requirements-dev.txt)..." -ForegroundColor Gray
& ".venv\Scripts\pip.exe" install -r requirements-dev.txt --quiet

Write-Host "[OK] Backend configurado." -ForegroundColor Green

# --- Frontend: npm install ---
Write-Host ""
Write-Host "[2/4] Configurando frontend Next.js..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "      Instalando pacotes npm..." -ForegroundColor Gray
    npm install --silent
}

Write-Host "[OK] Frontend configurado." -ForegroundColor Green

# --- Iniciar Backend em background ---
Write-Host ""
Write-Host "[3/4] Iniciando backend FastAPI em http://localhost:8000 ..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\backend"

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$PSScriptRoot\backend'; Write-Host '[Backend] Iniciando...' -ForegroundColor Cyan; .\.venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000"
) -WindowStyle Normal

Start-Sleep -Seconds 2

# --- Iniciar Frontend ---
Write-Host "[4/4] Iniciando frontend Next.js em http://localhost:3000 ..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend"

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$PSScriptRoot\frontend'; Write-Host '[Frontend] Iniciando...' -ForegroundColor Cyan; npm run dev"
) -WindowStyle Normal

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Aguarde alguns segundos e acesse:" -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Dois terminais foram abertos (backend e frontend)." -ForegroundColor Gray
Write-Host "Para encerrar, feche as janelas abertas." -ForegroundColor Gray
Write-Host ""

Set-Location $PSScriptRoot

