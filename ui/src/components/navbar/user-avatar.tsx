import { Avatar, Listbox, ListboxItem, Popover, PopoverContent, PopoverTrigger } from "@heroui/react"
import { useNavigate } from "react-router"
import { useAuth } from "../../hooks";

const UserAvatar = ({size}: {size: "sm" | "lg"}) => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    switch(size) {
        case "sm":
            return (
                <Popover placement="bottom" showArrow={true}>
                    <PopoverTrigger>
                        <div className="cursor-pointer flex gap-3 items-center">
                            <Avatar size="sm" isBordered color={user?.faction === "ENL" ? "success" : user?.faction === "RES" ? "primary" : "default"} src={user?.photo_url} />
                            {user?.first_name}
                        </div>
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
            );
        case "lg":
            return (
                <div className="flex items-center gap-4 mb-8">
                    <Avatar size="lg" isBordered color={user?.faction === "ENL" ? "success" : user?.faction === "RES" ? "primary" : "default"} src={user?.photo_url} />
                    <div>
                        <p className="font-semibold">{user?.first_name} {user?.last_name}</p>
                        {user?.username && <p className="text-foreground/50 text-sm">@{user.username}</p>}
                    </div>
                </div>
            );
    }
}

export default UserAvatar;