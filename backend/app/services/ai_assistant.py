"""
Assistente financeiro conversacional.

O LLM nunca inventa números: ele recebe um resumo estruturado das finanças do
usuário (já calculado pelo backend a partir do banco de dados) como contexto
e é instruído a responder somente com base nesses dados. Isso evita
alucinação de valores financeiros, que seria inaceitável neste domínio.
"""
from openai import OpenAI

from app.core.config import settings

SYSTEM_PROMPT = """\
Você é o assistente financeiro do FinanceFlow. Responda em português do Brasil,
de forma direta e simpática. Use APENAS os dados fornecidos no contexto abaixo
— nunca invente valores. Se a pergunta não puder ser respondida com os dados
disponíveis, diga isso claramente. Quando fizer sentido, sugira que o usuário
veja o gráfico correspondente no dashboard.
"""


def ask_financial_assistant(question: str, financial_context: dict, history: list[dict] | None = None) -> str:
    if not settings.OPENAI_API_KEY:
        q = question.lower()
        if "saldo" in q:
            return f"Seu saldo atual é de R$ {financial_context.get('current_balance', 0):.2f}."
        elif "gasto" in q or "despesa" in q:
            return f"Suas despesas mensais estão em R$ {financial_context.get('monthly_expenses', 0):.2f}."
        elif "receita" in q or "ganho" in q:
            return f"Sua receita mensal é de R$ {financial_context.get('monthly_income', 0):.2f}."
        elif "saúde" in q or "score" in q:
            return f"Seu score de saúde financeira é {financial_context.get('financial_health_score', 0)}/100."
        else:
            return (
                "Modo Offline (Sem IA conectada). "
                "Posso informar seu saldo, despesas, ganhos ou score de saúde financeira com base nos seus dados atuais."
            )

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    messages = [{"role": "system", "content": f"{SYSTEM_PROMPT}\n\nDados financeiros do usuário:\n{financial_context}"}]
    messages.extend(history or [])
    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=0.3,
        max_tokens=500,
    )
    return response.choices[0].message.content or "Não consegui gerar uma resposta agora."
