export type Course = {
    id: string;
    title: string;
    slug: string;
    description: string;
    is_paid: boolean;
    price: number;
    is_published: boolean;
    points_awarded: number;
    status: string;
}