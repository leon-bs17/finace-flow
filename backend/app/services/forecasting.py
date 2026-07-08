"""
Projeção simples de saldo futuro e fluxo de caixa.

Usa uma média móvel dos últimos N meses de receita/despesa, mais os
compromissos conhecidos (assinaturas e contas recorrentes) para projetar o
saldo de fim de mês e o fluxo de caixa dos próximos meses. Não é um modelo de
séries temporais sofisticado de propósito: é explicável, rápido e fácil de
depurar — trocar por um modelo estatístico mais robusto (ex. Prophet) é uma
extensão natural deste serviço.
"""
from dataclasses import dataclass


@dataclass
class MonthlyTotals:
    income: float
    expenses: float


def project_end_of_month_balance(current_balance: float, income_so_far: float, expenses_so_far: float,
                                   days_elapsed: int, days_in_month: int) -> float:
    if days_elapsed == 0:
        return current_balance
    daily_burn = expenses_so_far / days_elapsed
    daily_income = income_so_far / days_elapsed
    remaining_days = days_in_month - days_elapsed
    return round(current_balance + (daily_income - daily_burn) * remaining_days, 2)


def project_future_cash_flow(history: list[MonthlyTotals], months_ahead: int = 3) -> list[MonthlyTotals]:
    if not history:
        return [MonthlyTotals(0, 0) for _ in range(months_ahead)]

    avg_income = sum(m.income for m in history) / len(history)
    avg_expenses = sum(m.expenses for m in history) / len(history)
    return [MonthlyTotals(round(avg_income, 2), round(avg_expenses, 2)) for _ in range(months_ahead)]


def financial_health_score(savings_rate: float, on_time_bill_ratio: float, budget_adherence: float) -> int:
    """
    Score 0-100 combinando taxa de poupança, pontualidade de pagamentos e
    aderência ao orçamento. Pesos calibráveis conforme dados reais de uso.
    """
    score = (savings_rate * 0.4) + (on_time_bill_ratio * 0.35) + (budget_adherence * 0.25)
    return max(0, min(100, round(score * 100)))
