
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/auth-context';
import { Course } from '../types/course';

type EnrollmentsMap = Record<number, boolean>;

function normalizeBase(base?: string): string {
  if (!base) return '';
  return base.endsWith('/') ? base : `${base}/`;
}

async function safeJson(res: Response) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return {};
    }
  }
  try {
    const text = await res.text();
    return { message: text };
  } catch {
    return {};
  }
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EnrollmentsMap>({});
  const { user } = useAuth();

  const baseAPI = normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL);
  const API_URL = `${baseAPI}courses`;

  useEffect(() => {
    const ac = new AbortController();

    async function loadCourses() {

      setLoading(true);
      const token = localStorage.getItem('access_token');

      if (!token) {
        toast.error('Sessão expirada ou não autenticada.');
        setLoading(false);
        return;
      }

      if (!user?.sub) {
        toast.error('Usuário não encontrado ou não autenticado.');
        setLoading(false);
        return;
      }

      try {
        // Carrega cursos
        const res = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          signal: ac.signal,
        });

        const result = await safeJson(res);
        if (!res.ok) {
          console.error('Erro ao carregar cursos:', {
            status: res.status,
            statusText: res.statusText,
            body: result,
          });
          toast.error('Erro ao carregar cursos.');
          return;
        }

        setCourses((result as any).data ?? (result as Course[]));

        // Carrega inscrições do usuário
        const userEnrollments = await fetchEnrollments(user.sub, token, baseAPI, ac.signal);
        setEnrollments(userEnrollments);
      } catch (err) {
        if ((err as any).name !== 'AbortError') {
          console.error('Erro ao carregar cursos:', err);
          toast.error('Erro ao carregar cursos.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadCourses();

    return () => ac.abort();
  }, [user?.sub]); // depende só do ID

  const fetchEnrollments = async (
    userId: string,
    token: string,
    base: string,
    signal?: AbortSignal
  ): Promise<EnrollmentsMap> => {
    if (!userId) {
      console.error('Usuário não encontrado ou não autenticado.');
      return {};
    }

    try {
      const url = `${base}enrollment/user/${userId}`;

      const enrollmentsResponse = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        signal,
      });
      const payload = await safeJson(enrollmentsResponse);

      if (!enrollmentsResponse.ok) {
        console.error('Erro ao buscar inscrições:', {
          status: enrollmentsResponse.status,
          statusText: enrollmentsResponse.statusText,
          body: payload,
        });
        return {};
      }

      // payload esperado: Enrollment[]
      if (Array.isArray(payload)) {
        if (payload.length === 0) {
          return {};
        }
        return payload.reduce((acc: EnrollmentsMap, enrollment: any) => {
          acc[Number(enrollment.id)] = true;
          return acc;
        }, {});
      } else {
        console.error('Formato inesperado para enrollmentsData:', payload);
        return {};
      }
    } catch (err) {
      if ((err as any).name !== 'AbortError') {
        console.error('Erro ao carregar inscrições:', err);
      }
      return {};
    }
  };

  const handleEnrollment = async (courseId: number | string, price: number) => {
    const token = localStorage.getItem('access_token');

    if (!token || !user?.sub) {
      toast.error('Sessão expirada ou usuário não encontrado.');
      return;
    }

    const numericId = Number(courseId);

    if (enrollments[numericId]) {
      toast.info('Você já está inscrito neste curso.');
      return;
    }

    if (price > 0) {
      // curso pago: direciona ao checkout
      window.location.href = `/checkout/${numericId}`;
      return;
    }

    try {
      const res = await fetch(`${baseAPI}enrollment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          user_id: user.sub,
          course_id: numericId,
        }),
      });

      const payload = await safeJson(res);

      if (res.ok) {
        toast.success('Inscrição realizada com sucesso!');
        setEnrollments(prev => ({ ...prev, [numericId]: true }));
      } else {
        console.error('Erro ao realizar inscrição:', {
          status: res.status,
          statusText: res.statusText,
          body: payload,
        });
        toast.error((payload as any)?.message || 'Erro ao realizar inscrição.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao realizar inscrição.');
    }
  };

  return { courses, loading, enrollments, handleEnrollment };
}
