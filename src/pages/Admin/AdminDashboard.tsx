import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, LogOut, Package, BarChart3, Search, X, Upload, Save, AlertCircle, MessageCircle, Star } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { useTestimonials } from '../../hooks/useTestimonials';
import { productService, testimonialService } from '../../services/api';
import type { Product, ProductFormData, Testimonial, TestimonialFormData } from '../../types';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { logout, user } = useAuth();
    const { products, loading, refetch } = useProducts();
    const { testimonials, loading: testimonialsLoading, refetch: refetchTestimonials } = useTestimonials();
    const navigate = useNavigate();

    // Testimonial state
    const [showTestimonialForm, setShowTestimonialForm] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [testimonialFormLoading, setTestimonialFormLoading] = useState(false);
    const [testimonialFormError, setTestimonialFormError] = useState('');
    const [deleteTestimonialConfirm, setDeleteTestimonialConfirm] = useState<string | null>(null);
    const [testimonialFormData, setTestimonialFormData] = useState<TestimonialFormData>({
        name: '',
        role: '',
        content: '',
        rating: 5,
        image: null,
    });

    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        size: '',
        price: '',
        material: '',
        usage_suggestion: '',
        images: [],
        existing_image_urls: []
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            size: '',
            price: '',
            material: '',
            usage_suggestion: '',
            images: [],
            existing_image_urls: []
        });
        setEditingProduct(null);
        setShowForm(false);
        setFormError('');
    };

    const openEditForm = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            size: product.size,
            price: product.price || '',
            material: product.material || '',
            usage_suggestion: product.usage_suggestion || '',
            images: [],
            existing_image_urls: product.image_urls || [product.image_url],
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');

        try {
            if (editingProduct) {
                await productService.update(editingProduct.id, formData);
            } else {
                if (!formData.images || formData.images.length === 0) {
                    setFormError('Please select at least one image');
                    setFormLoading(false);
                    return;
                }
                await productService.create(formData);
            }
            resetForm();
            refetch();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setFormLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), ...files]
            }));
        }
    };

    const removeNewImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    const removeExistingImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            existing_image_urls: (prev.existing_image_urls || []).filter((_, i) => i !== index)
        }));
    };

    const handleDelete = async (id: string) => {
        try {
            await productService.delete(id);
            setDeleteConfirm(null);
            refetch();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Testimonial handlers
    const resetTestimonialForm = () => {
        setTestimonialFormData({
            name: '',
            role: '',
            content: '',
            rating: 5,
            image: null,
            existing_image_url: undefined
        });
        setEditingTestimonial(null);
        setShowTestimonialForm(false);
        setTestimonialFormError('');
    };

    const openEditTestimonialForm = (testimonial: Testimonial) => {
        setEditingTestimonial(testimonial);
        setTestimonialFormData({
            name: testimonial.name,
            role: testimonial.role || '',
            content: testimonial.content,
            rating: testimonial.rating,
            image: null,
            existing_image_url: testimonial.image_url
        });
        setShowTestimonialForm(true);
    };

    const handleTestimonialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTestimonialFormLoading(true);
        setTestimonialFormError('');

        try {
            if (editingTestimonial) {
                await testimonialService.update(editingTestimonial.id, testimonialFormData);
            } else {
                await testimonialService.create(testimonialFormData);
            }
            resetTestimonialForm();
            refetchTestimonials();
        } catch (err) {
            setTestimonialFormError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setTestimonialFormLoading(false);
        }
    };

    const handleDeleteTestimonial = async (id: string) => {
        try {
            await testimonialService.delete(id);
            setDeleteTestimonialConfirm(null);
            refetchTestimonials();
        } catch (err) {
            console.error('Delete testimonial failed:', err);
        }
    };

    return (
        <div className={`min-h-screen pt-20 pb-12 ${isDark ? 'bg-charcoal' : 'bg-cream'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                    <div>
                        <h1 className={`font-serif text-3xl sm:text-4xl font-bold ${isDark ? 'text-dark-text' : 'text-charcoal'}`}>
                            Admin Dashboard
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-dark-text/50' : 'text-light-text/60'}`}>
                            Welcome back, {user?.email}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { resetForm(); setShowForm(true); }}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                bg-gradient-to-r from-gold to-gold-muted text-charcoal
                hover:shadow-[0_4px_20px_rgba(212,168,83,0.3)] transition-all duration-300 shadow-lg shadow-gold/10"
                        >
                            <Plus size={18} />
                            Add Product
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300
                ${isDark
                                    ? 'bg-dark-card border border-dark-border text-dark-text/60 hover:text-red-400 hover:border-red-400/30'
                                    : 'bg-white border border-beige-dark/30 text-light-text/60 hover:text-red-500 hover:border-red-500/30'
                                }`}
                        >
                            <LogOut size={18} />
                            Logout
                        </motion.button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    {[
                        { icon: Package, label: 'Total Products', value: products.length },
                        { icon: BarChart3, label: 'Categories', value: [...new Set(products.map(p => p.size))].length },
                        { icon: Package, label: 'Latest Added', value: products.length > 0 ? new Date(products[0]?.created_at).toLocaleDateString() : 'N/A' },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            whileHover={{ y: -2 }}
                            className={`p-5 rounded-2xl ${isDark
                                ? 'bg-dark-card border border-dark-border'
                                : 'bg-white border border-beige-dark/20'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                  ${isDark ? 'bg-gold-muted/10 text-gold' : 'bg-gold/10 text-gold'}`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-xs uppercase tracking-wider truncate ${isDark ? 'text-dark-text/40' : 'text-light-text/50'}`}>
                                        {stat.label}
                                    </p>
                                    <p className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-charcoal'}`}>
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2
              ${isDark ? 'text-dark-text/30' : 'text-light-text/30'}`} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-300
                ${isDark
                                    ? 'bg-dark-card border border-dark-border text-dark-text placeholder:text-dark-text/25 focus:border-gold-muted/50'
                                    : 'bg-white border border-beige-dark/30 text-charcoal placeholder:text-light-text/30 focus:border-gold/50'
                                }`}
                        />
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <Package size={48} className={`mx-auto mb-4 ${isDark ? 'text-dark-border' : 'text-beige-dark'}`} />
                        <p className={`font-serif text-xl ${isDark ? 'text-dark-text/40' : 'text-light-text/40'}`}>
                            No products found
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map((product, i) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`rounded-2xl overflow-hidden group relative
                                  ${isDark ? 'bg-dark-card border border-dark-border' : 'bg-white border border-beige-dark/20'}`}
                            >
                                <div className="relative aspect-square overflow-hidden">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute inset-0 flex items-center justify-center gap-3
                                    transition-opacity duration-300
                                    md:opacity-0 md:group-hover:opacity-100
                                    ${isDark ? 'bg-charcoal/70' : 'bg-black/40'}`}>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => openEditForm(product)}
                                            className="p-3 rounded-full bg-white/90 text-charcoal shadow-lg hover:bg-gold hover:text-white transition-colors"
                                        >
                                            <Edit size={18} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setDeleteConfirm(product.id)}
                                            className="p-3 rounded-full bg-white/90 text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </motion.button>
                                    </div>
                                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${isDark ? 'bg-charcoal/80 text-gold' : 'bg-white/80 text-gold'}`}>
                                        {product.size}
                                    </div>
                                    {(product.image_urls && product.image_urls.length > 1) && (
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] bg-gold text-charcoal font-bold">
                                            {product.image_urls.length} Photos
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className={`font-serif text-sm font-semibold mb-1 truncate
                    ${isDark ? 'text-dark-text' : 'text-charcoal'}`}>
                                        {product.name}
                                    </h3>
                                    <p className={`text-xs truncate ${isDark ? 'text-dark-text/40' : 'text-light-text/50'}`}>
                                        {product.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* ===== TESTIMONIALS MANAGEMENT SECTION ===== */}
                <div className="mt-16">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                ${isDark ? 'bg-gold-muted/10 text-gold' : 'bg-gold/10 text-gold'}`}>
                                <MessageCircle size={20} />
                            </div>
                            <div>
                                <h2 className={`font-serif text-xl sm:text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-charcoal'}`}>
                                    Customer Testimonials
                                </h2>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-dark-text/40' : 'text-light-text/50'}`}>
                                    {testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''} published
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { resetTestimonialForm(); setShowTestimonialForm(true); }}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                                bg-gradient-to-r from-gold to-gold-muted text-charcoal
                                hover:shadow-[0_4px_20px_rgba(212,168,83,0.3)] transition-all duration-300 shadow-lg shadow-gold/10"
                        >
                            <Plus size={16} />
                            Add Testimonial
                        </motion.button>
                    </div>

                    {/* Testimonials List */}
                    {testimonialsLoading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    ) : testimonials.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageCircle size={40} className={`mx-auto mb-3 ${isDark ? 'text-dark-border' : 'text-beige-dark'}`} />
                            <p className={`font-serif text-lg ${isDark ? 'text-dark-text/40' : 'text-light-text/40'}`}>
                                No testimonials yet
                            </p>
                            <p className={`text-xs mt-1 ${isDark ? 'text-dark-text/25' : 'text-light-text/30'}`}>
                                Add your first customer testimonial
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {testimonials.map((testimonial, i) => (
                                <motion.div
                                    key={testimonial.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`relative p-5 rounded-2xl group
                                        ${isDark ? 'bg-dark-card border border-dark-border' : 'bg-white border border-beige-dark/20'}`}
                                >
                                    {/* Edit and Delete buttons */}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => openEditTestimonialForm(testimonial)}
                                            className={`p-1.5 rounded-full transition-all duration-200
                                                ${isDark
                                                    ? 'text-dark-text/20 hover:text-gold hover:bg-gold/10'
                                                    : 'text-light-text/20 hover:text-gold hover:bg-gold/10'}`}
                                        >
                                            <Edit size={14} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setDeleteTestimonialConfirm(testimonial.id)}
                                            className={`p-1.5 rounded-full transition-all duration-200
                                                ${isDark
                                                    ? 'text-dark-text/20 hover:text-red-400 hover:bg-red-400/10'
                                                    : 'text-light-text/20 hover:text-red-500 hover:bg-red-500/10'}`}
                                        >
                                            <Trash2 size={14} />
                                        </motion.button>
                                    </div>

                                    {/* Stars */}
                                    <div className="flex items-center gap-0.5 mb-3">
                                        {Array.from({ length: 5 }).map((_, starIdx) => (
                                            <Star
                                                key={starIdx}
                                                size={12}
                                                className={starIdx < testimonial.rating
                                                    ? 'text-gold fill-gold'
                                                    : isDark ? 'text-dark-border' : 'text-beige-dark/40'}
                                            />
                                        ))}
                                    </div>

                                    {/* Content */}
                                    <p className={`text-xs leading-relaxed mb-4 line-clamp-3
                                        ${isDark ? 'text-dark-text/60' : 'text-light-text/60'}`}>
                                        "{testimonial.content}"
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-2">
                                        {testimonial.image_url ? (
                                            <img
                                                src={testimonial.image_url}
                                                alt={testimonial.name}
                                                className="w-7 h-7 rounded-full object-cover border border-gold/20"
                                            />
                                        ) : (
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold uppercase
                                                ${isDark
                                                    ? 'bg-gold-muted/15 text-gold border border-gold-muted/20'
                                                    : 'bg-gold/10 text-gold border border-gold/20'}`}>
                                                {testimonial.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className={`text-xs font-semibold truncate ${isDark ? 'text-dark-text' : 'text-charcoal'}`}>
                                                {testimonial.name}
                                            </p>
                                            {testimonial.role && (
                                                <p className={`text-[10px] truncate ${isDark ? 'text-dark-text/35' : 'text-light-text/40'}`}>
                                                    {testimonial.role}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== PRODUCT FORM MODAL ===== */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => resetForm()}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8
                ${isDark ? 'bg-dark-surface border border-dark-border' : 'bg-white border border-beige-dark/20'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`font-serif text-xl font-bold
                  ${isDark ? 'text-dark-text' : 'text-charcoal'}`}>
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className={`p-2 rounded-full hover:bg-opacity-10 transition-colors
                                    ${isDark ? 'text-dark-text/40 hover:text-dark-text' : 'text-light-text/40 hover:text-charcoal'}`}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {formError && (
                                <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                    <AlertCircle size={16} />
                                    {formError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5
                                    ${isDark ? 'text-dark-text/60' : 'text-light-text/60'}`}>
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Traditional Lotus Kolam"
                                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300
                                          ${isDark
                                                ? 'bg-dark-card border border-dark-border text-dark-text placeholder:text-dark-text/25 focus:border-gold-muted/50'
                                                : 'bg-beige/50 border border-beige-dark/30 text-charcoal placeholder:text-light-text/30 focus:border-gold/50'
                                            }`}
                                    />
                                </div>

                                {/* Size (User Given) */}
                                <div>
                                    <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5
                                    ${isDark ? 'text-dark-text/60' : 'text-light-text/60'}`}>
                                        Size / Category *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.size}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        required
                                        placeholder="e.g. 10x10, Custom, Large..."
                                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300
                                          ${isDark
                                                ? 'bg-dark-card border border-dark-border text-dark-text placeholder:text-dark-text/25 focus:border-gold-muted/50'
                                                : 'bg-beige/50 border border-beige-dark/30 text-charcoal placeholder:text-light-text/30 focus:border-gold/50'
                                            }`}
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5
                                    ${isDark ? 'text-dark-text/60' : 'text-light-text/60'}`}>
                                        Price (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.price || ''}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="e.g. ₹499"
                                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300
                                           ${isDark
                                                ? 'bg-dark-card border border-dark-border text-dark-text placeholder:text-dark-text/25 focus:border-gold-muted/50'
                                                : 'bg-beige/50 border border-beige-dark/30 text-charcoal placeholder:text-light-text/30 focus:border-gold/50'
                                            }`}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5
                                    ${isDark ? 'text-dark-text/60' : 'text-light-text/60'}`}>
                                        Description *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        rows={3}
                                        placeholder="Describe the kolam design..."
                                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all duration-300
                                          ${isDark
                                                ? 'bg-dark-card border border-dark-border text-dark-text placeholder:text-dark-text/25 focus:border-gold-muted/50'
                                                : 'bg-beige/50 border border-beige-dark/30 text-charcoal placeholder:text-light-text/30 focus:border-gold/50'
                                            }`}
                                    />
                                </div>

                                {/* Material & Usage */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5
                                        ${isDark ? 'text-dark-text/60' : 'text-light-text/60'}`}>
                                            Material
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.material || ''}
                                            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                            placeholder="e.g. PVC"
                                            className={`w-full px-4 py-3 rounded-xl text-sm outline-none
                                              ${isDark ? 'bg-dark-card border border-dark-border' : 'bg-beige/50 border border-beige-dark/30'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5
                                        ${isDark ? 'text-dark-text/60' : 'text-light-text/60'}`}>
                                            Usage
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.usage_suggestion || ''}
                                            onChange={(e) => setFormData({ ...formData, usage_suggestion: e.target.value })}
                                            placeholder="e.g. Indoor"
                                            className={`w-full px-4 py-3 rounded-xl text-sm outline-none
                                              ${isDark ? 'bg-dark-card border border-dark-border' : 'bg-beige/50 border border-beige-dark/30'}`}
                                        />
                                    </div>
                                </div>

                                {/* Photo Gallery Management */}
                                <div className="space-y-3">
                                    <label className={`block text-xs font-medium uppercase tracking-wider
                                    ${isDark ? 'text-dark-text/60' : 'text-light-text/60'}`}>
                                        Photo Gallery {!editingProduct && '*'}
                                    </label>

                                    {/* Existing Images (Edit mode) */}
                                    {formData.existing_image_urls && formData.existing_image_urls.length > 0 && (
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
                                            {formData.existing_image_urls.map((url, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gold/20 bg-charcoal/20">
                                                    <img src={url} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(idx)}
                                                        className="absolute top-0.5 right-0.5 p-1 bg-red-500 text-white rounded-full transition-transform hover:scale-110 shadow-md"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* New Images Preview */}
                                    {formData.images && formData.images.length > 0 && (
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
                                            {formData.images.map((file, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gold/50 bg-gold/10 flex items-center justify-center">
                                                    <div className="text-[10px] text-center p-1 break-all overflow-hidden text-gold font-bold">
                                                        {file.name.substring(0, 8)}...
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewImage(idx)}
                                                        className="absolute top-0.5 right-0.5 p-1 bg-charcoal text-white rounded-full shadow-md"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <label className={`flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300
                                    ${isDark ? 'border-dark-border hover:border-gold-muted/30 hover:bg-gold-muted/5' : 'border-beige-dark/30 hover:border-gold/30 hover:bg-gold/5'}`}>
                                        <Upload size={20} className={`mb-1 ${isDark ? 'text-dark-text/30' : 'text-light-text/30'}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-dark-text/40' : 'text-light-text/40'}`}>
                                            Add Photos
                                        </span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>

                                {/* Submit */}
                                <motion.button
                                    type="submit"
                                    disabled={formLoading}
                                    whileHover={{ scale: formLoading ? 1 : 1.02 }}
                                    whileTap={{ scale: formLoading ? 1 : 0.98 }}
                                    className={`w-full py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-300
                                    ${formLoading ? 'opacity-60 cursor-not-allowed' : ''}
                                    bg-gradient-to-r from-gold to-gold-muted text-charcoal shadow-lg shadow-gold/10`}
                                >
                                    {formLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Save size={16} />
                                            {editingProduct ? 'Update Product' : 'Create Product'}
                                        </span>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== DELETE CONFIRMATION MODAL ===== */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`w-full max-w-sm p-6 rounded-2xl
                ${isDark ? 'bg-dark-surface border border-dark-border' : 'bg-white border border-beige-dark/20'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className={`font-serif text-lg font-bold mb-2
                ${isDark ? 'text-dark-text' : 'text-charcoal'}`}>
                                Delete Product
                            </h3>
                            <p className={`text-sm mb-6 ${isDark ? 'text-dark-text/50' : 'text-light-text/60'}`}>
                                Are you sure? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${isDark
                                            ? 'bg-dark-card border border-dark-border text-dark-text/60 hover:text-dark-text'
                                            : 'bg-beige border border-beige-dark/30 text-light-text/60 hover:text-charcoal'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== TESTIMONIAL FORM MODAL ===== */}
            <AnimatePresence>
                {showTestimonialForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => resetTestimonialForm()}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8
                                ${isDark ? 'bg-dark-surface border border-dark-border' : 'bg-white border border-beige-dark/20'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`font-serif text-xl font-bold
                                    ${isDark ? 'text-dark-text' : 'text-charcoal'}`}>
                                    {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                                </h2>
                                <button
                                    onClick={resetTestimonialForm}
                                    className={`p-2 rounded-full hover:bg-opacity-10 transition-colors
                                        ${isDark ? 'text-dark-text/40 hover:text-dark-text' : 'text-light-text/40 hover:text-charcoal'}`}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {testimonialFormError && (
                                <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                    <AlertCircle size={16} />
                                    {testimonialFormError}
                                </div>
                            )}

                            <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                                {/* Customer Name */}
                                <div>
                                    <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5
                                        ${isDark ? 'text-dark-text/60' : 'text-light-text/60'}`}>
                                        Customer Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={testimonialFormData.name}
                                        onChange={(e) => setTestimonialFormData({ ...testimonialFormData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Priya Sharma"
                                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300
                                            ${isDark
                                                ? 'bg-dark-card border border-dark-border text-dark-text placeholder:text-dark-text/25 focus:border-gold-muted/50'
                                                : 'bg-beige/50 border border-beige-dark/30 text-charcoal placeholder:text-light-text/30 focus:border-gold/50'
                                            }`}
                                    />
                                </div>

                                {/* Role / Title */}
                                <div>
                                    <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5
                                        ${isDark ? 'text-dark-text/60' : 'text-light-text/60'}`}>
                                        Role / Title (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={testimonialFormData.role || ''}
                                        onChange={(e) => setTestimonialFormData({ ...testimonialFormData, role: e.target.value })}
                                        placeholder="e.g. Homemaker, Art Enthusiast"
                                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300
                                            ${isDark
                                                ? 'bg-dark-card border border-dark-border text-dark-text placeholder:text-dark-text/25 focus:border-gold-muted/50'
                                                : 'bg-beige/50 border border-beige-dark/30 text-charcoal placeholder:text-light-text/30 focus:border-gold/50'
                                            }`}
                                    />
                                </div>

                                {/* Review Content */}
                                <div>
                                    <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5
                                        ${isDark ? 'text-dark-text/60' : 'text-light-text/60'}`}>
                                        Review *
                                    </label>
                                    <textarea
                                        value={testimonialFormData.content}
                                        onChange={(e) => setTestimonialFormData({ ...testimonialFormData, content: e.target.value })}
                                        required
                                        rows={4}
                                        placeholder="What did the customer say about our products?"
                                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all duration-300
                                            ${isDark
                                                ? 'bg-dark-card border border-dark-border text-dark-text placeholder:text-dark-text/25 focus:border-gold-muted/50'
                                                : 'bg-beige/50 border border-beige-dark/30 text-charcoal placeholder:text-light-text/30 focus:border-gold/50'
                                            }`}
                                    />
                                </div>

                                {/* Star Rating */}
                                <div>
                                    <label className={`block text-xs font-medium uppercase tracking-wider mb-2
                                        ${isDark ? 'text-dark-text/60' : 'text-light-text/60'}`}>
                                        Rating *
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setTestimonialFormData({ ...testimonialFormData, rating: star })}
                                                className="p-1 transition-colors"
                                            >
                                                <Star
                                                    size={24}
                                                    className={star <= testimonialFormData.rating
                                                        ? 'text-gold fill-gold'
                                                        : isDark ? 'text-dark-border' : 'text-beige-dark/40'}
                                                />
                                            </motion.button>
                                        ))}
                                        <span className={`text-xs ml-2 ${isDark ? 'text-dark-text/40' : 'text-light-text/50'}`}>
                                            {testimonialFormData.rating}/5
                                        </span>
                                    </div>
                                </div>

                                {/* Customer Photo (Optional) */}
                                <div>
                                    <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5
                                        ${isDark ? 'text-dark-text/60' : 'text-light-text/60'}`}>
                                        Customer Photo (Optional)
                                    </label>

                                    {/* Image Preview */}
                                    {(testimonialFormData.image || testimonialFormData.existing_image_url) && (
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gold/20 mb-3">
                                            <img
                                                src={testimonialFormData.image ? URL.createObjectURL(testimonialFormData.image) : testimonialFormData.existing_image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setTestimonialFormData({ ...testimonialFormData, image: null, existing_image_url: undefined })}
                                                className="absolute top-0.5 right-0.5 p-1 bg-red-500 text-white rounded-full transition-transform hover:scale-110 shadow-md"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    )}

                                    <label className={`flex flex-col items-center justify-center w-full h-20 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300
                                        ${isDark ? 'border-dark-border hover:border-gold-muted/30 hover:bg-gold-muted/5' : 'border-beige-dark/30 hover:border-gold/30 hover:bg-gold/5'}`}>
                                        <Upload size={18} className={`mb-1 ${isDark ? 'text-dark-text/30' : 'text-light-text/30'}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-dark-text/40' : 'text-light-text/40'}`}>
                                            {testimonialFormData.image || testimonialFormData.existing_image_url ? 'Change Photo' : 'Upload Photo'}
                                        </span>
                                        <input
                                            id="testimonial-image"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                setTestimonialFormData({ ...testimonialFormData, image: file });
                                            }}
                                        />
                                    </label>
                                </div>

                                {/* Submit */}
                                <motion.button
                                    type="submit"
                                    disabled={testimonialFormLoading}
                                    whileHover={{ scale: testimonialFormLoading ? 1 : 1.02 }}
                                    whileTap={{ scale: testimonialFormLoading ? 1 : 0.98 }}
                                    className={`w-full py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-300 mt-2
                                            ${testimonialFormLoading ? 'opacity-60 cursor-not-allowed' : ''}
                                            bg-gradient-to-r from-gold to-gold-muted text-charcoal shadow-lg shadow-gold/10`}
                                >
                                    {testimonialFormLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Save size={16} />
                                            {editingTestimonial ? 'Update Testimonial' : 'Publish Testimonial'}
                                        </span>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== DELETE TESTIMONIAL CONFIRMATION ===== */}
            <AnimatePresence>
                {deleteTestimonialConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setDeleteTestimonialConfirm(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`w-full max-w-sm p-6 rounded-2xl
                                ${isDark ? 'bg-dark-surface border border-dark-border' : 'bg-white border border-beige-dark/20'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className={`font-serif text-lg font-bold mb-2
                                ${isDark ? 'text-dark-text' : 'text-charcoal'}`}>
                                Delete Testimonial
                            </h3>
                            <p className={`text-sm mb-6 ${isDark ? 'text-dark-text/50' : 'text-light-text/60'}`}>
                                Are you sure? This testimonial will be removed from the homepage.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteTestimonialConfirm(null)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors
                                        ${isDark
                                            ? 'bg-dark-card border border-dark-border text-dark-text/60 hover:text-dark-text'
                                            : 'bg-beige border border-beige-dark/30 text-light-text/60 hover:text-charcoal'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteTestimonial(deleteTestimonialConfirm)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
