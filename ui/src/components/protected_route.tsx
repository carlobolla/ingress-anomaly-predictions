import { ReactNode, useEffect, useState } from 'react';
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

    if (!isAuthenticated) return <></>;

    return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: ReactNode }) => {
    const { verifyAuth } = useAuth();
    const navigate = useNavigate();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        verifyAuth().then(valid => {
            if (!valid) { navigate('/'); return; }
            const auth = sessionStorage.getItem('auth');
            const token = auth ? JSON.parse(auth).token : null;
            if (!token || getTokenRole(token) !== 'admin') { navigate('/'); return; }
            setAuthChecked(true);
        });
    }, [verifyAuth, navigate]);

    if (!authChecked) return <></>;

    return <>{children}</>;
};