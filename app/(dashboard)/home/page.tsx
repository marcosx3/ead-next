"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/app/context/auth-context";

export default function HomePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // =====================
  // VIEW: USER NORMAL
  // =====================
  if (!isAdmin) {
    return (
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo(a), {user?.email}</h1>
          <p className="text-muted-foreground">Aqui estão seus cursos e estatísticas gerais.</p>
        </div>

        {/* Progresso geral */}
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Seu Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={70} className="h-3" />
            <p className="mt-2 text-sm text-muted-foreground">70% concluído nos cursos ativos.</p>
          </CardContent>
        </Card>

        {/* Cursos do usuário */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Seus Cursos</h2>

          {["Fundamentos de HTML", "Introdução ao JavaScript", "UX Básico"].map((curso, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{curso}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={(index + 1) * 25} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  Progresso: {(index + 1) * 25}%
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // =====================
  // VIEW: ADMIN
  // =====================
  return (
    <div className="p-6 space-y-10">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">Gestão geral do LMS</p>
      </div>

      {/* Linha de Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total de Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">358</p>
            <p className="text-sm text-muted-foreground">Usuários ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cursos Publicados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">14</p>
            <p className="text-sm text-muted-foreground">Disponíveis para os estudantes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Média de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={48} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">48% de taxa geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Cursos Recentes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Cursos Recentemente Criados</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["React Avançado", "Lógica de Programação", "Design UI Básico"].map((curso, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{curso}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="mb-2">Ativo</Badge>
                <p className="text-sm text-muted-foreground">
                  {10 + index * 3} novas matrículas nesta semana
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Atividades Recentes</h2>

        <Card>
          <CardContent className="py-4 space-y-3">
            {["Novo aluno registrado", "Curso atualizado: React Avançado", "Certificado emitido para João"].map((item, index) => (
              <div key={index} className="flex justify-between border-b pb-2 last:border-none">
                <span>{item}</span>
                <span className="text-xs text-muted-foreground">há {index + 1}h</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}