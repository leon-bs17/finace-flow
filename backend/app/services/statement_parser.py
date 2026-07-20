"""
Extração de transações a partir de extratos bancários em diferentes formatos.

CSV/Excel: usa pandas com detecção heurística de colunas (data, descrição,
valor), tolerante a diferentes bancos.
OFX: usa ofxparse.
PDF: usa pdfplumber para extrair tabelas; se o PDF for uma imagem escaneada
(sem texto), cai para OCR via pytesseract sobre a rasterização das páginas.
"""
from dataclasses import dataclass
from datetime import datetime
from io import BytesIO

import pandas as pd


@dataclass
class ParsedTransaction:
    date: str
    description: str
    amount: float


COLUMN_ALIASES = {
    "date": ["data", "date", "dt_lancamento", "data lançamento"],
    "description": ["descrição", "descricao", "description", "histórico", "historico"],
    "amount": ["valor", "amount", "vl_lancamento", "valor (r$)"],
}


def _find_column(columns: list[str], aliases: list[str]) -> str | None:
    lowered = {c.lower().strip(): c for c in columns}
    for alias in aliases:
        if alias in lowered:
            return lowered[alias]
    return None


def parse_csv_or_excel(file_bytes: bytes, filename: str) -> list[ParsedTransaction]:
    buffer = BytesIO(file_bytes)
    df = pd.read_excel(buffer) if filename.lower().endswith((".xlsx", ".xls")) else pd.read_csv(buffer)

    date_col = _find_column(list(df.columns), COLUMN_ALIASES["date"])
    desc_col = _find_column(list(df.columns), COLUMN_ALIASES["description"])
    amount_col = _find_column(list(df.columns), COLUMN_ALIASES["amount"])

    if not all([date_col, desc_col, amount_col]):
        raise ValueError(
            "Não foi possível identificar as colunas de data/descrição/valor. "
            f"Colunas encontradas: {list(df.columns)}"
        )

    results = []
    for _, row in df.iterrows():
        try:
            results.append(ParsedTransaction(
                date=str(pd.to_datetime(row[date_col]).date()),
                description=str(row[desc_col]),
                amount=float(row[amount_col]),
            ))
        except (ValueError, TypeError):
            continue  # ignora linhas malformadas (cabeçalhos repetidos, totais, etc.)
    return results


def parse_ofx(file_bytes: bytes) -> list[ParsedTransaction]:
    from ofxparse import OfxParser  # import local: dependência pesada, só carrega quando necessário

    ofx = OfxParser.parse(BytesIO(file_bytes))
    results = []
    for account in ofx.accounts:
        for txn in account.statement.transactions:
            results.append(ParsedTransaction(
                date=str(txn.date.date()),
                description=txn.memo or txn.payee or "Transação",
                amount=float(txn.amount),
            ))
    return results


def parse_pdf(file_bytes: bytes) -> list[ParsedTransaction]:
    import pdfplumber

    results: list[ParsedTransaction] = []
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        has_text = any((page.extract_text() or "").strip() for page in pdf.pages)
        if has_text:
            for page in pdf.pages:
                for table in page.extract_tables():
                    for row in table:
                        parsed = _try_parse_table_row(row)
                        if parsed:
                            results.append(parsed)
        else:
            results = _parse_pdf_via_ocr(file_bytes)
    return results


def _try_parse_table_row(row: list[str | None]) -> ParsedTransaction | None:
    if not row or len(row) < 3:
        return None
    try:
        date_str, description, amount_str = row[0], row[1], row[-1]
        date_value = datetime.strptime(date_str.strip(), "%d/%m/%Y").date()
        amount_value = float(amount_str.replace(".", "").replace(",", ".").replace("R$", "").strip())
        return ParsedTransaction(date=str(date_value), description=description.strip(), amount=amount_value)
    except (ValueError, AttributeError, TypeError):
        return None


def _parse_pdf_via_ocr(file_bytes: bytes) -> list[ParsedTransaction]:
    """
    Fallback para extratos em PDF escaneado (imagem). Requer `pytesseract` e
    o binário `tesseract-ocr` instalado (já incluído no Dockerfile do backend).
    Implementação de referência: rasteriza cada página e roda OCR, depois
    aplica o mesmo parser de linha usado nas tabelas de texto.
    """
    try:
        import pytesseract
        from pdf2image import convert_from_bytes  # requer poppler-utils no sistema

        results: list[ParsedTransaction] = []
        pages = convert_from_bytes(file_bytes)
        for page_image in pages:
            text = pytesseract.image_to_string(page_image, lang="por")
            for line in text.splitlines():
                columns = [c for c in line.split("  ") if c.strip()]
                parsed = _try_parse_table_row(columns)
                if parsed:
                    results.append(parsed)
        return results
    except ImportError:
        print("[AVISO] Dependências de OCR (pytesseract, pdf2image) não instaladas.")
        return []
    except Exception as e:
        print(f"[ERRO OCR] Falha ao processar PDF via OCR: {e}")
        return []


def parse_statement(file_bytes: bytes, filename: str) -> list[ParsedTransaction]:
    lower = filename.lower()
    if lower.endswith(".csv") or lower.endswith((".xlsx", ".xls")):
        return parse_csv_or_excel(file_bytes, filename)
    if lower.endswith(".ofx"):
        return parse_ofx(file_bytes)
    if lower.endswith(".pdf"):
        return parse_pdf(file_bytes)
    raise ValueError(f"Formato de arquivo não suportado: {filename}")
