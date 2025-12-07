import { toast } from "sonner";

// services/courseService.ts (ou hook useEnrollments.ts)
export const handleEnrollment = async (course_id: number | string, price: number, user: any, enrollments: any) => {
  const token = localStorage.getItem("access_token");

  if (!token || !user) {
    toast.error("Sessão expirada ou usuário não encontrado.");
    return;
  }

  // Verifica se o aluno já está inscrito
  if (enrollments[course_id]) {
    toast.info("Você já está inscrito neste curso.");
    return;
  }

  if (price > 0 && !enrollments[course_id]) {
    // Se o curso for pago, redireciona para o checkout
    window.location.href = `/checkout/${course_id}`;
    return;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}courses/inscricao`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: user.sub,
        course_id: course_id,
      }),
    });

    if (res.ok) {
      toast.success("Inscrição realizada com sucesso!");
    } else {
      const errorData = await res.json();
      toast.error(errorData.message || "Erro ao realizar inscrição.");
    }
  } catch (error) {
    console.error(error);
    toast.error("Erro ao realizar inscrição.");
  }
};
