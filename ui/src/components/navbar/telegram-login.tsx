import { useEffect } from "react";
import { Listbox, ListboxItem, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks";
import UserAvatar from "./user-avatar";

const TelegramLogin = () => {
    const { logout, isAuthenticated, handleTelegramResponse } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        (window as any).onTelegramAuth = handleTelegramResponse;

        if (!document.getElementById('telegram-login-script')) {
            const script = document.createElement('script');
            script.id = 'telegram-login-script';
            script.src = 'https://oauth.telegram.org/js/telegram-login.js?3';
            script.async = true;
            script.setAttribute('data-client-id', '8298300844');
            script.setAttribute('data-onauth', 'onTelegramAuth(data)');
            script.setAttribute('data-request-access', 'write');
            document.head.appendChild(script);
        }

        return () => { delete (window as any).onTelegramAuth; };
    }, [handleTelegramResponse]);

    return (
        <>
            {isAuthenticated ? (
                <Popover placement="bottom" showArrow={true}>
                    <PopoverTrigger>
                        <UserAvatar size="sm" />
                    </PopoverTrigger>
                    <PopoverContent>
                        <Listbox aria-label="Actions">
                            <ListboxItem onPress={() => navigate('/profile')} key="profile">
                                Profile
                            </ListboxItem>
                            <ListboxItem onPress={logout} key="logout" className="text-danger" color="danger">
                                Logout
                            </ListboxItem>
                        </Listbox>
                    </PopoverContent>
                </Popover>
            ) : (
                <div>
                    <button className="tg-auth-button">Sign In with Telegram</button>
                </div>
            )}
        </>
    );
}

export default TelegramLogin;