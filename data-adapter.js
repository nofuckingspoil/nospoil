// data-adapter.js — converts production DATA format → NS_DATA format expected by React components
(function () {
  const TYPE_MAP = {
    'sprint':             { type: 'sprint',              icon: '🏁' },
    'mi-montagne':        { type: 'vallonnée',            icon: '🌄' },
    'montagne':           { type: 'montagne',             icon: '⛰️' },
    'haute-montagne':     { type: 'haute-montagne',       icon: '🏔️' },
    'clm':                { type: 'contre-la-montre',     icon: '⏱️' },
    'contre-la-montre':   { type: 'contre-la-montre',     icon: '⏱️' },
    'vallonnée':          { type: 'vallonnée',            icon: '🌄' },
  };

  const COMP_META = {
    'giro-2026':          { edition: '109ᵉ édition',  dates: '9 → 31 mai 2026',           country: '🇮🇹 Italie'  },
    'tdf-2026':           { edition: '113ᵉ édition',  dates: '4 → 26 juillet 2026',        country: '🇫🇷 France'  },
    'vuelta-2026':        { edition: '81ᵉ édition',   dates: '22 août → 13 sept. 2026',    country: '🇪🇸 Espagne' },
    'classiques-2026':    { edition: '2026',           dates: 'Printemps 2026',             country: '🇪🇺 Europe'  },
    'paris-nice-2026':    { edition: '84ᵉ édition',   dates: '8 → 15 mars 2026',           country: '🇫🇷 France'  },
    'milan-sanremo-2026': { edition: '117ᵉ édition',  dates: '21 mars 2026',               country: '🇮🇹 Italie'  },
  };

  const SPORT_META = {
    'cyclisme': { tagline: 'Grands Tours, Classiques' },
  };

  const UPCOMING_SPORTS = [
    { id: 'roland-garros', name: 'Roland Garros', emoji: '🎾', status: 'soon', tagline: 'Prochainement — Roland Garros' },
    { id: 'coupe-monde',   name: 'Coupe du Monde', emoji: '⚽', status: 'soon', tagline: 'Prochainement — 11 juin → 19 juil.' },
  ];

  const JOURS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  const MOIS  = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'];

  function formatDateLabel(dateStr) {
    if (!dateStr) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr + 'T12:00:00');
    const diffDays = Math.round((today - d) / 86400000);
    const short = `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
    if (diffDays === 0) return "Aujourd'hui · " + short;
    if (diffDays === 1) return 'Hier · ' + short;
    if (diffDays === 2) return 'Avant-hier · ' + short;
    return short;
  }

  function mapStatus(s) {
    if (s === 'active') return 'live';
    if (s === 'past')   return 'past';
    return 'upcoming';
  }

  // Build sports list (live sports from DATA + hardcoded upcoming)
  const sports = DATA.sports.map(sport => ({
    id:      sport.id,
    name:    sport.label,
    emoji:   sport.icon || '🏆',
    status:  'live',
    tagline: (SPORT_META[sport.id] || {}).tagline || '',
  })).concat(UPCOMING_SPORTS);

  // Build competitions + stages objects
  const competitions = {};
  const stages = {};

  DATA.sports.forEach(sport => {
    competitions[sport.id] = sport.competitions.map(comp => {
      const meta = COMP_META[comp.id] || {};
      return {
        id:          comp.id,
        name:        comp.label,
        edition:     meta.edition || '',
        dates:       meta.dates   || comp.upcomingLabel || '',
        country:     meta.country || '',
        status:      mapStatus(comp.status),
        accent:      comp.color,
        stagesDone:  0, // overridden at runtime from Supabase (see app.jsx)
        stagesTotal: comp.stages.length,
      };
    });

    sport.competitions.forEach(comp => {
      if (comp.stages.length === 0) return;

      // Sort descending: latest stage first
      const sorted = comp.stages.slice().sort((a, b) => b.id - a.id);

      stages[comp.id] = sorted.map(s => {
        const mapped = TYPE_MAP[s.type] || { type: s.type, icon: '🚴' };
        return {
          num:       s.id,
          type:      mapped.type,
          icon:      mapped.icon,
          from:      s.from  || '',
          to:        s.to    || '',
          km:        s.km    || 0,
          date:      s.date  || '',
          dateLabel: formatDateLabel(s.date),
          // available/videoId/latest are injected at runtime from Supabase (see app.jsx)
          available: false,
          videoId:   null,
          latest:    false,
        };
      });
    });
  });

  window.NS_DATA = { sports, competitions, stages };
})();
