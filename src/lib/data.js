// Mis à jour automatiquement — 27/05/2026
const DATA = {
  sports: [
    {
      id: "cyclisme",
      label: "Cyclisme",
      icon: "🚴",
      competitions: [
        {
          id: "giro-2026",
          label: "Giro d'Italia 2026",
          color: "#f43f5e",
          status: "active",
          stages: [
            { id: 1,  label: "Étape 1",  date: "2026-05-08", from: "Nessebar",            to: "Burgas",            km: 147, type: "sprint",      video: "ENQaUv2_pbg" },
            { id: 2,  label: "Étape 2",  date: "2026-05-09", from: "Burgas",              to: "Veliko Tarnovo",    km: 221, type: "mi-montagne", video: "_zeuV6W3yak" },
            { id: 3,  label: "Étape 3",  date: "2026-05-10", from: "Plovdiv",             to: "Sofia",             km: 175, type: "mi-montagne", video: "MnAlk7PjzLw" },
            { id: 4,  label: "Étape 4",  date: "2026-05-12", from: "Catanzaro",           to: "Cosenza",           km: 138, type: "sprint",      video: "1BvEza3PB1U" },
            { id: 5,  label: "Étape 5",  date: "2026-05-13", from: "Praia a Mare",        to: "Potenza",           km: 203, type: "montagne",    video: "cwz-swq9W1o" },
            { id: 6,  label: "Étape 6",  date: "2026-05-14", from: "Paestum",             to: "Napoli",            km: 142, type: "sprint",      video: "EiDoGNOPVlQ" },
            { id: 7,  label: "Étape 7",  date: "2026-05-15", from: "Formia",              to: "Blockhaus",         km: 245, type: "montagne",    video: "Z6bcANrrz00" },
            { id: 8,  label: "Étape 8",  date: "2026-05-16", from: "Chieti",              to: "Fermo",             km: 156, type: "mi-montagne", video: "XEenT1KFMWc" },
            { id: 9,  label: "Étape 9",  date: "2026-05-17", from: "Cervia",              to: "Corno alle Scale",  km: 184, type: "montagne",    video: "uGADFxly79s" },
            { id: 10, label: "Étape 10", date: "2026-05-19", from: "Viareggio",           to: "Massa",             km: 42,  type: "clm",         video: "0QgnvlEPwl4" },
            { id: 11, label: "Étape 11", date: "2026-05-20", from: "Porcari",             to: "Chiavari",          km: 195, type: "mi-montagne", video: "PD19KxNFwOQ" },
            { id: 12, label: "Étape 12", date: "2026-05-21", from: "Imperia",             to: "Novi Ligure",       km: 175, type: "mi-montagne", video: "NkKXkreh7Xw" },
            { id: 13, label: "Étape 13", date: "2026-05-22", from: "Alessandria",         to: "Verbania",          km: 189, type: "mi-montagne", video: "Jdo67txS45k" },
            { id: 14, label: "Étape 14", date: "2026-05-23", from: "Aosta",               to: "Pila",              km: 133, type: "montagne",    video: "xKInpXCVIL4" },
            { id: 15, label: "Étape 15", date: "2026-05-24", from: "Voghera",             to: "Milano",            km: 157, type: "sprint",      video: "1JcWnhdyxHo" },
            { id: 16, label: "Étape 16", date: "2026-05-26", from: "Bellinzona",          to: "Carì",              km: 113, type: "mi-montagne", video: "zBr_mHhCaGQ" },
            { id: 17, label: "Étape 17", date: "2026-05-27", from: "Cassano d'Adda",      to: "Andalo",            km: 202, type: "montagne" },
            { id: 18, label: "Étape 18", date: "2026-05-28", from: "Fai della Paganella", to: "Pieve di Soligo",   km: 171, type: "mi-montagne" },
            { id: 19, label: "Étape 19", date: "2026-05-29", from: "Feltre",              to: "Alleghe",           km: 151, type: "montagne" },
            { id: 20, label: "Étape 20", date: "2026-05-30", from: "Gemona del Friuli",   to: "Piancavallo",       km: 200, type: "montagne" },
            { id: 21, label: "Étape 21", date: "2026-05-31", from: "Roma",                to: "Roma",              km: 131, type: "sprint" }
          ]
        },
        {
          id: "tdf-2026",
          label: "Tour de France 2026",
          color: "#eab308",
          status: "upcoming",
          upcomingLabel: "Juillet 2026",
          stages: []
        },
        {
          id: "vuelta-2026",
          label: "La Vuelta 2026",
          color: "#dc2626",
          status: "upcoming",
          upcomingLabel: "Août 2026",
          stages: []
        },
        {
          id: "classiques-2026",
          label: "Classiques 2026",
          color: "#6366f1",
          status: "upcoming",
          upcomingLabel: "Bientôt",
          stages: []
        }
      ]
    }
  ]
};

export default DATA;
