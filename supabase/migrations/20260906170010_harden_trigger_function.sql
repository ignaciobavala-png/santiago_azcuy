-- La funcion solo se usa como trigger: no debe ser invocable por RPC.
revoke execute on function public.set_actualizado_at() from public, anon, authenticated;
