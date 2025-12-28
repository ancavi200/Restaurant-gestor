"use client";

import React from 'react';
import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

export default function BossSummaryPage() {
    // Datos simulados
    const stats = [
        {
            title: 'Ventas Totales',
            value: '1,234€',
            change: '+12.5%',
            trend: 'up',
            icon: DollarSign,
            color: 'bg-blue-500'
        },
        {
            title: 'Clientes Activos',
            value: '45',
            change: '+3',
            trend: 'up',
            icon: Users,
            color: 'bg-emerald-500'
        },
        {
            title: 'Tiempo Promedio',
            value: '48m',
            change: '-2m',
            trend: 'down', // down is good for wait time usually, but let's keep logic simple
            icon: Clock,
            color: 'bg-purple-500'
        },
        {
            title: 'Ocupación',
            value: '85%',
            change: '+5%',
            trend: 'up',
            icon: Activity,
            color: 'bg-amber-500'
        },
    ];

    const recentActivity = [
        { id: 1, text: 'Mesa 4 cerró cuenta (120.50€)', time: 'Hace 5 min', type: 'sale' },
        { id: 2, text: 'Nueva reserva: Familia García (6 pax)', time: 'Hace 12 min', type: 'reservation' },
        { id: 3, text: 'Stock bajo: Cerveza Especial', time: 'Hace 30 min', type: 'alert' },
        { id: 4, text: 'Mesa 2 solicitó la cuenta', time: 'Hace 45 min', type: 'info' },
    ];

    const theme = {
        borderRadius: '1.5rem',
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <div className="p-4 md:p-8 space-y-8">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Resumen del Día</h1>
                        <p className="text-slate-500 text-sm">Vista general del rendimiento del restaurante</p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800">27 Octubre, 2025</p>
                        <p className="text-xs text-green-600 font-bold flex items-center justify-end gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            Abierto ahora
                        </p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        const isTrendUp = stat.trend === 'up';
                        return (
                            <div
                                key={index}
                                className="bg-white p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow"
                                style={{ borderRadius: theme.borderRadius }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                                        <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full 
                    ${isTrendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {isTrendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.title}</h3>
                                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Gráfico Simulado (Placeholder visual) */}
                    <div className="lg:col-span-2 bg-white p-6 border border-slate-200 shadow-lg"
                        style={{ borderRadius: theme.borderRadius }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Ingresos por Hora</h2>
                            <select className="text-sm border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-600">
                                <option>Hoy</option>
                                <option>Ayer</option>
                            </select>
                        </div>

                        {/* Simulación de gráfico de barras con CSS */}
                        <div className="h-64 flex items-end justify-between gap-2 px-4">
                            {[40, 65, 30, 85, 50, 90, 45, 70, 60, 95, 55, 80].map((height, i) => (
                                <div key={i} className="w-full bg-blue-100 rounded-t-lg relative group cursor-pointer transition-all hover:bg-blue-500">
                                    <div
                                        className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all group-hover:bg-blue-600"
                                        style={{ height: `${height}%` }}
                                    ></div>
                                    {/* Tooltip */}
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {height * 10}€
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium uppercase">
                            <span>12:00</span>
                            <span>15:00</span>
                            <span>18:00</span>
                            <span>21:00</span>
                            <span>23:00</span>
                        </div>
                    </div>

                    {/* Actividad Reciente */}
                    <div className="bg-white p-6 border border-slate-200 shadow-lg"
                        style={{ borderRadius: theme.borderRadius }}>
                        <h2 className="text-lg font-bold text-slate-800 mb-6">Actividad Reciente</h2>
                        <div className="space-y-6">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex gap-4 items-start">
                                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 
                    ${activity.type === 'sale' ? 'bg-green-500' :
                                            activity.type === 'alert' ? 'bg-red-500' :
                                                activity.type === 'reservation' ? 'bg-blue-500' : 'bg-slate-300'}`}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{activity.text}</p>
                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            <Clock size={12} /> {activity.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-3 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                            Ver Historial Completo
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
