import { useEffect } from "react";
import { Avatar, Listbox, ListboxItem, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { useAuth } from "../../hooks";

const TelegramLogin = () => {
    const { logout, user, isAuthenticated, handleTelegramResponse } = useAuth();
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
                        <div className="cursor-pointer flex gap-3 items-center">
                            <Avatar size="sm" isBordered color="success" src={user?.photo_url} />
                            {user?.first_name}
                        </div>
                    </PopoverTrigger>
                    <PopoverContent>
                        <Listbox aria-label="Actions">
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