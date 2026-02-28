import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { login, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already admin
    useEffect(() => {
        if (isAdmin) {
            navigate('/admin', { replace: true });
        }
    }, [isAdmin, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/admin', { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-charcoal' : 'bg-cream'}`}>
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute top-1/3 left-1/4 w-72 h-72 rounded-full blur-3xl
            ${isDark ? 'bg-gold-muted/5' : 'bg-gold/5'}`}
                />
                <motion.div
                    animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl
            ${isDark ? 'bg-terracotta/5' : 'bg-terracotta/5'}`}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`relative w-full max-w-md p-8 sm:p-10 rounded-3xl
          ${isDark
                        ? 'bg-dark-surface border border-dark-border shadow-2xl'
                        : 'bg-white border border-beige-dark/20 shadow-2xl shadow-gold/5'
                    }`}
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4
            ${isDark ? 'bg-gold-muted/10' : 'bg-gold/10'}`}>
                        <Lock size={28} className="text-gold" />
                    </div>
                    <h1 className={`font-serif text-2xl font-bold mb-2
            ${isDark ? 'text-dark-text' : 'text-charcoal'}`}>
                        Admin Access
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-dark-text/50' : 'text-light-text/60'}`}>
                        Sign in with your credentials to manage products
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}

                    <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-dark-text/50' : 'text-light-text/60'}`}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl outline-none transition-all duration-300
                                ${isDark
                                    ? 'bg-charcoal border border-dark-border focus:border-gold text-dark-text'
                                    : 'bg-cream/30 border border-beige-dark/20 focus:border-gold text-charcoal'
                                }`}
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-dark-text/50' : 'text-light-text/60'}`}>
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl outline-none transition-all duration-300
                                ${isDark
                                    ? 'bg-charcoal border border-dark-border focus:border-gold text-dark-text'
                                    : 'bg-cream/30 border border-beige-dark/20 focus:border-gold text-charcoal'
                                }`}
                            placeholder="Enter password"
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className={`w-full py-4 mt-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3
                            ${loading
                                ? 'opacity-60 cursor-not-allowed'
                                : 'hover:shadow-[0_8px_30px_rgba(212,168,83,0.3)]'
                            }
                            bg-gradient-to-r from-gold to-gold-muted text-charcoal`}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
