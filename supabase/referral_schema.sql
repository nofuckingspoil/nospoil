-- ============================================================
-- Système de parrainage gamifié — no.spoil
-- ============================================================

-- 1. Configuration des paliers (éditables sans redéploiement)
CREATE TABLE IF NOT EXISTS public.tier_config (
  tier          int     PRIMARY KEY,
  name          text    NOT NULL,
  min_referrals int     NOT NULL,
  color         text    NOT NULL
);

INSERT INTO public.tier_config (tier, name, min_referrals, color) VALUES
  (1, 'Spectateur',  0,  '#6B7280'),
  (2, 'Complice',    1,  '#CD7F32'),
  (3, 'Ambassadeur', 10, '#C0C0C0'),
  (4, 'VIP',         25, '#FFD700')
ON CONFLICT (tier) DO NOTHING;

-- 2. Profils utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email               text        UNIQUE NOT NULL,
  pseudo              text        UNIQUE,
  community_opt_in    boolean     NOT NULL DEFAULT false,
  ref_code            text        UNIQUE NOT NULL,
  tier                int         NOT NULL DEFAULT 1 REFERENCES public.tier_config(tier),
  qualified_referrals int         NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- 3. Parrainages
CREATE TABLE IF NOT EXISTS public.referrals (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id  uuid        NOT NULL REFERENCES public.profiles(id),
  referee_id   uuid        NOT NULL UNIQUE REFERENCES public.profiles(id),
  status       text        NOT NULL DEFAULT 'qualified'
                           CHECK (status IN ('pending', 'qualified')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  qualified_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_referral CHECK (referrer_id <> referee_id)
);

-- 4. Événements anti-fraude
CREATE TABLE IF NOT EXISTS public.events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES public.profiles(id),
  type        text        NOT NULL,
  fingerprint text,
  ip_hash     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.tier_config   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events        ENABLE ROW LEVEL SECURITY;

-- tier_config : lecture publique (paliers affichés sur le site)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tier_config' AND policyname = 'tier_config_public_read') THEN
    CREATE POLICY "tier_config_public_read" ON public.tier_config
      FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- profiles : lecture publique uniquement des profils opt-in (jamais l'email)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_public_read_optin') THEN
    CREATE POLICY "profiles_public_read_optin" ON public.profiles
      FOR SELECT TO anon USING (community_opt_in = true);
  END IF;
END $$;

-- profiles : insertion anonyme (via la fonction register_subscriber)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_anon') THEN
    CREATE POLICY "profiles_insert_anon" ON public.profiles
      FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- events : insertion anonyme seulement
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'events_insert_anon') THEN
    CREATE POLICY "events_insert_anon" ON public.events
      FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- referrals : pas d'accès direct en lecture/écriture publique (via fonctions SECURITY DEFINER)

-- ============================================================
-- Vue publique du classement (jamais d'email exposé)
-- ============================================================

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.pseudo,
  p.tier,
  p.qualified_referrals,
  tc.name  AS tier_name,
  tc.color AS tier_color,
  p.created_at
FROM public.profiles p
JOIN public.tier_config tc ON tc.tier = p.tier
WHERE p.community_opt_in = true
ORDER BY p.qualified_referrals DESC, p.created_at ASC;

-- ============================================================
-- Génération de code parrainage (sans caractères ambigus)
-- Alphabet : pas de 0,O,1,I,L → 31 caractères
-- ============================================================

CREATE OR REPLACE FUNCTION public.generate_ref_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code  text;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE ref_code = code);
  END LOOP;
  RETURN code;
END;
$$;

-- ============================================================
-- Inscription atomique avec parrainage + anti-fraude
-- ============================================================

CREATE OR REPLACE FUNCTION public.register_subscriber(
  p_email            text,
  p_ref_code_used    text    DEFAULT NULL,
  p_pseudo           text    DEFAULT NULL,
  p_community_opt_in boolean DEFAULT false,
  p_fingerprint      text    DEFAULT NULL,
  p_ip_hash          text    DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id               uuid;
  v_ref_code         text;
  v_referrer_id      uuid;
  v_qualified_today  int;
  v_same_device      boolean;
  v_new_tier         int;
  v_pseudo_trimmed   text;
BEGIN
  -- Normalisation
  p_email := lower(trim(p_email));
  v_pseudo_trimmed := CASE WHEN p_pseudo IS NOT NULL THEN trim(p_pseudo) ELSE NULL END;

  -- Utilisateur déjà existant ?
  SELECT id, ref_code INTO v_id, v_ref_code
  FROM profiles WHERE email = p_email;

  IF v_id IS NOT NULL THEN
    IF p_community_opt_in AND v_pseudo_trimmed IS NOT NULL AND v_pseudo_trimmed != '' THEN
      IF EXISTS (SELECT 1 FROM profiles WHERE pseudo = v_pseudo_trimmed AND id <> v_id) THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Ce pseudo est déjà pris.');
      END IF;
      UPDATE profiles SET
        community_opt_in = true,
        pseudo = v_pseudo_trimmed
      WHERE id = v_id AND community_opt_in = false;
    END IF;
    RETURN jsonb_build_object('status', 'existing', 'ref_code', v_ref_code, 'profile_id', v_id);
  END IF;

  -- Validation pseudo
  IF p_community_opt_in THEN
    IF v_pseudo_trimmed IS NULL OR v_pseudo_trimmed = '' THEN
      RETURN jsonb_build_object('status', 'error', 'message', 'Pseudo requis pour rejoindre la communauté.');
    END IF;
    IF length(v_pseudo_trimmed) < 3 OR length(v_pseudo_trimmed) > 20 THEN
      RETURN jsonb_build_object('status', 'error', 'message', 'Le pseudo doit faire entre 3 et 20 caractères.');
    END IF;
    IF EXISTS (SELECT 1 FROM profiles WHERE pseudo = v_pseudo_trimmed) THEN
      RETURN jsonb_build_object('status', 'error', 'message', 'Ce pseudo est déjà pris.');
    END IF;
  END IF;

  -- Génération du code de parrainage
  v_ref_code := generate_ref_code();

  -- Création du profil
  INSERT INTO profiles (email, pseudo, community_opt_in, ref_code, tier, qualified_referrals)
  VALUES (
    p_email,
    CASE WHEN p_community_opt_in AND v_pseudo_trimmed IS NOT NULL AND v_pseudo_trimmed != '' THEN v_pseudo_trimmed ELSE NULL END,
    CASE WHEN p_community_opt_in AND v_pseudo_trimmed IS NOT NULL AND v_pseudo_trimmed != '' THEN true ELSE false END,
    v_ref_code,
    1,
    0
  )
  RETURNING id INTO v_id;

  -- Journalisation anti-fraude
  INSERT INTO events (user_id, type, fingerprint, ip_hash)
  VALUES (v_id, 'activation', p_fingerprint, p_ip_hash);

  -- Traitement du parrainage
  IF p_ref_code_used IS NOT NULL AND p_ref_code_used != '' THEN
    SELECT id INTO v_referrer_id
    FROM profiles
    WHERE ref_code = upper(trim(p_ref_code_used));

    IF v_referrer_id IS NOT NULL AND v_referrer_id != v_id THEN
      -- Plafond : max 5 qualifications par parrain par 24h
      SELECT COUNT(*) INTO v_qualified_today
      FROM referrals
      WHERE referrer_id = v_referrer_id
        AND created_at > now() - interval '24 hours';

      -- Anti-fraude : même appareil (fingerprint) déjà utilisé pour ce parrain ?
      SELECT EXISTS (
        SELECT 1
        FROM events e
        JOIN profiles p2 ON e.user_id = p2.id
        JOIN referrals r ON r.referee_id = p2.id
        WHERE r.referrer_id = v_referrer_id
          AND e.type = 'activation'
          AND p_fingerprint IS NOT NULL AND p_fingerprint != ''
          AND e.fingerprint = p_fingerprint
      ) INTO v_same_device;

      IF v_qualified_today < 5 AND NOT v_same_device THEN
        INSERT INTO referrals (referrer_id, referee_id, status, qualified_at)
        VALUES (v_referrer_id, v_id, 'qualified', now())
        ON CONFLICT (referee_id) DO NOTHING;

        -- Incrément atomique
        UPDATE profiles
        SET qualified_referrals = qualified_referrals + 1
        WHERE id = v_referrer_id;

        -- Recalcul du palier depuis tier_config
        SELECT tc.tier INTO v_new_tier
        FROM tier_config tc
        WHERE tc.min_referrals <= (SELECT qualified_referrals FROM profiles WHERE id = v_referrer_id)
        ORDER BY tc.tier DESC
        LIMIT 1;

        UPDATE profiles SET tier = v_new_tier WHERE id = v_referrer_id;
      END IF;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'status',     'created',
    'ref_code',   v_ref_code,
    'profile_id', v_id
  );
END;
$$;

-- ============================================================
-- Statistiques communauté (pour le bandeau marketing)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_community_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total',       COUNT(*),
    'sharers',     COUNT(*) FILTER (WHERE qualified_referrals > 0),
    'ambassadeurs',COUNT(*) FILTER (WHERE tier = 3),
    'vips',        COUNT(*) FILTER (WHERE tier = 4)
  )
  FROM profiles;
$$;
