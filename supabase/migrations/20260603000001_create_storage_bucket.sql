insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'obras',
  'obras',
  true,
  20971520,  -- 20MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/tiff']
);
