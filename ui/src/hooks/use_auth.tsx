import { useContext } from 'react';
import TelegramAuthContext from '@/context/telegram-auth-context';

const useAuth = () => {
    const context = useContext(TelegramAuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a TelegramAuthProvider');
    }
    return context;
};

export default useAuth;