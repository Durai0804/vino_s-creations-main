import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';



interface User {
    email: string;
}

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('vino_admin_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        setLoading(true);

        // Simple manual validation as requested
        const validAdmins = {
            'pvino4898@gmail.com': 'V9514773265p',
            'chairmadurai0804@gmail.com': 'Rasukutty0804'
        };

        const targetPass = validAdmins[email as keyof typeof validAdmins];

        if (targetPass && pass === targetPass) {
            localStorage.setItem('vino_admin_user', JSON.stringify({ email }));
            localStorage.setItem('vino_admin_pass', pass);
            setUser({ email });
            setLoading(false);
            return;
        }

        setLoading(false);
        throw new Error('Invalid email or password');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('vino_admin_user');
        localStorage.removeItem('vino_admin_pass');
    };

    const isAdmin = !!user;

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
