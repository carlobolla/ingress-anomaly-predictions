import {
    Navbar, 
    NavbarBrand, 
    NavbarContent
  } from "@heroui/react";
import { TelegramLogin } from '../'
import { NavbarLink } from "..";
import { Link } from "react-router";

const SiteNavbar = () => {
  return (
    <Navbar position="static" maxWidth="full">
      <NavbarBrand>
        <Link to="/"><p className="font-bold text-white">@IUENG</p></Link>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarLink text="Home" href="/" />
        <NavbarLink text="Leaderboard" href="/leaderboard" />
        <NavbarLink text="Scoring" href="/scoring" />
      </NavbarContent>
      <NavbarContent justify="end">
        <TelegramLogin />
      </NavbarContent>
    </Navbar>
  );
}

export default SiteNavbar;