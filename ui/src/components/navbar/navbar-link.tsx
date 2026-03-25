import { Link } from 'react-router'

interface props{
    href: string,
    text: string
}

const NavbarLink = (props: props) => {
    const isActive = location.pathname === props.href;
    return(
        <li>
            <Link
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "font-medium text-accent" : ""}
                to={props.href}
            >
                {props.text}
            </Link>
        </li>
    )
}

export default NavbarLink;
