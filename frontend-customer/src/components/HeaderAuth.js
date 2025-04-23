'use client';

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "@/styles/Header.css";
import PereraToyland from "../images/logo.png";
import MenuIcon from "@mui/icons-material/Menu";

export const HeaderAuth = ({ isSignIn = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="header-logo">
        <Image
          className="toyland-logo"
          alt="Perera Toyland"
          src={PereraToyland}
        />
      </div>

      {/* Navigation Links */}
      <nav className={`header-nav ${menuOpen ? "open" : ""}`}>
        <Link href="/" className="nav-link">Home</Link>
        <Link href="/contact" className="nav-link">Contact</Link>
        <Link href="/about" className="nav-link">About Us</Link>
        {isSignIn ? (
          <Link href="/SignUp" className="nav-link">Sign Up</Link>
        ) : (
          <Link href="/SignIn" className="nav-link">Sign In</Link>
        )}
      </nav>

      {/* Menu Icon for Smaller Screens */}
      <div className="menu-icon-auth" onClick={toggleMenu}>
        <MenuIcon />
      </div>
    </header>
  );
};
