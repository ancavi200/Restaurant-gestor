"use client";

import { supabase } from '@/lib/supabaseClient';
import React, { useState, useEffect } from 'react';
import { Layout, ShoppingCart, CheckCircle, Clock, ShieldCheck, Save } from 'lucide-react';

export default function BossMesasPage() {
    // Simulación de sesión de usuario
    const [user, setUser] = useState({
        name: 'Carlos Dueño',
        role: 'admin',
        restaurantId: 'rest_123'
    });

    // Estado para la personalización de colores
    const [theme, setTheme] = useState({
        primaryColor: '#2563eb', // Azul por defecto
        borderRadius: '1.5rem',  // Redondeado por defecto
        accentColor: '#f59e0b'   // Color de acento (reservas)
    });

    const [showColorPicker, setShowColorPicker] = useState(false);
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [view, setView] = useState('details'); // 'details', 'orders', 'bill'

    // Mock data para pedidos con estado y fecha
    const [orders, setOrders] = useState([
        { id: 1, name: 'Hamburguesa Clásica', quantity: 2, price: 12.50, processed: false, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() }, // Hace 5 min
        { id: 2, name: 'Patatas Bravas', quantity: 1, price: 6.00, processed: true, createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString() }, // Hace 20 min
        { id: 3, name: 'Cerveza Doble', quantity: 3, price: 3.50, processed: false, createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString() }, // Hace 2 min
        { id: 4, name: 'Tarta de Queso', quantity: 1, price: 5.50, processed: false, createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() }, // Hace 10 min
    ]);

    const [restaurantName, setRestaurantName] = useState('Restaurante Gestor');
    const [amountPaid, setAmountPaid] = useState('');
    const [change, setChange] = useState(null);

    // Fetch restaurant info
    // useEffect(() => {
    //     // ...
    // }, []);

    const calculateTotal = () => {
        return orders.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2);
    };

    const calculateChange = (paid) => {
        const total = parseFloat(calculateTotal());
        const paidAmount = parseFloat(paid);
        if (!isNaN(paidAmount) && paidAmount >= total) {
            setChange((paidAmount - total).toFixed(2));
        } else {
            setChange(null);
        }
    };

    const handleAmountPaidChange = (e) => {
        const val = e.target.value;
        setAmountPaid(val);
        calculateChange(val);
    };

    const toggleOrderProcessed = (orderId) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, processed: !order.processed } : order
            )
        );
    };

    const handlePrintTicket = () => {
        if (!selectedTable) return;

        const printWindow = window.open('', '', 'width=300');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Ticket ${selectedTable.name} ${restaurantName.toUpperCase()}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; margin: 0 auto; padding: 10px; }
                        .header { text-align: center; margin-bottom: 10px; }
                        .line { border-bottom: 1px dashed #000; margin: 5px 0; }
                        .item { display: flex; justify-content: space-between; margin-bottom: 2px; }
                        .totals { margin-top: 10px; text-align: right; }
                        .footer { text-align: center; margin-top: 20px; font-size: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h3>${restaurantName.toUpperCase()}</h3>
                        <p>${selectedTable.name}</p>
                        <p>${new Date().toLocaleString()}</p>
                    </div>
                    <div class="line"></div>
                    ${orders.map(item => `
                        <div class="item">
                            <span>${item.quantity}x ${item.name}</span>
                            <span style="flex: 1; text-align: right; padding-right: 10px;">${item.price.toFixed(2)}€</span>
                            <span style="width: 60px; text-align: right;">${(item.price * item.quantity).toFixed(2)}€</span>
                        </div>
                    `).join('')}
                    <div class="line"></div>
                    <div class="totals">
                        <p>Subtotal: ${(calculateTotal() / 1.21).toFixed(2)}€</p>
                        <p>IVA (21%): ${(calculateTotal() - (calculateTotal() / 1.21)).toFixed(2)}€</p>
                        <h3>TOTAL: ${calculateTotal()}€</h3>
                    </div>
                    <div class="footer">
                        <p>¡Gracias por su visita!</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    // Reset view when table selection changes
    useEffect(() => {
        setView('details');
        setAmountPaid('');
        setChange(null);
    }, [selectedTable?.id]);

    // Función para actualizar el estado de la mesa
    const updateTableStatus = async (newStatus) => {
        if (!selectedTable) return;

        const { error } = await supabase
            .from('tables')
            .update({ status: newStatus })
            .eq('id', selectedTable.id);

        if (error) {
            console.error('Error updating table status:', error);
        } else {
            setSelectedTable(prev => ({ ...prev, status: newStatus }));
        }
    };

    useEffect(() => {
        const fetchTables = async () => {
            const { data, error } = await supabase
                .from('tables')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error('Error fetching tables:', error);
            } else {
                setTables(data);
            }
        };

        fetchTables();

        const channel = supabase
            .channel('realtime tables')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tables' }, (payload) => {
                setTables((currentTables) =>
                    currentTables.map((table) =>
                        table.id === payload.new.id ? payload.new : table
                    )
                );

                if (selectedTable && selectedTable.id === payload.new.id) {
                    setSelectedTable(payload.new);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedTable]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'ocupada': return 'bg-red-500 border-red-700 shadow-red-200';
            case 'reservada': return `border-amber-700 shadow-amber-200`;
            default: return 'bg-emerald-500 border-emerald-700 shadow-emerald-200';
        }
    };

    const renderSidePanelContent = () => {
        if (!selectedTable) {
            return (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center space-y-4">
                    <Layout size={48} strokeWidth={1} style={{ color: theme.primaryColor, opacity: 0.3 }} />
                    <p>Selecciona una mesa para gestionar.</p>
                </div>
            );
        }

        if (view === 'orders') {
            // Ordenar pedidos: primero no procesados, luego por fecha
            const sortedOrders = [...orders].sort((a, b) => {
                if (a.processed === b.processed) {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                }
                return a.processed ? 1 : -1;
            });

            return (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={() => setView('details')}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <span className="text-xl">←</span>
                        </button>
                        <h2 className="text-xl font-bold text-slate-800">Pedidos Mesa {selectedTable.name}</h2>
                    </div>

                    <div className="space-y-3">
                        {sortedOrders.map((item) => (
                            <div
                                key={item.id}
                                className={`flex justify-between items-center p-3 rounded-xl border transition-all ${item.processed ? 'bg-slate-100 border-slate-200 opacity-70' : 'bg-white border-slate-200 shadow-sm'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${item.processed ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-700'}`}>
                                        {item.quantity}x
                                    </span>
                                    <div className="flex flex-col">
                                        <span className={`font-medium ${item.processed ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                                            {item.name}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleOrderProcessed(item.id)}
                                    className={`p-2 rounded-full transition-colors ${item.processed ? 'text-slate-400 hover:text-slate-600' : 'text-slate-300 hover:text-emerald-500'}`}
                                >
                                    {item.processed ? <CheckCircle size={24} className="text-emerald-500" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-emerald-500" />}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Total Pedidos</span>
                        <span className="text-2xl font-bold text-slate-900">{calculateTotal()}€</span>
                    </div>

                    <button
                        className="w-full py-3 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-95"
                        style={{ backgroundColor: theme.primaryColor }}
                    >
                        Añadir Nuevo Pedido
                    </button>
                </div>
            );
        }

        if (view === 'bill') {
            return (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={() => setView('details')}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <span className="text-xl">←</span>
                        </button>
                        <h2 className="text-xl font-bold text-slate-800">Cuenta {selectedTable.name}</h2>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                        {/* Lista de items en la cuenta */}
                        <div className="space-y-2 mb-4 pb-4 border-b border-slate-200 border-dashed">
                            {orders.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm text-slate-700">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="font-medium">{(item.price * item.quantity).toFixed(2)}€</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal</span>
                            <span>{(calculateTotal() / 1.21).toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>IVA (21%)</span>
                            <span>{(calculateTotal() - (calculateTotal() / 1.21)).toFixed(2)}€</span>
                        </div>
                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                            <span className="font-bold text-lg text-slate-900">Total a Pagar</span>
                            <span className="font-bold text-2xl" style={{ color: theme.primaryColor }}>{calculateTotal()}€</span>
                        </div>
                    </div>

                    {/* Calculadora de Cambio */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                        <h3 className="font-bold text-sm text-slate-700">Calcular Cambio</h3>
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <label className="block text-xs text-slate-500 mb-1">Entregado</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amountPaid}
                                        onChange={handleAmountPaidChange}
                                        className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-3 top-2 text-slate-400">€</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-slate-500 mb-1">Cambio</label>
                                <div className={`py-2 px-3 rounded-lg font-bold text-lg ${change !== null ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                    {change !== null ? `${change}€` : '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handlePrintTicket}
                            className="py-3 rounded-xl font-bold border-2 transition-colors hover:bg-slate-50"
                            style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
                        >
                            Imprimir
                        </button>
                        <button
                            className="py-3 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-95"
                            style={{ backgroundColor: '#10b981' }}
                            onClick={() => {
                                updateTableStatus('libre');
                                setView('details');
                            }}
                        >
                            Cobrar y Liberar
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-slate-800">{selectedTable.name}</h2>
                    <span
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: selectedTable.status === 'reservada' ? theme.accentColor : (selectedTable.status === 'libre' ? '#10b981' : '#ef4444') }}
                    >
                        {selectedTable.status}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setView('orders')}
                        className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-opacity-80 rounded-2xl border border-slate-200 transition-all group hover:shadow-md"
                        style={{ borderRadius: `calc(${theme.borderRadius} / 2)` }}
                    >
                        <ShoppingCart className="mb-2 transition-colors" style={{ color: theme.primaryColor }} />
                        <span className="text-sm font-semibold text-slate-700">Pedidos</span>
                    </button>
                    <button
                        onClick={() => setView('bill')}
                        className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-opacity-80 rounded-2xl border border-slate-200 transition-all group hover:shadow-md"
                        style={{ borderRadius: `calc(${theme.borderRadius} / 2)` }}
                    >
                        <Layout className="mb-2 transition-colors" style={{ color: theme.primaryColor }} />
                        <span className="text-sm font-semibold text-slate-700">Ver Cuenta</span>
                    </button>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-sm text-slate-500 uppercase">Cambiar Estado</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => updateTableStatus('libre')}
                            className={`p-2 rounded-lg text-xs font-bold text-white transition-colors ${selectedTable.status === 'libre' ? 'bg-emerald-600 ring-2 ring-emerald-200' : 'bg-emerald-400 hover:bg-emerald-500'}`}
                        >
                            Libre
                        </button>
                        <button
                            onClick={() => updateTableStatus('ocupada')}
                            className={`p-2 rounded-lg text-xs font-bold text-white transition-colors ${selectedTable.status === 'ocupada' ? 'bg-red-600 ring-2 ring-red-200' : 'bg-red-400 hover:bg-red-500'}`}
                        >
                            Ocupada
                        </button>
                        <button
                            onClick={() => updateTableStatus('reservada')}
                            className={`p-2 rounded-lg text-xs font-bold text-white transition-colors ${selectedTable.status === 'reservada' ? 'bg-amber-600 ring-2 ring-amber-200' : 'bg-amber-400 hover:bg-amber-500'}`}
                        >
                            Reservada
                        </button>
                    </div>
                </div>

                {user.role === 'admin' && (
                    <div className="pt-6 border-t border-slate-100">
                        <h3 className="font-bold mb-4 flex items-center gap-2 px-3 py-1 rounded-lg w-fit"
                            style={{ color: theme.primaryColor, backgroundColor: `${theme.primaryColor}15` }}>
                            <ShieldCheck size={18} />
                            Opciones de Dueño
                        </h3>
                        <div className="space-y-2">
                            <button
                                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-all font-medium border border-slate-200 flex justify-between items-center"
                                style={{ borderRadius: `calc(${theme.borderRadius} / 2.5)` }}
                            >
                                Estadísticas de Mesa
                                <span style={{ color: theme.primaryColor }}>→</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Mapa de Sala</h1>
                            <p className="text-slate-500 text-sm">Gestiona la distribución de {user.restaurantId}</p>
                        </div>
                    </div>

                    {showColorPicker && (
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-lg flex flex-wrap gap-4 items-end animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Color Principal</label>
                                <input
                                    type="color"
                                    value={theme.primaryColor}
                                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                                    className="h-10 w-20 rounded cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Color Reservas</label>
                                <input
                                    type="color"
                                    value={theme.accentColor}
                                    onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                                    className="h-10 w-20 rounded cursor-pointer"
                                />
                            </div>
                            <button
                                onClick={() => setShowColorPicker(false)}
                                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800"
                            >
                                <Save size={16} /> Guardar Cambios
                            </button>
                        </div>
                    )}

                    <div className="bg-white border border-slate-200 shadow-xl overflow-hidden relative min-h-[500px] pattern-grid"
                        style={{ borderRadius: theme.borderRadius }}>
                        <div className="absolute inset-0 opacity-5 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                        {tables.map((table) => (
                            <div
                                key={table.id}
                                onClick={() => setSelectedTable(table)}
                                className={`absolute cursor-pointer transition-all duration-300 transform hover:scale-105
                  w-28 h-28 md:w-32 md:h-32 border-b-4 flex flex-col items-center justify-center text-white font-bold shadow-lg
                  ${getStatusColor(table.status)} ${selectedTable?.id === table.id ? 'ring-4 ring-offset-2' : ''}`}
                                style={{
                                    left: `${table.x}px`,
                                    top: `${table.y}px`,
                                    borderRadius: `calc(${theme.borderRadius} / 1.5)`,
                                    backgroundColor: table.status === 'reservada' ? theme.accentColor : undefined,
                                    outlineColor: theme.primaryColor
                                }}
                            >
                                <span className="text-lg">{table.name}</span>
                                {table.status === 'ocupada' && <div className="mt-2 bg-white/20 px-2 py-0.5 rounded text-xs">{table.orders}€</div>}
                                {table.status === 'reservada' && <Clock size={18} className="mt-2" />}
                                {table.status === 'libre' && <CheckCircle size={18} className="mt-2 text-white/80" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 h-fit sticky top-8"
                    style={{ borderRadius: theme.borderRadius }}>
                    {renderSidePanelContent()}
                </div>
            </div>
        </div>
    );
}
