-- Prexiopá Historical Price Data
-- Datos históricos de precios para gráficas (últimos 90 días)
-- Ejecutar DESPUÉS de schema.sql y seed.sql

-- =====================================================
-- HISTORICAL PRICES (Precios Históricos)
-- =====================================================
-- Este script agrega precios históricos para demostrar la funcionalidad
-- del componente PriceHistoryChart. Genera datos para los últimos 90 días
-- con variaciones realistas de precios.

DO $$
DECLARE
  riba_smith_id UUID;
  super99_id UUID;
  machetazo_id UUID;
  xtra_id UUID;
  rey_id UUID;

  -- Productos seleccionados para historial
  arroz_id UUID;
  coca_id UUID;
  leche_id UUID;
  detergente_id UUID;
  doritos_id UUID;

  current_date DATE := CURRENT_DATE;
  days_back INTEGER;
  base_price DECIMAL(10,2);
  price_variation DECIMAL(10,2);
BEGIN
  -- Obtener IDs de tiendas
  SELECT id INTO riba_smith_id FROM stores WHERE name = 'Riba Smith' LIMIT 1;
  SELECT id INTO super99_id FROM stores WHERE name = 'Super 99' LIMIT 1;
  SELECT id INTO machetazo_id FROM stores WHERE name = 'El Machetazo' LIMIT 1;
  SELECT id INTO xtra_id FROM stores WHERE name = 'Xtra' LIMIT 1;
  SELECT id INTO rey_id FROM stores WHERE name = 'Rey' LIMIT 1;

  -- Obtener IDs de productos más populares
  SELECT id INTO arroz_id FROM products WHERE barcode = '7501234567890' LIMIT 1;
  SELECT id INTO coca_id FROM products WHERE barcode = '7501234567895' LIMIT 1;
  SELECT id INTO leche_id FROM products WHERE barcode = '7501234567897' LIMIT 1;
  SELECT id INTO detergente_id FROM products WHERE barcode = '7501234567900' LIMIT 1;
  SELECT id INTO doritos_id FROM products WHERE barcode = '7501234567910' LIMIT 1;

  -- ===================================================
  -- ARROZ GALLO 5 LB - Historial (90 días)
  -- ===================================================
  -- Riba Smith: Precio base $4.50, con variaciones
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 4.50;
    price_variation := (random() * 0.40) - 0.20; -- Varía entre -$0.20 y +$0.20

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      arroz_id,
      riba_smith_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      CASE WHEN random() > 0.05 THEN true ELSE false END -- 95% disponibilidad
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price, in_stock = EXCLUDED.in_stock;

    days_back := days_back - 7; -- Datos semanales
  END LOOP;

  -- Super 99: Precio base $4.20 (más económico)
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 4.20;
    price_variation := (random() * 0.30) - 0.15;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      arroz_id,
      super99_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      CASE WHEN random() > 0.08 THEN true ELSE false END
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price, in_stock = EXCLUDED.in_stock;

    days_back := days_back - 7;
  END LOOP;

  -- El Machetazo: Precio base $3.99 (el más económico)
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 3.99;
    price_variation := (random() * 0.25) - 0.10;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      arroz_id,
      machetazo_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      CASE WHEN random() > 0.10 THEN true ELSE false END
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price, in_stock = EXCLUDED.in_stock;

    days_back := days_back - 7;
  END LOOP;

  -- ===================================================
  -- COCA-COLA 2L - Historial (90 días)
  -- ===================================================
  -- Riba Smith: $2.49
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 2.49;
    price_variation := (random() * 0.20) - 0.10;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      coca_id,
      riba_smith_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      true
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price;

    days_back := days_back - 7;
  END LOOP;

  -- Super 99: $2.35
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 2.35;
    price_variation := (random() * 0.15) - 0.08;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      coca_id,
      super99_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      true
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price;

    days_back := days_back - 7;
  END LOOP;

  -- Xtra: $2.29 (el más económico)
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 2.29;
    price_variation := (random() * 0.12) - 0.06;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      coca_id,
      xtra_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      true
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price;

    days_back := days_back - 7;
  END LOOP;

  -- ===================================================
  -- LECHE PARMALAT 1L - Historial (90 días)
  -- ===================================================
  -- Riba Smith: $3.25
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 3.25;
    price_variation := (random() * 0.30) - 0.15;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      leche_id,
      riba_smith_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      CASE WHEN random() > 0.03 THEN true ELSE false END
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price, in_stock = EXCLUDED.in_stock;

    days_back := days_back - 7;
  END LOOP;

  -- Rey: $3.15
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 3.15;
    price_variation := (random() * 0.25) - 0.12;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      leche_id,
      rey_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      CASE WHEN random() > 0.05 THEN true ELSE false END
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price, in_stock = EXCLUDED.in_stock;

    days_back := days_back - 7;
  END LOOP;

  -- El Machetazo: $2.99 (el más económico)
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 2.99;
    price_variation := (random() * 0.20) - 0.10;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      leche_id,
      machetazo_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      CASE WHEN random() > 0.07 THEN true ELSE false END
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price, in_stock = EXCLUDED.in_stock;

    days_back := days_back - 7;
  END LOOP;

  -- ===================================================
  -- DETERGENTE ACE 1KG - Historial (90 días)
  -- ===================================================
  -- Riba Smith: $5.99
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 5.99;
    price_variation := (random() * 0.50) - 0.25;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      detergente_id,
      riba_smith_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      true
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price;

    days_back := days_back - 7;
  END LOOP;

  -- Super 99: $5.79
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 5.79;
    price_variation := (random() * 0.40) - 0.20;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      detergente_id,
      super99_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      true
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price;

    days_back := days_back - 7;
  END LOOP;

  -- Xtra: $5.49 (el más económico)
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 5.49;
    price_variation := (random() * 0.35) - 0.18;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      detergente_id,
      xtra_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      true
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price;

    days_back := days_back - 7;
  END LOOP;

  -- ===================================================
  -- DORITOS NACHO 150G - Historial (90 días)
  -- ===================================================
  -- Riba Smith: $2.99
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 2.99;
    price_variation := (random() * 0.20) - 0.10;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      doritos_id,
      riba_smith_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      true
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price;

    days_back := days_back - 7;
  END LOOP;

  -- Rey: $2.79
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 2.79;
    price_variation := (random() * 0.18) - 0.09;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      doritos_id,
      rey_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      true
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price;

    days_back := days_back - 7;
  END LOOP;

  -- Super 99: $2.65 (el más económico)
  days_back := 90;
  WHILE days_back >= 0 LOOP
    base_price := 2.65;
    price_variation := (random() * 0.15) - 0.08;

    INSERT INTO prices (product_id, store_id, price, date, in_stock)
    VALUES (
      doritos_id,
      super99_id,
      ROUND((base_price + price_variation)::numeric, 2),
      current_date - days_back,
      true
    )
    ON CONFLICT (product_id, store_id, date) DO UPDATE
    SET price = EXCLUDED.price;

    days_back := days_back - 7;
  END LOOP;

  RAISE NOTICE 'Datos históricos de precios insertados correctamente';
  RAISE NOTICE 'Productos con historial: Arroz, Coca-Cola, Leche, Detergente, Doritos';
  RAISE NOTICE 'Periodo: últimos 90 días (datos semanales)';
  RAISE NOTICE 'Total de registros agregados: ~200 precios históricos';
END $$;
