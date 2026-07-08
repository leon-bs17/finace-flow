/**
 * Estrutura de internacionalização. Hoje só "pt-BR" está totalmente
 * preenchido (conforme solicitado); "en" está com as mesmas chaves prontas
 * para tradução — basta preencher os valores.
 */
export const locales = ["pt-BR", "en"] as const;
export type Locale = (typeof locales)[number];

export const dictionaries: Record<Locale, Record<string, string>> = {
  "pt-BR": {
    "nav.dashboard": "Painel",
    "nav.transactions": "Transações",
    "nav.subscriptions": "Assinaturas",
    "nav.goals": "Metas",
    "nav.chat": "Assistente",
    "nav.settings": "Configurações",
    "dashboard.balance": "Saldo atual",
    "dashboard.income": "Receita do mês",
    "dashboard.expenses": "Despesas do mês",
    "dashboard.savings": "Economia do mês",
    "dashboard.healthScore": "Score financeiro",
    "dashboard.topCategories": "Principais categorias",
    "dashboard.recentTransactions": "Transações recentes",
    "dashboard.insights": "Insights da IA",
    "dashboard.upcomingBills": "Contas a vencer",
    "action.uploadStatement": "Importar extrato",
    "action.askAssistant": "Perguntar ao assistente",
    "action.logout": "Sair",
    "settings.language": "Idioma",
    "settings.languageCurrency": "Idioma e Moeda",
  },
  en: {
    "nav.dashboard": "Dashboard",
    "nav.transactions": "Transactions",
    "nav.subscriptions": "Subscriptions",
    "nav.goals": "Goals",
    "nav.chat": "Assistant",
    "nav.settings": "Settings",
    "dashboard.balance": "Current balance",
    "dashboard.income": "Monthly income",
    "dashboard.expenses": "Monthly expenses",
    "dashboard.savings": "Monthly savings",
    "dashboard.healthScore": "Financial score",
    "dashboard.topCategories": "Top categories",
    "dashboard.recentTransactions": "Recent transactions",
    "dashboard.insights": "AI insights",
    "dashboard.upcomingBills": "Upcoming bills",
    "action.uploadStatement": "Import statement",
    "action.askAssistant": "Ask the assistant",
    "action.logout": "Log out",
    "settings.language": "Language",
    "settings.languageCurrency": "Language & Currency",
  },
};

export function t(locale: Locale, key: string): string {
  return dictionaries[locale][key] ?? dictionaries["pt-BR"][key] ?? key;
}
