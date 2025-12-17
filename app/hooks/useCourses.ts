
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

      if (!token || !user?.sub) {
        setLoading(false);
        return;
      }

      try {
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
          toast.error('Erro ao carregar cursos.');
          return;
        }

        setCourses((result as any).data ?? (result as Course[]));

        // Carrega inscrições e popula o mapa
        const userEnrollments = await fetchEnrollments(user.sub, token, baseAPI, ac.signal);
        setEnrollments(userEnrollments);
      } catch (err) {
        if ((err as any).name !== 'AbortError') {
          toast.error('Erro ao carregar conteúdo.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
    return () => ac.abort();
  }, [user?.sub]);

  const fetchEnrollments = async (
    userId: string,
    token: string,
    base: string,
    signal?: AbortSignal
  ): Promise<EnrollmentsMap> => {
    try {
      const url = `${base}enrollment/user/${userId}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal,
      });
      const payload = await safeJson(res);
    
			if (Array.isArray(payload)) {
				return payload.reduce((acc: EnrollmentsMap, enrollment: any) => {
					const courseId = enrollment.course?.id;
					
					if (courseId) {
						acc[Number(courseId)] = true;
					}
					return acc;
				}, {});
			}
			return {};
    } catch (err) {
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
