-- Prexiopá Seed Data
-- Datos de prueba para desarrollo y testing

-- =====================================================
-- STORES (Tiendas en Panamá)
-- =====================================================
INSERT INTO stores (name, logo, website) VALUES
  ('Riba Smith', 'https://ribasmith.com/wp-content/uploads/2021/04/logo-riba-smith.png', 'https://ribasmith.com'),
  ('Super 99', 'https://super99.com/logo.png', 'https://super99.com'),
  ('El Machetazo', 'https://elmachetazo.com/logo.png', 'https://elmachetazo.com'),
  ('Xtra', 'https://xtra.com.pa/logo.png', 'https://xtra.com.pa'),
  ('Rey', 'https://supermercadosrey.com/logo.png', 'https://supermercadosrey.com')
ON CONFLICT DO NOTHING;

-- =====================================================
-- PRODUCTS (Productos de supermercado)
-- =====================================================

-- Alimentos
INSERT INTO products (name, description, image, category, brand, barcode) VALUES
  ('Arroz Gallo 5 lb', 'Arroz blanco premium, 5 libras', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', 'Alimentos', 'Gallo', '7501234567890'),
  ('Frijoles Rojos Ducal 454g', 'Frijoles rojos en lata, listos para cocinar', 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400', 'Alimentos', 'Ducal', '7501234567891'),
  ('Pasta Ronzoni 454g', 'Pasta italiana tipo spaghetti', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', 'Alimentos', 'Ronzoni', '7501234567892'),
  ('Aceite Mazola 946ml', 'Aceite de maíz 100% puro', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', 'Alimentos', 'Mazola', '7501234567893'),
  ('Sal Diana 1kg', 'Sal de mesa yodada', 'https://images.unsplash.com/photo-1607622750671-6cd9a99d6494?w=400', 'Alimentos', 'Diana', '7501234567894'),

-- Bebidas
  ('Coca-Cola 2L', 'Bebida gaseosa sabor cola, 2 litros', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', 'Bebidas', 'Coca-Cola', '7501234567895'),
  ('Agua Cristal 1.5L', 'Agua purificada', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', 'Bebidas', 'Cristal', '7501234567896'),
  ('Leche Parmalat 1L', 'Leche entera UHT', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', 'Bebidas', 'Parmalat', '7501234567897'),
  ('Jugo Del Valle Naranja 1L', 'Jugo de naranja 100% natural', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', 'Bebidas', 'Del Valle', '7501234567898'),
  ('Café Durán 250g', 'Café molido premium', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 'Bebidas', 'Durán', '7501234567899'),

-- Limpieza
  ('Detergente Ace 1kg', 'Detergente en polvo para ropa', 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', 'Limpieza', 'Ace', '7501234567900'),
  ('Cloro Clorox 1L', 'Blanqueador con cloro', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400', 'Limpieza', 'Clorox', '7501234567901'),
  ('Jabón Líquido Axion 500ml', 'Jabón líquido para trastes', 'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=400', 'Limpieza', 'Axion', '7501234567902'),
  ('Desinfectante Fabuloso 1L', 'Limpiador multiusos', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400', 'Limpieza', 'Fabuloso', '7501234567903'),
  ('Papel Higiénico Charmin 4u', 'Papel higiénico doble hoja', 'https://images.unsplash.com/photo-1584556326561-c8746083993b?w=400', 'Limpieza', 'Charmin', '7501234567904'),

-- Cuidado Personal
  ('Champú Pantene 400ml', 'Champú reparador', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400', 'Cuidado Personal', 'Pantene', '7501234567905'),
  ('Jabón Dove 90g', 'Jabón en barra humectante', 'https://images.unsplash.com/photo-1598662957477-0b4f85a6c7c5?w=400', 'Cuidado Personal', 'Dove', '7501234567906'),
  ('Desodorante Speed Stick', 'Desodorante en barra', 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400', 'Cuidado Personal', 'Speed Stick', '7501234567907'),
  ('Pasta Colgate 150ml', 'Pasta dental triple acción', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400', 'Cuidado Personal', 'Colgate', '7501234567908'),
  ('Shampoo Head & Shoulders 400ml', 'Shampoo anticaspa', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'Cuidado Personal', 'Head & Shoulders', '7501234567909'),

-- Snacks
  ('Doritos Nacho 150g', 'Totopos de maíz sabor nacho', 'https://images.unsplash.com/photo-1613919113640-27b1e4c4b5b0?w=400', 'Snacks', 'Doritos', '7501234567910'),
  ('Galletas Oreo 432g', 'Galletas de chocolate rellenas', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', 'Snacks', 'Oreo', '7501234567911'),
  ('Papas Lays 170g', 'Papas fritas naturales', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', 'Snacks', 'Lays', '7501234567912'),
  ('Chocolate Milka 100g', 'Chocolate con leche', 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400', 'Snacks', 'Milka', '7501234567913'),
  ('Cereal Corn Flakes 490g', 'Cereal de maíz tostado', 'https://images.unsplash.com/photo-1517686974610-b1cbe2c95d4d?w=400', 'Snacks', 'Kelloggs', '7501234567914')
ON CONFLICT (barcode) DO NOTHING;

-- =====================================================
-- PRICES (Precios por tienda)
-- =====================================================

-- Obtener IDs de tiendas
DO $$
DECLARE
  riba_smith_id UUID;
  super99_id UUID;
  machetazo_id UUID;
  xtra_id UUID;
  rey_id UUID;

  -- IDs de productos
  arroz_id UUID;
  frijoles_id UUID;
  pasta_id UUID;
  aceite_id UUID;
  sal_id UUID;
  coca_id UUID;
  agua_id UUID;
  leche_id UUID;
  jugo_id UUID;
  cafe_id UUID;
  detergente_id UUID;
  cloro_id UUID;
  jabon_liquido_id UUID;
  desinfectante_id UUID;
  papel_id UUID;
  champu_id UUID;
  jabon_dove_id UUID;
  desodorante_id UUID;
  pasta_dental_id UUID;
  head_shoulders_id UUID;
  doritos_id UUID;
  oreo_id UUID;
  lays_id UUID;
  milka_id UUID;
  cereal_id UUID;
BEGIN
  -- Obtener IDs de tiendas
  SELECT id INTO riba_smith_id FROM stores WHERE name = 'Riba Smith' LIMIT 1;
  SELECT id INTO super99_id FROM stores WHERE name = 'Super 99' LIMIT 1;
  SELECT id INTO machetazo_id FROM stores WHERE name = 'El Machetazo' LIMIT 1;
  SELECT id INTO xtra_id FROM stores WHERE name = 'Xtra' LIMIT 1;
  SELECT id INTO rey_id FROM stores WHERE name = 'Rey' LIMIT 1;

  -- Obtener IDs de productos
  SELECT id INTO arroz_id FROM products WHERE barcode = '7501234567890' LIMIT 1;
  SELECT id INTO frijoles_id FROM products WHERE barcode = '7501234567891' LIMIT 1;
  SELECT id INTO pasta_id FROM products WHERE barcode = '7501234567892' LIMIT 1;
  SELECT id INTO aceite_id FROM products WHERE barcode = '7501234567893' LIMIT 1;
  SELECT id INTO sal_id FROM products WHERE barcode = '7501234567894' LIMIT 1;
  SELECT id INTO coca_id FROM products WHERE barcode = '7501234567895' LIMIT 1;
  SELECT id INTO agua_id FROM products WHERE barcode = '7501234567896' LIMIT 1;
  SELECT id INTO leche_id FROM products WHERE barcode = '7501234567897' LIMIT 1;
  SELECT id INTO jugo_id FROM products WHERE barcode = '7501234567898' LIMIT 1;
  SELECT id INTO cafe_id FROM products WHERE barcode = '7501234567899' LIMIT 1;
  SELECT id INTO detergente_id FROM products WHERE barcode = '7501234567900' LIMIT 1;
  SELECT id INTO cloro_id FROM products WHERE barcode = '7501234567901' LIMIT 1;
  SELECT id INTO jabon_liquido_id FROM products WHERE barcode = '7501234567902' LIMIT 1;
  SELECT id INTO desinfectante_id FROM products WHERE barcode = '7501234567903' LIMIT 1;
  SELECT id INTO papel_id FROM products WHERE barcode = '7501234567904' LIMIT 1;
  SELECT id INTO champu_id FROM products WHERE barcode = '7501234567905' LIMIT 1;
  SELECT id INTO jabon_dove_id FROM products WHERE barcode = '7501234567906' LIMIT 1;
  SELECT id INTO desodorante_id FROM products WHERE barcode = '7501234567907' LIMIT 1;
  SELECT id INTO pasta_dental_id FROM products WHERE barcode = '7501234567908' LIMIT 1;
  SELECT id INTO head_shoulders_id FROM products WHERE barcode = '7501234567909' LIMIT 1;
  SELECT id INTO doritos_id FROM products WHERE barcode = '7501234567910' LIMIT 1;
  SELECT id INTO oreo_id FROM products WHERE barcode = '7501234567911' LIMIT 1;
  SELECT id INTO lays_id FROM products WHERE barcode = '7501234567912' LIMIT 1;
  SELECT id INTO milka_id FROM products WHERE barcode = '7501234567913' LIMIT 1;
  SELECT id INTO cereal_id FROM products WHERE barcode = '7501234567914' LIMIT 1;

  -- Insertar precios (cada producto en 3-5 tiendas con precios variados)

  -- Arroz Gallo
  INSERT INTO prices (product_id, store_id, price, in_stock) VALUES
    (arroz_id, riba_smith_id, 5.99, true),
    (arroz_id, super99_id, 5.49, true),
    (arroz_id, machetazo_id, 4.99, true),
    (arroz_id, xtra_id, 5.25, true)
  ON CONFLICT (product_id, store_id, date) DO NOTHING;

  -- Frijoles
  INSERT INTO prices (product_id, store_id, price, in_stock) VALUES
    (frijoles_id, riba_smith_id, 1.99, true),
    (frijoles_id, super99_id, 1.75, true),
    (frijoles_id, rey_id, 1.85, true),
    (frijoles_id, xtra_id, 1.69, true)
  ON CONFLICT (product_id, store_id, date) DO NOTHING;

  -- Pasta
  INSERT INTO prices (product_id, store_id, price, in_stock) VALUES
    (pasta_id, riba_smith_id, 2.49, true),
    (pasta_id, machetazo_id, 1.99, true),
    (pasta_id, rey_id, 2.25, true)
  ON CONFLICT (product_id, store_id, date) DO NOTHING;

  -- Aceite
  INSERT INTO prices (product_id, store_id, price, in_stock) VALUES
    (aceite_id, riba_smith_id, 7.99, true),
    (aceite_id, super99_id, 7.49, true),
    (aceite_id, xtra_id, 7.25, true),
    (aceite_id, rey_id, 7.75, true)
  ON CONFLICT (product_id, store_id, date) DO NOTHING;

  -- Sal
  INSERT INTO prices (product_id, store_id, price, in_stock) VALUES
    (sal_id, machetazo_id, 0.99, true),
    (sal_id, super99_id, 1.15, true),
    (sal_id, xtra_id, 1.05, true)
  ON CONFLICT (product_id, store_id, date) DO NOTHING;

  -- Coca-Cola
  INSERT INTO prices (product_id, store_id, price, in_stock) VALUES
    (coca_id, riba_smith_id, 2.99, true),
    (coca_id, super99_id, 2.75, true),
    (coca_id, machetazo_id, 2.49, true),
    (coca_id, xtra_id, 2.65, true),
    (coca_id, rey_id, 2.85, true)
  ON CONFLICT (product_id, store_id, date) DO NOTHING;

  -- Agua
  INSERT INTO prices (product_id, store_id, price, in_stock) VALUES
    (agua_id, riba_smith_id, 1.29, true),
    (agua_id, super99_id, 0.99, true),
    (agua_id, machetazo_id, 0.89, true),
    (agua_id, xtra_id, 0.95, true)
  ON CONFLICT (product_id, store_id, date) DO NOTHING;

  -- Leche
  INSERT INTO prices (product_id, store_id, price, in_stock) VALUES
    (leche_id, riba_smith_id, 3.49, true),
    (leche_id, super99_id, 3.25, true),
    (leche_id, rey_id, 3.35, true),
    (leche_id, xtra_id, 3.15, true)
  ON CONFLICT (product_id, store_id, date) DO NOTHING;

  -- Jugo
  INSERT INTO prices (product_id, store_id, price, in_stock) VALUES
    (jugo_id, riba_smith_id, 4.99, true),
    (jugo_id, super99_id, 4.49, true),
    (jugo_id, xtra_id, 4.75, true)
  ON CONFLICT (product_id, store_id, date) DO NOTHING;

  -- Café
  INSERT INTO prices (product_id, store_id, price, in_stock) VALUES
    (cafe_id, riba_smith_id, 8.99, true),
    (cafe_id, super99_id, 8.49, true),
    (cafe_id, machetazo_id, 7.99, true),
    (cafe_id, rey_id, 8.75, true)
  ON CONFLICT (product_id, store_id, date) DO NOTHING;

  -- Resto de productos con precios similares...
  INSERT INTO prices (product_id, store_id, price, in_stock) VALUES
    (detergente_id, riba_smith_id, 6.99, true),
    (detergente_id, machetazo_id, 5.99, true),
    (detergente_id, xtra_id, 6.49, true),

    (cloro_id, super99_id, 2.99, true),
    (cloro_id, machetazo_id, 2.49, true),
    (cloro_id, xtra_id, 2.75, true),

    (jabon_liquido_id, riba_smith_id, 3.99, true),
    (jabon_liquido_id, super99_id, 3.49, true),
    (jabon_liquido_id, rey_id, 3.75, true),

    (desinfectante_id, machetazo_id, 4.99, true),
    (desinfectante_id, xtra_id, 5.25, true),
    (desinfectante_id, super99_id, 4.75, true),

    (papel_id, riba_smith_id, 7.99, true),
    (papel_id, super99_id, 6.99, true),
    (papel_id, machetazo_id, 6.49, true),

    (champu_id, riba_smith_id, 9.99, true),
    (champu_id, super99_id, 8.99, true),
    (champu_id, xtra_id, 9.25, true),

    (jabon_dove_id, super99_id, 1.99, true),
    (jabon_dove_id, machetazo_id, 1.75, true),
    (jabon_dove_id, rey_id, 1.85, true),

    (desodorante_id, riba_smith_id, 4.99, true),
    (desodorante_id, super99_id, 4.49, true),
    (desodorante_id, xtra_id, 4.75, true),

    (pasta_dental_id, machetazo_id, 3.99, true),
    (pasta_dental_id, super99_id, 4.25, true),
    (pasta_dental_id, rey_id, 4.49, true),

    (head_shoulders_id, riba_smith_id, 11.99, true),
    (head_shoulders_id, super99_id, 10.99, true),
    (head_shoulders_id, xtra_id, 11.49, true),

    (doritos_id, super99_id, 3.49, true),
    (doritos_id, machetazo_id, 2.99, true),
    (doritos_id, xtra_id, 3.25, true),

    (oreo_id, riba_smith_id, 5.99, true),
    (oreo_id, super99_id, 5.49, true),
    (oreo_id, rey_id, 5.75, true),

    (lays_id, machetazo_id, 3.49, true),
    (lays_id, super99_id, 3.75, true),
    (lays_id, xtra_id, 3.59, true),

    (milka_id, riba_smith_id, 4.99, true),
    (milka_id, super99_id, 4.49, true),
    (milka_id, xtra_id, 4.75, true),

    (cereal_id, riba_smith_id, 6.99, true),
    (cereal_id, super99_id, 6.49, true),
    (cereal_id, machetazo_id, 5.99, true),
    (cereal_id, rey_id, 6.75, true)
  ON CONFLICT (product_id, store_id, date) DO NOTHING;

END $$;
