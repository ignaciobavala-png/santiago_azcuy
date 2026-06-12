-- Aumentar límite de archivos en bucket obras de 20MB → 100MB
-- Necesario para fotos de alta resolución y escaneos TIFF profesionales
UPDATE storage.buckets
SET file_size_limit = 104857600
WHERE name = 'obras';
