interface User{
    id: number,
    username: string,
    first_name: string,
    last_name: string,
    photo_url: string,
    telegram_id: number,
    faction?: string,
    hide_picture?: boolean
}

export default User;