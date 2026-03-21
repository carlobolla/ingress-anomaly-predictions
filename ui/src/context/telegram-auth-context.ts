import { createContext } from 'react';
import { User, TelegramResponse } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    logout: () => void;
    handleTelegramResponse: (response: TelegramResponse) => Promise<void>;
    verifyAuth: () => Promise<boolean>;
}

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  logout: () => {},
  handleTelegramResponse: async () => {},
  verifyAuth: async () => false
};

const TelegramAuthContext = createContext<AuthContextType>(defaultContext)

export default TelegramAuthContext;