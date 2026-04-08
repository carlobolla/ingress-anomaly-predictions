import { Avatar, Label, ListBox, Popover } from "@heroui/react"
import { useNavigate } from "react-router"
import useAuth from '@/hooks/use_auth';

const UserAvatar = ({size}: {size: "sm" | "lg"}) => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const avatarRingClass = user?.faction === "ENL" ? "ring-2 ring-enl" : user?.faction === "RES" ? "ring-2 ring-res" : "";

    switch(size) {
        case "sm":
            return (
                <Popover>
                    <Popover.Trigger>
                        <div className="cursor-pointer flex gap-3 items-center">
                            <Avatar size="sm" className={avatarRingClass}>
                                <Avatar.Image src={user?.photo_url} alt={user?.first_name} />
                                <Avatar.Fallback>{user?.first_name?.[0]}</Avatar.Fallback>
                            </Avatar>
                            {user?.first_name}
                        </div>
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
            );
        case "lg":
            return (
                <div className="flex items-center gap-4 mb-8">
                    <Avatar size="lg" className={avatarRingClass}>
                        {<Avatar.Image src={user?.photo_url} alt={user?.first_name} />}
                        <Avatar.Fallback>{user?.first_name?.[0]}</Avatar.Fallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{user?.first_name} {user?.last_name}</p>
                        {user?.username && <p className="text-foreground/50 text-sm">@{user.username}</p>}
                    </div>
                </div>
            );
    }
}

export default UserAvatar;
