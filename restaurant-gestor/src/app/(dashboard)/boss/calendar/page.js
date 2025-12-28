"use client";

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users, Plus } from 'lucide-react';

export default function BossCalendarPage() {
    // Estado simulado para la fecha actual
    const [currentDate, setCurrentDate] = useState(new Date());

    // Datos simulados de reservas
    const [reservations, setReservations] = useState([
        { id: 1, title: 'Cena Empresa Tech', time: '20:30', people: 12, table: 'Mesa Grande', type: 'group' },
        { id: 2, title: 'Juan Pérez', time: '21:00', people: 2, table: 'Mesa 4', type: 'normal' },
        { id: 3, title: 'Aniversario López', time: '21:15', people: 4, table: 'Mesa 2', type: 'special' },
    ]);

    const daysInMonth = 31; // Simplificado para el mockup
    const startDay = 3; // Miércoles (0 = Domingo)

    // Estilos consistentes
    const theme = {
        primaryColor: '#2563eb',
        borderRadius: '1.5rem',
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">

                {/* Calendario Principal */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <CalendarIcon className="text-blue-600" /> Calendario de Reservas
                            </h1>
                            <p className="text-slate-500 text-sm">Gestiona los eventos y reservas del mes</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-bold text-lg">Octubre 2025</span>
                            <button className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-xl p-6"
                        style={{ borderRadius: theme.borderRadius }}>

                        {/* Días de la semana */}
                        <div className="grid grid-cols-7 mb-4 text-center">
                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                                <div key={day} className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Grid del mes */}
                        <div className="grid grid-cols-7 gap-2 md:gap-4">
                            {/* Espacios vacíos iniciales */}
                            {Array.from({ length: startDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-50/50 rounded-xl"></div>
                            ))}

                            {/* Días */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const hasEvents = day === 15 || day === 20 || day === 24;
                                const isToday = day === 15;

                                return (
                                    <div
                                        key={day}
                                        className={`h-24 md:h-32 border rounded-xl p-2 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer
                      ${isToday ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-100 bg-white hover:border-blue-300'}`}
                                        style={{ borderRadius: '1rem' }}
                                    >
                                        <span className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                                            {day}
                                        </span>

                                        {hasEvents && (
                                            <div className="space-y-1">
                                                <div className="h-1.5 w-full bg-emerald-400 rounded-full"></div>
                                                <div className="h-1.5 w-2/3 bg-amber-400 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Panel Lateral - Reservas del Día */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sticky top-8"
                        style={{ borderRadius: theme.borderRadius }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Reservas del Día</h2>
                            <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {reservations.map((res) => (
                                <div
                                    key={res.id}
                                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-800">{res.title}</h3>
                                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                            {res.time}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Users size={14} />
                                            <span>{res.people} pax</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${res.type === 'group' ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                                            <span>{res.table}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t border-slate-100 text-center">
                                <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                    Ver todas las reservas
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
