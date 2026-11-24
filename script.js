/* =====================================================================
   CNDI — MOTEUR DU PORTAIL
   Pas besoin de modifier ce fichier : tout le contenu est dans config.js.
   ===================================================================== */
(function () {
  'use strict';

  const C = CONFIG; // défini dans config.js
  const $ = (s, r = document) => r.querySelector(s);
  const MOUVEMENT_REDUIT = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ECRAN_LARGE = window.matchMedia('(min-width: 1000px)');
  const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
  const pad = (n) => String(n).padStart(2, '0');
  const nombre = new Intl.NumberFormat('fr-FR');

  /* ---------- Stockage de session (tolérant aux navigateurs privés) ---------- */
  const memoire = {
    lire(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    ecrire(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* rien */ } },
  };

  /* ---------- Session de l'agent ---------- */
  const AGENT = memoire.lire('cndi-agent') ||
    'AGT-' + Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
  memoire.ecrire('cndi-agent', AGENT);
  const DEBUT_SESSION = Number(memoire.lire('cndi-debut')) || Date.now();
  memoire.ecrire('cndi-debut', String(DEBUT_SESSION));

  /* ---------- Texte : jetons {…}, échappement, placeholders surlignés ---------- */
  const JETONS = {
    prenom: C.sujet.prenom, nom: C.sujet.nom, surnom: C.sujet.surnom,
    numero: C.dossier.numero, sigle: C.institution.sigle, agent: AGENT,
  };
  const PLACEHOLDER = /\[[A-ZÀ-Ý][A-ZÀ-Ý0-9_ -]*\]/g;
  const echapper = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const remplir = (s) => String(s == null ? '' : s).replace(/\{(\w+)\}/g, (m, k) => (k in JETONS ? JETONS[k] : m));
  const texte = (s) => echapper(remplir(s))
    .replace(PLACEHOLDER, (m) => `<mark class="a-remplir" title="À personnaliser dans config.js">${m}</mark>`)
    .replace(/\|\|(.+?)\|\|/g, '<span class="caviarde" title="Information classifiée">$1</span>');
  const paragraphes = (s) => String(s == null ? '' : s).split(/\n{2,}/)
    .map((p) => `<p>${texte(p).replace(/\n/g, '<br>')}</p>`).join('');
  const borner = (n, min, max) => Math.min(max, Math.max(min, n));
  const pad3 = (n) => String(n).padStart(3, '0');
  const dateDuJour = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const brut = (s) => remplir(s); // version sans HTML (titres d'onglet, etc.)

  /* ---------- Rubriques ---------- */
  const RUBRIQUES = [
    { id: 'fiche',        route: 'fiche',                   code: '01' },
    { id: 'citations',    route: 'archives-litteraires',    code: '02' },
    { id: 'affaires',     route: 'affaires-non-resolues',   code: '03' },
    { id: 'audiovisuel',  route: 'archives-audiovisuelles', code: '04' },
    { id: 'distinctions', route: 'distinctions',            code: '05' },
  ].map((r) => Object.assign(r, C.rubriques[r.id]));
  const SECRET = Object.assign({ id: 'secret', route: 'acces-restreint', code: 'Ω' }, C.rubriques.secret);
  const INTROUVABLE = { id: 'introuvable', code: '404', titre: 'Pièce introuvable' };

  /* =====================================================================
     GRAPHISMES (SVG)
     ===================================================================== */
  let compteurSceau = 0;
  function sceau() {
    const id = 'arc-sceau-' + (++compteurSceau);
    const legende = (C.institution.nom + ' · ' + C.institution.sigle + ' ·').toUpperCase();
    return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 200" fill="none" stroke="currentColor" aria-hidden="true">
  <circle cx="100" cy="100" r="96" stroke-width="3"/>
  <circle cx="100" cy="100" r="90" stroke-width="1"/>
  <circle cx="100" cy="100" r="68" stroke-width="1.5"/>
  <g class="anneau">
    <path id="${id}" d="M100,100 m-79,0 a79,79 0 1,1 158,0 a79,79 0 1,1 -158,0" stroke="none"/>
    <text fill="currentColor" stroke="none" font-family="Plex Mono, monospace" font-size="9.6" font-weight="600" letter-spacing="1.4">
      <textPath href="#${id}" xlink:href="#${id}" textLength="490" lengthAdjust="spacing">${echapper(legende)}</textPath>
    </text>
  </g>
  <!-- Hibou archiviste -->
  <g stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M78 66 L82 50 L91 61 Q100 57 109 61 L118 50 L122 66 Q130 82 126 102 Q122 124 100 128 Q78 124 74 102 Q70 82 78 66 Z"/>
    <circle cx="90" cy="78" r="9"/><circle cx="110" cy="78" r="9"/>
    <circle cx="90" cy="78" r="3" fill="currentColor" stroke="none"/>
    <circle cx="110" cy="78" r="3" fill="currentColor" stroke="none"/>
    <path d="M96.5 88 L100 95 L103.5 88 Z" fill="currentColor"/>
    <path d="M84 100 Q100 106 116 100" stroke-width="1.4" opacity=".7"/>
    <!-- le classeur -->
    <path d="M79 104 H95 L98 100 H121 V132 H79 Z" fill="currentColor" stroke-width="1.6"/>
    <path d="M86 114 H114 M86 120 H108" stroke="#16221B" stroke-width="1.6"/>
    <path d="M88 132 V138 M94 132 V138 M106 132 V138 M112 132 V138" stroke-width="2"/>
  </g>
  <path d="M100 150 l2.4 5 5.4.6 -4 3.7 1.1 5.3 -4.9-2.7 -4.9 2.7 1.1-5.3 -4-3.7 5.4-.6 z" fill="currentColor" stroke="none"/>
  <text x="100" y="47" text-anchor="middle" fill="currentColor" stroke="none" font-family="Plex Mono, monospace" font-size="8" letter-spacing="2">N° ${echapper(C.dossier.numero)}</text>
</svg>`;
  }

  const TROMBONE = `<svg class="dossier__trombone" viewBox="0 0 22 58" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M7 20 V45 a4 4 0 0 0 8 0 V10 a6 6 0 0 0 -12 0 V48 a8 8 0 0 0 16 0 V18"/></svg>`;
  const ICONE_ALERTE = `<svg class="avertissement__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 L22 20 H2 Z"/><path d="M12 10 V14.5" stroke-linecap="round"/><circle cx="12" cy="17.3" r=".9" fill="currentColor"/></svg>`;
  const ICONE_VERROU = `<svg class="verrou-grand" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><rect x="12" y="28" width="40" height="30" rx="3"/><path d="M20 28 V20 a12 12 0 0 1 24 0 V28"/><circle cx="32" cy="41" r="4"/><path d="M32 45 V51" stroke-linecap="round"/></svg>`;

  /* Code-barres déterministe généré à partir d'une chaîne */
  function codeBarres(chaine) {
    let x = 0, barres = '';
    const motif = [2, 1, 1, 2, 3, 1].concat(...[...chaine].map((c) => {
      const b = c.charCodeAt(0);
      return [1 + (b & 3), 1 + ((b >> 2) & 1), 1 + ((b >> 3) & 3), 1 + ((b >> 5) & 1)];
    }), [2, 3, 1, 1, 2]);
    motif.forEach((w, i) => {
      if (i % 2 === 0) barres += `<rect x="${x}" y="0" width="${w}" height="34"/>`;
      x += w;
    });
    return `<svg class="code-barres" viewBox="0 0 ${x} 34" fill="currentColor" preserveAspectRatio="none" style="width:${Math.min(x * 1.5, 170)}px" aria-hidden="true">${barres}</svg>`;
  }

  /* =====================================================================
     NOTIFICATIONS SYSTÈME
     ===================================================================== */
  function notifier(message, options) {
    const o = Object.assign({ titre: 'Notification système', type: 'info', duree: 5200 }, options);
    const zone = $('#notifications');
    const n = document.createElement('div');
    n.className = 'notif' + (o.type === 'alerte' ? ' notif--alerte' : '');
    n.setAttribute('role', o.type === 'alerte' ? 'alert' : 'status');
    n.innerHTML = `<span class="notif__icone" aria-hidden="true">${o.type === 'alerte' ? '▲' : '■'}</span>
      <span class="notif__titre">${echapper(C.institution.sigle)} · ${echapper(o.titre)}</span>
      <span class="notif__texte">${texte(message)}</span>`;
    const fermer = () => {
      if (n.classList.contains('est-sortante')) return;
      n.classList.add('est-sortante');
      setTimeout(() => n.remove(), 260);
    };
    n.addEventListener('click', fermer);
    zone.appendChild(n);
    while (zone.children.length > 3) zone.firstElementChild.remove();
    setTimeout(fermer, o.duree);
  }

  /* =====================================================================
     ÉTAT : habilitation Ω, surprises découvertes
     ===================================================================== */
  const estOmega = () => memoire.lire('cndi-omega') === '1';
  const estVerrouille = (x) => !!(x && x.verrouille) && !estOmega();
  const SURPRISES = ['alerte', 'caviardage', 'tampon', 'minitel', 'reclamation'];
  const surprisesTrouvees = () => { try { return JSON.parse(memoire.lire('cndi-surprises') || '[]'); } catch (e) { return []; } };
  function majCompteurSurprises() {
    const el = $('#compteur-surprises');
    if (el) el.textContent = `${surprisesTrouvees().length}/${SURPRISES.length}`;
  }
  function decouvrir(id, message) {
    const t = surprisesTrouvees();
    const nouvelle = !t.includes(id);
    if (nouvelle) { t.push(id); memoire.ecrire('cndi-surprises', JSON.stringify(t)); majCompteurSurprises(); }
    notifier(message, { titre: nouvelle ? `Anomalie ${t.length}/${SURPRISES.length} détectée` : 'Anomalie déjà consignée', type: 'alerte', duree: 6500 });
  }
  const auHasard = (liste) => liste[Math.floor(Math.random() * liste.length)];
  const entre = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
  const normaliser = (x) => String(x == null ? '' : x).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/\s+/g, ' ').trim();

  function confettis(n) {
    if (MOUVEMENT_REDUIT) return;
    const z = document.createElement('div');
    z.className = 'confettis'; z.setAttribute('aria-hidden', 'true');
    const couleurs = ['#B0281F', '#C4952F', '#E8DEC4', '#8FC79A', '#CDBF9E'];
    for (let i = 0; i < (n || 70); i++) {
      const c = document.createElement('i');
      c.style.cssText = `left:${Math.random() * 100}%;background:${couleurs[i % 5]};--d:${(2.2 + Math.random() * 2.2).toFixed(2)}s;--r:${entre(-360, 360)}deg;--x:${entre(-60, 60)}px;animation-delay:${(Math.random() * .7).toFixed(2)}s;width:${entre(6, 11)}px;height:${entre(8, 17)}px`;
      z.appendChild(c);
    }
    document.body.appendChild(z);
    setTimeout(() => z.remove(), 5800);
  }

  async function sequenceVerification(titre, etapes) {
    const v = $('#verification');
    const ligne = $('#verification-ligne');
    $('.verification__titre', v).textContent = titre;
    v.hidden = false;
    v.classList.remove('est-active'); void v.offsetWidth; v.classList.add('est-active');
    for (const e of etapes) { ligne.textContent = e; await attendre(MOUVEMENT_REDUIT ? 250 : 380); }
    await attendre(150);
    v.hidden = true;
  }

  /* =====================================================================
     SÉQUENCE DE DÉMARRAGE
     ===================================================================== */
  function demarrer() {
    const el = $('#demarrage');
    const dejaVu = memoire.lire('cndi-demarre') && !C.demarrage.aChaqueVisite;
    if (dejaVu) { el.remove(); return Promise.resolve(false); }
    document.documentElement.classList.remove('deja-demarre');
    document.body.style.overflow = 'hidden';

    let passe = false;
    let terminer;
    const fin = new Promise((r) => { terminer = r; });

    const conclure = () => {
      if (el.classList.contains('est-termine')) return;
      memoire.ecrire('cndi-demarre', '1');
      el.classList.add('est-termine');
      document.body.style.overflow = '';
      setTimeout(() => el.remove(), 550);
      document.removeEventListener('keydown', surTouche);
      terminer(true);
    };
    const passer = () => { passe = true; conclure(); };
    const surTouche = (e) => { if (['Escape', 'Enter', ' '].includes(e.key)) passer(); };
    $('#demarrage-passer').addEventListener('click', passer);
    el.addEventListener('click', (e) => { if (e.target === el) passer(); });
    document.addEventListener('keydown', surTouche);

    const lignes = C.demarrage.lignes;
    const conteneur = $('#demarrage-lignes');
    const progression = $('#demarrage-progression');
    const vitesse = MOUVEMENT_REDUIT ? 0 : 1;

    (async () => {
      const titre = $('#demarrage-titre');
      titre.classList.add('curseur');
      await taper(titre, brut(C.demarrage.titre), 9 * vitesse);
      titre.classList.remove('curseur');
      for (let i = 0; i < lignes.length; i++) {
        if (passe) return;
        const [libelle, statut] = lignes[i];
        const ligne = document.createElement('div');
        ligne.className = 'demarrage__ligne';
        ligne.innerHTML = `<span class="l curseur"></span><span class="pts"></span><span class="s${String(statut).toUpperCase() === 'OK' ? '' : ' alerte'}">${echapper(remplir(statut))}</span>`;
        conteneur.appendChild(ligne);
        await taper(ligne.querySelector('.l'), '> ' + brut(libelle), 7 * vitesse);
        await attendre(110 * vitesse + 40);
        ligne.querySelector('.l').classList.remove('curseur');
        ligne.classList.add('est-fini');
        progression.style.width = ((i + 1) / lignes.length * 100) + '%';
      }
      if (passe) return;
      $('#demarrage-final').innerHTML = `${texte(C.demarrage.bienvenue)}<br><strong>ACCÈS AUTORISÉ</strong>`;
      await attendre(MOUVEMENT_REDUIT ? 900 : 850);
      conclure();
    })();

    async function taper(noeud, chaine, delai) {
      if (!delai) { noeud.textContent = chaine; return; }
      for (let i = 1; i <= chaine.length; i++) {
        if (passe) { noeud.textContent = chaine; return; }
        noeud.textContent = chaine.slice(0, i);
        if (i % 2 === 0) await attendre(delai);
      }
    }
    return fin;
  }

  /* =====================================================================
     EN-TÊTE : sceau, agent, chronomètre de session
     ===================================================================== */
  function initialiserEntete() {
    $('#entete-sceau').innerHTML = sceau();
    $('#entete-agent').textContent = AGENT;
    const chrono = $('#entete-chrono');
    const maj = () => {
      const s = Math.floor((Date.now() - DEBUT_SESSION) / 1000);
      chrono.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
    };
    maj(); setInterval(maj, 1000);
  }

  /* =====================================================================
     RÉPERTOIRE (menu)
     ===================================================================== */
  const bouton = () => $('#bouton-menu');
  const nav = () => $('#repertoire');
  let menuDejaOuvert = false;

  function construireRepertoire() {
    nav().innerHTML = `
      <p class="repertoire__titre">${echapper(C.institution.sigle)} · Dossier n°${echapper(C.dossier.numero)}</p>
      <p class="repertoire__sous-titre">Répertoire des pièces</p>
      <a class="repertoire__retour" href="#/" data-id="accueil">◂ Retour au portail</a>
      <ul class="tiroir">
        ${RUBRIQUES.map((r, i) => `
        <li><a class="fiche-onglet" href="#/${r.route}" data-id="${r.id}" data-code="${r.code}" style="--i:${i}">
          <span class="fiche-onglet__titre">${texte(r.titre)}</span>
          <span class="fiche-onglet__ref">Réf. ${echapper(C.dossier.reference)}/${r.code}</span>
        </a></li>`).join('')}
        <li><a class="fiche-onglet fiche-onglet--verrou${estOmega() ? ' fiche-onglet--omega' : ''}" href="#/${SECRET.route}" data-id="secret" data-code="Ω · ${estOmega() ? 'DÉCLASSIFIÉ' : 'RESTREINT'}" style="--i:0">
          <span class="fiche-onglet__titre">${texte(SECRET.titre)}</span>
          <span class="fiche-onglet__ref">${estOmega() ? 'Habilitation Ω accordée' : 'Habilitation Ω requise'}</span>
        </a></li>
      </ul>
      <div class="repertoire__pied">
        Agent ${echapper(AGENT)} · Habilitation ${estOmega() ? 'Ω' : 'provisoire'}<br>
        ${echapper(C.dossier.classification)} · ${echapper(C.dossier.volume)}<br>
        Anomalies détectées : <span id="compteur-surprises">${surprisesTrouvees().length}/${SURPRISES.length}</span>
      </div>`;
  }

  function ouvrirMenu() {
    if (ECRAN_LARGE.matches) return;
    const voile = $('#voile');
    nav().classList.add('est-ouvert');
    nav().inert = false;
    voile.hidden = false;
    requestAnimationFrame(() => voile.classList.add('est-visible'));
    bouton().setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    poserEtatHistorique('menu');
    const actif = nav().querySelector('[aria-current="page"]') || nav().querySelector('a');
    setTimeout(() => actif && actif.focus({ preventScroll: true }), 50);
    if (!menuDejaOuvert) {
      menuDejaOuvert = true;
      setTimeout(() => notifier(C.notifications.ouvertureMenu), 350);
    }
  }
  function fermerMenu(rendreFocus, depuisHistorique) {
    if (ECRAN_LARGE.matches || !nav().classList.contains('est-ouvert')) return;
    if (!depuisHistorique) retirerEtatHistorique('menu');
    const voile = $('#voile');
    nav().classList.remove('est-ouvert');
    nav().inert = true;
    voile.classList.remove('est-visible');
    setTimeout(() => { voile.hidden = true; }, 300);
    bouton().setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (rendreFocus) bouton().focus();
  }
  function adapterMenuALaLargeur() {
    if (ECRAN_LARGE.matches) {
      nav().inert = false;
      nav().classList.remove('est-ouvert');
      $('#voile').hidden = true;
      document.body.style.overflow = '';
      bouton().setAttribute('aria-expanded', 'false');
    } else {
      nav().inert = !nav().classList.contains('est-ouvert');
    }
  }
  function initialiserMenu() {
    construireRepertoire();
    bouton().addEventListener('click', () =>
      nav().classList.contains('est-ouvert') ? fermerMenu(true) : ouvrirMenu());
    $('#voile').addEventListener('click', () => fermerMenu(true));
    // Lien choisi dans le menu ouvert : on remplace l'étape « menu » de l'historique
    nav().addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || !history.state || history.state.cndi !== 'menu') return;
      e.preventDefault();
      history.replaceState(null, '', a.getAttribute('href'));
      router();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerMenu(true); });
    (ECRAN_LARGE.addEventListener ? ECRAN_LARGE.addEventListener('change', adapterMenuALaLargeur)
      : ECRAN_LARGE.addListener(adapterMenuALaLargeur));
    adapterMenuALaLargeur();
  }

  function marquerActif(id) {
    nav().querySelectorAll('[data-id]').forEach((a) => {
      if (a.dataset.id === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* =====================================================================
     FIL D'ARIANE + PIED DE PAGE
     ===================================================================== */
  function majAriane(r, detail) {
    const racine = `<li><a href="#/">${echapper(C.institution.sigle)}</a></li>`;
    const dossier = `<li>${r ? '<a href="#/">' : '<span aria-current="page">'}Dossier n°${echapper(C.dossier.numero)}${r ? '</a>' : '</span>'}</li>`;
    let page = '';
    if (r && detail) page = `<li><a href="#/${r.route}">${r.code} · ${texte(r.titre)}</a></li><li><span aria-current="page">${echapper(detail)}</span></li>`;
    else if (r) page = `<li><span aria-current="page">${r.code} · ${texte(r.titre)}</span></li>`;
    $('#ariane').innerHTML = racine + dossier + page;
  }

  function construirePied() {
    const d = new Date();
    const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    $('#pied').innerHTML = `
      <p>${echapper(C.institution.nom)} · ${echapper(C.institution.service)}</p>
      <p>Document édité le ${date} à ${pad(d.getHours())}:${pad(d.getMinutes())} pour l'agent ${echapper(AGENT)} · <span id="version-portail">Portail v${echapper(C.institution.versionPortail)}</span></p>
      <p>${texte(C.piedDePage)}</p>`;
  }

  /* =====================================================================
     VUES
     ===================================================================== */
  function enteteDocument(r, feuillet) {
    return `<div class="papier__entete">
      <span><strong>${echapper(C.institution.sigle)}</strong> · ${echapper(C.institution.service)}</span>
      <span>Réf. ${echapper(C.dossier.reference)}/${r.code} · ${feuillet || 'Feuillet 1/1'} · Diffusion restreinte</span>
    </div>`;
  }

  function pagination(r) {
    const i = RUBRIQUES.indexOf(r);
    const prec = i > 0 ? RUBRIQUES[i - 1] : null;
    const suiv = i >= 0 && i < RUBRIQUES.length - 1 ? RUBRIQUES[i + 1] : null;
    const lien = (x, sens) => x
      ? `<a class="bouton bouton--papier" href="#/${x.route}">${sens === 'p' ? '◂&nbsp;' + x.code + ' · Pièce précédente' : 'Pièce suivante · ' + x.code + '&nbsp;▸'}</a>`
      : '<span class="pagination__vide"></span>';
    const retour = `<a class="bouton bouton--papier" href="#/">◂ Portail</a>`;
    return `<nav class="pagination" aria-label="Pièces voisines">${prec ? lien(prec, 'p') : retour}${lien(suiv, 's')}</nav>`;
  }

  /* ----- Accueil ----- */
  const estAnniversaire = () => {
    const [m, j] = String(C.sujet.anniversaire || '').split('-').map(Number);
    const t = new Date();
    return t.getMonth() + 1 === m && t.getDate() === j;
  };

  function vueAccueil(params) {
    const anniv = estAnniversaire() || (params && params.has('anniversaire'));
    const s = C.sujet, d = C.dossier, a = C.accueil;
    const dateOuv = new Date(s.dateDecouverte);
    const dateTxt = isNaN(dateOuv) ? '[DATE_INVALIDE]' :
      dateOuv.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const messages = C.bandeau.map((m) => `<span>${texte(m)}</span>`).join('');
    const longueur = C.bandeau.join(' ').length;

    const html = `
<section class="accueil" aria-labelledby="titre-accueil">
  ${anniv ? `<div class="anniversaire" role="note"><span class="anniversaire__label">Avis exceptionnel</span><p>${texte(C.surprises.messageAnniversaire)}</p></div>` : ''}
  <div class="accueil__haut">
    <p class="accueil__surtitre">${texte(a.surtitre)}</p>
    <div class="accueil__sceau" data-oeuf="sceau">${sceau()}</div>
    <h1 class="accueil__nom" id="titre-accueil" tabindex="-1">${texte(C.institution.nom)}</h1>
    <p class="accueil__devise">${texte(C.institution.devise)}</p>
    <div class="accueil__filet" aria-hidden="true"></div>
  </div>

  <p class="accueil__presentation"><span class="etiquette">Présentation officielle</span>${texte(a.presentation)}</p>

  <article class="papier dossier" aria-label="Dossier individuel">
    ${TROMBONE}
    <h2 class="dossier__titre"><small>Dossier individuel</small>N° ${texte(d.numero)}</h2>
    <span class="tampon tampon--anime" style="--delai:.5s">${estOmega() ? 'Déclassifié' : texte(d.statut)}</span>
    <dl class="champs">
      <div class="champ champ--large"><dt>Sujet</dt><dd>${texte(s.prenom)} ${texte(s.nom)}, dit «&nbsp;${texte(s.surnom)}&nbsp;»</dd></div>
      <div class="champ"><dt>Référence</dt><dd>${texte(d.reference)}</dd></div>
      <div class="champ"><dt>Ouverture du dossier</dt><dd>${dateTxt}</dd></div>
      <div class="champ"><dt>Classification</dt><dd>${texte(d.classification)}</dd></div>
      <div class="champ"><dt>Volume</dt><dd>${texte(d.volume)}</dd></div>
      <div class="champ champ--large"><dt>Agent référent</dt><dd><span class="caviarde" title="Information classifiée">${texte(d.agentReferent)}</span></dd></div>
      <div class="champ champ--large"><dt>Durée de surveillance continue</dt><dd class="compteur" id="compteur" aria-live="off">…</dd></div>
    </dl>
    <div class="dossier__bas">
      <small>Pièce consultée par ${echapper(AGENT)}<br>Toute sortie de ce document est consignée.</small>
      ${codeBarres(d.reference + AGENT)}
    </div>
  </article>

  <div class="avertissement" role="note">
    ${ICONE_ALERTE}
    <p style="margin:0"><strong>Avertissement</strong>${texte(a.avertissement)}</p>
  </div>

  <div class="accueil__acces">
    <button type="button" class="bouton bouton--principal" id="acces-archives">▶&nbsp;${texte(a.boutonAcces)}</button>
    <small>${texte(a.mentionBouton)}</small>
  </div>

  <div class="bandeau" aria-label="Avis à la population">
    <span class="bandeau__label">Avis</span>
    <div class="bandeau__piste">
      <div class="bandeau__defile" style="--duree:${Math.max(30, Math.round(longueur / 6))}s">
        ${messages}<span aria-hidden="true" style="display:contents">${messages}</span>
      </div>
    </div>
  </div>

  <section class="sommaire" aria-labelledby="titre-sommaire">
    <h2 class="sommaire__titre" id="titre-sommaire"><span>Contenu du dossier</span><span>${RUBRIQUES.length + 1} pièces</span></h2>
    <ol>
      ${RUBRIQUES.map((r) => `<li><a href="#/${r.route}"><span class="num">${r.code}</span><span class="tit">${texte(r.titre)}<small>${texte(r.sousTitre)}</small></span><span class="fl" aria-hidden="true">▸</span></a></li>`).join('')}
      <li class="verrou${estOmega() ? ' ouvert' : ''}"><a href="#/${SECRET.route}"><span class="num">Ω</span><span class="tit">${texte(SECRET.titre)}<small>${estOmega() ? 'Habilitation Ω accordée · Document déclassifié' : 'Habilitation Ω requise'}</small></span><span class="fl" aria-hidden="true">${estOmega() ? '✓' : '⊘'}</span></a></li>
    </ol>
  </section>
</section>`;

    function monter(main) {
      // Compteur de surveillance en direct
      const compteur = $('#compteur', main);
      const maj = () => {
        if (isNaN(dateOuv)) { compteur.innerHTML = texte('[DATE_DE_DECOUVERTE_INVALIDE]'); return; }
        let t = Math.max(0, Math.floor((Date.now() - dateOuv.getTime()) / 1000));
        const j = Math.floor(t / 86400); t %= 86400;
        compteur.textContent = `${nombre.format(j)} j ${pad(Math.floor(t / 3600))} h ${pad(Math.floor(t / 60) % 60)} min ${pad(t % 60)} s`;
      };
      maj();
      const minuteur = setInterval(maj, 1000);

      // Bouton d'accès aux archives
      $('#acces-archives', main).addEventListener('click', accederAuxArchives);

      // Notification d'arrivée (une fois par session)
      let minuteurNotif;
      if (!memoire.lire('cndi-notif-arrivee')) {
        memoire.ecrire('cndi-notif-arrivee', '1');
        minuteurNotif = setTimeout(() => notifier(C.notifications.arrivee), 1800);
      }
      if (anniv && !memoire.lire('cndi-confettis')) {
        memoire.ecrire('cndi-confettis', '1');
        setTimeout(() => confettis(90), 700);
      }
      return () => { clearInterval(minuteur); clearTimeout(minuteurNotif); };
    }
    return { html, monter };
  }

  async function accederAuxArchives() {
    await sequenceVerification("Vérification de l'habilitation", [`Agent ${AGENT}…`, 'Contrôle du QR code…', 'Habilitation : CONFORME']);
    location.hash = '#/' + RUBRIQUES[0].route;
    setTimeout(() => notifier(C.notifications.accesArchives), 500);
  }

  /* =====================================================================
     OUTILS COMMUNS AUX RUBRIQUES
     ===================================================================== */
  function enTeteRubrique(r, feuillet) {
    return `${enteteDocument(r, feuillet)}
  <h1 class="papier__titre" tabindex="-1"><span class="code">${r.code}</span>${texte(r.titre)}</h1>
  <p class="papier__sous-titre">${texte(r.sousTitre)}</p>`;
  }
  const titreSection = (num, txt) => `<h2 class="section-titre"><span>${num}</span>${txt}</h2>`;
  const vide = (msg) => `<p class="vide">${msg}</p>`;

  /* Balayage horizontal (mobile) */
  function surBalayage(el, versGauche, versDroite) {
    let x0 = null, y0 = null;
    const debut = (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; };
    const fin = (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) (dx < 0 ? versGauche : versDroite)();
      x0 = null;
    };
    el.addEventListener('touchstart', debut, { passive: true });
    el.addEventListener('touchend', fin, { passive: true });
  }

  /* Image : chargement différé + remplacement si le fichier manque */
  const image = (src, alt, classe) =>
    `<img src="${echapper(src)}" alt="${echapper(brut(alt || ''))}" loading="lazy" decoding="async"${classe ? ` class="${classe}"` : ''}>`;

  document.addEventListener('error', (e) => {
    const t = e.target;
    if (!t || !(t.tagName === 'IMG' || t.tagName === 'VIDEO') || t.dataset.manquant) return;
    t.dataset.manquant = '1';
    const ph = document.createElement('div');
    ph.className = 'media-manquant';
    ph.innerHTML = `<span>${t.tagName === 'VIDEO' ? 'Bande vidéo' : 'Pièce'} introuvable</span><code>${echapper(t.getAttribute('src') || '')}</code>`;
    t.replaceWith(ph);
  }, true);

  const SIGNATURE = (variante) => `<svg xmlns="http://www.w3.org/2000/svg" class="signature__trace" viewBox="0 0 160 50" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${variante === 2
    ? '<path d="M8 34 C14 10 26 8 24 30 C23 40 30 38 36 26 S48 12 50 30 C51 38 58 36 62 28 C66 18 74 14 76 26 S88 40 96 22 C100 14 108 16 110 26 C112 34 122 34 132 20"/><path d="M20 42 C60 36 100 38 150 30"/>'
    : '<path d="M6 30 C18 4 30 6 24 28 C20 42 34 40 40 22 S54 8 56 28 C57 36 64 34 68 24 S80 12 84 26 S96 38 104 20 S118 10 122 24 C124 32 132 30 140 16"/><path d="M14 40 C50 46 110 44 154 36"/>'}</svg>`;

  function rosette() {
    let pts = [];
    for (let k = 0; k < 32; k++) {
      const a = (k / 32) * Math.PI * 2, rr = k % 2 ? 31 : 38;
      pts.push((50 + rr * Math.cos(a)).toFixed(1) + ',' + (46 + rr * Math.sin(a)).toFixed(1));
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" class="rosette" viewBox="0 0 100 120" aria-hidden="true">
      <path d="M34 66 L22 116 L34 106 L44 118 L50 72 Z" fill="#8E1F18"/>
      <path d="M66 66 L78 116 L66 106 L56 118 L50 72 Z" fill="#A8271E"/>
      <polygon points="${pts.join(' ')}" fill="#C4952F"/>
      <circle cx="50" cy="46" r="26" fill="#B0281F"/>
      <circle cx="50" cy="46" r="21" fill="none" stroke="#E8C77A" stroke-width="1.2"/>
      <text x="50" y="44" text-anchor="middle" font-family="Source Serif, serif" font-weight="600" font-size="11" fill="#F3E3B8">${echapper(C.institution.sigle)}</text>
      <text x="50" y="56" text-anchor="middle" font-family="Plex Mono, monospace" font-size="6" fill="#F3E3B8" letter-spacing="1">MÉRITE</text>
    </svg>`;
  }

  /* =====================================================================
     BOUTON « RETOUR » DU TÉLÉPHONE
     Ouvrir la visionneuse ou le menu ajoute une étape à l'historique :
     le bouton retour les referme au lieu de quitter la page.
     ===================================================================== */
  function poserEtatHistorique(cle) {
    try { history.pushState({ cndi: cle }, '', location.href); } catch (e) { /* rien */ }
  }
  function retirerEtatHistorique(cle) {
    try { if (history.state && history.state.cndi === cle) history.back(); } catch (e) { /* rien */ }
  }
  window.addEventListener('popstate', () => {
    if (Visionneuse.estOuverte()) Visionneuse.fermer(true);
    else if (nav().classList.contains('est-ouvert')) fermerMenu(false, true);
  });

  /* =====================================================================
     VISIONNEUSE (photos, vidéos, captures, pièces à conviction)
     ===================================================================== */
  const Visionneuse = (() => {
    let el = null, liste = [], index = 0, retourFocus = null;

    function creer() {
      el = document.createElement('div');
      el.className = 'visionneuse';
      el.hidden = true;
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', 'Visionneuse des archives');
      el.innerHTML = `
        <div class="visionneuse__barre">
          <span class="visionneuse__cote"></span>
          <span class="visionneuse__compteur"></span>
          <button type="button" class="visionneuse__fermer" aria-label="Fermer la visionneuse">✕</button>
        </div>
        <div class="visionneuse__scene"></div>
        <button type="button" class="visionneuse__nav visionneuse__nav--prec" aria-label="Pièce précédente">‹</button>
        <button type="button" class="visionneuse__nav visionneuse__nav--suiv" aria-label="Pièce suivante">›</button>
        <div class="visionneuse__legende"></div>`;
      document.body.appendChild(el);
      el.querySelector('.visionneuse__fermer').addEventListener('click', fermer);
      el.querySelector('.visionneuse__nav--prec').addEventListener('click', () => aller(-1));
      el.querySelector('.visionneuse__nav--suiv').addEventListener('click', () => aller(1));
      el.querySelector('.visionneuse__scene').addEventListener('click', (e) => {
        if (e.target.classList.contains('visionneuse__scene')) fermer();
      });
      surBalayage(el.querySelector('.visionneuse__scene'), () => aller(1), () => aller(-1));
      document.addEventListener('keydown', (e) => {
        if (el.hidden) return;
        if (e.key === 'Escape') { e.stopPropagation(); fermer(); }
        else if (e.key === 'ArrowRight') aller(1);
        else if (e.key === 'ArrowLeft') aller(-1);
        else if (e.key === 'Tab') { // garder le focus dans la visionneuse
          const f = [...el.querySelectorAll('button, video')].filter((b) => !b.hidden && b.offsetParent);
          if (!f.length) return;
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      }, true);
    }

    function rendre() {
      const m = liste[index];
      const scene = el.querySelector('.visionneuse__scene');
      const ancienne = scene.querySelector('video');
      if (ancienne) ancienne.pause();
      scene.innerHTML = m.type === 'video'
        ? `<video src="${echapper(m.src)}" ${m.poster ? `poster="${echapper(m.poster)}"` : ''} controls playsinline preload="metadata"></video>`
        : `<img src="${echapper(m.src)}" alt="${echapper(brut(m.legende || m.cote))}">`;
      el.querySelector('.visionneuse__cote').textContent = m.cote || '';
      el.querySelector('.visionneuse__compteur').textContent = liste.length > 1 ? `${pad(index + 1)} / ${pad(liste.length)}` : '';
      el.querySelector('.visionneuse__legende').innerHTML =
        (m.legende ? `<p>${texte(m.legende)}</p>` : '') + (m.date ? `<small>${texte(m.date)}</small>` : '');
      el.querySelectorAll('.visionneuse__nav').forEach((b) => { b.hidden = liste.length < 2; });
    }

    function aller(pas) {
      if (liste.length < 2) return;
      index = (index + pas + liste.length) % liste.length;
      rendre();
    }

    function ouvrir(items, i) {
      if (!el) creer();
      liste = items; index = i || 0;
      retourFocus = document.activeElement;
      rendre();
      if (el.hidden) poserEtatHistorique('visionneuse');
      el.hidden = false;
      document.body.style.overflow = 'hidden';
      el.querySelector('.visionneuse__fermer').focus();
    }

    function fermer(depuisHistorique) {
      if (!el || el.hidden) return;
      if (depuisHistorique !== true) retirerEtatHistorique('visionneuse');
      const v = el.querySelector('video'); if (v) v.pause();
      el.hidden = true;
      el.querySelector('.visionneuse__scene').innerHTML = '';
      document.body.style.overflow = '';
      if (retourFocus && retourFocus.focus) retourFocus.focus();
    }

    return { ouvrir, fermer, estOuverte: () => !!el && !el.hidden };
  })();

  /* =====================================================================
     01 – FICHE D'IDENTITÉ
     ===================================================================== */
  const NIVEAUX_DANGER = [
    { nom: 'Vert', libelle: 'Inoffensif (en apparence)' },
    { nom: 'Jaune', libelle: 'Surveillance passive' },
    { nom: 'Orange', libelle: 'Vigilance renforcée' },
    { nom: 'Rouge', libelle: 'Alerte maximale' },
    { nom: 'Écarlate', libelle: 'Évacuation recommandée' },
  ];

  function vueFiche(r) {
    const s = C.sujet, f = C.fiche, d = C.dossier;
    const niv = borner(parseInt(f.dangerosite.niveau, 10) || 1, 1, 5);
    const N = NIVEAUX_DANGER[niv - 1];
    const dOuv = new Date(s.dateDecouverte);
    const dateOuv = isNaN(dOuv) ? texte('[DATE_INVALIDE]')
      : dOuv.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const psy = f.etatPsychologique;

    const html = `
<article class="papier fiche">
  ${enTeteRubrique(r, 'Feuillet 1/1')}

  ${titreSection('I.', 'État civil')}
  <div class="fiche__identite">
    <figure class="photo-id">
      ${image(f.photo, 'Photographie d\'identité du sujet')}
      <figcaption>Cliché n°${echapper(d.numero)}-A</figcaption>
      <span class="tampon tampon--anime tampon--petit" style="--rot:-11deg;--delai:.45s">Identifié</span>
    </figure>
    <dl class="champs champs--serre">
      <div class="champ"><dt>Nom</dt><dd>${texte(s.nom)}</dd></div>
      <div class="champ"><dt>Prénom</dt><dd>${texte(s.prenom)}</dd></div>
      <div class="champ champ--large"><dt>Surnom d'usage</dt><dd>«&nbsp;${texte(s.surnom)}&nbsp;»</dd></div>
      <div class="champ"><dt>Date de découverte</dt><dd>${dateOuv}</dd></div>
      <div class="champ"><dt>Lieu de découverte</dt><dd>${texte(f.lieuDecouverte)}</dd></div>
    </dl>
  </div>
  <dl class="champs">
    <div class="champ champ--large"><dt>Fonction officielle</dt><dd>${texte(f.fonction)}</dd></div>
    <div class="champ champ--large"><dt>Signes particuliers</dt><dd>${texte(f.signesParticuliers)}</dd></div>
  </dl>

  ${titreSection('II.', 'Compétences reconnues')}
  <ul class="cases">${f.competences.map((c) => `<li class="case case--oui">${texte(c)}</li>`).join('') || vide('Aucune compétence recensée à ce jour.')}</ul>

  ${titreSection('III.', 'Défauts recensés')}
  <ul class="cases">${f.defauts.map((c) => `<li class="case case--non">${texte(c)}</li>`).join('') || vide('Recensement en cours (il risque d\'être long).')}</ul>
  <p class="note-bas">Liste non exhaustive. Le recensement complet est estimé à 11 volumes.</p>

  ${titreSection('IV.', 'Niveau de dangerosité')}
  <div class="jauge" role="img" aria-label="Niveau ${niv} sur 5 : ${N.nom}, ${N.libelle}">
    <div class="jauge__segments">
      ${NIVEAUX_DANGER.map((n, k) => `<span class="jauge__seg jauge__seg--${k + 1}${k < niv ? ' est-actif' : ''}" style="--k:${k}"><small>${n.nom}</small></span>`).join('')}
    </div>
    <p class="jauge__verdict jauge__verdict--${niv}">Niveau ${N.nom.toUpperCase()} · ${N.libelle}</p>
  </div>
  <p class="commentaire">${texte(f.dangerosite.commentaire)}</p>

  ${titreSection('V.', 'Évaluation psychologique')}
  <div class="psy">
    <p class="psy__ligne"><span>Diagnostic</span><strong>${texte(psy.diagnostic)}</strong></p>
    <div class="psy__obs"><span>Observations cliniques</span>${paragraphes(psy.observations)}</div>
    <p class="psy__ligne"><span>Recommandation</span><strong>${texte(psy.recommandation)}</strong></p>
  </div>

  ${titreSection('VI.', 'Bureau des Statistiques')}
  <div class="stats">
    <p class="stats__intro">Le Bureau produit à la demande une étude statistique inédite sur le sujet. Les résultats sont garantis non reproductibles.</p>
    <button type="button" class="bouton bouton--papier" id="lancer-etude">▶&nbsp;Lancer une étude</button>
    <div class="stats__resultats" id="stats-resultats" aria-live="polite"></div>
  </div>

  <div class="signature">
    <p class="signature__lieu">Fait à ${texte(f.villeSignature)}, le ${dateDuJour()}</p>
    <div class="signature__bloc">
      <span>Le Directeur du ${echapper(C.institution.sigle)},</span>
      ${SIGNATURE(1)}
      <strong>${texte(C.institution.directeur)}</strong>
    </div>
    <div class="cachet" aria-hidden="true">${sceau()}</div>
  </div>
  ${pagination(r)}
</article>`;
    function monter(main) {
      const bouton = $('#lancer-etude', main);
      const zone = $('#stats-resultats', main);
      let etudes = 0, enCours = false;
      bouton.addEventListener('click', async () => {
        if (enCours) return;
        enCours = true; bouton.disabled = true; etudes++;
        zone.innerHTML = '<div class="stats__calcul"><div class="stats__jauge"><span></span></div><p id="stats-ligne"></p></div>';
        const ligne = $('#stats-ligne', zone);
        for (const e of [`Consultation de ${nombre.format(entre(1200, 9800))} sources…`, `Interrogation de ${entre(2, 7)} témoins (dont ${entre(1, 2)} réticents)…`, 'Arrondi des résultats à l\'avantage du Bureau…']) {
          ligne.textContent = e; await attendre(MOUVEMENT_REDUIT ? 200 : 520);
        }
        zone.innerHTML = rendreStatistiques();
        bouton.innerHTML = '▶&nbsp;Relancer une étude';
        bouton.disabled = false; enCours = false;
        if (etudes === 1) notifier('Étude statistique terminée. Résultats non contractuels.', { titre: 'Bureau des Statistiques' });
        if (etudes === 5) notifier('Le Bureau vous rappelle que chaque étude coûte 3 200 € au contribuable.', { titre: 'Bureau des Statistiques', type: 'alerte' });
      });
    }
    return { html, monter };
  }

  function rendreStatistiques() {
    const cfg = C.statistiques || { modeles: [] };
    const modeles = cfg.modeles.slice().sort(() => Math.random() - .5).slice(0, cfg.parEtude || 4);
    return `<p class="stats__entete">Étude n°ST-${entre(1000, 9999)} · Échantillon : 1 individu · Marge d'erreur : ±${entre(40, 300)} %</p>
    <ol class="stats__liste">${modeles.map((m) => {
      const n = entre(m.min, m.max);
      const t = texte(String(m.texte).replace('{n}', nombre.format(n)));
      const barre = m.barre ? `<span class="stats__barre${n > 100 ? ' stats__barre--hors' : ''}"><span style="--v:${Math.min(n, 100)}%"></span></span>${n > 100 ? '<em class="stats__hors">Hors échelle</em>' : ''}` : '';
      return `<li><span class="stats__txt">${t}</span>${barre}</li>`;
    }).join('')}</ol>`;
  }


  /* =====================================================================
     02 – ARCHIVES LITTÉRAIRES
     ===================================================================== */
  const GRAVITES = ['Anodin', 'Préoccupant', 'Grave', 'Critique', 'Irréparable'];

  function carteCitation(c, i) {
    const g = borner(parseInt(c.gravite, 10) || 1, 1, 5);
    return `
<figure class="citation" data-gravite="${g}">
  <blockquote class="citation__texte"><p>${texte(c.texte)}</p></blockquote>
  ${g >= 4 ? `<span class="tampon tampon--anime citation__tampon" style="--rot:${g === 5 ? 7 : -6}deg;--delai:.25s">${GRAVITES[g - 1]}</span>` : ''}
  <dl class="champs">
    <div class="champ champ--large"><dt>Contexte</dt><dd>${texte(c.contexte)}</dd></div>
    <div class="champ"><dt>Date approximative</dt><dd>${texte(c.date)}</dd></div>
    <div class="champ"><dt>Niveau de gravité</dt><dd class="gravite gravite--${g}">
      <span class="gravite__points" aria-hidden="true">${'●'.repeat(g)}${'○'.repeat(5 - g)}</span>
      ${g}/5 · ${GRAVITES[g - 1]}</dd></div>
  </dl>
  <div class="analyse">
    <p class="analyse__titre">Analyse du Bureau d'Interprétation Linguistique</p>
    ${paragraphes(c.analyse)}
    <p class="analyse__ref">Rapport BIL/${pad3(i + 1)} · Approuvé en commission après ${7 + ((i * 13) % 40)} réunions</p>
  </div>
</figure>`;
  }

  function vueCitations(r, params) {
    const L = C.citations || [];
    if (!L.length) {
      return { html: `<article class="papier">${enTeteRubrique(r)}${vide('Aucune déclaration n\'a encore été versée aux archives.')}${pagination(r)}</article>` };
    }
    let i = borner((parseInt(params.get('piece'), 10) || 1) - 1, 0, L.length - 1);

    const html = `
<article class="papier">
  ${enTeteRubrique(r, `${L.length} pièce${L.length > 1 ? 's' : ''}`)}
  <div class="lecteur">
    <div class="lecteur__haut">
      <span>Pièce <strong id="cit-ref">L-${pad3(i + 1)}</strong></span>
      <span id="cit-compteur">${pad(i + 1)} / ${pad(L.length)}</span>
    </div>
    <div class="lecteur__cadre" id="cit-cadre" aria-live="polite">${carteCitation(L[i], i)}</div>
    <div class="lecteur__commandes">
      <button type="button" class="bouton bouton--papier" data-pas="-1" aria-label="Citation précédente">◂ Préc.</button>
      <button type="button" class="bouton bouton--papier" id="cit-hasard">Pièce au hasard</button>
      <button type="button" class="bouton bouton--papier" data-pas="1" aria-label="Citation suivante">Suiv. ▸</button>
    </div>
    <p class="lecteur__aide">Balayez la fiche ou utilisez les flèches du clavier.</p>
  </div>
  <details class="registre">
    <summary>Registre des déclarations <span>(${L.length})</span></summary>
    <ol>${L.map((c, k) => `<li><button type="button" data-aller="${k}"><span class="registre__ref">L-${pad3(k + 1)}</span><span class="registre__txt">${texte(c.texte)}</span><span class="gravite gravite--${borner(c.gravite || 1, 1, 5)}">${'●'.repeat(borner(c.gravite || 1, 1, 5))}</span></button></li>`).join('')}</ol>
  </details>
  ${pagination(r)}
</article>`;

    function monter(main) {
      const cadre = $('#cit-cadre', main);
      const aller = (n, sens) => {
        i = (n + L.length) % L.length;
        cadre.classList.remove('glisse-g', 'glisse-d');
        void cadre.offsetWidth;
        cadre.innerHTML = carteCitation(L[i], i);
        cadre.classList.add(sens < 0 ? 'glisse-d' : 'glisse-g');
        $('#cit-ref', main).textContent = 'L-' + pad3(i + 1);
        $('#cit-compteur', main).textContent = `${pad(i + 1)} / ${pad(L.length)}`;
        history.replaceState(null, '', `#/${r.route}?piece=${i + 1}`);
      };
      main.querySelectorAll('[data-pas]').forEach((b) =>
        b.addEventListener('click', () => aller(i + Number(b.dataset.pas), Number(b.dataset.pas))));
      $('#cit-hasard', main).addEventListener('click', () => {
        if (L.length < 2) return;
        let n; do { n = Math.floor(Math.random() * L.length); } while (n === i);
        aller(n, 1);
      });
      main.querySelectorAll('[data-aller]').forEach((b) => b.addEventListener('click', () => {
        aller(Number(b.dataset.aller), 1);
        $('.lecteur', main).scrollIntoView({ behavior: MOUVEMENT_REDUIT ? 'auto' : 'smooth', block: 'start' });
      }));
      surBalayage(cadre, () => aller(i + 1, 1), () => aller(i - 1, -1));
      const clavier = (e) => {
        if (Visionneuse.estOuverte() || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
        if (e.key === 'ArrowRight') aller(i + 1, 1);
        else if (e.key === 'ArrowLeft') aller(i - 1, -1);
      };
      document.addEventListener('keydown', clavier);
      return () => document.removeEventListener('keydown', clavier);
    }
    return { html, monter };
  }

  /* =====================================================================
     03 – AFFAIRES NON RÉSOLUES
     ===================================================================== */
  const STATUTS = {
    'non-resolue': { libelle: 'Non résolue', classe: 'rouge' },
    'en-cours':    { libelle: 'En cours', classe: 'ambre' },
    'classee':     { libelle: 'Classée sans suite', classe: 'gris' },
    'resolue':     { libelle: 'Résolue (à tort)', classe: 'vert' },
  };
  const statutDe = (a) => STATUTS[a.statut] || STATUTS['non-resolue'];
  const lienAffaire = (r, a) => `#/${r.route}?affaire=${encodeURIComponent(a.reference)}`;

  function vueAffaires(r, params) {
    const L = C.affaires || [];
    const id = params.get('affaire');
    if (id) {
      const k = L.findIndex((a) => a.reference === id);
      if (k >= 0) return estVerrouille(L[k]) ? vueAffaireVerrouillee(r, k) : vueAffaire(r, k);
    }
    const nonResolues = L.filter((a) => a.statut !== 'resolue' && a.statut !== 'classee').length;
    const html = `
<article class="papier">
  ${enTeteRubrique(r, 'Registre')}
  <p class="registre-intro">${L.length} affaire${L.length > 1 ? 's' : ''} enregistrée${L.length > 1 ? 's' : ''} · <strong>${nonResolues}</strong> toujours ouverte${nonResolues > 1 ? 's' : ''} · Taux d'élucidation : ${L.length ? Math.round((L.length - nonResolues) / L.length * 100) : 0}&nbsp;% (objectif national : 2&nbsp;%)</p>
  ${L.length ? `<ol class="registre-affaires">
    ${L.map((a) => {
      const st = statutDe(a), v = estVerrouille(a);
      return `<li><a href="${lienAffaire(r, a)}"${v ? ' class="est-verrouille"' : ''}>
        <span class="ra__ref">${texte(a.reference)}</span>
        <span class="ra__titre">${v ? `<span class="caviarde">${texte(a.titre)}</span>` : texte(a.titre)}</span>
        <span class="ra__date">${v ? 'Date classifiée' : texte(a.date)}</span>
        <span class="statut statut--${v ? 'gris' : st.classe}">${v ? '⊘ Verrouillé' : st.libelle}</span>
        <span class="ra__fleche" aria-hidden="true">▸</span>
      </a></li>`;
    }).join('')}
  </ol>` : vide('Aucune affaire en cours. C\'est suspect.')}
  ${pagination(r)}
</article>`;
    return { html };
  }

  function vueAffaireVerrouillee(r, k) {
    const L = C.affaires, a = L[k], suiv = L[(k + 1) % L.length];
    const lignesFloues = Array.from({ length: 9 }, (_, n) => `<span class="ligne-caviardee" style="width:${[92, 78, 96, 64, 88, 71, 95, 58, 83][n]}%"></span>`).join('');
    const html = `
<article class="papier pv">
  ${enteteDocument(r, 'Procès-verbal')}
  <p class="pv__type">Procès-verbal d'enquête administrative</p>
  <h1 class="papier__titre" tabindex="-1"><span class="caviarde">${texte(a.titre)}</span></h1>
  <span class="tampon tampon--anime pv__tampon tampon--gris" style="--rot:-7deg">Verrouillé</span>
  <dl class="champs">
    <div class="champ"><dt>Référence</dt><dd>${texte(a.reference)}</dd></div>
    <div class="champ"><dt>Date des faits</dt><dd><span class="caviarde">${texte(a.date)}</span></dd></div>
    <div class="champ champ--large"><dt>Lieu</dt><dd><span class="caviarde">${texte(a.lieu)}</span></dd></div>
  </dl>
  <div class="pv__flou" aria-hidden="true">${lignesFloues}</div>
  <div class="acces-refuse" role="alert">
    ${ICONE_VERROU}
    <p class="acces-refuse__titre">Accès refusé</p>
    <p>${texte(a.messageVerrou || 'Ce document est verrouillé.')}</p>
    <button type="button" class="bouton bouton--papier" id="demande-declass">Demander la déclassification</button>
    <p class="acces-refuse__reponse" id="reponse-declass" aria-live="polite"></p>
    <p class="acces-refuse__astuce">Une habilitation de niveau <a href="#/${SECRET.route}">Ω</a> permettrait peut-être d'accélérer la procédure.</p>
  </div>
  <nav class="pagination" aria-label="Navigation entre affaires">
    <a class="bouton bouton--papier" href="#/${r.route}">◂ Registre</a>
    ${L.length > 1 ? `<a class="bouton bouton--papier" href="${lienAffaire(r, suiv)}">Affaire suivante ▸</a>` : ''}
  </nav>
</article>`;
    function monter(main) {
      const b = $('#demande-declass', main), rep = $('#reponse-declass', main);
      b.addEventListener('click', async () => {
        b.disabled = true;
        rep.textContent = 'Transmission de la demande au service compétent…';
        await attendre(1400);
        const motif = auHasard(C.refusDeclassification || ['Demande rejetée.']);
        rep.innerHTML = `Demande n°DD-${entre(1000, 9999)} <strong>rejetée</strong>. Motif : ${texte(motif)}`;
        notifier('Demande de déclassification rejetée.', { type: 'alerte', titre: 'Service des déclassifications' });
        b.disabled = false; b.textContent = 'Renouveler la demande';
      });
    }
    return { html, monter, ariane: brut(a.reference) };
  }

  function vueAffaire(r, k) {
    const L = C.affaires, a = L[k], st = statutDe(a);
    const preuves = (a.preuves || []).map((p, n) => ({
      type: 'photo', src: p.src, legende: p.legende, cote: `Scellé n°${n + 1} · ${a.reference}`,
    }));
    const suiv = L[(k + 1) % L.length];
    const html = `
<article class="papier pv">
  ${enteteDocument(r, 'Procès-verbal')}
  <p class="pv__type">Procès-verbal d'enquête administrative</p>
  <h1 class="papier__titre" tabindex="-1">${texte(a.titre)}</h1>
  <span class="tampon tampon--anime pv__tampon tampon--${st.classe}" style="--rot:-7deg">${st.libelle}</span>
  <dl class="champs">
    <div class="champ"><dt>Référence</dt><dd>${texte(a.reference)}</dd></div>
    <div class="champ"><dt>Date des faits</dt><dd>${texte(a.date)}</dd></div>
    <div class="champ"><dt>Lieu</dt><dd>${texte(a.lieu)}</dd></div>
    <div class="champ"><dt>Service saisi</dt><dd>Brigade des Faits Insignifiants</dd></div>
    <div class="champ champ--large"><dt>Mis en cause</dt><dd>${texte(C.sujet.prenom)} ${texte(C.sujet.nom)}, dit «&nbsp;${texte(C.sujet.surnom)}&nbsp;»</dd></div>
  </dl>

  ${titreSection('I.', 'Exposé des faits')}
  <div class="pv__texte">${paragraphes(a.description)}</div>

  ${titreSection('II.', 'Pièces à conviction')}
  ${preuves.length ? `<ul class="scelles">${preuves.map((p, n) => `
    <li><button type="button" class="scelle" data-preuve="${n}" style="--rot:${[-2, 1.5, -1, 2.5][n % 4]}deg">
      <span class="scelle__etiquette">Scellé n°${n + 1}</span>
      <span class="scelle__photo">${image(p.src, p.legende)}</span>
      <span class="scelle__legende">${texte(p.legende)}</span>
    </button></li>`).join('')}</ul>` : vide('Aucune pièce à conviction n\'a pu être saisie. Le sujet a probablement tout mangé.')}

  ${titreSection('III.', 'Conclusion officielle')}
  <div class="conclusion">${paragraphes(a.conclusion)}</div>

  <nav class="pagination" aria-label="Navigation entre affaires">
    <a class="bouton bouton--papier" href="#/${r.route}">◂ Registre</a>
    ${L.length > 1 ? `<a class="bouton bouton--papier" href="${lienAffaire(r, suiv)}">Affaire suivante ▸</a>` : ''}
  </nav>
</article>`;

    function monter(main) {
      main.querySelectorAll('[data-preuve]').forEach((b) =>
        b.addEventListener('click', () => Visionneuse.ouvrir(preuves, Number(b.dataset.preuve))));
    }
    return { html, monter, ariane: brut(a.reference) };
  }

  /* =====================================================================
     04 – ARCHIVES AUDIOVISUELLES
     ===================================================================== */
  const TYPES_MEDIA = { photo: 'Photographies', video: 'Vidéos', capture: 'Captures' };

  function vueAudiovisuel(r, params) {
    const L = (C.medias || []).map((m, k) => Object.assign({}, m, { cote: `AV-${pad3(k + 1)}` }));
    let filtre = params.get('type');
    if (!TYPES_MEDIA[filtre]) filtre = 'tout';
    const compte = (t) => L.filter((m) => t === 'tout' || m.type === t).length;

    const vignette = (m, k) => {
      if (estVerrouille(m)) {
        return `<li data-type="${echapper(m.type)}"${filtre !== 'tout' && m.type !== filtre ? ' hidden' : ''}>
        <button type="button" class="cliche cliche--verrou" data-verrou="${k}" aria-label="${m.cote} : accès restreint">
          <span class="cliche__img">${m.type === 'video' ? (m.poster ? image(m.poster, '') : '<span class="cliche__noir"></span>') : image(m.src, '')}<span class="cliche__cadenas" aria-hidden="true">⊘</span></span>
          <span class="cliche__cote">${m.cote} · RESTREINT</span>
        </button>
        <p class="cliche__legende">Accès restreint · Habilitation Ω requise</p>
      </li>`;
      }
      const visuel = m.type === 'video'
        ? (m.poster ? image(m.poster, m.legende) : '<span class="cliche__noir"></span>')
        : image(m.src, m.legende);
      return `<li data-type="${echapper(m.type)}"${filtre !== 'tout' && m.type !== filtre ? ' hidden' : ''}>
        <button type="button" class="cliche cliche--${echapper(m.type)}" data-media="${k}" aria-label="Ouvrir ${m.cote}">
          <span class="cliche__img">${visuel}${m.type === 'video' ? '<span class="cliche__lecture" aria-hidden="true">▶</span>' : ''}</span>
          <span class="cliche__cote">${m.cote}${m.type === 'video' ? ' · VIDÉO' : m.type === 'capture' ? ' · CAPT.' : ''}</span>
        </button>
        <p class="cliche__legende">${texte(m.legende)}</p>
      </li>`;
    };

    const html = `
<article class="papier">
  ${enTeteRubrique(r, `${L.length} pièce${L.length > 1 ? 's' : ''}`)}
  <div class="filtres" role="group" aria-label="Filtrer les archives">
    ${['tout', 'photo', 'video', 'capture'].map((t) => `<button type="button" class="filtre" data-filtre="${t}" aria-pressed="${t === filtre}">${t === 'tout' ? 'Tout' : TYPES_MEDIA[t]} <span>${compte(t)}</span></button>`).join('')}
  </div>
</article>
<div class="planche">
  <p class="planche__titre"><span>Planche contact n°${echapper(C.dossier.numero)}</span><span>${echapper(C.institution.sigle)} · Service photographique</span></p>
  ${L.length ? `<ul class="planche__grille">${L.map(vignette).join('')}</ul>` : `<p class="planche__vide">Aucune archive audiovisuelle n'a été versée.</p>`}
  <p class="planche__vide" id="planche-vide" hidden>Aucune pièce dans cette catégorie.</p>
</div>
<div class="papier papier--bas">${pagination(r)}</div>`;

    function monter(main) {
      const appliquer = (t) => {
        filtre = t;
        main.querySelectorAll('[data-filtre]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtre === t)));
        main.querySelectorAll('.planche__grille li').forEach((li) => { li.hidden = t !== 'tout' && li.dataset.type !== t; });
        $('#planche-vide', main).hidden = !L.length || compte(t) > 0;
        history.replaceState(null, '', `#/${r.route}${t === 'tout' ? '' : '?type=' + t}`);
      };
      main.querySelectorAll('[data-filtre]').forEach((b) => b.addEventListener('click', () => appliquer(b.dataset.filtre)));
      main.querySelectorAll('[data-media]').forEach((b) => b.addEventListener('click', () => {
        const visibles = L.filter((m) => (filtre === 'tout' || m.type === filtre) && !estVerrouille(m));
        Visionneuse.ouvrir(visibles, visibles.indexOf(L[Number(b.dataset.media)]));
      }));
      main.querySelectorAll('[data-verrou]').forEach((b) => b.addEventListener('click', () => {
        const m = L[Number(b.dataset.verrou)];
        b.classList.remove('secoue'); void b.offsetWidth; b.classList.add('secoue');
        notifier(m.messageVerrou || 'Document verrouillé.', { type: 'alerte', titre: 'Accès refusé' });
      }));
    }
    return { html, monter };
  }

  /* =====================================================================
     05 – DISTINCTIONS HONORIFIQUES
     ===================================================================== */
  const lienDistinction = (r, k) => `#/${r.route}?n=${k + 1}`;

  function vueDistinctions(r, params) {
    const L = C.distinctions || [];
    const n = parseInt(params.get('n'), 10);
    if (n >= 1 && n <= L.length) return vueCertificat(r, n - 1);
    const html = `
<article class="papier">
  ${enTeteRubrique(r, 'Chancellerie')}
  <p class="registre-intro">Sur proposition de la Commission des Mérites Discutables, le ${echapper(C.institution.sigle)} a décerné au sujet les distinctions suivantes. Chacune donne droit à un certificat officiel, sans aucun avantage associé.</p>
  ${L.length ? `<ul class="vitrine">${L.map((x, k) => `
    <li><a class="medaille" href="${lienDistinction(r, k)}" style="--rot:${[-1.2, .8, -.5, 1.4][k % 4]}deg">
      ${rosette()}
      <span class="medaille__num">N° DH-${pad3(k + 1)}</span>
      <span class="medaille__titre">${texte(x.titre)}</span>
      <span class="medaille__date">${texte(x.date)}</span>
      <span class="medaille__voir">Consulter le certificat ▸</span>
    </a></li>`).join('')}</ul>` : vide('Aucune distinction décernée. Le sujet reste néanmoins éligible.')}
  ${pagination(r)}
</article>`;
    return { html };
  }

  function vueCertificat(r, k) {
    const L = C.distinctions, x = L[k], s = C.sujet;
    const html = `
<div class="certificat-page">
  <div class="certificat" id="certificat">
    <div class="certificat__cadre">
      <p class="certificat__institution">${echapper(C.institution.nom)}<br><span>Chancellerie des Distinctions Individuelles</span></p>
      <div class="certificat__sceau" aria-hidden="true">${sceau()}</div>
      <p class="certificat__type">Certificat officiel</p>
      <p class="certificat__formule">Le Centre, sur proposition de la Commission des Mérites Discutables et après délibération excessivement longue, décerne à</p>
      <p class="certificat__nom">${texte(s.prenom)} ${texte(s.nom)}</p>
      <p class="certificat__surnom">dit «&nbsp;${texte(s.surnom)}&nbsp;»</p>
      <p class="certificat__formule">la distinction de</p>
      <h1 class="certificat__titre" tabindex="-1">${texte(x.titre)}</h1>
      <p class="certificat__motif">${texte(x.motif)}</p>
      ${x.mention ? `<p class="certificat__mention">${texte(x.mention)}</p>` : ''}
      <div class="certificat__pied">
        <div class="certificat__sig"><span>Le Directeur</span>${SIGNATURE(1)}<strong>${texte(C.institution.directeur)}</strong></div>
        <div class="certificat__rosette">${rosette()}</div>
        <div class="certificat__sig"><span>Le Président de la Commission</span>${SIGNATURE(2)}<strong>${texte(C.signataireDistinctions)}</strong></div>
      </div>
      <p class="certificat__ref">N° DH-${pad3(k + 1)} · Remis le ${texte(x.date)} · Ni échangeable, ni remboursable, ni vraiment officiel</p>
    </div>
  </div>
  <div class="certificat-actions">
    <button type="button" class="bouton bouton--principal" id="telecharger-certificat">⬇&nbsp;Télécharger le certificat</button>
    <button type="button" class="bouton" id="imprimer-certificat">Imprimer / PDF</button>
  </div>
  <nav class="pagination pagination--sombre" aria-label="Navigation entre distinctions">
    <a class="bouton" href="#/${r.route}">◂ Toutes les distinctions</a>
    ${L.length > 1 ? `<a class="bouton" href="${lienDistinction(r, (k + 1) % L.length)}">Suivante ▸</a>` : ''}
  </nav>
</div>`;
    function monter(main) {
      const b = $('#telecharger-certificat', main);
      b.addEventListener('click', async () => {
        const libelle = b.innerHTML;
        b.disabled = true; b.textContent = 'Édition en cours…';
        try {
          const cv = await dessinerCertificat(k);
          await telechargerCanvas(cv, `certificat-${C.institution.sigle.toLowerCase()}-DH-${pad3(k + 1)}.png`);
          notifier(C.notifications.certificat, { titre: 'Chancellerie' });
        } catch (e) {
          console.error(e);
          notifier('Échec de l\'édition. Utilisez « Imprimer / PDF ».', { type: 'alerte', titre: 'Chancellerie' });
        }
        b.disabled = false; b.innerHTML = libelle;
      });
      $('#imprimer-certificat', main).addEventListener('click', () => window.print());
    }
    return { html, monter, ariane: `DH-${pad3(k + 1)}` };
  }

  const VUES = {
    fiche: vueFiche,
    citations: vueCitations,
    affaires: vueAffaires,
    audiovisuel: vueAudiovisuel,
    distinctions: vueDistinctions,
  };

  /* =====================================================================
     SECTION SECRÈTE Ω
     ===================================================================== */
  const motsDePasse = () => [].concat(C.motDePasse).map(normaliser).filter(Boolean);

  function vueSecret() {
    return estOmega() ? vueSecretOuvert() : vueSecretFerme();
  }

  function vueSecretFerme() {
    const r = SECRET;
    const html = `
<article class="papier papier--sombre guichet">
  ${enteteDocument(r, 'Feuillet Ω')}
  ${ICONE_VERROU}
  <h1 class="papier__titre" tabindex="-1"><span class="code">Ω</span>${texte(r.titre)}</h1>
  <p class="papier__sous-titre">${texte(r.sousTitre)}</p>
  <p>Cette section contient la pièce la plus sensible du dossier n°${echapper(C.dossier.numero)}. Sa consultation requiert un code d'habilitation de niveau&nbsp;Ω, communiqué uniquement aux personnes ayant côtoyé le sujet assez longtemps pour ne plus s'en étonner.</p>
  <form class="guichet__form" id="form-omega" autocomplete="off" novalidate>
    <label for="code-omega">Code d'habilitation Ω</label>
    <div class="guichet__ligne">
      <input id="code-omega" name="code" type="password" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="go">
      <button type="submit" class="bouton bouton--principal">Soumettre</button>
    </div>
    <p class="guichet__essais">Tentatives : <span id="essais-omega" aria-label="0 tentative sur 3">○ ○ ○</span></p>
    <p class="guichet__message" id="message-omega" role="alert"></p>
    <p class="guichet__indice" id="indice-omega" hidden><span>Indice déclassifié</span>${texte(C.secret.indice)}</p>
  </form>
  <nav class="pagination"><a class="bouton" href="#/" style="font-size:11px">◂ Retour au portail</a></nav>
</article>`;

    function monter(main) {
      let essais = 0, bloqueJusqua = 0, minuteur = null;
      const form = $('#form-omega', main), champ = $('#code-omega', main);
      const bouton = form.querySelector('button');
      const msg = $('#message-omega', main), essaisEl = $('#essais-omega', main);
      const majEssais = () => {
        essaisEl.textContent = [0, 1, 2].map((n) => (n < essais ? '●' : '○')).join(' ');
        essaisEl.setAttribute('aria-label', `${essais} tentative${essais > 1 ? 's' : ''} sur 3`);
      };
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (Date.now() < bloqueJusqua) return;
        const v = normaliser(champ.value);
        if (!v) { msg.textContent = 'Champ vide. Le CNDI ne lit pas (encore) dans les pensées.'; champ.focus(); return; }
        if (motsDePasse().includes(v)) { champ.blur(); await declassifier(); return; }

        essais++; majEssais();
        champ.value = '';
        form.classList.remove('secoue'); void form.offsetWidth; form.classList.add('secoue');
        if (essais === 1) msg.textContent = 'Code refusé. Tentative consignée au registre.';
        if (essais === 2) {
          msg.textContent = 'Code refusé. Un indice a été déclassifié à titre exceptionnel.';
          $('#indice-omega', main).hidden = false;
        }
        if (essais >= 3) {
          const incident = 'INC-' + entre(1000, 9999);
          notifier(C.notifications.echecMotDePasse, { type: 'alerte', titre: "Contrôle d'accès" });
          bloqueJusqua = Date.now() + 15000;
          champ.disabled = bouton.disabled = true;
          const tic = () => {
            const reste = Math.ceil((bloqueJusqua - Date.now()) / 1000);
            if (reste <= 0) {
              clearInterval(minuteur); minuteur = null;
              essais = 0; majEssais();
              champ.disabled = bouton.disabled = false;
              msg.textContent = 'Nouveau formulaire disponible. Le Directeur a été (vaguement) prévenu.';
              champ.focus();
              return;
            }
            msg.textContent = `Incident n°${incident} signalé au Directeur. Nouveau formulaire dans ${reste} s.`;
          };
          tic(); minuteur = setInterval(tic, 1000);
        } else {
          champ.focus();
        }
      });
      return () => { if (minuteur) clearInterval(minuteur); };
    }
    return { html, monter };
  }

  async function declassifier() {
    await sequenceVerification('Déclassification en cours', ['Code accepté.', 'Rupture des scellés…', 'Document déclassifié.']);
    memoire.ecrire('cndi-omega', '1');
    construireRepertoire();
    router();
    setTimeout(() => confettis(90), 350);
    notifier(C.notifications.deverrouillage, { titre: 'Habilitation Ω' });
  }

  function vueSecretOuvert() {
    const r = SECRET, S = C.secret;
    const nbVerrous = (C.affaires || []).filter((a) => a.verrouille).length + (C.medias || []).filter((m) => m.verrouille).length;
    const html = `
<article class="papier declassifie">
  ${enteteDocument(r, 'Feuillet Ω · Déclassifié')}
  <span class="tampon tampon--anime declassifie__tampon" style="--rot:-9deg;--delai:.4s">Déclassifié</span>
  <p class="pv__type">Pièce Ω · Communication exceptionnelle</p>
  <h1 class="papier__titre declassifie__titre" tabindex="-1">${texte(S.titre)}</h1>
  ${S.photo ? `<button type="button" class="declassifie__photo" id="photo-omega" aria-label="Agrandir la photographie">${image(S.photo, S.titre)}</button>` : ''}
  ${S.video ? `<div class="declassifie__video"><video src="${echapper(S.video)}"${S.poster ? ` poster="${echapper(S.poster)}"` : ''} controls playsinline preload="metadata"></video></div>` : ''}
  <div class="declassifie__message">${paragraphes(S.message)}</div>
  <p class="declassifie__signature">${texte(S.signature)}</p>
  ${nbVerrous ? `<p class="attente__note">Votre habilitation Ω vous donne désormais accès ${nbVerrous > 1 ? `aux ${nbVerrous} documents verrouillés` : 'au document verrouillé'} du dossier.</p>` : ''}
  <nav class="pagination">
    <a class="bouton bouton--papier" href="#/">◂ Retour au portail</a>
    <button type="button" class="bouton bouton--papier" id="reclasser">Reclasser le document</button>
  </nav>
</article>`;
    function monter(main) {
      const photo = $('#photo-omega', main);
      if (photo) photo.addEventListener('click', () =>
        Visionneuse.ouvrir([{ type: 'photo', src: S.photo, legende: S.titre, cote: 'Pièce Ω' }], 0));
      $('#reclasser', main).addEventListener('click', () => {
        memoire.ecrire('cndi-omega', '0');
        construireRepertoire();
        router();
        notifier("Document reclassé. Il n'a jamais existé.", { titre: 'Habilitation Ω' });
      });
    }
    return { html, monter };
  }

  /* =====================================================================
     PAGE 404
     ===================================================================== */
  function vue404(chemin) {
    const motifs = [
      'détruit lors du grand rangement de printemps',
      `emprunté par ${texte(C.sujet.surnom)} sans formulaire de sortie`,
      'classé par erreur dans le dossier d\'un individu parfaitement normal',
      'égaré entre deux réunions de service',
    ];
    const html = `
<article class="papier">
  ${enteteDocument(INTROUVABLE, 'Feuillet manquant')}
  <p class="introuvable__code" aria-hidden="true">404</p>
  <h1 class="papier__titre" tabindex="-1">Pièce introuvable</h1>
  <p class="papier__sous-titre">La pièce «&nbsp;${echapper(chemin || 'inconnue')}&nbsp;» ne figure pas au registre.</p>
  <div class="attente">
    <span class="tampon tampon--anime">Égarée</span>
    <p>Après recherches approfondies (deux minutes), le service des archives estime que ce document a été ${auHasard(motifs)}.</p>
    <p>Les agents sont invités à ne pas paniquer. Le sujet, lui, n'a jamais paniqué, ce qui est en soi préoccupant.</p>
  </div>
  <nav class="pagination">
    <a class="bouton bouton--papier" href="#/">◂ Retour au portail</a>
    <button type="button" class="bouton bouton--papier" id="reclamation">Déposer une réclamation</button>
  </nav>
</article>`;
    function monter(main) {
      $('#reclamation', main).addEventListener('click', (e) => {
        e.currentTarget.disabled = true;
        e.currentTarget.textContent = 'Réclamation déposée';
        decouvrir('reclamation', `Réclamation n°RC-${entre(1000, 9999)} enregistrée. Délai de traitement estimé : ${entre(14, 48)} mois. Personne n'avait jamais déposé de réclamation.`);
      });
    }
    return { html, monter };
  }

  /* =====================================================================
     CERTIFICAT : export en image PNG (canvas, sans bibliothèque)
     ===================================================================== */
  const plat = (x) => brut(x).replace(/\|\|(.+?)\|\|/g, (m, t) => '█'.repeat(Math.min(t.length, 12)));

  function chargerSvg(svg, couleur, l, h) {
    return new Promise((ok, ko) => {
      let src = svg.replace(/currentColor/g, couleur).replace('<svg ', `<svg width="${l}" height="${h}" `);
      if (!/xmlns=/.test(src)) src = src.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
      const url = URL.createObjectURL(new Blob([src], { type: 'image/svg+xml;charset=utf-8' }));
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); ok(img); };
      img.onerror = (e) => { URL.revokeObjectURL(url); ko(e); };
      img.src = url;
    });
  }

  function decouper(ctx, txt, largeur) {
    const mots = String(txt).split(/\s+/), res = [];
    let l = '';
    for (const m of mots) {
      const essai = l ? l + ' ' + m : m;
      if (ctx.measureText(essai).width > largeur && l) { res.push(l); l = m; } else l = essai;
    }
    if (l) res.push(l);
    return res;
  }

  function ecrire(ctx, txt, x, y, police, couleur, largeur, interligne) {
    ctx.font = police; ctx.fillStyle = couleur;
    const L = decouper(ctx, txt, largeur);
    L.forEach((l, n) => ctx.fillText(l, x, y + n * interligne));
    return y + (L.length - 1) * interligne;
  }

  async function dessinerCertificat(k) {
    const x = C.distinctions[k], s = C.sujet;
    const W = 1414, H = 2000, M = 56;
    const serif = '"Source Serif", Georgia, serif', mono = '"Plex Mono", monospace', machine = '"Courier Prime", monospace';
    try {
      await Promise.all(['600 40px "Source Serif"', '400 40px "Source Serif"', '400 30px "Courier Prime"', '400 20px "Plex Mono"']
        .map((f) => document.fonts.load(f)));
    } catch (e) { /* polices de secours */ }

    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');

    // Fond guilloché
    const motif = document.createElement('canvas');
    motif.width = motif.height = 36;
    const m = motif.getContext('2d');
    m.fillStyle = '#E9DFC2'; m.fillRect(0, 0, 36, 36);
    m.strokeStyle = '#9A7B3A'; m.lineWidth = 1.1;
    [[0, 18], [36, 18], [18, 0], [18, 36]].forEach(([cx, cy]) => { m.beginPath(); m.arc(cx, cy, 18, 0, Math.PI * 2); m.stroke(); });
    ctx.fillStyle = ctx.createPattern(motif, 'repeat');
    ctx.fillRect(0, 0, W, H);

    // Feuille et doubles filets
    ctx.fillStyle = '#F6F0E0'; ctx.fillRect(M, M, W - 2 * M, H - 2 * M);
    ctx.strokeStyle = '#8C6E2E';
    ctx.lineWidth = 5; ctx.strokeRect(M, M, W - 2 * M, H - 2 * M);
    ctx.lineWidth = 2; ctx.strokeRect(M + 16, M + 16, W - 2 * M - 32, H - 2 * M - 32);

    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const cx = W / 2;

    // Filigrane : grand sceau très pâle au centre
    const filigrane = await chargerSvg(sceau(), '#9A7B3A', 900, 900);
    ctx.globalAlpha = .06;
    ctx.drawImage(filigrane, cx - 450, 620, 900, 900);
    ctx.globalAlpha = 1;
    const espacer = (v) => { if ('letterSpacing' in ctx) ctx.letterSpacing = v; };

    let y = 175;
    espacer('4px');
    y = ecrire(ctx, plat(C.institution.nom).toUpperCase(), cx, y, `600 30px ${serif}`, '#24211D', 1100, 42);
    espacer('0px');
    y = ecrire(ctx, 'Chancellerie des Distinctions Individuelles', cx, y + 44, `italic 400 28px ${serif}`, '#5A5246', 1100, 36);

    const imgSceau = await chargerSvg(sceau(), '#7A5E22', 200, 200);
    ctx.drawImage(imgSceau, cx - 95, y + 30, 190, 190);
    y += 30 + 190 + 100;

    espacer('12px');
    y = ecrire(ctx, 'CERTIFICAT OFFICIEL', cx, y, `600 76px ${serif}`, '#7A5E22', 1250, 88);
    espacer('0px');
    y = ecrire(ctx, 'Le Centre, sur proposition de la Commission des Mérites Discutables et après délibération excessivement longue, décerne à',
      cx, y + 80, `italic 400 32px ${serif}`, '#5A5246', 1000, 46);
    y = ecrire(ctx, `${plat(s.prenom)} ${plat(s.nom)}`, cx, y + 110, `600 78px ${serif}`, '#24211D', 1150, 90);
    y = ecrire(ctx, `dit « ${plat(s.surnom)} »`, cx, y + 60, `italic 400 38px ${serif}`, '#24211D', 1100, 50);
    y = ecrire(ctx, 'la distinction de', cx, y + 80, `italic 400 32px ${serif}`, '#5A5246', 1000, 46);
    y = ecrire(ctx, plat(x.titre), cx, y + 90, `600 66px ${serif}`, '#B0281F', 1100, 78);
    y = ecrire(ctx, plat(x.motif), cx, y + 70, `400 36px ${serif}`, '#24211D', 1050, 50);
    if (x.mention) y = ecrire(ctx, plat(x.mention), cx, y + 60, `400 28px ${machine}`, '#5A5246', 1000, 40);

    // Signatures et rosette
    const yS = Math.max(y + 130, 1600);

    // Tampon « Certifié conforme » dans l'espace libre
    const yT = Math.min(y + 150, yS - 140);
    ctx.save();
    ctx.translate(cx + 270, yT);
    ctx.rotate(-0.13);
    ctx.globalAlpha = .82;
    ctx.strokeStyle = ctx.fillStyle = '#B0281F';
    ctx.font = `600 34px ${mono}`;
    espacer('6px');
    const lt = ctx.measureText('CERTIFIÉ CONFORME').width + 56;
    ctx.lineWidth = 5; ctx.strokeRect(-lt / 2, -44, lt, 72);
    ctx.lineWidth = 2; ctx.strokeRect(-lt / 2 + 9, -35, lt - 18, 54);
    ctx.fillText('CERTIFIÉ CONFORME', 0, 4);
    espacer('0px');
    ctx.restore();
    const [sig1, sig2, ros] = await Promise.all([
      chargerSvg(SIGNATURE(1), '#23366F', 320, 100),
      chargerSvg(SIGNATURE(2), '#23366F', 320, 100),
      chargerSvg(rosette(), '#000', 200, 240),
    ]);
    [[340, 'Le Directeur', sig1, plat(C.institution.directeur)],
     [W - 340, 'Le Président de la Commission', sig2, plat(C.signataireDistinctions)]].forEach(([sx, lib, img, nom]) => {
      ecrire(ctx, lib, sx, yS, `italic 400 26px ${serif}`, '#5A5246', 380, 32);
      ctx.drawImage(img, sx - 150, yS + 14, 300, 94);
      ecrire(ctx, nom, sx, yS + 140, `600 24px ${serif}`, '#24211D', 380, 30);
    });
    ctx.drawImage(ros, cx - 85, yS - 50, 170, 204);

    ecrire(ctx, `N° DH-${pad3(k + 1)} · Remis le ${plat(x.date)} · Délivré à l'agent ${AGENT} le ${new Date().toLocaleDateString('fr-FR')} · Ni échangeable, ni remboursable, ni vraiment officiel`,
      cx, H - M - 70, `400 19px ${mono}`, '#5A5246', 1150, 28);
    return cv;
  }

  const ECRAN_TACTILE = window.matchMedia('(pointer: coarse)').matches;
  let dernierCertificat = null;

  function telechargerCanvas(cv, nom) {
    return new Promise((ok, ko) => cv.toBlob((blob) => {
      if (!blob) { ko(new Error('toBlob')); return; }
      if (dernierCertificat) URL.revokeObjectURL(dernierCertificat);
      const url = dernierCertificat = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = nom;
      document.body.appendChild(a); a.click(); a.remove();
      if (ECRAN_TACTILE) {
        setTimeout(() => Visionneuse.ouvrir([{
          type: 'photo', src: url, cote: 'Certificat officiel',
          legende: 'Si le téléchargement n\'a pas démarré : appui long sur l\'image, puis « Enregistrer ».',
        }], 0), 300);
      }
      ok();
    }, 'image/png'));
  }

  /* =====================================================================
     SURPRISES CACHÉES
     ===================================================================== */
  async function alerteGenerale() {
    if (document.querySelector('.alerte-generale')) return;
    const a = document.createElement('div');
    a.className = 'alerte-generale';
    a.setAttribute('role', 'alert');
    a.innerHTML = `<div class="alerte-generale__boite"><p class="alerte-generale__titre">Alerte générale</p><p id="alerte-texte">Le sujet a été localisé.<br>Tous les agents sont priés de rejoindre leur poste.</p></div>`;
    document.body.appendChild(a);
    document.documentElement.classList.add('en-alerte');
    await attendre(2600);
    $('#alerte-texte', a).innerHTML = '… Fausse alerte.<br>Il s\'agissait de quelqu\'un de normal. Reprenez vos activités.';
    await attendre(2200);
    document.documentElement.classList.remove('en-alerte');
    a.classList.add('est-sortante');
    setTimeout(() => a.remove(), 400);
    decouvrir('alerte', "Vous avez déclenché l'alerte générale. Le Directeur salue votre zèle.");
  }

  function basculerMinitel() {
    const actif = document.documentElement.classList.toggle('mode-minitel');
    if (actif) decouvrir('minitel', 'Mode Minitel activé. 3615 CNDI, retour en 1982 confirmé.');
    else notifier('Retour au XXIᵉ siècle. Le CNDI vous remercie de votre voyage.');
  }

  function initialiserSurprises() {
    let clicsSceau = 0, minuteurSceau = null;
    let refusCaviar = 0;
    let tapsVersion = 0, minuteurVersion = null;
    const MESSAGES_CAVIAR = [
      'Accès refusé. Information classifiée.',
      'Accès toujours refusé.',
      'Insister ne changera rien.',
      'Vous êtes tenace. C\'est noté.',
    ];

    document.addEventListener('click', (e) => {
      // 1. Sceau de l'accueil : 7 clics rapides → alerte générale
      const sc = e.target.closest('.accueil__sceau');
      if (sc) {
        clicsSceau++;
        clearTimeout(minuteurSceau);
        minuteurSceau = setTimeout(() => { clicsSceau = 0; }, 2500);
        sc.classList.remove('tressaute'); void sc.offsetWidth; sc.classList.add('tressaute');
        if (clicsSceau >= 7) { clicsSceau = 0; alerteGenerale(); }
        return;
      }

      // 2. Caviardage : refus, puis révélation à la 5e insistance
      const cav = e.target.closest('.caviarde');
      if (cav && !cav.closest('a') && !cav.classList.contains('est-revele')) {
        if (surprisesTrouvees().includes('caviardage')) { cav.classList.add('est-revele'); return; }
        if (refusCaviar < MESSAGES_CAVIAR.length) {
          notifier(MESSAGES_CAVIAR[refusCaviar++], { type: 'alerte', titre: 'Information classifiée' });
        } else {
          cav.classList.add('est-revele');
          decouvrir('caviardage', "Bon. Exceptionnellement, vous pouvez lire. N'en parlez à personne.");
        }
        return;
      }

      // 3. Tampons : chaque clic en applique un nouveau
      const tp = e.target.closest('#vue .tampon');
      if (tp) {
        const options = (C.surprises.tampons || []).filter((t) => normaliser(t) !== normaliser(tp.textContent));
        if (!options.length) return;
        tp.textContent = auHasard(options);
        tp.style.setProperty('--delai', '0s');
        tp.style.setProperty('--rot', entre(-12, 12) + 'deg');
        tp.classList.remove('tampon--anime'); void tp.offsetWidth; tp.classList.add('tampon--anime');
        if (!surprisesTrouvees().includes('tampon')) {
          decouvrir('tampon', "Vous avez modifié un tampon officiel. Ce geste est irréversible (il ne l'est pas).");
        }
        return;
      }

      // 4. Version du portail (pied de page) : 5 touchers → mode Minitel
      if (e.target.closest('#version-portail')) {
        tapsVersion++;
        clearTimeout(minuteurVersion);
        minuteurVersion = setTimeout(() => { tapsVersion = 0; }, 3000);
        if (tapsVersion >= 5) { tapsVersion = 0; basculerMinitel(); }
      }
    });

    // 4 bis. Code Konami au clavier → mode Minitel
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let pos = 0;
    document.addEventListener('keydown', (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = k === KONAMI[pos] ? pos + 1 : (k === KONAMI[0] ? 1 : 0);
      if (pos === KONAMI.length) { pos = 0; basculerMinitel(); }
    });

    // 5. Message pour les curieux de la console
    try {
      console.log('%c' + C.institution.sigle + ' · ' + C.institution.nom,
        'font: 600 14px Georgia, serif; color: #B0281F; padding: 4px 0;');
      console.log('%c' + brut(C.surprises.console),
        'font: 12px monospace; color: #16221B; background: #E8DEC4; padding: 6px 10px; border-left: 4px solid #B0281F;');
    } catch (e) { /* rien */ }
  }

  /* =====================================================================
     VEILLE : inactivité, retour sur l'onglet, copie
     ===================================================================== */
  function initialiserVeille() {
    const N = C.notifications;
    let derniere = Date.now(), alertes = 0, cache = 0, derniereCopie = 0;
    const activite = () => { derniere = Date.now(); };
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((ev) =>
      window.addEventListener(ev, activite, { passive: true }));
    setInterval(() => {
      if (document.hidden || alertes >= 3 || !(N.inactivite || []).length) return;
      if (Date.now() - derniere > 40000) {
        notifier(N.inactivite[alertes % N.inactivite.length], { titre: 'Surveillance de session' });
        alertes++; derniere = Date.now();
      }
    }, 5000);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cache = Date.now(); return; }
      if (cache && Date.now() - cache > 8000 && N.retour) notifier(N.retour);
      cache = 0; derniere = Date.now();
    });
    document.addEventListener('copy', () => {
      if (Date.now() - derniereCopie < 10000 || !N.copie) return;
      derniereCopie = Date.now();
      notifier(N.copie, { type: 'alerte', titre: 'Propriété intellectuelle' });
    });
  }

  /* =====================================================================
     ROUTAGE
     ===================================================================== */
  let demonter = null;
  let premierRendu = true;

  function lireRoute() {
    const h = location.hash.replace(/^#\/?/, '');
    const [chemin, requete] = h.split('?');
    let c = '';
    try { c = decodeURIComponent(chemin || ''); } catch (e) { c = chemin || ''; }
    return { chemin: c.replace(/\/+$/, ''), params: new URLSearchParams(requete || '') };
  }

  function router() {
    const { chemin, params } = lireRoute();
    let rubrique = null, vue;
    if (chemin === '' || chemin === 'accueil') vue = vueAccueil(params);
    else if (chemin === SECRET.route) { rubrique = SECRET; vue = vueSecret(); }
    else if (chemin === 'introuvable') { rubrique = INTROUVABLE; vue = vue404(params.get('chemin')); }
    else {
      rubrique = RUBRIQUES.find((r) => r.route === chemin);
      if (rubrique) vue = VUES[rubrique.id](rubrique, params);
      else { rubrique = INTROUVABLE; vue = vue404(chemin); }
    }
    fermerMenu(false);
    Visionneuse.fermer();
    afficher(vue, rubrique);
  }

  function afficher(vue, rubrique) {
    const main = $('#vue');
    const rendre = () => {
      if (demonter) { demonter(); demonter = null; }
      main.innerHTML = vue.html;
      main.classList.remove('vue--sortie', 'vue--entree');
      void main.offsetWidth;
      main.classList.add('vue--entree');
      if (vue.monter) demonter = vue.monter(main) || null;
      majAriane(rubrique, vue.ariane);
      const msg = rubrique && C.notifications.rubriques && C.notifications.rubriques[rubrique.id];
      if (msg && !memoire.lire('cndi-vu-' + rubrique.id)) {
        memoire.ecrire('cndi-vu-' + rubrique.id, '1');
        setTimeout(() => notifier(msg), 1100);
      }
      marquerActif(rubrique ? rubrique.id : 'accueil');
      document.title = rubrique
        ? `${vue.ariane ? vue.ariane + ' · ' : ''}${rubrique.code} · ${brut(rubrique.titre)} · ${C.institution.sigle}`
        : `${C.institution.sigle} · Portail officiel · Dossier n°${C.dossier.numero}`;
      window.scrollTo(0, 0);
      if (!premierRendu) {
        const titre = main.querySelector('h1');
        (titre || main).focus({ preventScroll: true });
      }
      premierRendu = false;
    };

    if (premierRendu || MOUVEMENT_REDUIT) { rendre(); return; }
    const barre = $('#chargement');
    barre.classList.remove('est-actif'); void barre.offsetWidth; barre.classList.add('est-actif');
    main.classList.add('vue--sortie');
    setTimeout(rendre, 170);
  }

  /* =====================================================================
     DÉMARRAGE DU PORTAIL
     ===================================================================== */
  initialiserEntete();
  initialiserMenu();
  construirePied();
  router();
  window.addEventListener('hashchange', router);
  demarrer();
  initialiserSurprises();
  initialiserVeille();

  // Petit point d'accès pour les étapes suivantes (et la console)
  window.CNDI = { notifier, texte, sceau, AGENT };
})();
