"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Calendar, FileText, User, Menu, X, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Simulación de rol (esto vendría de tu contexto de autenticación)
    const userRole = 'admin'; // Cambiar a 'employee' para probar

    // Estilos base (tomados de la referencia de diseño)
    const primaryColor = '#2563eb';

    const allLinks = [
        { name: 'Mesas', href: '/boss/tables', icon: Layout, roles: ['admin', 'employee'] },
        { name: 'Calendario', href: '/boss/calendar', icon: Calendar, roles: ['admin'] },
        { name: 'Resumen', href: '/boss/summary', icon: FileText, roles: ['admin'] },
    ];

    const navLinks = allLinks.filter(link => link.roles.includes(userRole));

    const isActive = (path) => pathname === path;

    return (
        <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex justify-between items-center h-16">
                    {/* Logo / Brand */}
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <Layout className="text-white" size={20} />
                        </div>
                        <span className="font-bold text-lg text-slate-800 hidden md:block">RestuManager Pro</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200
                    ${isActive(link.href)
                                            ? 'text-blue-600'
                                            : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-4 focus:outline-none"
                            >
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-bold text-slate-800 leading-none">Carlos Dueño</p>
                                    <p className="text-xs text-slate-500">Admin</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-200 transition-all">
                                    <User className="text-slate-400" size={24} />
                                </div>
                            </button>

                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                    >
                                        <Settings size={16} />
                                        Configuración
                                    </Link>
                                    <button
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                    >
                                        <LogOut size={16} />
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white">
                    <div className="px-4 py-2 space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive(link.href)
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon size={20} />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}
