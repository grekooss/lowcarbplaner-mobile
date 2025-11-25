-- Query to find all triggers on profiles table
SELECT
    t.tgname AS trigger_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'profiles'
  AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
