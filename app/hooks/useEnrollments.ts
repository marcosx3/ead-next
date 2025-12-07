// hooks/useEnrollments.ts
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context";
import { toast } from "sonner";

const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useEnrollments = (userId: string) => {
  const [enrollments, setEnrollments] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEnrollments() {
      const token = localStorage.getItem("access_token");
      try {
        const res = await fetch(`${baseAPI}users/${userId}/enrollments`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        const enrolledCourses = result.data.reduce((acc: { [key: number]: boolean }, enrollment: any) => {
          acc[enrollment.course.id] = true;
          return acc;
        }, {});

        setEnrollments(enrolledCourses);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar as inscrições.");
      } finally {
        setLoading(false);
      }
    }

    loadEnrollments();
  }, [userId]);

  return { enrollments, loading };
};
