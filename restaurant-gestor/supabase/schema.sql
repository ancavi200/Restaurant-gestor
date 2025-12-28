-- Limpiar tablas existentes para evitar conflictos de tipos (UUID vs BIGINT)
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.tables CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.restaurants CASCADE;

-- ==========================================
-- 1. TABLE: restaurants
-- ==========================================
CREATE TABLE public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_name TEXT,
    registration_year INTEGER,
    email TEXT,
    address TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    secondary_color TEXT DEFAULT '#f59e0b',
    tertiary_color TEXT DEFAULT '#10b981',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.restaurants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.restaurants FOR UPDATE USING (auth.role() = 'authenticated');

-- ==========================================
-- 2. TABLE: employees
-- ==========================================
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    internal_id TEXT,
    name TEXT NOT NULL,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.employees FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.employees FOR UPDATE USING (auth.role() = 'authenticated');

-- ==========================================
-- 3. TABLE: tables
-- ==========================================
CREATE TABLE public.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'libre',
    x INTEGER DEFAULT 0,
    y INTEGER DEFAULT 0,
    current_total NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.tables FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.tables FOR UPDATE USING (auth.role() = 'authenticated');

-- ==========================================
-- 4. TABLE: orders (pedidos)
-- ==========================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    waiter_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    products JSONB DEFAULT '[]'::jsonb,
    total_price NUMERIC(10,2) DEFAULT 0.00,
    total_iva NUMERIC(10,2) DEFAULT 0.00,
    clients INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');

-- ==========================================
-- 5. TABLE: reservations (reservas)
-- ==========================================
CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    reservation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    people INTEGER DEFAULT 1,
    phone_number TEXT,
    is_cancelled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.reservations FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.reservations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.reservations FOR UPDATE USING (auth.role() = 'authenticated');

-- ==========================================
-- DATOS DE PRUEBA
-- ==========================================

-- 1. Restaurante
INSERT INTO public.restaurants (id, name, owner_name, registration_year, email, address)
VALUES ('00000000-0000-0000-0000-000000000001', 'Restaurante Gestor', 'Carlos Dueño', 2025, 'contacto@gestor.com', 'Calle Mayor 1, Madrid');

-- 2. Empleados
INSERT INTO public.employees (id, restaurant_id, internal_id, name, role)
VALUES 
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'REST1-E1', 'Juan Camarero', 'camarero'),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'REST1-E2', 'Ana Maître', 'maitre');

-- 3. Mesas
INSERT INTO public.tables (id, restaurant_id, name, status, x, y, current_total)
VALUES 
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Mesa 1', 'libre', 50, 50, 0.00),
    ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Mesa 2', 'ocupada', 200, 50, 45.50),
    ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Mesa 3', 'reservada', 50, 180, 0.00),
    ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Mesa 4', 'libre', 200, 180, 0.00),
    ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Terraza 1', 'ocupada', 350, 115, 120.20);

-- 4. Pedido
INSERT INTO public.orders (restaurant_id, waiter_id, table_id, products, total_price, total_iva, clients)
VALUES (
    '00000000-0000-0000-0000-000000000001', 
    '00000000-0000-0000-0000-000000000002', 
    '00000000-0000-0000-0000-000000000005', 
    '[{"name": "Hamburguesa", "quantity": 2, "price": 15.00}, {"name": "Refresco", "quantity": 2, "price": 2.50}]'::jsonb,
    35.00,
    7.35,
    2
);

-- 5. Reserva
INSERT INTO public.reservations (restaurant_id, table_id, reservation_date, people, phone_number)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000006',
    NOW() + INTERVAL '2 hours',
    4,
    '600123456'
);