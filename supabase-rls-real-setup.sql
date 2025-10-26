-- Habilitar RLS en la tabla trabajadores existente
ALTER TABLE public.trabajadores ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Allow all operations for trabajadores" ON public.trabajadores;
DROP POLICY IF EXISTS "Authenticated users can view all trabajadores" ON public.trabajadores;

-- Crear política que permita todas las operaciones (para desarrollo)
CREATE POLICY "Allow all operations for trabajadores" ON public.trabajadores
  FOR ALL USING (true) WITH CHECK (true);

-- Verificar la estructura de la tabla
SELECT 'Estructura de la tabla trabajadores:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'trabajadores' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar datos existentes
SELECT 'Total trabajadores:' as info, count(*) as total FROM public.trabajadores;
SELECT 'Trabajadores activos:' as info, count(*) as total FROM public.trabajadores WHERE activo = true;

-- Mostrar algunos registros de ejemplo (sin mostrar contraseñas completas)
SELECT 
  id, 
  empresa_id,
  nombre_completo, 
  rut, 
  turno_habitual, 
  activo, 
  rol,
  CASE 
    WHEN contraseña IS NOT NULL THEN 'Definida'
    ELSE 'No definida'
  END as contraseña_status
FROM public.trabajadores 
WHERE activo = true
LIMIT 10;

-- Crear tabla shifts si no existe (para el sistema de pedidos)
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en shifts
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for shifts" ON public.shifts
  FOR ALL USING (true) WITH CHECK (true);

-- Insertar turnos por defecto
INSERT INTO public.shifts (name, start_time, end_time) VALUES
  ('Turno Día', '06:00:00', '14:00:00'),
  ('Turno Noche', '14:00:00', '22:00:00')
ON CONFLICT DO NOTHING;

-- Crear tabla orders si no existe
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trabajador_id INTEGER REFERENCES public.trabajadores(id) ON DELETE CASCADE NOT NULL,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE NOT NULL,
  order_date DATE NOT NULL,
  menu_item TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trabajador_id, shift_id, order_date)
);

-- Habilitar RLS en orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for orders" ON public.orders
  FOR ALL USING (true) WITH CHECK (true);
