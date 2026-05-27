-- Migration : ajoute le champ `topic` à la table subscribers
-- À exécuter dans l'éditeur SQL de ton projet Supabase (une seule fois)

-- 1. Supprimer l'ancienne contrainte unique sur email seul
ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_email_key;

-- 2. Ajouter la colonne topic (si elle n'existe pas déjà)
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS topic text NOT NULL DEFAULT 'all';

-- 3. Nouvelle contrainte unique sur (email + topic) — même email peut s'abonner à plusieurs topics
ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_email_topic_key;
ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_email_topic_key UNIQUE (email, topic);
