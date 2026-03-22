import { ReactNode, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { TelegramAuthContext } from ".";
import api from "../api/axios";
import { User, TelegramResponse } from "../types";
import { isTokenExpired } from "../utils/jwt";

const TelegramAuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const verifyAuth = useCallback(async (): Promise<boolean> => {
        const auth = sessionStorage.getItem('auth');
        if (!auth) return false;

        try {
            const { token, user } = JSON.parse(auth);

            if (isTokenExpired(token)) {
                sessionStorage.removeItem('auth');
                setUser(null);
                setIsAuthenticated(false);
                return false;
            }
    
            setUser(user);
            setIsAuthenticated(true);
    
            // Verify with backend
            await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            return true;
        } catch {
            sessionStorage.removeItem('auth');
            setUser(null);
            setIsAuthenticated(false);
            return false;
        }
    }, []);
    
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const userParam = params.get('user');
        if (token && userParam) {
            try {
                const user = JSON.parse(userParam);
                sessionStorage.setItem('auth', JSON.stringify({ token, user }));
                setUser(user);
                setIsAuthenticated(true);
                // Clean up URL
                const clean = new URL(window.location.href);
                clean.searchParams.delete('token');
                clean.searchParams.delete('user');
                window.history.replaceState({}, '', clean.toString());
                return;
            } catch { /* fall through to verifyAuth */ }
        }
        verifyAuth();
    }, [verifyAuth]);

    const handleTelegramResponse = async (response: TelegramResponse) => {
        try {
            const res = await api.post('/auth/telegram', { response });
            sessionStorage.setItem('auth', JSON.stringify(res.data));
            setUser(res.data.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error(error);
        }
    };

    const logout = () => {
        sessionStorage.removeItem('auth');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/');
    };

    const updateUser = (updated: Partial<User>) => {
        setUser(prev => {
            if (!prev) return prev;
            const next = { ...prev, ...updated };
            const auth = sessionStorage.getItem('auth');
            if (auth) {
                const parsed = JSON.parse(auth);
                sessionStorage.setItem('auth', JSON.stringify({ ...parsed, user: next }));
            }
            return next;
        });
    };

    return (
        <TelegramAuthContext.Provider
            value={{
                user,
                isAuthenticated,
                logout,
                handleTelegramResponse,
                verifyAuth,
                updateUser
            }}
        >
            {children}
        </TelegramAuthContext.Provider>
    );
};

export default TelegramAuthProvider;