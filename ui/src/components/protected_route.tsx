import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router';
import useAuth from '@/hooks/use_auth';
import { getTokenRole } from '@/utils/jwt';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, verifyAuth } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        const verify = async () => {
            const isValid = await verifyAuth();
            if (!isValid)
                navigate('/');
        };
        verify();
    }, [verifyAuth, navigate]);

    if (!isAuthenticated) return null;

    return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, verifyAuth } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        verifyAuth().then(valid => {
            if (!valid) navigate('/');
        });
    }, [verifyAuth, navigate]);

    const auth = sessionStorage.getItem('auth');
    const token = auth ? JSON.parse(auth).token : null;
    const isAdmin = token ? getTokenRole(token) === 'admin' : false;

    if (!isAuthenticated || !isAdmin) return null;

    return <>{children}</>;
};