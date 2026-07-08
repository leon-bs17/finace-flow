"""
Detecta pagamentos recorrentes (assinaturas) a partir do histórico de
transações: agrupa por estabelecimento e procura padrões de valor e
periodicidade (mensal/anual) similares.
"""
from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from statistics import mean, pstdev


@dataclass
class TxnPoint:
    merchant: str
    date: date
    amount: float


def detect_recurring_payments(transactions: list[TxnPoint], min_occurrences: int = 2) -> list[dict]:
    """
    Agrupa transações por merchant e sinaliza como recorrente quando o mesmo
    estabelecimento cobra valores muito similares em intervalos regulares
    (aproximadamente 28-31 dias ou ~365 dias).
    """
    by_merchant: dict[str, list[TxnPoint]] = defaultdict(list)
    for t in transactions:
        by_merchant[t.merchant].append(t)

    results = []
    for merchant, txns in by_merchant.items():
        if len(txns) < min_occurrences:
            continue
        txns.sort(key=lambda t: t.date)
        amounts = [abs(t.amount) for t in txns]
        if pstdev(amounts) > mean(amounts) * 0.1:  # valores variam demais, provavelmente não é assinatura
            continue

        intervals = [(txns[i].date - txns[i - 1].date).days for i in range(1, len(txns))]
        avg_interval = mean(intervals)

        if 25 <= avg_interval <= 35:
            cycle = "monthly"
        elif 350 <= avg_interval <= 380:
            cycle = "yearly"
        else:
            continue

        last_amount = amounts[-1]
        price_increased = amounts[-1] > amounts[0] * 1.05

        results.append({
            "merchant": merchant,
            "monthly_cost": last_amount if cycle == "monthly" else round(last_amount / 12, 2),
            "billing_cycle": cycle,
            "last_price": last_amount,
            "price_increased": price_increased,
            "last_charge_date": txns[-1].date,
        })

    return results
