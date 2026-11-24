/* =====================================================================
   CNDI — FICHIER DE CONFIGURATION
   ---------------------------------------------------------------------
   C'est le SEUL fichier à modifier pour personnaliser le site.
   Ne touchez ni à index.html, ni à script.js, ni à style.css.

   Règles simples :
   • Remplacez les textes entre [CROCHETS_MAJUSCULES]. Tant qu'un
     placeholder n'est pas remplacé, il reste surligné en jaune sur le
     site : impossible d'en oublier un.
   • Les mots-clés entre {accolades} sont remplacés automatiquement :
       {prenom} {nom} {surnom} {numero} {sigle} {agent}
   • Gardez les guillemets "…" et les virgules en fin de ligne.
   • Pour une apostrophe dans un texte, utilisez ’ (typographique)
     ou laissez ' : les deux fonctionnent entre guillemets doubles.
   ===================================================================== */

const CONFIG = {

  /* ---------- L'INSTITUTION ---------- */
  institution: {
    nom: "Centre National de Documentation de l'Individu",
    sigle: "CNDI",
    devise: "Observer. Archiver. S'inquiéter.",
    service: "Direction de la Surveillance des Individus Ordinaires",
    directeur: "[NOM_DU_DIRECTEUR]",       // signe les documents officiels
    versionPortail: "3.1.4",
  },

  /* ---------- LE SUJET (votre ami) ---------- */
  sujet: {
    prenom: "[PRÉNOM]",
    nom: "[NOM]",
    surnom: "[SURNOM]",
    // Date de « découverte » : alimente le compteur de surveillance.
    // Format obligatoire : AAAA-MM-JJ (ex. "2015-09-01").
    dateDecouverte: "2015-09-01",
    // Jour de l'anniversaire, format MM-JJ (servira à une surprise).
    anniversaire: "11-28",
  },

  /* ---------- LE DOSSIER ---------- */
  dossier: {
    numero: "001",
    reference: "CNDI/DI/001-B",
    classification: "Secret Individu",
    statut: "Classifié",                   // affiché en tampon rouge
    volume: "Volume XIV sur ∞",
    agentReferent: "[NOM_DE_L_AGENT_REFERENT]", // apparaît caviardé
  },

  /* ---------- PAGE D'ACCUEIL ---------- */
  accueil: {
    surtitre: "Portail officiel · Accès public restreint",
    presentation:
      "Placé sous l'autorité directe de personne en particulier, le {sigle} a pour mission " +
      "de recenser, analyser et archiver l'intégralité des faits, gestes et déclarations " +
      "d'un individu unique, jugé par une commission indépendante d'un ordinaire préoccupant. " +
      "Le présent portail donne accès, sous conditions, au dossier n°{numero} : " +
      "47 agents mobilisés à temps plein, 3 tonnes de papier, aucune conclusion exploitable.",
    avertissement:
      "La consultation de ce dossier est réservée aux personnes dûment habilitées ou ayant " +
      "scanné un QR code. Une lecture prolongée peut entraîner fou rire, consternation ou " +
      "reprise involontaire des expressions du sujet. Le {sigle} décline toute responsabilité.",
    boutonAcces: "Accéder aux archives",
    mentionBouton: "Habilitation provisoire accordée aux porteurs du QR code.",
  },

  /* ---------- BANDEAU DÉFILANT « AVIS À LA POPULATION » ---------- */
  bandeau: [
    "Avis n°118 : le sujet a été aperçu en train de [ACTIVITE_SUSPECTE]. Restez calmes.",
    "La cellule de crise est ouverte du lundi au vendredi, de 14 h à 14 h 15.",
    "Rappel : toute ressemblance avec un individu normal serait purement fortuite.",
    "Le service des réclamations est temporairement remplacé par un répondeur.",
    "Avis n°119 : [AVIS_PRIVATE_JOKE].",
  ],

  /* ---------- SÉQUENCE DE DÉMARRAGE ---------- */
  demarrage: {
    aChaqueVisite: false, // true = rejouée à chaque visite (sinon 1 fois par session)
    titre: "CNDI-OS v3.1.4 — Système d'archivage individuel",
    // [texte, statut]. Un statut autre que "OK" s'affiche en ambre.
    lignes: [
      ["Initialisation des tiroirs", "OK"],
      ["Dépoussiérage des disques durs", "OK"],
      ["Connexion au serveur central (Minitel)", "OK"],
      ["Chargement du dossier n°{numero}", "4 812 pièces"],
      ["Évaluation du niveau d'absurdité", "ÉLEVÉ"],
      ["Vérification de l'habilitation", "PROVISOIRE"],
    ],
    bienvenue: "Bienvenue, agent {agent}.",
  },

  /* ---------- INTITULÉS DES RUBRIQUES ---------- */
  rubriques: {
    fiche:        { titre: "Fiche d'identité",         sousTitre: "Signalement administratif du sujet" },
    citations:    { titre: "Archives littéraires",     sousTitre: "Déclarations recueillies et analysées" },
    affaires:     { titre: "Affaires non résolues",    sousTitre: "Registre des enquêtes en cours" },
    audiovisuel:  { titre: "Archives audiovisuelles",  sousTitre: "Photographies, vidéos et pièces visuelles" },
    distinctions: { titre: "Distinctions honorifiques", sousTitre: "Récompenses décernées par la Nation (ou presque)" },
    secret:       { titre: "Accès restreint",          sousTitre: "Archives de niveau Ω" },
  },

  /* =================================================================
     01 – FICHE D'IDENTITÉ
     Astuce valable partout : entourez un passage de ||doubles barres||
     pour le caviarder (barre noire).
     ================================================================= */
  fiche: {
    photo: "assets/img/identite.svg",          // ex. "assets/img/identite.jpg"
    fonction: "[FONCTION_OFFICIELLE_INVENTEE]", // ex. « Inspecteur général des siestes »
    lieuDecouverte: "[LIEU_DE_DECOUVERTE]",
    signesParticuliers: "[SIGNES_PARTICULIERS]",
    competences: [
      "[COMPETENCE_RECONNUE_1]",
      "[COMPETENCE_RECONNUE_2]",
      "[COMPETENCE_RECONNUE_3]",
    ],
    defauts: [
      "[DEFAUT_RECENSE_1]",
      "[DEFAUT_RECENSE_2]",
      "[DEFAUT_RECENSE_3]",
    ],
    // niveau de 1 à 5 : 1 Vert · 2 Jaune · 3 Orange · 4 Rouge · 5 Écarlate
    dangerosite: { niveau: 3, commentaire: "[COMMENTAIRE_SUR_LA_DANGEROSITE]" },
    etatPsychologique: {
      diagnostic: "[DIAGNOSTIC_FICTIF]",
      observations:
        "Lors des entretiens, le sujet s'est montré [ATTITUDE_DU_SUJET]. " +
        "Les praticiens ont relevé une tendance marquée à ||[DETAIL_CONFIDENTIEL]||, " +
        "dont l'origine demeure inexpliquée.",
      recommandation: "[RECOMMANDATION_DU_PSYCHOLOGUE]",
    },
    villeSignature: "[VILLE]",
  },

  /* =================================================================
     02 – ARCHIVES LITTÉRAIRES (citations)
     Ajoutez autant de blocs { … } que vous voulez.
     gravite : 1 Anodin · 2 Préoccupant · 3 Grave · 4 Critique · 5 Irréparable
     Exemple de ton pour l'analyse :
       « Le Bureau a consacré quatorze mois à l'étude de cette phrase.
         Les experts s'accordent sur un seul point : elle a été prononcée. »
     ================================================================= */
  citations: [
    {
      texte: "[CITATION_01]",
      contexte: "[CONTEXTE_DE_LA_CITATION_01]",
      date: "[DATE_APPROXIMATIVE_01]",
      gravite: 2,
      analyse: "[ANALYSE_INSTITUTIONNELLE_ABSURDE_01]",
    },
    {
      texte: "[CITATION_02]",
      contexte: "[CONTEXTE_DE_LA_CITATION_02]",
      date: "[DATE_APPROXIMATIVE_02]",
      gravite: 4,
      analyse: "[ANALYSE_INSTITUTIONNELLE_ABSURDE_02]",
    },
    {
      texte: "[CITATION_03]",
      contexte: "[CONTEXTE_DE_LA_CITATION_03]",
      date: "[DATE_APPROXIMATIVE_03]",
      gravite: 5,
      analyse: "[ANALYSE_INSTITUTIONNELLE_ABSURDE_03]",
    },
  ],

  /* =================================================================
     03 – AFFAIRES NON RÉSOLUES
     statut : "non-resolue" · "en-cours" · "classee" (sans suite) · "resolue"
     description / conclusion : une ligne vide (\n\n) = nouveau paragraphe.
     preuves : liste de photos (peut rester vide : preuves: []).
     ================================================================= */
  affaires: [
    {
      reference: "AF-2017-003",
      titre: "[TITRE_DE_L_AFFAIRE_01]",
      date: "[DATE_DES_FAITS_01]",
      lieu: "[LIEU_DES_FAITS_01]",
      statut: "non-resolue",
      description: "[DESCRIPTION_DES_FAITS_01]\n\n[SUITE_DE_LA_DESCRIPTION_01]",
      preuves: [
        { src: "assets/img/exemple-scelle-1.svg", legende: "[LEGENDE_DE_LA_PREUVE_01]" },
        { src: "assets/img/exemple-photo-3.svg", legende: "[LEGENDE_DE_LA_PREUVE_02]" },
      ],
      conclusion: "[CONCLUSION_OFFICIELLE_RIDICULE_01]",
    },
    {
      reference: "AF-2019-011",
      titre: "[TITRE_DE_L_AFFAIRE_02]",
      date: "[DATE_DES_FAITS_02]",
      lieu: "[LIEU_DES_FAITS_02]",
      statut: "classee",
      description: "[DESCRIPTION_DES_FAITS_02]",
      preuves: [
        { src: "assets/img/exemple-photo-1.svg", legende: "[LEGENDE_DE_LA_PREUVE_03]" },
      ],
      conclusion: "[CONCLUSION_OFFICIELLE_RIDICULE_02]",
    },
    {
      reference: "AF-2023-027",
      titre: "[TITRE_DE_L_AFFAIRE_03]",
      date: "[DATE_DES_FAITS_03]",
      lieu: "[LIEU_DES_FAITS_03]",
      statut: "en-cours",
      // Document verrouillé : illisible tant que la section Ω n'est pas ouverte.
      verrouille: true,
      messageVerrou: "Ce dossier relève du Secret Défense Individuelle. Même le sujet n'y a pas accès.",
      description: "[DESCRIPTION_DES_FAITS_03]",
      preuves: [],
      conclusion: "[CONCLUSION_OFFICIELLE_RIDICULE_03]",
    },
  ],

  /* =================================================================
     04 – ARCHIVES AUDIOVISUELLES
     type : "photo" · "video" · "capture"
     Placez les fichiers dans assets/img/ ou assets/video/.
     Vidéos : format .mp4 (H.264), idéalement moins de 10 Mo chacune,
     avec une image d'aperçu (poster) pour un chargement rapide.
     ================================================================= */
  medias: [
    { type: "photo",   src: "assets/img/exemple-photo-1.svg", legende: "[LEGENDE_MEDIA_01]", date: "[DATE_01]" },
    { type: "photo",   src: "assets/img/exemple-photo-2.svg", legende: "[LEGENDE_MEDIA_02]", date: "[DATE_02]" },
    { type: "video",   src: "assets/video/exemple.mp4", poster: "assets/img/exemple-video.svg", legende: "[LEGENDE_MEDIA_03]", date: "[DATE_03]" },
    { type: "capture", src: "assets/img/exemple-capture-1.svg", legende: "[LEGENDE_MEDIA_04]", date: "[DATE_04]" },
    { type: "photo",   src: "assets/img/exemple-photo-3.svg", legende: "[LEGENDE_MEDIA_05]", date: "[DATE_05]" },
    { type: "photo",   src: "assets/img/exemple-photo-4.svg", legende: "[LEGENDE_MEDIA_06]", date: "[DATE_06]",
      verrouille: true, messageVerrou: "Cliché saisi par la Commission de Protection de l'Image du Sujet. Pour votre bien." },
  ],

  /* =================================================================
     05 – DISTINCTIONS HONORIFIQUES
     ================================================================= */
  signataireDistinctions: "[NOM_DU_PRESIDENT_DE_LA_COMMISSION]",
  distinctions: [
    {
      titre: "Prix Nobel de la mauvaise foi",
      motif: "pour [MOTIF_DE_LA_DISTINCTION_01]",
      mention: "Décerné à l'unanimité, moins une voix (la sienne).",
      date: "[DATE_DE_REMISE_01]",
    },
    {
      titre: "Médaille du mérite pour services inexistants",
      motif: "pour [MOTIF_DE_LA_DISTINCTION_02]",
      mention: "Aucun service n'a été rendu. La Commission tient à le souligner.",
      date: "[DATE_DE_REMISE_02]",
    },
    {
      titre: "Record mondial de [PRIVATE_JOKE]",
      motif: "pour [MOTIF_DE_LA_DISTINCTION_03]",
      mention: "Record homologué par un huissier qui a demandé à rester anonyme.",
      date: "[DATE_DE_REMISE_03]",
    },
  ],

  /* =================================================================
     BUREAU DES STATISTIQUES (bouton en bas de la fiche d'identité)
     {n} = nombre tiré au hasard entre min et max.
     barre: true → affiche une barre (en %). Au-delà de 100 : « HORS ÉCHELLE ».
     ================================================================= */
  statistiques: {
    parEtude: 4, // nombre de statistiques par étude
    modeles: [
      { texte: "{n} % de ses phrases commencent par « [EXPRESSION_FAVORITE] »", min: 61, max: 98, barre: true },
      { texte: "Probabilité qu'il lise cette statistique jusqu'au bout : {n} %", min: 3, max: 27, barre: true },
      { texte: "Nombre de fois où il a eu raison cette année : {n} (chiffre contesté)", min: 0, max: 3 },
      { texte: "Temps quotidien consacré à [ACTIVITE_FAVORITE] : {n} h", min: 4, max: 19 },
      { texte: "Indice de mauvaise foi relevé ce jour : {n} / 10", min: 8, max: 10 },
      { texte: "{n} % des témoins interrogés déclarent « ne pas vouloir en parler »", min: 40, max: 95, barre: true },
      { texte: "Niveau de [TRAIT_DE_CARACTERE] détecté : {n} %", min: 112, max: 340, barre: true },
      { texte: "Dossiers ouverts à son sujet ce mois-ci : {n}", min: 12, max: 4812 },
    ],
  },

  /* =================================================================
     SECTION SECRÈTE Ω
     Rappel : le mot de passe est lisible dans ce fichier (simple blague,
     pas une vraie protection). Majuscules, accents et espaces en trop
     sont ignorés. Plusieurs mots de passe possibles : ["un", "deux"].
     ================================================================= */
  motDePasse: "[MOT_DE_PASSE]",
  secret: {
    indice: "[INDICE_DU_MOT_DE_PASSE]", // affiché après 2 erreurs
    titre: "Joyeux anniversaire, {prenom}",
    message:
      "[PARAGRAPHE_1_DU_MESSAGE_D_ANNIVERSAIRE]\n\n" +
      "[PARAGRAPHE_2_DU_MESSAGE_D_ANNIVERSAIRE]",
    signature: "[SIGNATURE_DES_AMIS]",
    photo: "assets/img/exemple-photo-1.svg", // "" pour ne pas en mettre
    video: "",                                // ex. "assets/video/message.mp4"
    poster: "",                               // image d'aperçu de la vidéo
  },
  // Raisons tirées au hasard quand on demande à déverrouiller un document
  refusDeclassification: [
    "Formulaire rempli au stylo de la mauvaise couleur.",
    "Le préposé aux tampons est en congé jusqu'à une date indéterminée.",
    "Votre demande a été jugée « trop sincère ».",
    "Le sujet s'y est opposé avec une mauvaise foi remarquable.",
  ],

  /* =================================================================
     NOTIFICATIONS SYSTÈME
     ================================================================= */
  notifications: {
    arrivee: "Votre consultation est enregistrée. Merci de votre coopération.",
    ouvertureMenu: "Ouverture du répertoire. Veuillez manipuler les fiches avec délicatesse.",
    accesArchives: "Habilitation temporaire accordée. Elle expirera à votre départ, ou avant.",
    // Première ouverture de chaque rubrique (une fois par session)
    rubriques: {
      fiche: "Consultation de la fiche consignée. Le sujet en sera (peut-être) informé.",
      citations: "Rappel : toute citation sortie de son contexte reste hilarante.",
      affaires: "Les enquêtes présentées ici sont en cours depuis trop longtemps.",
      audiovisuel: "Les clichés ne sont pas retouchés. Nous en sommes désolés.",
      distinctions: "La Chancellerie vous rappelle que ces distinctions n'ouvrent droit à rien.",
    },
    // Messages affichés après ~40 s sans activité (3 au maximum par visite)
    inactivite: [
      "Votre session expire dans 3 minutes. Ou pas.",
      "Agent, êtes-vous toujours là ? Le sujet, lui, n'a pas bougé.",
      "Inactivité détectée. Elle sera versée à votre propre dossier.",
    ],
    copie: "Copie détectée. L'agent est prié de citer ses sources.",
    retour: "Bon retour, agent. Votre absence a été consignée.",
    certificat: "Certificat délivré. Merci de ne pas l'encadrer.",
    deverrouillage: "Habilitation Ω accordée. Les documents verrouillés sont désormais lisibles.",
    echecMotDePasse: "Code d'habilitation refusé. Tentative consignée.",
  },

  /* =================================================================
     SURPRISES CACHÉES (easter eggs)
     ================================================================= */
  surprises: {
    // Bannière + confettis sur l'accueil le jour de sujet.anniversaire
    messageAnniversaire: "Le sujet célèbre aujourd'hui son anniversaire. Les agents sont autorisés à sourire.",
    // Textes que prennent les tampons quand on clique dessus
    tampons: ["Top secret", "Très secret", "Pas si secret", "Égaré", "À brûler", "Lu et désapprouvé", "Vu"],
    // Message pour les curieux qui ouvrent la console du navigateur
    console: "Agent, vous inspectez le code source. C'est consigné.",
  },

  /* ---------- PIED DE PAGE ---------- */
  piedDePage:
    "Site parodique. Aucune institution réelle n'a été consultée, ni blessée. " +
    "Toute reproduction de ce dossier est vivement déconseillée.",
};
