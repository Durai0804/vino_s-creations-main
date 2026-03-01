import { useState, useEffect, useCallback } from 'react';
import { testimonialService } from '../services/api';
import type { Testimonial } from '../types';

export function useTestimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTestimonials = useCallback(async () => {
        try {
            setLoading(true);
            const data = await testimonialService.getAll();
            setTestimonials(data);
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    return { testimonials, loading, refetch: fetchTestimonials };
}
