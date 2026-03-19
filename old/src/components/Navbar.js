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
import {
  BarChart3,
  Bot,
  ChevronDown,
  Menu,
  User,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navbarClasses = `
    fixed top-0 w-full z-50 transition-all duration-300
    ${isScrolled ? "glass-nav shadow-lg py-2" : "bg-transparent py-4"}
  `;

  const linkClasses =
    "text-foreground/70 hover:text-primary font-medium transition-colors duration-200";
  const activeLinkClasses = "text-primary font-semibold";

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/dashboard", label: "Dashboard", requiresAuth: true },
    { href: "/trading/automated", label: "Auto Trading", requiresAuth: true },
  ];

  const filteredNavLinks = navLinks.filter(
    (link) => !link.requiresAuth || isAuthenticated
  );

  const accountsDropdown = [
    {
      name: "Profile",
      href: "/profile",
      icon: <User className="w-4 h-4" />,
    },
    {
      name: "Portfolio",
      href: "/portfolio",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      name: "Automated Trading",
      href: "/trading/automated",
      icon: <Bot className="w-4 h-4" />,
      highlight: true,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Zap className="w-4 h-4" />,
    },
  ];

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-neon group-hover:shadow-neon-lg transition-shadow duration-300">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="gradient-text">Abu</span>
                <span className="text-foreground">Beast</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  pathname === link.href
                    ? activeLinkClasses + " bg-primary/10"
                    : linkClasses + " hover:bg-foreground/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <DarkModeToggle />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden lg:inline">Account</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 glass-card border-0 p-2"
                >
                  {accountsDropdown.map((item) => (
                    <DropdownMenuItem
                      key={item.href}
                      asChild
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                        item.highlight
                          ? "bg-gradient-to-r from-primary/10 to-purple-400/10"
                          : ""
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 w-full"
                      >
                        <span className="text-primary">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="my-2 bg-border/50" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="p-3 rounded-lg cursor-pointer text-destructive hover:text-destructive"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" className="font-medium">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="gap-2">
                    <Wallet className="w-4 h-4" />
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <DarkModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-expanded={isOpen}
              className="relative"
            >
              <span className="sr-only">
                {isOpen ? "Close menu" : "Open menu"}
              </span>
              {isOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-card mx-4 mt-2 rounded-2xl overflow-hidden animate-fade-in-up">
          <div className="p-4 space-y-1">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-border/50 mt-4">
              {isAuthenticated ? (
                <>
                  {accountsDropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        item.highlight
                          ? "bg-gradient-to-r from-primary/10 to-purple-400/10"
                          : "hover:bg-foreground/5"
                      }`}
                    >
                      <span className="text-primary">{item.icon}</span>
                      <span className="text-foreground/70">{item.name}</span>
                    </Link>
                  ))}
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/login" className="block">
                    <Button variant="ghost" className="w-full justify-start">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="block">
                    <Button className="w-full gap-2">
                      <Wallet className="w-4 h-4" />
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
