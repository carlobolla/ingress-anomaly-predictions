import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router';
import useAuth from '@/hooks/use_auth';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
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

export default ProtectedRoute;