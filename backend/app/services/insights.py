"""
Gera insights em linguagem natural a partir dos dados de transações.

Cada função de regra devolve zero ou um Insight; `generate_insights` roda
todas as regras contra o mês atual vs. o mês anterior. É deliberadamente
determinístico (não depende de LLM) para ser rápido, barato e sempre
disponível — o hook para enriquecer com um LLM (`enrich_with_llm`) é opcional
e usado só para tornar o texto final mais natural, não para os cálculos.
"""
import uuid
from dataclasses import dataclass


@dataclass
class CategoryTotals:
    category: str
    current_month: float
    previous_month: float


def pct_change(current: float, previous: float) -> float:
    if previous == 0:
        return 0.0
    return round(((current - previous) / previous) * 100, 1)


def insight_category_spike(totals: list[CategoryTotals]) -> list[dict]:
    insights = []
    for t in totals:
        change = pct_change(t.current_month, t.previous_month)
        if change >= 25:
            insights.append({
                "id": str(uuid.uuid4()),
                "message": f"Você gastou {change:.0f}% a mais em {t.category} este mês.",
                "kind": "warning",
                "icon": "trending-up",
            })
        elif change <= -15:
            insights.append({
                "id": str(uuid.uuid4()),
                "message": f"Seus gastos com {t.category} caíram {abs(change):.0f}% este mês.",
                "kind": "positive",
                "icon": "trending-down",
            })
    return insights


def insight_unused_subscriptions(unused_subscriptions: list[str]) -> dict | None:
    if not unused_subscriptions:
        return None
    names = ", ".join(unused_subscriptions)
    return {
        "id": str(uuid.uuid4()),
        "message": f"Você paga por {len(unused_subscriptions)} assinaturas que não usa há mais de 30 dias: {names}.",
        "kind": "tip",
        "icon": "credit-card",
    }


def insight_projected_savings(recurring_waste: float) -> dict | None:
    if recurring_waste <= 0:
        return None
    return {
        "id": str(uuid.uuid4()),
        "message": f"Você pode economizar cerca de R$ {recurring_waste:,.2f} no próximo mês reduzindo despesas recorrentes.".replace(",", "."),
        "kind": "tip",
        "icon": "piggy-bank",
    }


def insight_abnormal_spending(current_total: float, historical_average: float) -> dict | None:
    change = pct_change(current_total, historical_average)
    if change >= 40:
        return {
            "id": str(uuid.uuid4()),
            "message": "Seus gastos este mês estão muito acima da sua média histórica.",
            "kind": "warning",
            "icon": "alert-triangle",
        }
    return None


def generate_insights(
    category_totals: list[CategoryTotals],
    unused_subscriptions: list[str],
    recurring_waste: float,
    current_total: float,
    historical_average: float,
) -> list[dict]:
    insights = insight_category_spike(category_totals)

    unused = insight_unused_subscriptions(unused_subscriptions)
    if unused:
        insights.append(unused)

    savings = insight_projected_savings(recurring_waste)
    if savings:
        insights.append(savings)

    abnormal = insight_abnormal_spending(current_total, historical_average)
    if abnormal:
        insights.append(abnormal)

    return insights
