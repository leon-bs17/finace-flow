import { redirect } from "next/navigation";

/**
 * Rota raiz "/" — redireciona para o dashboard.
 * Em produção, o middleware de autenticação intercepta primeiro e manda para /login se necessário.
 */
export default function RootPage() {
  redirect("/dashboard");
}
