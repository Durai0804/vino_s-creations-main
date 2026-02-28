import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const ADMIN_EMAILS = [
    'pvino4898@gmail.com',
    'chairmadurai0804@gmail.com'
];

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

    const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

    useEffect(() => {
        const savedUser = localStorage.getItem('vino_admin_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        if (!ADMIN_EMAILS.includes(email)) {
            throw new Error('Unauthorized email address');
        }

        if (pass !== 'Rasukutty0804') {
            throw new Error('Invalid password');
        }

        const loggedInUser = { email };
        setUser(loggedInUser);
        localStorage.setItem('vino_admin_user', JSON.stringify(loggedInUser));
        localStorage.setItem('vino_admin_pass', pass); // For API requests
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('vino_admin_user');
        localStorage.removeItem('vino_admin_pass');
    };

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
