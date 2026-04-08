import { createContext } from 'react';
import type User from '@/types/user';
import type TelegramResponse from '@/types/telegram-response';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    logout: () => void;
    handleTelegramResponse: (response: TelegramResponse) => Promise<void>;
    verifyAuth: () => Promise<boolean>;
    updateUser: (updated: Partial<User>) => void;
}

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  logout: () => {},
  handleTelegramResponse: async () => {},
  verifyAuth: async () => false,
  updateUser: () => {}
};

const TelegramAuthContext = createContext<AuthContextType>(defaultContext)

export default TelegramAuthContext;