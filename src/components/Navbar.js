"use client";

import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { ChevronDown, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  // Handle scroll events for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navbarClasses = `
    fixed top-0 w-full z-50 transition-all duration-300
    ${
      isScrolled
        ? "bg-background/95 shadow-sm py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        : "bg-background/80 backdrop-blur-md py-4"
    }
  `;

  const linkClasses =
    "text-foreground/80 hover:text-primary font-medium transition-colors";
  const activeLinkClasses = "text-primary font-semibold";

  // Define main navigation links
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/dashboard", label: "Dashboard", requiresAuth: true },
    { href: "/trading/automated", label: "Auto Trading", requiresAuth: true },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  // Filter nav links based on authentication status
  const filteredNavLinks = navLinks.filter(
    (link) => !link.requiresAuth || isAuthenticated
  );

  const accountsDropdown = [
    {
      name: "Profile",
      href: "/profile",
    },
    {
      name: "Settings",
      href: "/settings",
    },
    {
      name: "Portfolio",
      href: "/portfolio",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "View your wallet portfolio and performance",
    },
    {
      name: "Automated Trading",
      href: "/trading/automated",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      description: "Authorize bot to trade 24/7",
      highlight: true,
    },
  ];

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                AB
              </div>
              <span className="ml-2 text-xl font-bold text-foreground">
                AbuBeast
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              {filteredNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    pathname === link.href ? activeLinkClasses : linkClasses
                  }
                >
                  {link.label}
                </Link>
              ))}

              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Account
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {accountsDropdown.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>{item.name}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/auth/login" passHref>
                    <Button
                      variant="ghost"
                      className={
                        pathname === "/auth/login"
                          ? activeLinkClasses
                          : linkClasses
                      }
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/signup" passHref>
                    <Button>Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Dark Mode Toggle for mobile */}
            <DarkModeToggle />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-expanded={isOpen}
            >
              <span className="sr-only">
                {isOpen ? "Close menu" : "Open menu"}
              </span>
              {isOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md ${
                  pathname === link.href
                    ? "bg-primary/10 " + activeLinkClasses
                    : linkClasses
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                {accountsDropdown.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-foreground/80 hover:bg-muted hover:text-primary"
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 rounded-md text-foreground/80 hover:bg-muted hover:text-primary"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 rounded-md text-foreground/80 hover:bg-muted hover:text-primary"
                >
                  Log in
                </Link>
                <div className="px-3 py-2">
                  <Button className="w-full" asChild>
                    <Link href="/auth/signup">Sign up</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
