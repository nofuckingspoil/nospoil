-- Table des abonnés aux alertes NoSpoil
-- À exécuter dans l'éditeur SQL de ton projet Supabase

CREATE TABLE IF NOT EXISTS public.subscribers (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email        text NOT NULL UNIQUE,
  unsubscribed boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Activer la sécurité (obligatoire)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Permettre à n'importe qui d'insérer son email (inscription publique)
CREATE POLICY "Inscription publique" ON public.subscribers
  FOR INSERT TO anon
  WITH CHECK (true);

-- Interdire la lecture à la clé anonyme (la clé service contourne ces règles)
-- Le script update.js utilise la clé service pour lire les abonnés → pas besoin de policy SELECT pour anon
