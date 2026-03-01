export interface Product {
    id: string;
    name: string;
    description: string;
    size: string;
    price?: string;
    image_url: string; // Maintain for thumbnail
    image_urls?: string[]; // Array of all images
    material?: string;
    usage_suggestion?: string;
    created_at: string;
    updated_at: string;
}

export interface ProductFormData {
    name: string;
    description: string;
    size: string;
    price?: string;
    material?: string;
    usage_suggestion?: string;
    images?: File[]; // Array of new files
    existing_image_urls?: string[]; // For updates
}

export interface AdminUser {
    uid: string;
    email: string;
    displayName?: string;
}

export interface Testimonial {
    id: string;
    name: string;
    role?: string;
    content: string;
    rating: number;
    image_url?: string;
    created_at: string;
}

export interface TestimonialFormData {
    name: string;
    role?: string;
    content: string;
    rating: number;
    image?: File | null;
}
