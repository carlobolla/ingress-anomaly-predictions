import { useEffect } from "react";
import { Button, Label, ListBox, Popover } from "@heroui/react";
import { useNavigate } from "react-router";
import useAuth from '@/hooks/use_auth';
import UserAvatar from "./user-avatar";

const TelegramLogin = () => {
    const { logout, isAuthenticated, handleTelegramResponse } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!document.getElementById('telegram-login-script')) {
            const script = document.createElement('script');
            script.id = 'telegram-login-script';
            script.src = 'https://oauth.telegram.org/js/telegram-login.js?3';
            script.async = true;
            document.head.appendChild(script);
        }

        return () => {};
    }, []);

    return (
        <>
            {isAuthenticated ? (
                <Popover>
                    <Popover.Trigger>
                        <UserAvatar size="sm" />
                    </Popover.Trigger>
                    <Popover.Content placement="bottom">
                        <Popover.Arrow />
                        <Popover.Dialog>
                            <ListBox aria-label="Actions" onAction={(key) => {
                                if (key === 'profile') navigate('/profile');
                                if (key === 'logout') logout();
                            }}>
                                <ListBox.Item id="profile" textValue="Profile">
                                    <Label>Profile</Label>
                                </ListBox.Item>
                                <ListBox.Item id="logout" textValue="Logout" variant="danger">
                                    <Label>Logout</Label>
                                </ListBox.Item>
                            </ListBox>
                        </Popover.Dialog>
                    </Popover.Content>
                </Popover>
            ) : (
                <div className="flex flex-row items-center gap-2">
                    <Button
                        onClick={() => {
                            if ((window as any).Telegram && (window as any).Telegram.Login) {
                                (window as any).Telegram.Login.auth(
                                    { client_id: '8298300844', request_access: 'write' },
                                    handleTelegramResponse
                                );
                            }
                        }}
                    >
                        Sign In with Telegram
                    </Button>
                </div>
            )}
        </>
    );
}

export default TelegramLogin;
