import { NavbarItem } from "@heroui/react"
import { Link } from 'react-router'

interface props{
    href: string,
    text: string
}

const NavbarLink = (props: props) => {
    return(
        <NavbarItem isActive={location.pathname === props.href}>
            <Link aria-current="page" to={props.href}>
                {props.text}
            </Link>
        </NavbarItem>
    )
}

export default NavbarLink;