"""
Serviço de categorização automática de transações.

Estratégia em duas camadas:
1. Heurística por palavras-chave (rápida, gratuita, roda sempre) — cobre a
   maioria dos casos comuns (mercado, uber, netflix, etc).
2. Fallback para LLM quando a heurística não tem confiança suficiente
   (ver `categorize_with_llm`), usando correções passadas do usuário como
   poucos-shots para melhorar a precisão ao longo do tempo.

Isso evita bater na API de IA para cada transação (custo/latência) e ainda
assim mantém a promessa de "o usuário nunca organiza nada manualmente".
"""
import re

from openai import OpenAI

from app.core.config import settings

# merchant/keyword -> nome da categoria
KEYWORD_RULES: dict[str, str] = {
    r"ifood|uber eats|rappi|restaurante|lanchonete|padaria|mercado|supermercado": "Alimentação",
    r"uber|99app|taxi|posto|combustível|estacionamento|metro|onibus": "Transporte",
    r"aluguel|condom[ií]nio|imobili[aá]ria": "Moradia",
    r"amazon|shopee|mercado livre|magazine luiza|shein": "Compras",
    r"netflix|spotify|hbo|disney\+|amazon prime|youtube premium|icloud": "Assinaturas",
    r"cinema|steam|playstation|xbox|ingresso": "Entretenimento",
    r"farmácia|drogaria|hospital|clínica|plano de saúde": "Saúde",
    r"udemy|coursera|faculdade|escola|curso": "Educação",
    r"corretora|xp investimentos|nubank invest|tesouro direto": "Investimentos",
    r"energia|luz|água|internet|telefone|celular|boleto": "Contas",
    r"salário|folha de pagamento|pagamento cltt?": "Salário",
    r"pix recebido.*freelance|nota fiscal de serviço": "Freelance",
}


def categorize_by_rules(description: str, merchant: str | None) -> tuple[str | None, float]:
    """Retorna (nome_categoria, confiança) usando regras de palavras-chave."""
    text = f"{description} {merchant or ''}".lower()
    for pattern, category in KEYWORD_RULES.items():
        if re.search(pattern, text):
            return category, 0.9
    return None, 0.0


def categorize_with_llm(description: str, merchant: str | None, user_corrections: list[dict]) -> tuple[str, float]:
    """
    Usa o LLM configurado para classificar a transação quando a heurística falha.
    `user_corrections` é uma lista de exemplos passados (poucos-shots) no formato
    [{"description": ..., "category": ...}], usada para aprender com o feedback do usuário.
    """
    if not settings.OPENAI_API_KEY:
        return "Compras", 0.3  # fallback conservador sem chave configurada

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    examples = "\n".join(f"- '{c['description']}' -> {c['category']}" for c in user_corrections[-10:])
    prompt = (
        "Classifique a transação financeira abaixo em UMA destas categorias: "
        "Alimentação, Transporte, Moradia, Compras, Assinaturas, Entretenimento, "
        "Saúde, Educação, Investimentos, Contas, Salário, Freelance, Poupança.\n\n"
        f"Exemplos de correções anteriores do usuário:\n{examples}\n\n"
        f"Transação: descrição='{description}', estabelecimento='{merchant or 'desconhecido'}'\n"
        "Responda apenas com o nome exato da categoria."
    )
    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=10,
    )
    category = (response.choices[0].message.content or "Compras").strip()
    return category, 0.75


def categorize_transaction(description: str, merchant: str | None, user_corrections: list[dict] | None = None) -> tuple[str, float]:
    category, confidence = categorize_by_rules(description, merchant)
    if category:
        return category, confidence
    return categorize_with_llm(description, merchant, user_corrections or [])
