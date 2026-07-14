window.addEventListener('DOMContentLoaded', () => {

  const MODE_DEBUG = true;
  const SOUHAITE_SAUVEGARDER = false;
  
  /*// 🌟 CONDITION COMMANDE DEBUG : Sélection manuelle de l'heure du ciel au démarrage
  if (MODE_DEBUG) {
    const choixHeure = prompt("🛠️ MODE DEBUG ACTIVÉ\n\nChoisissez une heure réelle simulée pour tester la couleur du ciel (de 0 à 23) :", new Date().getHours());
    
    if (choixHeure !== null && !isNaN(choixHeure) && choixHeure.trim() !== "") {
      const heureSaisie = Math.max(0, Math.min(23, parseInt(choixHeure)));
      
      // On écrase la méthode native de l'objet Date pour ce paramètre précis
      Date.prototype.getHours = function() {
        return heureSaisie;
      };
      console.log(`[DEBUG] L'heure réelle du système est forcée à : ${heureSaisie}h00`);
    }
  }*/

  // 🌟 Date et heure fixes précises de l'envoi de la lettre originale (Année, Mois-1, Jour, Heure, Minute, Seconde)
  // Remarque : En JavaScript, les mois commencent à 0 (0 = Janvier, 1 = Février, 9 = Octobre, etc.)
  const TIMESTAMP_DEBUT_PARTIE = new Date(2025, 9, 9, 20, 0, 0).getTime();

  let ressources = { bois: 0, pierre: 0, energie: 0, connaissance: 0 }; 
  let clics = { bois: 1, pierre: 1, energie: 1 };
  let multiplicateursPassifs = { bois: 1.0, pierre: 1.0, energie: 1.0 };

  let nbBucherons = 0;
  let nbMineurs = 0;
  let nbCentrales = 0;
  let nbEtudiants = 0;
  let nbAstronomes = 0;

  let upgradePierreAchetee = false;   
  let upgradeTradAchetee = false;     
  let upgradeObservAchetee = false;   
  let planCentraleAchete = false;    

  let etapeTutoRotateOk = false;
  let etapeTutoClicOk = false;
  let tutoObservationFait = false; 

  let upgradesActivees = {
    bois1: false, bois2: false,
    pierre1: false, pierre2: false,
    elec1: false
  };

  let techActivees = {
    livre: false, lentilles: false, brevet: false,
    foret2: false, mine2: false, elec2: false, fusee: false, meditation:false,
  };

  const DOM_TEXTES = {
    bois: document.getElementById('txt-bois'),
    pierre: document.getElementById('txt-pierre'),
    energie: document.getElementById('txt-energie'),
    connaissance: document.getElementById('txt-connaissance'),
    roches: document.getElementById('txt-roches')
  };

  ressources.roches = 0; // Nouvelle ressource
  clics.roches = 1;
  multiplicateursPassifs.roches = 0.0;

  // Variables du mini-jeu Fusée
  let etatFusee = {
    pasDeTir: false, reservoir: false, moteur: false, ordi: false,
    kitAchete: false,
    piecesAssemblees: 0,
    lancee: false,
    tentatives: 0,
    moteurPose: false,
    reservoirPose: false,
    cockpitPose: false
  };

  // 🛠️ CHANGEMENT ICI : Mets à 'false' quand tu distribues ton jeu pour que le hasard revienne !
  let fuseeCibles = { ratio: 50, puissance: 50, angle: 45 };

  // 📅 VARIABLES DU CALENDRIER VIRTUEL (1j = 1min réelle)
  let dateVirtuelle = { jour: 1, mois: 0, annee: 0 };
  const NOMS_MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const JOURS_PAR_MOIS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Compteur de minutes réelles écoulées (ou de jours virtuels)
  let joursVirtuelsEcoules = 0;

  // VARIABLES POUR LES CONTROLES PAN & ZOOM D'ESPACE
  let zoomActuel = 1.0;
  let panX = 0;
  let panY = 0;
  let premierChargementEspace = true;
  let estEnTrainDeGlisser = false;
  let debutX = 0;
  let debutY = 0;

  let nbSatellites = 0;
  let angleSatellitesBase = 0; // Pour animer leur rotation indépendante

  let etapeDyson = 0; // Va évoluer de 0 à 4

  // 🪐 SYSTÈME DE COLONISATION SPATIALE
  let colonisation = {
    luna: { niveau: 0, enVoyage: false, joursRestants: 0, drapeauPose: false },
    croquetis: { niveau: 0, enVoyage: false, joursRestants: 0, drapeauPose: false },
    ronronis: { niveau: 0, enVoyage: false, joursRestants: 0, drapeauPose: false },
    calinous: { niveau: 0, enVoyage: false, joursRestants: 0, drapeauPose: false },
    sardinia: { niveau: 0, enVoyage: false, joursRestants: 0, drapeauPose: false }
  };

  let happyHourAchete = false; // Devient true quand l'upgrade est achetée
  let etoileDecouverte = false; // Permet de faire apparaître l'upgrade en boutique
  let plansInterstellairesDebloques = false;

  ressources.matiereNoire = 0;
  DOM_TEXTES.matiereNoire = document.getElementById('txt-matiere-noire');

  let elementsInterstellaires = { coque: false, reservoir: false, propulseur: false, pret: false };
  let lasersVoyage = { tourelle: 0, canon: 0, ia: 0 };
  let upgradesVoyage = { optimisation: 0, deflecteur: 0, processeur: 0 };
  
  let vitesseLumierePct = 0.0;
  let voyageDemarre = false;
  let asteroidesActifs = [];

  let modeLivre = 'constellations'; // Permet de savoir quoi afficher dans le livre
  let pagesLore = [];               // Stockera le texte du voyage final

  let loreVoyage = {
    //depart
    l5: { lu: false, texte: "Cela fait maintenant quelques jours que la Terre n'est plus qu'un lointain souvenir. Nous sommes entourés d'un décor féerique, une toile infinie où scintillent des milliers d'étoiles colorées. Nous contemplons ce spectacle, le cœur empli d'un émerveillement presque enfantin. Également, les chats ingénieurs ont découvert que l’on pouvait exploiter les astéroïdes pour améliorer le vaisseau. Chaque débris récolté devient une promesse, un pas de plus vers notre Étoile sacrée. Notre épopée ne fait que commencer. " },
    // ???
    l25: { lu: false, texte: "Nous venons de franchir le quart de la vitesse maximale. Nos technologies s'affinent à mesure que nos lasers fendent la matière noire. Mais l'espace est cruel, et le temps, trop long pour nos existences éphémères. Pour espérer contempler un jour notre Étoile de nos propres yeux, nous avons inventé la cryogénisation. Nous allons nous endormir, bercés par le bourdonnement des moteurs. Juste avant de sombrer dans ce grand sommeil, une étrange lueur a capté nos capteurs... Un signal lointain, vibrant au cœur d'un système similaire au nôtre. Une autre vie bat-elle dans cet Univers? " },
    // chien
    l50: { lu: false, texte: "Moitié de la vitesse maximale atteinte. À notre réveil, le vertige nous saisit : nous ne sommes pas seuls. L'Univers abrite d'autres âmes, une espèce mystérieuse se faisant appeler les Chiens. Leur savoir et leur technologie dépassent tout ce que nous avions osé imaginer. Pourtant, nulle ombre de menace ne plane sur cette rencontre. Derrière la barrière de nos langues encore maladroites, nous ne lisons que de la bienveillance dans leurs regards. Ils nous tendent la main, prêts à guider nos pas maladroits à travers le vide. " },
    // triste
    l75: { lu: false, texte: "Trois quarts de la vitesse de la lumière. Grâce à l’alliance née avec les Chiens, notre traducteur murmure enfin des mots clairs. Mais la vérité qu'il nous apporte a l'effet d'un coup de poignard. En tournant leurs instruments vers la position de l'Étoile, les Chiens parviennent à l’interroger. Leur rapport est effroyable : autrefois, elle a posé son regard sur les chats et elle s'est rendu compte que notre nature ne lui correspondait pas. Elle a choisi de se tourner vers les astres, préférant la compagnie des autres étoiles à nos visages. Depuis ce jour, un voile de deuil s’est abattu sur le vaisseau. Le silence est devenu lourd de larmes invisibles. À quoi bon continuer ? Pourquoi avoir consenti à tant de sacrifices, tant de nuits blanches passées les yeux rivés vers le ciel, à tenter de l'effleurer du regard, si notre Étoile ne nous aime plus ?" },
    // motivation
    l100: { lu: false, texte: "La mélancolie nous rongeait l'âme, nous étions prêts à couper les moteurs et à nous laisser dériver à jamais. C'est alors qu'au milieu des décombres de nos espoirs, un chat a pris la parole : “Je me console en pensant qu'ailleurs, dans un autre repli du temps, une autre version de nous qui a réussi nous sourit. Mais si cette version existe, c’est qu’elle est née de la même étincelle que nous. Alors je m'accroche. Parce que si cet idéal est assez vaste pour remplir un autre monde, il est peut-être assez puissant pour finir par s’imposer dans celui-ci.” Ces mots ont rallumé un feu que nous croyions éteint. Qu'importe le refus de l'Étoile, qu'importe si le voyage doit durer une éternité. Nous choisissons de continuer à avancer, quitte à souffrir encore. On nous traitera peut-être d'idiots, de fous obstinés courant après un mirage indifférent. Mais il y a une chose que l'immensité de l'Univers ne pourra jamais nous arracher : la pureté de notre dévouement et la beauté de notre amour inébranlable pour elle. Nous ne fermons pas nos yeux au reste du cosmos, car il existe sans doute d'autres étoiles plus clémentes et plus brillantes dans l'infini. Mais pour l'instant, pour nos cœurs de minou, elle reste la plus belle chose que nos yeux aient jamais contemplée. Et pour cela, nous attendrons le temps qu'il faudra. Nous sommes prêts à nous endormir pour l’éternité si il le faut…" }
  };
  let nouveauLoreEnAttente = false;

  let modeFuseeActuel = "normale"; 
  let cielMystereActif = false;

  // 🌟 NOUVELLES VARIABLES DE PROD MATIÈRE NOIRE
  let nbCollecteursMatiereNoire = 0;
  let multiMatiereNoire = 1.0;

  function genererNouvellesCiblesFusee(forcerNouvelleValeur = false) {
    // Si une solution existe déjà et qu'on ne force pas le reset, on ne fait rien
    if (fuseeCibles !== null && !forcerNouvelleValeur) {
      return; 
    }

    if (MODE_DEBUG) {
      // 🎯 VALEURS FIXES EN DEBUG MODE
      fuseeCibles = { ratio: 50, puissance: 50, angle: 45 };
    } else {
      // 🎲 VRAI HASARD EN MODE NORMAL
      fuseeCibles = {
        ratio: Math.floor(Math.random() * 101),
        puissance: Math.floor(Math.random() * 101),
        angle: Math.floor(Math.random() * 91)
      };
    }
  }

  // Historique pour les indices (Dichotomie)
  let fuseeEssais = { ratio: null, puissance: null, angle: null };

  let upgradesFusee = {
    croquettes: false,
    plasma: false,
    soute: false,
    compresseur: false,
    hyperpropulsion: false,
    distorsion: false,
    extracteur: false,
    moissonneuse: false,
  };

  let historiqueTentatives = []; // Stockera l'historique complet des tirs
  let ongletActif = "Base";

  let valeursTesteesRatio = [];
  let valeursTesteesPuissance = [];
  let valeursTesteesAngle = [];

  let decalageHeureReelleMs = 0;
  const SECRET_KEY_SAVE = "ChaCosmicVaultKey2026"; // Clé pour générer le hash anti-triche
  let intervalleSauvegardeAuto = null;

  let premiereFoisOngletEspace = true;
  let premiereFoisOngletVoyage = true;

  // 🌟 NOUVELLE FONCTION CENTRALE POUR TOUT LE SCRIPT
  function obtenirDateFrancaiseReelle() {
    const tempsPcActuel = Date.now();
    const maintenantRaw = new Date(tempsPcActuel + decalageHeureReelleMs); 
    const dateFrStr = maintenantRaw.toLocaleString('en-US', { timeZone: 'Europe/Paris' });
    return new Date(dateFrStr);
  }

  // 🔄 CONFIGURATION DE LA ROTATION DES PLANÈTES (Degrés par jour virtuel)
  // Plus elles sont proches du soleil, plus elles vont vite !
  const VITESSES_REVOLUTION = {
    croquetis: 4.1,   // Fait le tour rapidement 
    felina: 0.986,    // ~1 degré par jour (~365 jours pour faire le tour) 
    luna: 13.2,       // Tourne très vite autour de Félina 
    ronronis: 0.53,   // Plus lente 
    calinous: 0.21,   // Ceinture d'astéroïdes
    sardinia: 0.08    // Très lointaine 
  };

  let anglesPlanetes = { croquetis: 0, felina: 0, luna: 0, ronronis: 0, calinous: 0, sardinia: 0 };

  // 🌌 NIVEAUX INDÉPENDANTS DES AMÉLIORATIONS DE VOYAGE
  let lvlVoyageOpti = 0;
  let lvlVoyageDeflecteur = 0;
  let lvlVoyageProcesseur = 0;
  let lvlVoyageMoissonneurVide = 0;
  
  let nbLasersManuels = 0; // Sécurité pour le laser manuel

  // 🎵 CONFIGURATION DE LA PLAYLIST MUSICALE
  const PLAYLIST_MUSIQUES = [
    "sons/ambiance/Aerie.mp3",
    "sons/ambiance/Infinite_Amethyst.mp3",
    "sons/ambiance/Introduction.mp3",
    "sons/ambiance/aloy.mp3",
    "sons/ambiance/Trust.mp3",
    "sons/ambiance/Wanderstop.mp3",
    "sons/ambiance/Friends.mp3",
    "sons/ambiance/boruto.mp3",
    "sons/ambiance/musique_accueil.mp3",
    "sons/ambiance/fishing_vibes.mp3",
    "sons/ambiance/mameilleureennemie.mp3",
    "sons/ambiance/traverse_town.mp3",
    // 💡 Tu peux ajouter autant de musiques que tu veux ici !
  ];

  let musiqueFond = null;
  let indexMusiqueActuelle = -1;
  let enModeMusiqueSpeciale = false;
  const VOLUME_MAX_CIBLE = 0.25;

  let musiquesRestantes = [];
  let derniereMusiqueJouee = null;
  let cheminMusiqueActuelle = ""; 
  let tempsSauvegardeMusique = 0;

  function lancerPlaylistAleatoire() {
    if (PLAYLIST_MUSIQUES.length === 0 || enModeMusiqueSpeciale) return;

    // Cycle de lecture sans répétition
    if (musiquesRestantes.length === 0) {
      musiquesRestantes = [...PLAYLIST_MUSIQUES];
    }

    let indexPioche = Math.floor(Math.random() * musiquesRestantes.length);
    let musiqueChoisie = musiquesRestantes[indexPioche];

    if (musiqueChoisie === derniereMusiqueJouee && musiquesRestantes.length > 1) {
      indexPioche = (indexPioche + 1) % musiquesRestantes.length;
      musiqueChoisie = musiquesRestantes[indexPioche];
    }

    musiquesRestantes.splice(indexPioche, 1);
    derniereMusiqueJouee = musiqueChoisie;
    cheminMusiqueActuelle = musiqueChoisie; 

    if (!musiqueFond) musiqueFond = new Audio();

    musiqueFond.onended = null;
    musiqueFond.onended = () => {
      tempsSauvegardeMusique = 0; 
      lancerPlaylistAleatoire();
    };

    musiqueFond.src = musiqueChoisie;
    musiqueFond.volume = VOLUME_MAX_CIBLE;
    
    if (tempsSauvegardeMusique > 0) {
      musiqueFond.currentTime = tempsSauvegardeMusique;
      tempsSauvegardeMusique = 0;
    }

    musiqueFond.play().catch(e => console.log("[AUDIO] Lecture auto bloquée."));
  }

  function changerMusiqueTemporaire(cheminMusiqueSpeciale) {
    if (!musiqueFond) musiqueFond = new Audio();

    // Si on demande le retour à la playlist normale (chemin vide ou nul)
    if (!cheminMusiqueSpeciale) {
      if (enModeMusiqueSpeciale) {
        enModeMusiqueSpeciale = false;
        cheminMusiqueActuelle = "";
        lancerPlaylistAleatoire();
      }
      return;
    }

    // Sécurité : Si on joue déjà exactement cette musique d'ambiance, on ignore
    if (cheminMusiqueActuelle === cheminMusiqueSpeciale) return;

    enModeMusiqueSpeciale = true;
    cheminMusiqueActuelle = cheminMusiqueSpeciale;

    // Transition fluide (Fade out)
    let volumeActuel = musiqueFond.volume;
    const intervalleFade = setInterval(() => {
      if (volumeActuel > 0.05) {
        volumeActuel -= 0.05;
        musiqueFond.volume = Math.max(0, volumeActuel);
      } else {
        clearInterval(intervalleFade);
        musiqueFond.pause();

        musiqueFond.src = cheminMusiqueSpeciale;
        musiqueFond.volume = VOLUME_MAX_CIBLE;

        // Restauration du timing précis depuis la sauvegarde si nécessaire
        if (tempsSauvegardeMusique > 0) {
          musiqueFond.currentTime = tempsSauvegardeMusique;
          tempsSauvegardeMusique = 0;
        }

        musiqueFond.onended = null;
        musiqueFond.onended = () => {
          // 🌟 CORRECTION : Quand le son de l'onglet se termine, on désactive le mode spécial 
          // et on relance automatiquement la playlist aléatoire !
          enModeMusiqueSpeciale = false;
          cheminMusiqueActuelle = "";
          lancerPlaylistAleatoire();
        };

        musiqueFond.play().catch(e => console.log("[AUDIO] Erreur lecture."));
      }
    }, 50);
  }

  const SON_ACHAT = new Audio("sons/click.mp3");
  const SON_CLIC_BOIS = new Audio("sons/hache_bois.mp3");
  const SON_CLIC_PIERRE = new Audio("sons/mine.mp3");
  const SON_CLIC_ELEC = new Audio("sons/elec.mp3");
  const SON_ACHAT_CHAT = new Audio("sons/achat_chat.mp3");
  const SON_UPGRADE = new Audio("sons/upgrade.mp3");
  const SON_BUILDING = new Audio("sons/building.mp3");
  const SON_SUCCES = new Audio("sons/succes.mp3");
  const SON_ECHEC = new Audio("sons/erreur.mp3");
  const SON_LIER = new Audio("sons/relier.mp3");
  const SON_DELIER = new Audio("sons/delier.mp3");
  const SON_REUSSITE_ETOILE = new Audio("sons/reussite_etoile.mp3");
  const SON_PAGE = new Audio("sons/page.mp3");
  const SON_PUZZLE = new Audio("sons/puzzle.mp3");
  const SON_ROCKET = new Audio("sons/rocket.mp3");
  const SON_EXPLOSION = new Audio("sons/explosion.mp3");
  const SON_VENT = new Audio("sons/vent.mp3");

  SON_CLIC_BOIS.volume = 0.4;
  SON_CLIC_PIERRE.volume = 0.4;
  SON_CLIC_ELEC.volume = 0.4;
  SON_ACHAT.volume = 0.5;
  SON_ACHAT_CHAT.volume = 0.5;
  SON_UPGRADE.volume = 0.5;
  SON_BUILDING.volume = 0.5;
  SON_SUCCES.volume = 0.5;
  SON_ECHEC.volume = 0.5;
  SON_LIER.volume = 0.5;
  SON_DELIER.volume = 0.5;
  SON_REUSSITE_ETOILE.volume = 0.5;
  SON_PAGE.volume = 1;
  SON_PUZZLE.volume = 0.5;
  SON_ROCKET.volume = 0.5;
  SON_EXPLOSION.volume = 0.5;
  SON_VENT.volume = 0.5;

  window.ouvrirNotificationCHA = function(titre, texte, actionAuClic = null, texteBoutonPrincipal = "Fermer", avecBoutonAnnuler = false) {
    const modalNotif = document.getElementById('modal-notification-custom');
    const titreNotif = document.getElementById('notif-custom-titre');
    const texteNotif = document.getElementById('notif-custom-texte');
    const btnFermer = document.getElementById('btn-notif-custom-fermer');
    const btnAnnuler = document.getElementById('btn-notif-custom-annuler');

    if (!modalNotif || !titreNotif || !texteNotif || !btnFermer || !btnAnnuler) return;

    titreNotif.innerHTML = titre;
    texteNotif.innerHTML = texte;
    btnFermer.textContent = texteBoutonPrincipal;
    modalNotif.style.display = 'flex';

    // 🌟 Gestion du bouton Annuler
    if (avecBoutonAnnuler) {
      btnAnnuler.style.display = 'block';
      // Si on clique sur annuler, on ferme juste la popup sans rien faire
      btnAnnuler.onclick = () => { modalNotif.style.display = 'none'; };
    } else {
      btnAnnuler.style.display = 'none';
    }

    // Nettoyage de l'ancien écouteur sur le bouton principal
    const nouveauBouton = btnFermer.cloneNode(true);
    btnFermer.parentNode.replaceChild(nouveauBouton, btnFermer);

    nouveauBouton.addEventListener('click', () => {
      SON_ACHAT.currentTime = 0;
      SON_ACHAT.play();
      modalNotif.style.display = 'none';
      if (actionAuClic && typeof actionAuClic === 'function') {
        actionAuClic(); 
      }
    });
  };

  function calculerPrixExponentiel(prixInitial, nbAchete) {
    if (MODE_DEBUG) return 0;
    return Math.ceil(prixInitial * Math.pow(1.15, nbAchete));
  }

  function convertirNombreCHA(valeur) {
    if (valeur === undefined || valeur === null || isNaN(valeur) || valeur < 0) return "0";
    if (valeur === 0) return "0";

    let nombreAConvertir = valeur;
    let suffixe = "";

    // 1. Extraction du suffixe en lettre majuscule brute
    if (valeur >= 1000) {
        const suffixes = ["", "K", "M", "B", "T", "QA", "QI"];
        const i = Math.floor(Math.log10(valeur) / 3);
        
        if (i < suffixes.length) {
            nombreAConvertir = valeur / Math.pow(1000, i);
            suffixe = suffixes[i];
        }
    }

    // 2. Si le bouton de traduction (Base 10) est actif
    if (document.body.classList.contains('traduit')) {
        if (valeur < 1000) {
            return Number.isInteger(valeur) ? valeur.toString() : valeur.toFixed(1);
        }
        return nombreAConvertir.toFixed(2).replace(/\.00$/, '') + suffixe;
    }

    // 3. Conversion Base 5 d'origine avec prise en compte des décimales inférieures à 1000
    let entier = Math.floor(nombreAConvertir);
    let resultatBase5 = "";
    
    if (entier === 0) {
        resultatBase5 = "0";
    } else {
        while (entier > 0) {
            resultatBase5 = (entier % 5) + resultatBase5;
            entier = Math.floor(entier / 5);
        }
    }

    // Correctif décimales (Pour les petits nombres comme 1.5, 0.5, etc.)
    if (valeur < 1000 && !Number.isInteger(nombreAConvertir)) {
        let partieDecimale = nombreAConvertir % 1;
        let resteBase5 = Math.floor(partieDecimale * 5);
        if (resteBase5 > 0) {
            resultatBase5 += "." + resteBase5;
        }
    }
    // Format condensé des grands nombres (ex: 1.5K -> 1.2K)
    else if (valeur >= 1000) {
        let resteDecimal = Math.floor((nombreAConvertir % 1) * 5);
        if (resteDecimal > 0) {
            resultatBase5 += "." + resteDecimal;
        }
    }

    return resultatBase5 + suffixe;
  }

  const anglesUltraSerrés = [1.5, -1.5, 3.5, -3.5, 5.5, -5.5, 7.5, -7.5, 9.5, -9.5];

  function ajouterUnChatOuvrierSurPlanete(typeZone, indexAchat, urlImage) {
    if (indexAchat > 100) return; 
    const conteneur = document.getElementById(`chats-conteneur-${typeZone}`);
    if (!conteneur) return;
    const imgChat = document.createElement('img');
    imgChat.src = urlImage;
    imgChat.className = "chat-recrue";
    const indexLigne = Math.floor((indexAchat - 1) / 10);
    const positionDansLigne = (indexAchat - 1) % 10;
    imgChat.style.setProperty('--rayon-pivot', `${550 - (indexLigne * 12)}px`);
    imgChat.style.setProperty('--position-bas', `${-8 - (indexLigne * 12)}px`);
    imgChat.style.setProperty('--ordre-visuel', 10 + indexLigne);
    imgChat.style.setProperty('--angle-chat', `${anglesUltraSerrés[positionDansLigne]}deg`);
    conteneur.appendChild(imgChat);
  }


  // 🌟 Chemins uniques des images de ressources
  const IMAGES_RESSOURCES = {
    bois: "images/ressources/bois.png",
    pierre: "images/ressources/pierre.png",
    energie: "images/ressources/elec.png",
    connaissance: "images/ressources/connaissance.png",
    roches: "images/ressources/roches_stellaires.png",
    matiereNoire: "images/ressources/matiere_noire.png"
  };
/* =========================================================================
     🛒 CATALOGUE DE LA BOUTIQUE CENTRALISÉ (FUSION CONDITION/AFFICHAGE)
     ========================================================================= */
  const CATALOGUE_BOUTIQUE = [
    // ------------------- BÂTIMENTS TERRESTRES -------------------
    {
      id: "btn-bat-bois", zone: "batiments-terre", type: "batiment",
      titre: () => "Chat Bûcheron",
      desc: () => "+0.1 bois/s",
      icone: () => "images/minichat-bucheron.png",
      prix: () => ({ bois: calculerPrixExponentiel(10, nbBucherons) }),
      qte: () => nbBucherons,
      condition: () => true, // Toujours visible et accessible dès le départ
      action: () => { nbBucherons++; ajouterUnChatOuvrierSurPlanete('bois', nbBucherons, 'images/minichat-bucheron.png'); SON_ACHAT_CHAT.currentTime = 0; SON_ACHAT_CHAT.play();}
    },
    {
      id: "btn-bat-pierre", zone: "batiments-terre", type: "batiment",
      titre: () => "Chat Mineur",
      desc: () => "+0.2 pierre/s",
      icone: () => "images/minichat-mineur.png",
      prix: () => ({ pierre: calculerPrixExponentiel(50, nbMineurs) }),
      qte: () => nbMineurs,
      condition: () => upgradePierreAchetee, // Apparaît uniquement si la pierre est débloquée
      action: () => { nbMineurs++; ajouterUnChatOuvrierSurPlanete('pierre', nbMineurs, 'images/minichat-mineur.png'); SON_ACHAT_CHAT.currentTime = 0; SON_ACHAT_CHAT.play();}
    },
    {
      id: "btn-bat-energie", zone: "batiments-terre", type: "batiment",
      titre: () => "Chat Électricien",
      desc: () => nbCentrales >= 50 ? "+50.0 élec/s" : (nbCentrales >= 25 ? "+10.0 élec/s" : (nbCentrales >= 10 ? "+2.0 élec/s" : "+0.5 élec/s")),
      icone: () => "images/minichat-elec.png",
      prix: () => ({ energie: calculerPrixExponentiel(100, nbCentrales) }),
      qte: () => nbCentrales,
      condition: () => planCentraleAchete, // Apparaît uniquement si le brevet a été obtenu
      action: () => { nbCentrales++; ajouterUnChatOuvrierSurPlanete('energie', nbCentrales, 'images/minichat-elec.png'); SON_ACHAT_CHAT.currentTime = 0; SON_ACHAT_CHAT.play();}
    },

    // ------------------- AMÉLIORATIONS TERRESTRES -------------------
    {
      id: "btn-up-bois-1", zone: "ameliorations-terre", type: "amelioration", unique: true,
      titre: () => "Amélioration Bois I",
      desc: () => "+1 bois par clic",
      prix: () => ({ bois: 100 }),
      achete: () => upgradesActivees.bois1,
      // N'apparaît que si on a acheté au moins 1 bûcheron et qu'on ne l'a pas déjà validée
      condition: () => nbBucherons >= 1 && !upgradesActivees.bois1,
      action: () => { clics.bois += 1; upgradesActivees.bois1 = true; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-up-pierre-1", zone: "ameliorations-terre", type: "amelioration", unique: true,
      titre: () => !upgradePierreAchetee ? "Débloquer la Pierre" : "Amélioration Pierre I",
      desc: () => !upgradePierreAchetee ? "Ouvre l'accès aux carrières" : "+1 pierre par clic",
      prix: () => ({ bois: 500 }),
      achete: () => upgradesActivees.pierre1,
      // Étape Évolutive : s'affiche à 10 bûcherons tant que l'amélioration n'est pas acquise au max
      condition: () => nbBucherons >= 10 && !upgradesActivees.pierre1,
      action: () => { 
        if (!upgradePierreAchetee) {
          upgradePierreAchetee = true;
          document.getElementById('bloc-pierre').style.display = 'flex'; 
          document.getElementById('zone-pierre').style.display = 'flex'; 
          SON_BUILDING.currentTime = 0; SON_BUILDING.play();
        } else {
          clics.pierre += 1; upgradesActivees.pierre1 = true;
          SON_UPGRADE.currentTime = 0; SON_UPGRADE.play(); 
        }
      }
    },
    {
      id: "btn-up-traduction", zone: "ameliorations-terre", type: "amelioration", unique: true,
      titre: () => "Débloquer Traduction",
      desc: () => "Active le module traducteur",
      prix: () => ({ bois: 1000 }),
      achete: () => upgradeTradAchetee,
      condition: () => nbBucherons >= 10 && !upgradeTradAchetee,
      action: () => { 
        upgradeTradAchetee = true;
        const tab = document.getElementById('tab-trad'); 
        if (tab) { tab.style.display = 'block'; tab.classList.add('nouveau-clignotant'); }
        SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();

      }
    },
    {
      id: "btn-up-bois-2", zone: "ameliorations-terre", type: "amelioration", unique: true,
      titre: () => "Amélioration Bois II",
      desc: () => `+${convertirNombreCHA(5)} clic / Prod Passive x${convertirNombreCHA(1.5)}`,
      prix: () => ({ bois: 1500, pierre: 1000 }),
      achete: () => upgradesActivees.bois2,
      condition: () => upgradesActivees.bois1 && nbBucherons >= 20 && !upgradesActivees.bois2,
      action: () => { clics.bois += 5; multiplicateursPassifs.bois *= 1.5; upgradesActivees.bois2 = true; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-up-observatoire", zone: "ameliorations-terre", type: "amelioration", unique: true,
      titre: () => "Débloquer l'Observatoire",
      desc: () => "Permet d'observer le ciel pour obtenir de la connaissance",
      prix: () => ({ bois: 1500, pierre: 1500 }),
      achete: () => upgradeObservAchetee,
      condition: () => nbMineurs >= 10 && !upgradeObservAchetee,
      action: () => { 
        upgradeObservAchetee = true; 
        const tab = document.getElementById('tab-observ');
        if (tab) { tab.style.display = 'block'; tab.classList.add('nouveau-clignotant'); }
        SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();
      }
    },
    {
      id: "btn-up-pierre-2", zone: "ameliorations-terre", type: "amelioration", unique: true,
      titre: () => "Amélioration Pierre II",
      desc: () => `+${convertirNombreCHA(5)} clic / Prod Passive x${convertirNombreCHA(1.5)}`,
      prix: () => ({ bois: 5000, pierre: 5000 }),
      achete: () => upgradesActivees.pierre2,
      // Ta règle stricte : n'apparaît que si Pierre I est achetée ET qu'on a le palier des 20 mineurs
      condition: () => upgradesActivees.pierre1 && nbMineurs >= 20 && !upgradesActivees.pierre2,
      action: () => { clics.pierre += 5; multiplicateursPassifs.pierre *= 1.5; upgradesActivees.pierre2 = true; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-up-elec-1", zone: "ameliorations-terre", type: "amelioration", unique: true,
      titre: () => "Amélioration Électricité I",
      desc: () => "+5 élec/clic / Prod x1.5",
      prix: () => ({ bois: 10000, pierre: 10000, energie: 10000 }),
      achete: () => upgradesActivees.elec1,
      condition: () => planCentraleAchete && !upgradesActivees.elec1,
      action: () => { clics.energie += 5; multiplicateursPassifs.energie *= 1.5; upgradesActivees.elec1 = true; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },

    {
      id: "btn-up-plan-moulin", zone: "ameliorations-terre", type: "amelioration", unique: true,
      titre: () => "Acheter les Plans du Moulin",
      desc: () => "Débloque l'électricité",
      prix: () => ({ bois: 2000, pierre: 2000 }), // Tu peux ajuster le prix en ressources ici
      achete: () => planCentraleAchete,
      // 🌟 N'apparaît que si on a le brevet de l'espace ET qu'on n'a pas encore acheté le plan
      condition: () => techActivees.brevet && !planCentraleAchete,
      action: () => { 
        planCentraleAchete = true;
        // Débloque l'affichage de la ressource Énergie
        document.getElementById('bloc-energie').style.display = 'flex'; 
        document.getElementById('zone-energie').style.display = 'flex';
        SON_BUILDING.currentTime = 0; SON_BUILDING.play();
      }
    },

    // ------------------- BÂTIMENTS ESPACE -------------------
    {
      id: "btn-metier-etudiant", zone: "batiments-espace", type: "batiment",
      titre: () => "Intelligence accrue",
      desc: () => "+1 Connaissance par constellation",
      icone: () => "images/cerveau.png",
      prix: () => ({ connaissance: calculerPrixExponentiel(5, nbEtudiants) }),
      qte: () => nbEtudiants,
      condition: () => true, // Visible d'office dans l'onglet spatial
      action: () => { nbEtudiants++; }
    },
    {
      id: "btn-metier-astronome", zone: "batiments-espace", type: "batiment",
      titre: () => "Chat Astrologue",
      desc: () => "+0.5 connaissance/s",
      icone: () => "images/chat-astrologue.png",
      prix: () => ({ connaissance: calculerPrixExponentiel(50, nbAstronomes) }),
      qte: () => nbAstronomes,
      condition: () => nbEtudiants >= 5, // Apparaît dès qu'on a 5 étudiants
      action: () => { nbAstronomes++; }
    },

    {
      id: "btn-metier-satellite", zone: "infrastructure-espace", type: "batiment",
      titre: () => "Satellite",
      icone: () => "images/espace/satellite.png",
      desc: () => `Dissipe le brouillard spatial (${nbSatellites}/30)`,
      // 🌟 MUTATION DYNAMIQUE DU PRIX SELON LA QUANTITÉ
      prix: () => {
        if (nbSatellites === 0) {
          // Coût unique pour le tout premier satellite (Ressources Terrestres)
          return {
            bois: 1000,
            pierre: 500,
            energie: 200
          };
        } else {
          // Coût exponentiel pour les suivants (Minerai + Électricité)
          return {
            roches: calculerPrixExponentiel(500, nbSatellites),
            energie: calculerPrixExponentiel(200, nbSatellites)
          };
        }
      },
      qte: () => nbSatellites,
      condition: () => etatFusee.lancee, 
      action: () => { 
        if (nbSatellites < 30) {
          nbSatellites++; 
          ajouterUnSatelliteGraphique(nbSatellites);
          mettreAjourBrouillardSpatial();
          SON_VENT.currentTime = 0;
          SON_VENT.play();
        }
      }
    },

    {
      id: "btn-tech-dyson", zone: "infrastructure-espace", type: "amelioration", unique: false, // unique: false car on l'achète 4 fois !
      titre: () => {
        if (etapeDyson === 0) return "Sphère de Dyson I";
        if (etapeDyson === 1) return "Sphère de Dyson II";
        if (etapeDyson === 2) return "Sphère de Dyson III";
        if (etapeDyson === 3) return "Sphère de Dyson IV";
        return "⚡ Sphère de Dyson Complétée !";
      },
      desc: () => {
        if (etapeDyson === 0) return "+10k élec/s";
        if (etapeDyson === 1) return "+50k élec/s";
        if (etapeDyson === 2) return "+200k élec/s";
        if (etapeDyson === 3) return "+10m élec/s";
        return "Production maximale stabilisée.";
      },
      prix: () => {
        if (etapeDyson === 0) return { roches: 10000, energie: 2000000 };
        if (etapeDyson === 1) return { roches: 25000, pierre: 10000000 };
        if (etapeDyson === 2) return { roches: 50000, bois: 5000000 };
        if (etapeDyson === 3) return { roches: 100000, energie: 50000000 };
        return {};
      },
      condition: () => nbSatellites >= 10 && etapeDyson < 4, // Débloqué dès 10 satellites, disparait à l'étape 4
      action: () => {
        etapeDyson++;
        
        // 1. Mise à jour immédiate du sprite du Soleil
        const imgSoleil = document.getElementById('img-soleil');
        if (imgSoleil) {
          imgSoleil.src = `images/espace/soleil_etape${etapeDyson}.png`;
          
          // Effets visuels de surpuissance progressifs
          if (etapeDyson === 4) {
            imgSoleil.style.filter = "drop-shadow(0 0 25px #7CFC6E) drop-shadow(0 0 50px #000)";
          } else {
            imgSoleil.style.filter = `drop-shadow(0 0 ${10 + etapeDyson * 5}px var(--accent))`;
          }
        }

        // 2. Application des bonus de production passifs (Cumulatifs ou paliers)
        if (etapeDyson === 1) multiplicateursPassifs.energie += 10000;
        else if (etapeDyson === 2) multiplicateursPassifs.energie += 50000;
        else if (etapeDyson === 3) multiplicateursPassifs.energie += 200000;
        else if (etapeDyson === 4) multiplicateursPassifs.energie += 10000000; // +10 Millions élec/s !

        mettreAjourInterface();
        SON_BUILDING.currentTime = 0; SON_BUILDING.play();
      }
    },

    // ------------------- AMÉLIORATIONS ESPACE -------------------
    {
      id: "btn-tech-livre", zone: "ameliorations-espace", type: "amelioration", unique: true,
      titre: () => "Le Grand Livre", 
      desc: () => "Permet de voir les pattern des constellations",
      prix: () => ({ connaissance: 10 }), 
      achete: () => techActivees.livre,
      condition: () => nbEtudiants >= 1 && !techActivees.livre,
      action: () => { techActivees.livre = true; document.getElementById('btn-ouvrir-livre').style.display = 'block'; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-tech-lentilles", zone: "ameliorations-espace", type: "amelioration", unique: true,
      titre: () => "Lentilles de l'Espace", 
      desc: () => "Affiche directement le tracé pour relier les étoiles.",
      prix: () => ({ connaissance: 250 }), 
      achete: () => techActivees.lentilles,
      condition: () => nbEtudiants >= 10 && !techActivees.lentilles,
      action: () => { techActivees.lentilles = true; actualiserPositionsCiel(); SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-tech-brevet", zone: "ameliorations-espace", type: "amelioration", unique: true,
      titre: () => "Brevet de l'Électricité", desc: () => "Permet d'acheter les plans du Moulin à eau sur la Base.",
      prix: () => ({ connaissance: 50 }), achete: () => techActivees.brevet,
      condition: () => nbAstronomes >= 1 && !techActivees.brevet,
      action: () => { 
        techActivees.brevet = true; 
        SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();
      }
    },
    // ==========================================
    // 🌌 AMÉLIORATIONS DE L'OBSERVATOIRE MODIFIÉES
    // ==========================================
    {
      id: "btn-tech-foret2", zone: "ameliorations-espace", type: "amelioration", unique: true,
      titre: () => "Amélioration Bois III", 
      desc: () => "+5 bois/clic & Prod passive Bois x1.5",
      prix: () => ({ connaissance: 500 }), 
      achete: () => techActivees.foret2,
      // 🌟 Correction : Demande simplement le brevet d'électricité (Base II optionnel ou géré ici)
      condition: () => techActivees.brevet && !techActivees.foret2,
      action: () => { techActivees.foret2 = true; clics.bois += 5; multiplicateursPassifs.bois *= 1.5; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-tech-mine2", zone: "ameliorations-espace", type: "amelioration", unique: true,
      titre: () => "Amélioration Bois III", 
      desc: () => "+5 pierre/clic & Prod passive Pierre x1.5",
      prix: () => ({ connaissance: 750 }), 
      achete: () => techActivees.mine2,
      // 🌟 Correction : Demande simplement le brevet d'électricité
      condition: () => techActivees.brevet && !techActivees.mine2,
      action: () => { techActivees.mine2 = true; clics.pierre += 5; multiplicateursPassifs.pierre *= 1.5; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-tech-elec2", zone: "ameliorations-espace", type: "amelioration", unique: true,
      titre: () => "Surchauffe Electrique", 
      desc: () => "Prod passive Énergie x2",
      prix: () => ({ connaissance: 1000 }), 
      achete: () => techActivees.elec2,
      // 🌟 CONDITION : Demande le brevet ET que le bouton terrestre de base (btn-up-elec-1) soit acheté
      condition: () => techActivees.brevet && upgradesActivees.elec1 && !techActivees.elec2,
      action: () => { techActivees.elec2 = true; multiplicateursPassifs.energie *= 2; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },

    // ==========================================
    // ⚛️ NOUVELLES UPGRADES QUANTIQUES DE LA BASE
    // ==========================================
    {
      id: "btn-up-bois-quantique", zone: "ameliorations-terre", type: "amelioration", unique: true,
      titre: () => "Amélioration Bois IV",
      desc: () => "+50 bois/clic & +250 bois/s par Bûcheron",
      prix: () => ({ roches: 1000, bois: 500000 }),
      achete: () => upgradesActivees.boisQuantique,
      // Condition : Espace débloqué (Fusée lancée) ET l'upgrade Électrique du Bois (foret2) achetée
      condition: () => etatFusee.lancee && techActivees.foret2 && !upgradesActivees.boisQuantique,
      action: () => { 
        clics.bois += 50; 
        multiplicateursPassifs.bois += 2500; 
        upgradesActivees.boisQuantique = true;
        SON_UPGRADE.currentTime = 0; SON_UPGRADE.play(); 
      }
    },
    {
      id: "btn-up-pierre-quantique", zone: "ameliorations-terre", type: "amelioration", unique: true,
      titre: () => "Amélioration Pierre IV",
      desc: () => "+100 pierre/clic & +500 pierre/s par Mineur",
      prix: () => ({ roches: 1500, pierre: 750000 }),
      achete: () => upgradesActivees.pierreQuantique,
      // Condition : Espace débloqué (Fusée lancée) ET l'upgrade Électrique de la Pierre (mine2) achetée
      condition: () => etatFusee.lancee && techActivees.mine2 && !upgradesActivees.pierreQuantique,
      action: () => { 
        clics.pierre += 100; 
        multiplicateursPassifs.pierre += 5000; 
        upgradesActivees.pierreQuantique = true; 
        SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();
      }
    },
    {
      id: "btn-tech-fusee", zone: "ameliorations-espace", type: "amelioration", unique: true,
      titre: () => "Le Plan de la Fusée", 
      desc: () => "Ouvre l'onglet de la Fusée.",
      prix: () => ({ connaissance: 2500 }), 
      achete: () => techActivees.fusee,
      condition: () => nbAstronomes >= 10 && !techActivees.fusee,
      action: () => { 
        techActivees.fusee = true; 
        const tab = document.getElementById('tab-fusee');
        if (tab) { tab.style.display = 'block'; tab.classList.add('nouveau-clignotant'); }
        SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();
      }
    },

    {
      id: "btn-tech-meditation", zone: "ameliorations-espace", type: "amelioration", unique: true,
      titre: () => "Méditation Temporelle", 
      desc: () => "Permet d'accélérer le temps (+1j / +1m).",
      prix: () => ({ connaissance: 1500 }), 
      achete: () => techActivees.meditation,
      condition: () => etatFusee.lancee && !techActivees.meditation,
      action: () => { techActivees.meditation = true; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },

    {
      id: "btn-tech-happyhour", zone: "ameliorations-espace", type: "amelioration", unique: true,
      titre: () => "Happy Hour", 
      desc: () => "Double x2 TOUTES vos productions passives entre 20h00 et 6h00 (Heure Réelle). (Indice : Activer ceci le bon jour de l'année pourrait permettre de voir l'Etoile depuis l'Observatoire...)",
      prix: () => ({ connaissance: 10000 }), 
      achete: () => happyHourAchete,
      condition: () => etoileDecouverte && !happyHourAchete,
      action: () => { happyHourAchete = true; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },

    // ==========================================
    // 🚀 ONGLET FUSÉE - INVENTIONS COMPOSÉES DANS L'ORDRE
    // ==========================================
    {
      id: "btn-inv-tir", zone: "inventions-fusee", type: "amelioration", unique: true,
      titre: () => "Pas de Tir", desc: () => "",
      prix: () => ({ pierre: 50000, bois: 10000, energie: 5000 }), achete: () => etatFusee.pasDeTir,
      // 🌟 Étape 1 : Disponible d'office
      condition: () => !etatFusee.pasDeTir,
      action: () => { etatFusee.pasDeTir = true; SON_BUILDING.currentTime = 0; SON_BUILDING.play();}
    },
    {
      id: "btn-inv-mot", zone: "inventions-fusee", type: "amelioration", unique: true,
      titre: () => "Moteur à Propulsion", desc: () => "",
      prix: () => ({ energie: 50000, pierre: 30000 }), achete: () => etatFusee.moteur,
      // 🌟 Étape 2 : Requiert le Pas de Tir
      condition: () => etatFusee.pasDeTir && !etatFusee.moteur,
      action: () => { etatFusee.moteur = true; SON_BUILDING.currentTime = 0; SON_BUILDING.play();}
    },
    {
      id: "btn-inv-res", zone: "inventions-fusee", type: "amelioration", unique: true,
      titre: () => "Réservoir et Carburant", desc: () => "",
      prix: () => ({ bois: 75000, energie: 25000 }), achete: () => etatFusee.reservoir,
      // 🌟 Étape 3 : Requiert le Moteur
      condition: () => etatFusee.moteur && !etatFusee.reservoir,
      action: () => { etatFusee.reservoir = true; SON_BUILDING.currentTime = 0; SON_BUILDING.play();}
    },
    {
      id: "btn-inv-ordi", zone: "inventions-fusee", type: "amelioration", unique: true,
      titre: () => "Cockpit", desc: () => "",
      prix: () => ({ energie: 100000, connaissance: 5000 }), achete: () => etatFusee.ordi,
      // 🌟 Étape 4 : Requiert le Réservoir
      condition: () => etatFusee.reservoir && !etatFusee.ordi,
      action: () => { etatFusee.ordi = true; SON_BUILDING.currentTime = 0; SON_BUILDING.play();}
    },
    {
      id: "btn-achat-kit", zone: "inventions-fusee", type: "amelioration", unique: false,
      titre: () => "Acheter un Kit de Fusée", desc: () => "Permet une tentative d'assemblage",
      prix: () => ({ bois: 5000, pierre: 5000, energie: 7500 }), achete: () => false,
      // Disponible uniquement si toute la construction linéaire de base est achevée
      condition: () => etatFusee.ordi && !etatFusee.kitAchete && !etatFusee.lancee,
      action: () => { 
        etatFusee.kitAchete = true; 
        etatFusee.piecesAssemblees = 0;
        preparerMiniJeuFusee();
        SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();
      }
    },

    // ==========================================
    // 🚀 ONGLET FUSÉE - AMÉLIORATIONS (POST-LANCEMENT)
    // ==========================================
    {
      id: "btn-up-croquettes", zone: "ameliorations-fusee", type: "amelioration", unique: true,
      titre: () => "Carburant aux Croquettes Enrichies (Vitesse I)", 
      desc: () => "Permet d'aller sur Croquetis",
      prix: () => ({ energie: 10000, pierre: 5000 }), 
      achete: () => upgradesFusee.croquettes,
      condition: () => etatFusee.lancee && !upgradesFusee.croquettes,
      action: () => { upgradesFusee.croquettes = true; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();} // Géré dynamiquement au lancement
    },
    {
      id: "btn-up-plasma", zone: "ameliorations-fusee", type: "amelioration", unique: true,
      titre: () => "Propulseur Plasma Ionique (Vitesse II)", 
      desc: () => "Permet d'aller sur Ronronis",
      prix: () => ({ energie: 50000, roches: 500 }), 
      achete: () => upgradesFusee.plasma,
      condition: () => upgradesFusee.croquettes && !upgradesFusee.plasma,
      action: () => { upgradesFusee.plasma = true; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-up-hyperpropulsion", zone: "ameliorations-fusee", type: "amelioration", unique: true,
      titre: () => "Hyperpropulsion Quantique (Vitesse III)", 
      desc: () => "Permet d'aller sur la Ceinture Calinous",
      prix: () => ({ energie: 250000, roches: 5000 }), 
      achete: () => upgradesFusee.hyperpropulsion,
      condition: () => upgradesFusee.plasma && !upgradesFusee.hyperpropulsion,
      action: () => { upgradesFusee.hyperpropulsion = true; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-up-distorsion", zone: "ameliorations-fusee", type: "amelioration", unique: true,
      titre: () => "Moteur à Distorsion Temporelle (Vitesse IV)", 
      desc: () => "Permet d'aller sur Sardinia",
      prix: () => ({ connaissance: 50000, roches: 25000 }), 
      achete: () => upgradesFusee.distorsion,
      condition: () => upgradesFusee.hyperpropulsion && !upgradesFusee.distorsion,
      action: () => { upgradesFusee.distorsion = true; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },

    {
      id: "btn-up-soute", zone: "ameliorations-fusee", type: "amelioration", unique: true,
      titre: () => "Soute Allégée (Minerai I)", desc: () => "Gain Minerais +25%",
      prix: () => ({ bois: 25000 }), achete: () => upgradesFusee.soute,
      condition: () => etatFusee.lancee && !upgradesFusee.soute,
      action: () => { upgradesFusee.soute = true; multiplicateursPassifs.roches *= 1.25; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-up-compresseur", zone: "ameliorations-fusee", type: "amelioration", unique: true,
      titre: () => "Compresseur Anti-Gravité (Minerai II)", desc: () => "Gain Minerais +100%",
      // 🌟 CORRECTIF : Utilise bien la clé 'roches'
      prix: () => ({ energie: 100000, roches: 1000 }), achete: () => upgradesFusee.compresseur,
      condition: () => upgradesFusee.soute && !upgradesFusee.compresseur,
      action: () => { upgradesFusee.compresseur = true; multiplicateursPassifs.roches *= 2.0; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },

    // --- SUITE DES AMÉLIORATIONS DE RECOLTE (III & IV) ---
    {
      id: "btn-up-extracteur", zone: "ameliorations-fusee", type: "amelioration", unique: true,
      titre: () => "Extracteur Laser de Noyau (Minerai III)", 
      desc: () => "Gain Minerais +150%.",
      prix: () => ({ pierre: 5000000, roches: 2500 }), 
      achete: () => upgradesFusee.extracteur,
      // Condition : Demande le Compresseur (Roches II)
      condition: () => upgradesFusee.compresseur && !upgradesFusee.extracteur,
      action: () => { 
        upgradesFusee.extracteur = true; 
        multiplicateursPassifs.roches *= 2.5;
        SON_UPGRADE.currentTime = 0; SON_UPGRADE.play(); 
      }
    },
    {
      id: "btn-up-moissonneuse", zone: "ameliorations-fusee", type: "amelioration", unique: true,
      titre: () => "Moissonneuse d'Étoiles Gravitationnelle (Roches IV)", 
      desc: () => "Gain Minerais +500%.",
      prix: () => ({ energie: 2000000, roches: 15000 }), 
      achete: () => upgradesFusee.moissonneuse,
      // Condition ultime : Demande l'Extracteur (Roches III)
      condition: () => upgradesFusee.extracteur && !upgradesFusee.moissonneuse,
      action: () => { 
        upgradesFusee.moissonneuse = true; 
        multiplicateursPassifs.roches *= 6.0;
        SON_UPGRADE.currentTime = 0; SON_UPGRADE.play(); 
      }
    },

    // 🚀 MISSIONS DE COLONISATION ET ENVOI DE FUSÉES (ONGLET ESPACE)
    {
      id: "btn-col-luna", zone: "infrastructure-espace", type: "batiment",
      titre: () => `Luna`,
      desc: () => colonisation.luna.enVoyage ? `⏳ Fusée en transit (${colonisation.luna.joursRestants}j)` : "Coloniser Luna (+ 1 Minerai/s)",
      icone: () => "images/espace/luna.png",
      prix: () => ({ energie: calculerPrixExponentiel(10000, colonisation.luna.niveau) }),
      qte: () => colonisation.luna.niveau,
      // 🛰️ Condition : Fusée lancée ET au moins 1 satellite déployé (révèle Luna)
      condition: () => etatFusee.lancee && nbSatellites >= 1 && !colonisation.luna.enVoyage,
      action: () => { lancerFuseeColonisation('luna', 3); SON_ROCKET.currentTime = 0; SON_ROCKET.play();}
    },
    {
      id: "btn-col-croquetis", zone: "infrastructure-espace", type: "batiment",
      titre: () => `Croquetis`,
      desc: () => colonisation.croquetis.enVoyage ? `⏳ Fusée en transit (${colonisation.croquetis.joursRestants}j)` : "Coloniser Croquetis (+ 5 Minerai/s).",
      icone: () => "images/espace/croquetis.png",
      prix: () => ({ energie: calculerPrixExponentiel(50000, colonisation.croquetis.niveau), roches: calculerPrixExponentiel(200, colonisation.croquetis.niveau) }),
      qte: () => colonisation.croquetis.niveau,
      // 🛰️ Condition : Vitesse I ET au moins 5 satellites (révèle Croquetis)
      condition: () => upgradesFusee.croquettes && nbSatellites >= 5 && !colonisation.croquetis.enVoyage,
      action: () => { lancerFuseeColonisation('croquetis', 7); SON_ROCKET.currentTime = 0; SON_ROCKET.play();}
    },
    {
      id: "btn-col-ronronis", zone: "infrastructure-espace", type: "batiment",
      titre: () => `Ronronis`,
      desc: () => colonisation.ronronis.enVoyage ? `⏳ Fusée en transit (${colonisation.ronronis.joursRestants}j)` : "Coloniser Ronronis (+ 25 Minerai/s)",
      icone: () => "images/espace/ronronis.png",
      prix: () => ({ energie: calculerPrixExponentiel(200000, colonisation.ronronis.niveau), roches: calculerPrixExponentiel(1000, colonisation.ronronis.niveau) }),
      qte: () => colonisation.ronronis.niveau,
      // 🛰️ Condition : Vitesse II ET au moins 10 satellites (révèle Ronronis)
      condition: () => upgradesFusee.plasma && nbSatellites >= 10 && !colonisation.ronronis.enVoyage,
      action: () => { lancerFuseeColonisation('ronronis', 14); SON_ROCKET.currentTime = 0; SON_ROCKET.play();}
    },
    {
      id: "btn-col-calinous", zone: "infrastructure-espace", type: "batiment",
      titre: () => `Ceinture Calinous`,
      desc: () => colonisation.calinous.enVoyage ? `⏳ Fusée en transit (${colonisation.calinous.joursRestants}j)` : "Coloniser Ceinture Calinous (+ 100 Minerai/s)",
      prix: () => ({ energie: calculerPrixExponentiel(1000000, colonisation.calinous.niveau), roches: calculerPrixExponentiel(5000, colonisation.calinous.niveau) }),
      icone: () => "images/espace/ma2.png",
      qte: () => colonisation.calinous.niveau,
      // 🛰️ Condition : Vitesse III ET au moins 15 satellites (révèle la Ceinture Calinous)
      condition: () => upgradesFusee.hyperpropulsion && nbSatellites >= 15 && !colonisation.calinous.enVoyage,
      action: () => { lancerFuseeColonisation('calinous', 20); SON_ROCKET.currentTime = 0; SON_ROCKET.play();}
    },
    {
      id: "btn-col-sardinia", zone: "infrastructure-espace", type: "batiment",
      titre: () => `Sardinia`,
      desc: () => colonisation.sardinia.enVoyage ? `⏳ Fusée en transit (${colonisation.sardinia.joursRestants}j)` : "Coloniser Sardinia (+ 500 Minerai/s)",
      prix: () => ({ energie: calculerPrixExponentiel(5000000, colonisation.sardinia.niveau), roches: calculerPrixExponentiel(20000, colonisation.sardinia.niveau) }),
      icone: () => "images/espace/sardinia.png",
      qte: () => colonisation.sardinia.niveau,
      // 🛰️ Condition : Vitesse IV ET au moins 20 satellites (révèle Sardinia)
      condition: () => upgradesFusee.distorsion && nbSatellites >= 20 && !colonisation.sardinia.enVoyage,
      action: () => { lancerFuseeColonisation('sardinia', 40); SON_ROCKET.currentTime = 0; SON_ROCKET.play();}
    },

    {
      id: "btn-inter-coque", zone: "interstellaire-boutique", type: "amelioration", unique: true,
      titre: () => "Blindage en Coque Stellaire", desc: () => "Résiste aux débris spatiaux à très haute vitesse",
      prix: () => ({ roches: 25000, pierre: 5000000 }), achete: () => elementsInterstellaires.coque,
      condition: () => plansInterstellairesDebloques && etatFusee.lancee && !elementsInterstellaires.coque,
      action: () => { elementsInterstellaires.coque = true; verifierLancementInterstellaire(); SON_BUILDING.currentTime = 0; SON_BUILDING.play();}
    },
    {
      id: "btn-inter-res", zone: "interstellaire-boutique", type: "amelioration", unique: true,
      titre: () => "Réservoir à Antimatière", desc: () => "Isole magnétiquement l'énergie pure",
      prix: () => ({ roches: 50000, bois: 10000000 }), achete: () => elementsInterstellaires.reservoir,
      condition: () => plansInterstellairesDebloques && etatFusee.lancee && !elementsInterstellaires.reservoir,
      action: () => { elementsInterstellaires.reservoir = true; verifierLancementInterstellaire(); SON_BUILDING.currentTime = 0; SON_BUILDING.play();}
    },
    {
      id: "btn-inter-prop", zone: "interstellaire-boutique", type: "amelioration", unique: true,
      titre: () => "Hyper-Propulseur Quantique", desc: () => "Moteur à distorsion pour le saut hyperespace",
      prix: () => ({ roches: 100000, energie: 50000000, connaissance: 10000 }), achete: () => elementsInterstellaires.propulseur,
      condition: () => plansInterstellairesDebloques && etatFusee.lancee && !elementsInterstellaires.propulseur,
      action: () => { elementsInterstellaires.propulseur = true; verifierLancementInterstellaire();SON_BUILDING.currentTime = 0; SON_BUILDING.play(); }
    },

    // --- ARMEMENT ET MOTEURS (Onglet Voyage Final) ---
    {
      id: "btn-voyage-laser-manuel", zone: "ameliorations-voyage", type: "batiment", unique: false,
      titre: () => "Focalisateur de Clic", desc: () => "Augmente la puissance de vos tirs manuels. (+10 dégâts/clic)",
      prix: () => ({ matiereNoire: calculerPrixExponentiel(100, window.nbLasersManuels || 0) }), 
      qte: () => window.nbLasersManuels || 0,
      condition: () => voyageDemarre,
      action: () => { 
        if (!window.nbLasersManuels) window.nbLasersManuels = 0;
        window.nbLasersManuels++;
        SON_UPGRADE.currentTime = 0; SON_UPGRADE.play(); 
      }
    },
    {
      id: "btn-voyage-tourelle", zone: "ameliorations-voyage", type: "batiment",
      titre: () => "Tourelle Laser Standard", desc: () => "Tire automatiquement sur les petits débris.",
      prix: () => ({ matiereNoire: calculerPrixExponentiel(10, lasersVoyage.tourelle) }), qte: () => lasersVoyage.tourelle,
      condition: () => voyageDemarre,
      action: () => { lasersVoyage.tourelle++; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-voyage-canon", zone: "ameliorations-voyage", type: "batiment",
      titre: () => "Canon à Ions Synchrone", desc: () => "Pulvérise les gros astéroïdes à votre place.",
      prix: () => ({ matiereNoire: calculerPrixExponentiel(250, lasersVoyage.canon) }), qte: () => lasersVoyage.canon,
      condition: () => voyageDemarre && lasersVoyage.tourelle >= 5,
      action: () => { lasersVoyage.canon++; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-voyage-ia", zone: "ameliorations-voyage", type: "batiment",
      titre: () => "Laser Tactique IA", desc: () => "Scanne et nettoie l'écran des grappes de roches.",
      prix: () => ({ matiereNoire: calculerPrixExponentiel(5000, lasersVoyage.ia) }), qte: () => lasersVoyage.ia,
      condition: () => voyageDemarre && lasersVoyage.canon >= 5,
      action: () => { lasersVoyage.ia++; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-voyage-collecteur-mn", zone: "ameliorations-voyage", type: "batiment", unique: false,
      titre: () => `Moissonneur du Vide`, 
      desc: () => `Base +100 MN/s (Formule Exp) & Double (x2) TOUS les gains et récoltes par niveau.`,
      prix: () => ({ matiereNoire: calculerPrixExponentiel(1000, lvlVoyageMoissonneurVide) }), qte: () => lvlVoyageMoissonneurVide,
      // 🌟 NOUVELLE CONDITION : Débloqué dès qu'on a au moins 5 tourelles lasers
      condition: () => voyageDemarre && lasersVoyage.tourelle >= 5,
      action: () => { lvlVoyageMoissonneurVide++; SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();}
    },
    {
      id: "btn-voyage-opti", zone: "ameliorations-voyage", type: "batiment", unique: false,
      titre: () => `Injection d'Antimatière`, desc: () => "+1% Vitesse Lumière",
      prix: () => ({ matiereNoire: calculerPrixExponentiel(50, lvlVoyageOpti) }), qte: () => lvlVoyageOpti,
      condition: () => voyageDemarre,
      action: () => { 
        lvlVoyageOpti++; 
        vitesseLumierePct = Math.min(100, Math.round((vitesseLumierePct + 1) * 100) / 100); 
        SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();
      }
    },
    {
      id: "btn-voyage-deflecteur", zone: "ameliorations-voyage", type: "batiment", unique: false,
      titre: () => `Surcharge Propulseur`, desc: () => "+2% Vitesse Lumière",
      prix: () => ({ matiereNoire: calculerPrixExponentiel(150, lvlVoyageDeflecteur) }), qte: () => lvlVoyageDeflecteur,
      condition: () => voyageDemarre && lvlVoyageOpti >= 10,
      action: () => { 
        if (vitesseLumierePct < 100) {
          lvlVoyageDeflecteur++; 
          vitesseLumierePct = Math.min(100, Math.round((vitesseLumierePct + 2) * 100) / 100); 
          SON_UPGRADE.currentTime = 0; SON_UPGRADE.play();
        }
      }
    },
    {
      id: "btn-voyage-processeur", zone: "ameliorations-voyage", type: "batiment", unique: false,
      titre: () => `Saut Quantique`, desc: () => "+5% Vitesse Lumière",
      prix: () => ({ matiereNoire: calculerPrixExponentiel(400, lvlVoyageProcesseur) }), qte: () => lvlVoyageProcesseur,
      condition: () => voyageDemarre && lvlVoyageDeflecteur >= 10,
      action: () => { 
        if (vitesseLumierePct < 100) {
          lvlVoyageProcesseur++; 
          vitesseLumierePct = Math.min(100, Math.round((vitesseLumierePct + 5) * 100) / 100);
          SON_UPGRADE.currentTime = 0; SON_UPGRADE.play(); 
        }
      }
    },
  ];

  function initialiserBoutique() {
    CATALOGUE_BOUTIQUE.forEach(item => {
      const containerId = `liste-${item.zone}`;
      const parent = document.getElementById(containerId);
      if (!parent) return;

      const btn = document.createElement('button');
      btn.className = 'bouton-achat';
      btn.id = item.id;
      btn.style.display = 'none'; // Caché par défaut

      btn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <img class="img-item-boutique" src="" style="width: 40px; height: 40px; object-fit: contain; display: none;">
          <div class="infos-achat">
            <strong class="titre-item"></strong>
            <span class="prod-desc desc-item"></span>
            <span class="prix-aligne prix-item"></span>
          </div>
        </div>
        ${item.type === 'batiment' ? `<div class="quantite-droite qte-item">0</div>` : ''}
      `;

      btn.addEventListener('click', () => {
        let coutActuel = item.prix();
        let peutAcheter = MODE_DEBUG;
        
        if (!peutAcheter) {
          peutAcheter = true;
          for (let res in coutActuel) {
            if (ressources[res] < coutActuel[res]) peutAcheter = false;
          }
        }

        if (peutAcheter && item.condition() && (!item.unique || !item.achete())) {
          if (!MODE_DEBUG) {
            for (let res in coutActuel) ressources[res] -= coutActuel[res];
          }
          
          // 🌟 EFFET SONORE D'ACHAT :
          // .currentTime = 0 permet de rejouer le son immédiatement même si on clique très vite
          SON_ACHAT.currentTime = 0; 
          SON_ACHAT.play().catch(e => console.log("[AUDIO] Bruitage d'achat bloqué par le navigateur."));

          item.action();
          // 🌟 FORCE L'ACTUALISATION VISUELLE IMMÉDIATE DU HUD HAPPY HOUR AU CLIC
          avancerCalendrierVirtuel(0);
          mettreAjourInterface();
        }
      });

      parent.appendChild(btn);
    });
  }

function mettreAjourInterface() {
    // 🌟 SÉCURITÉ STRICTE : Si on est en Traduction, on masque TOUTES les barres du haut
    const blocRessourcesGlobal = document.querySelector('.affichage-ressources');
    const barreHorlogeGlobale = document.getElementById('barre-horloge-globale');
    
    if (document.querySelector('.onglet.actif')) {
      ongletActif = document.querySelector('.onglet.actif').textContent.trim();
    }
    
    if (ongletActif === 'Traduction') {
      if (blocRessourcesGlobal) blocRessourcesGlobal.style.setProperty('display', 'none', 'important');
      if (barreHorlogeGlobale) barreHorlogeGlobale.style.setProperty('display', 'flex', 'important');
      return; // 🛑 On stoppe ici
    } else {
      if (blocRessourcesGlobal) blocRessourcesGlobal.style.setProperty('display', 'flex', 'important');
      if (barreHorlogeGlobale) barreHorlogeGlobale.style.setProperty('display', 'flex', 'important');
    }

    // === 1. MISE À JOUR DES COMPTEURS DE RESSOURCES (CACHE LES DOM_TEXTES) ===
    DOM_TEXTES.bois.textContent = convertirNombreCHA(ressources.bois);
    DOM_TEXTES.pierre.textContent = convertirNombreCHA(ressources.pierre);
    DOM_TEXTES.energie.textContent = convertirNombreCHA(ressources.energie);
    DOM_TEXTES.connaissance.textContent = convertirNombreCHA(ressources.connaissance);
    DOM_TEXTES.roches.textContent = convertirNombreCHA(ressources.roches);
    if (DOM_TEXTES.matiereNoire) {
      DOM_TEXTES.matiereNoire.textContent = convertirNombreCHA(ressources.matiereNoire);
    }

    // === 2. CALCUL ET AFFICHAGE DU TPS (AVEC HAPPY HOUR RÉELLE) ===
    let multiplicateurHappyHour = 1.0;
    const maintenant = obtenirDateFrancaiseReelle();
    const heureReelleActuelle = maintenant.getHours();
    // 🕒 Happy Hour active de 20h00 à 23h59
    if (happyHourAchete && heureReelleActuelle >= 20 && heureReelleActuelle < 24) {
      multiplicateurHappyHour = 2.0; 
    }

    let rpsBois = ((nbBucherons * 0.1) * multiplicateursPassifs.bois) * multiplicateurHappyHour;
    let rpsPierre = ((nbMineurs * 0.2) * multiplicateursPassifs.pierre) * multiplicateurHappyHour;
    let rpsEnergieRaw = nbCentrales >= 50 ? 50.0 : (nbCentrales >= 25 ? 10.0 : (nbCentrales >= 10 ? 2.0 : 0.5));
    let rpsEnergie = ((nbCentrales * rpsEnergieRaw) * multiplicateursPassifs.energie) * multiplicateurHappyHour;
    let rpsConnaissance = (nbAstronomes * 0.5) * multiplicateurHappyHour;
    let rpsRoches = etatFusee.lancee ? (((1 * multiplicateursPassifs.roches) * multiplicateurHappyHour)) : 0;
    let rpsMatiereNoire = voyageDemarre ? ((lasersVoyage.tourelle * 1) + (lasersVoyage.canon * 10) + (lasersVoyage.ia * 100)) : 0;

    document.getElementById('rps-bois').textContent = "+" + convertirNombreCHA(rpsBois) + "/s";
    document.getElementById('rps-pierre').textContent = "+" + convertirNombreCHA(rpsPierre) + "/s";
    document.getElementById('rps-energie').textContent = "+" + convertirNombreCHA(rpsEnergie) + "/s";
    document.getElementById('rps-connaissance').textContent = "+" + convertirNombreCHA(rpsConnaissance) + "/s";
    document.getElementById('rps-roches').textContent = "+" + convertirNombreCHA(rpsRoches) + "/s";
    if (document.getElementById('rps-matiere-noire')) {
      document.getElementById('rps-matiere-noire').textContent = "+" + convertirNombreCHA(rpsMatiereNoire) + "/s";
    }

    // === 3. GESTION DE LA VISIBILITÉ DES RESSOURCES PAR ONGLET ===
    const blocRessources = document.getElementById('bloc-ressources');
    const bBois = document.getElementById('bloc-bois');
    const bPierre = document.getElementById('bloc-pierre');
    const bEnergie = document.getElementById('bloc-energie');
    const bConnaissance = document.getElementById('bloc-connaissance');
    const bRoches = document.getElementById('bloc-roches');

    if (blocRessources) {
      // 🌟 Masquage global par tick si nécessaire (le sélecteur d'onglet prend le dessus)
      if (bRoches) bRoches.style.display = etatFusee.lancee ? 'flex' : 'none';
    }

    //gestion matière noire
    const divMatiereNoire = document.getElementById('bloc-matiere-noire'); // Remplace par l'ID exact de ton div contenant l'icône et le texte de la matière noire
    if (divMatiereNoire) {
      if (ongletActif === 'Voyage Final') {
        divMatiereNoire.style.display = 'flex';
      } else {
        divMatiereNoire.style.display = 'none'; // 🌟 Masqué partout ailleurs !
      }
    }

    // === 4. RÉCUPÉRATION DE L'ONGLET ACTIF POUR LA BOUTIQUE ===
    if (document.querySelector('.onglet.actif')) {
      ongletActif = document.querySelector('.onglet.actif').textContent.trim();
    }

    // === 5. GESTION DE LA BOUTIQUE DYNAMIQUE ET DES BOUTONS SWITCH ===
    const btnSwitchElement = document.getElementById('btn-switch-fusee');
    if (btnSwitchElement) {
      btnSwitchElement.style.display = (plansInterstellairesDebloques && ongletActif === 'Fusée') ? 'block' : 'none';
    }

    if (ongletActif === 'Fusée') {
      const bNormale = document.getElementById('boutique-fusee');
      const bInter = document.getElementById('boutique-fusee-interstellaire');
      if (modeFuseeActuel === 'normale') {
        if (bNormale) bNormale.style.display = 'block';
        if (bInter) bInter.style.display = 'none';
      } else {
        if (bNormale) bNormale.style.display = 'none';
        if (bInter) bInter.style.display = 'block';
      }
    } else {
      const bInter = document.getElementById('boutique-fusee-interstellaire');
      if (bInter) bInter.style.display = 'none';
      const bVoyage = document.getElementById('boutique-voyage');
      if (bVoyage) bVoyage.style.display = (ongletActif === 'Voyage Final') ? 'block' : 'none';
    }

    // === 6. ACTUALISATION DU CATALOGUE BOUTIQUE (Avec masquage des upgrades achetées) ===
    CATALOGUE_BOUTIQUE.forEach(item => {
      const btn = document.getElementById(item.id);
      if (!btn) return;

      // Détection de l'onglet correspondant
      let correspondALOnglet = false;
      if (ongletActif === 'Base' && (item.zone === 'batiments-terre' || item.zone === 'ameliorations-terre')) {
        correspondALOnglet = true;
      } else if (ongletActif === 'Fusée' && modeFuseeActuel === 'normale' && (item.zone === 'inventions-fusee' || item.zone === 'ameliorations-fusee')) {
        correspondALOnglet = true;
      } else if (ongletActif === 'Fusée' && modeFuseeActuel === 'interstellaire' && item.zone === 'interstellaire-boutique') {
        correspondALOnglet = true;
      } else if (ongletActif === 'Observation' && (item.zone === 'batiments-espace' || item.zone === 'ameliorations-espace')) {
        correspondALOnglet = true;
      } else if (ongletActif === 'Espace' && item.zone === 'infrastructure-espace') {
        correspondALOnglet = true;
      } else if (ongletActif === 'Voyage Final' && item.zone === 'ameliorations-voyage') {
        correspondALOnglet = true;
      }

      // 🌟 SÉCURITÉ DE MASQUAGE : Si l'amélioration unique est déjà achetée, on la cache DIRECTEMENT !
      let dejaAchete = false;
      if (item.unique) {
        if (typeof item.achete === 'function') {
          dejaAchete = item.achete();
        }
        // Double vérification manuelle pour la boutique des améliorations de fusée
        if (item.id === 'btn-up-croquettes' && upgradesFusee.croquettes) dejaAchete = true;
        if (item.id === 'btn-up-plasma' && upgradesFusee.plasma) dejaAchete = true;
        if (item.id === 'btn-up-hyperpropulsion' && upgradesFusee.hyperpropulsion) dejaAchete = true;
        if (item.id === 'btn-up-distorsion' && upgradesFusee.distorsion) dejaAchete = true;
        if (item.id === 'btn-up-soute' && upgradesFusee.soute) dejaAchete = true;
        if (item.id === 'btn-up-compresseur' && upgradesFusee.compresseur) dejaAchete = true;
        if (item.id === 'btn-up-extracteur' && upgradesFusee.extracteur) dejaAchete = true;
        if (item.id === 'btn-up-moissonneuse' && upgradesFusee.moissonneuse) dejaAchete = true;
      }

      if (dejaAchete) {
        btn.style.display = 'none';
      } 
      else if (item.id === "btn-metier-satellite" && nbSatellites >= 30) {
        btn.style.display = 'none';
      }
      else if (item.id === "btn-tech-dyson" && etapeDyson >= 4) {
        btn.style.display = 'none';
      }
      else if (item.condition() && correspondALOnglet) {
        btn.style.display = 'flex';
        btn.querySelector('.titre-item').textContent = item.titre();
        btn.querySelector('.desc-item').textContent = item.desc();
        const imgBouton = btn.querySelector('.img-item-boutique');
        if (imgBouton && typeof item.icone === 'function') {
          imgBouton.src = item.icone();
          imgBouton.style.display = 'block';
        }
        if (item.type === 'batiment') {
          btn.querySelector('.qte-item').textContent = convertirNombreCHA(item.qte());
        }

        let coutActuel = item.prix();
        let htmlPrix = "";
        let aLesFonds = true;

        for (let res in coutActuel) {
          htmlPrix += `<span><img src="${IMAGES_RESSOURCES[res]}" class="icone-ressource-img" style="width:14px;height:14px;margin-right:3px;vertical-align:middle;">${convertirNombreCHA(coutActuel[res])}</span> `;
          if (ressources[res] < coutActuel[res]) aLesFonds = false;
        }
        btn.querySelector('.prix-item').innerHTML = htmlPrix;

        if (!MODE_DEBUG && !aLesFonds) {
          btn.disabled = true;
        } else {
          btn.disabled = false;
        }

      } else {
        btn.style.display = 'none';
      }
    });

    // === 8. GESTION DU VISUEL DU HANGAR DE LA FUSÉE (Prend en compte etatFusee.lancee) ===
    const divInventions = document.getElementById('liste-inventions-fusee');
    const divUpgrades = document.getElementById('liste-ameliorations-fusee');
    
    if (divInventions) {
      // 🌟 Sécurité ajoutée pour masquer les inventions si lancée
      divInventions.style.display = (ongletActif === 'Fusée' && modeFuseeActuel === 'normale' && !etatFusee.lancee) ? 'block' : 'none';
    }
    if (divUpgrades) {
      // 🌟 Sécurité ajoutée pour afficher les upgrades si lancée
      divUpgrades.style.display = (ongletActif === 'Fusée' && modeFuseeActuel === 'normale' && etatFusee.lancee) ? 'block' : 'none';
    }

    const titreSectionsFusee = document.querySelectorAll('#boutique-fusee .section-separateur');
    titreSectionsFusee.forEach(titre => {
      titre.style.display = (ongletActif === 'Fusée' && modeFuseeActuel === 'normale') ? 'block' : 'none';
    });

    if (ongletActif === 'Base') {
      if (divUpgrades) divUpgrades.style.display = 'none';
    }

    // === 9. GESTION DES CALQUES DE PRÉVISUALISATION DU HANGAR (Fusée Normale) ===
    if (document.getElementById('img-couche-pad')) {
      document.getElementById('img-couche-pad').style.display = (ongletActif === 'Fusée' && modeFuseeActuel === 'normale' && etatFusee.pasDeTir) ? 'block' : 'none';
      document.getElementById('img-couche-moteur').style.display = (ongletActif === 'Fusée' && modeFuseeActuel === 'normale' && etatFusee.moteur && !etatFusee.moteurPose) ? 'block' : 'none';
      document.getElementById('img-couche-reservoir').style.display = (ongletActif === 'Fusée' && modeFuseeActuel === 'normale' && etatFusee.reservoir && !etatFusee.reservoirPose) ? 'block' : 'none';
      document.getElementById('img-couche-cockpit').style.display = (ongletActif === 'Fusée' && modeFuseeActuel === 'normale' && etatFusee.ordi && !etatFusee.cockpitPose) ? 'block' : 'none';
    }

    // === 10. GESTION DES PIÈCES POSÉES / FUSÉE OPÉRATIONNELLE (SÉCURITÉ POST-LANCEMENT) ===
    const blocFuseeGlobal = document.getElementById('couches-fusee-normale');
    
    if (etatFusee.lancee) {
      // 🌟 CORRECTION : On n'affiche la grosse fusée normale QUE si on est dans le mode 'normale'
      if (modeFuseeActuel === 'normale' && ongletActif === 'Fusée') {
        if (blocFuseeGlobal) blocFuseeGlobal.style.display = 'block';
        document.getElementById('piece-posee-moteur').style.display = 'block';
        document.getElementById('piece-posee-reservoir').style.display = 'block';
        document.getElementById('piece-posee-cockpit').style.display = 'block';
      } else {
        // Si on est en mode interstellaire (ou sur un autre onglet), on cache le gros plan terrestre !
        if (blocFuseeGlobal) blocFuseeGlobal.style.display = 'none';
        document.getElementById('piece-posee-moteur').style.display = 'none';
        document.getElementById('piece-posee-reservoir').style.display = 'none';
        document.getElementById('piece-posee-cockpit').style.display = 'none';
      }
    }

    // === 11. VISUELS FUSÉE INTERSTELLAIRE ET HUD (Méditation) ===
    if (document.getElementById('piece-inter-coque')) {
      document.getElementById('piece-inter-coque').style.display = (modeFuseeActuel === 'interstellaire' && elementsInterstellaires.coque) ? 'block' : 'none';
      document.getElementById('piece-inter-reservoir').style.display = (modeFuseeActuel === 'interstellaire' && elementsInterstellaires.reservoir) ? 'block' : 'none';
      document.getElementById('piece-inter-propulseur').style.display = (modeFuseeActuel === 'interstellaire' && elementsInterstellaires.propulseur) ? 'block' : 'none';
    }

    const blocMeditation = document.getElementById('hud-meditation-temps');
    if (blocMeditation) {
      blocMeditation.style.display = techActivees.meditation ? 'flex' : 'none';
    }

    // === 12. ÉVOLUTION VISUELLE DES PLANÈTES (BASE) ===
    // === 12. ÉVOLUTION VISUELLE DES PLANÈTES / BÂTIMENTS (BASE) ===
    
    // 1. Évolution Visuelle de la Forêt (Bois)
    const imgPlaneteBois = document.getElementById('img-bois');
    if (imgPlaneteBois) {
      if (upgradesActivees.boisQuantique) {
        imgPlaneteBois.src = "images/batiments/arbres4.png";
      } else if (techActivees.foret2) { 
        imgPlaneteBois.src = "images/batiments/arbres3.png";
      } else if (upgradesActivees.bois2) {
        imgPlaneteBois.src = "images/batiments/arbres2.png";
      } else if (upgradesActivees.bois1) {
        imgPlaneteBois.src = "images/batiments/arbres1.png";
      } else {
        imgPlaneteBois.src = "images/batiments/arbres.png";
      }
    }

    // 2. Évolution Visuelle de la Carrière (Pierre)
    const imgPlanetePierre = document.getElementById('img-pierre');
    if (imgPlanetePierre) {
      if (upgradesActivees.pierreQuantique) {
        imgPlanetePierre.src = "images/batiments/mines4.png";
      } else if (techActivees.mine2) { 
        imgPlanetePierre.src = "images/batiments/mines3.png";
      } else if (upgradesActivees.pierre2) { // 🌟 Changé de pierre2 à upgradesActivees.pierre2
        imgPlanetePierre.src = "images/batiments/mines2.png";
      } else if (upgradesActivees.pierre1) { // 🌟 Changé de pierre1 à upgradesActivees.pierre1
        imgPlanetePierre.src = "images/batiments/mines.png";
      } else {
        imgPlanetePierre.src = "images/batiments/pierre.png";
      }
    }

    // 3. Évolution Visuelle de l'Énergie (Centrales)
    const imgPlaneteEnergie = document.getElementById('img-energie');
    if (imgPlaneteEnergie) {
      if (nbCentrales >= 50) {
        imgPlaneteEnergie.src = "images/batiments/nucleaire.png";
      } else if (nbCentrales >= 25) {
        imgPlaneteEnergie.src = "images/batiments/renouvelable.png";
      } else if (nbCentrales >= 10) {
        imgPlaneteEnergie.src = "images/batiments/usine_charbon.png";
      } else {
        imgPlaneteEnergie.src = "images/batiments/moulin.png";
      }
    }

    // === 13. GESTION DES BOUTONS DE LANCEMENT FINAUX (Vérification et Tremblement) ===
    const btnLancerFinal = document.getElementById('btn-lancer-voyage-final');
    if (btnLancerFinal) {
      const toutesPiecesAchetees = (elementsInterstellaires.coque && elementsInterstellaires.reservoir && elementsInterstellaires.propulseur);
      // On ne l'affiche que si toutes les pièces sont là, qu'on est en mode interstellaire et que le voyage n'a pas encore démarré
      if (toutesPiecesAchetees && modeFuseeActuel === 'interstellaire' && !voyageDemarre && ongletActif === 'Fusée') {
        btnLancerFinal.style.display = 'block';
      } else {
        btnLancerFinal.style.display = 'none';
      }
    }
}

// 🌟 SORTI DU TIMER : La variable doit rester globale pour conserver l'état entre les tics !
  let derniereTrancheSec = -1;
  // 🌟 SÉCURITÉ ANTI-TRICHE ET CLAMP FUSEAU HORAIRE :
  let dernierTempsPcEnregistre = Date.now();

  setInterval(() => {
    const tempsPcActuel = Date.now();
    
    // Traque de la triche sur le temps écoulé
    const ecartCalculé = tempsPcActuel - dernierTempsPcEnregistre;
    if (ecartCalculé < 0 || ecartCalculé > 2000) {
      decalageHeureReelleMs -= (tempsPcActuel - dernierTempsPcEnregistre - 100);
      console.warn("[SÉCURITÉ] Modification de l'horloge détectée et neutralisée !");
    }
    dernierTempsPcEnregistre = tempsPcActuel;

    // 🌟 CORRECTION ICI : Utilisation de notre fonction synchronisée et localisée en France
    let maintenant = obtenirDateFrancaiseReelle();

    // Extraction des heures pour l'Happy Hour et le calendrier
    let heureReelleActuelle = maintenant.getHours(); 
    const secondesReelles = maintenant.getSeconds();
    
    // 🌍 SYNCHRO TEMPS VIRTUEL COMPACTE (1 jour unique par tranche de 10s réelle)
    const trancheActuelle = Math.floor(secondesReelles / 10) * 10;

    if (trancheActuelle !== derniereTrancheSec) {
      if (derniereTrancheSec !== -1) { 
        avancerCalendrierVirtuel(1);
      }
      derniereTrancheSec = trancheActuelle;
    }

    // 🕒 CALCUL DE L'HEURE RÉELLE EN BASE 5
    let hCHA = convertirNombreCHA(maintenant.getHours()).toString();
    let mCHA = convertirNombreCHA(maintenant.getMinutes()).toString();
    let sCHA = convertirNombreCHA(secondesReelles).toString();

    // On n'ajoute le 0 de tête QUE si la page est TRADUITE (temps normal)
    if (document.body.classList.contains('traduit')) {
      if (maintenant.getHours() < 10) hCHA = "0" + hCHA;
      if (maintenant.getMinutes() < 10) mCHA = "0" + mCHA;
      if (secondesReelles < 10) sCHA = "0" + sCHA;
    }

    document.getElementById('txt-heure-reelle').textContent = `${hCHA}:${mCHA}:${sCHA}`;

    // 🌌 VERIFICATION HAPPY HOUR (De 20h00 à 05h59 du matin)
    let multiplicateurHappyHour = 1.0;
    heureReelleActuelle = maintenant.getHours();
    if (happyHourAchete && (heureReelleActuelle >= 20 || heureReelleActuelle < 6)) {
      multiplicateurHappyHour = 2.0; // Double toutes les productions !
    }

    let gainBois = ((nbBucherons * 0.1) * multiplicateursPassifs.bois) * multiplicateurHappyHour;
    let gainPierre = ((nbMineurs * 0.2) * multiplicateursPassifs.pierre) * multiplicateurHappyHour;
    let rpsEnergieRaw = nbCentrales >= 50 ? 50.0 : (nbCentrales >= 25 ? 10.0 : (nbCentrales >= 10 ? 2.0 : 0.5));
    let gainEnergie = ((nbCentrales * rpsEnergieRaw) * multiplicateursPassifs.energie) * multiplicateurHappyHour;
    let gainConnaissance = (nbAstronomes * 0.5) * multiplicateurHappyHour;
    // 🧠 1. CALCUL DE LA PRODUCTION DES LASERS AUTOMATIQUES
    let rpsLasersBase = (lasersVoyage.tourelle * 1) + (lasersVoyage.canon * 10) + (lasersVoyage.ia * 100);
    
    // 🛸 2. PRODUCTION DU MOISSONNEUR DU VIDE (Commence à 100/s puis exponentiel indépendant par niveau)
    let rpsMoissonneurPassif = 0;
    if (lvlVoyageMoissonneurVide > 0) {
      rpsMoissonneurPassif = Math.floor(100 * Math.pow(1.15, lvlVoyageMoissonneurVide - 1));
    }

    // 💥 3. APPLICATION DU MULTIPLICATEUR RECTILIGNE (x2 cumulatif par achat de Moissonneur)
    let multiMoissonneurGlobal = Math.pow(2, lvlVoyageMoissonneurVide);

    let rpsMatiereNoire = (rpsLasersBase + rpsMoissonneurPassif) * multiMoissonneurGlobal * multiplicateurHappyHour;

    ressources.bois += gainBois / 10;
    ressources.pierre += gainPierre / 10;
    ressources.energie += gainEnergie / 10;
    ressources.connaissance += gainConnaissance / 10;
    
    if (voyageDemarre) {
      ressources.matiereNoire += rpsMatiereNoire / 10;
    }

    // 🚀 GAIN DES ROCHES STELLAIRES (Doublé aussi sous Happy Hour !)
    if (etatFusee.lancee) {
      ressources.roches += ((1 * multiplicateursPassifs.roches) * multiplicateurHappyHour) / 10;
    }

    if (ongletActif === 'Espace') {
      mettreAjourBrouillardSpatial();
    }

    mettreAjourInterface();
  }, 100);

  // Clics manuels planètes
  document.querySelectorAll('.zone-clic-ressource').forEach(zone => {
    zone.addEventListener('click', (e) => {
      const type = zone.dataset.ressource;
      ressources[type] += clics[type];

      if (type === 'bois') {
        SON_CLIC_BOIS.currentTime = 0;
        SON_CLIC_BOIS.play().catch(err => console.log("[AUDIO] Son bois.mp3 manquant ou bloqué."));
      } 
      else if (type === 'pierre') {
        SON_CLIC_PIERRE.currentTime = 0;
        SON_CLIC_PIERRE.play().catch(err => console.log("[AUDIO] Son pierre.mp3 manquant ou bloqué."));
      } 
      else if (type === 'energie') {
        SON_CLIC_ELEC.currentTime = 0;
        SON_CLIC_ELEC.play().catch(err => console.log("[AUDIO] Son elec.mp3 manquant ou bloqué."));
      }
      
      if(type === 'bois' && etapeTutoRotateOk && !etapeTutoClicOk) {
        etapeTutoClicOk = true;
        document.getElementById('tuto-clic').style.opacity = '0';
        setTimeout(() => document.getElementById('tuto-clic').style.display = 'none', 400);
      }
      mettreAjourInterface();
    });
  });

  // Gestion Onglets (simplifiée vu que la boutique gère son affichage)
  const onglets = document.querySelectorAll('.onglet');
  const vues = {
    'Base': document.getElementById('vue-base'),
    'Traduction': document.getElementById('vue-trad'),
    'Observation': document.getElementById('vue-observ'),
    'Fusée': document.getElementById('vue-fusee'),
    'Espace': document.getElementById('vue-espace'),
    'Voyage Final': document.getElementById('vue-voyage'),
  };
  const blocRessources = document.querySelector('.affichage-ressources');
  const blocBoutique = document.querySelector('.zone-boutique');

  onglets.forEach(onglet => {
    onglet.addEventListener('click', () => {
      onglet.classList.remove('nouveau-clignotant');
      const nom = onglet.textContent.trim();
      ongletActif = nom; // 🌟 Changement ici : on affecte la variable globale
      onglets.forEach(o => o.classList.remove('actif'));
      onglet.classList.add('actif');
      Object.values(vues).forEach(v => { if(v) v.style.display = 'none'; });
      const bEspace = document.getElementById('boutique-espace');
      if (bEspace) bEspace.style.display = 'none';

      if (vues[nom]) vues[nom].style.display = 'block';

      if (nom === 'Traduction') {
        if (blocRessources) blocRessources.style.display = 'none';
        if (blocBoutique) blocBoutique.style.display = 'none';
      } 
      
      else if (nom === 'Observation') {
        if (blocRessources) {
          blocRessources.style.display = 'flex';
          blocRessources.style.background = 'transparent';
          blocRessources.style.borderBottom = 'none';
          document.getElementById('bloc-bois').style.display = 'none';
          document.getElementById('bloc-pierre').style.display = 'none';
          document.getElementById('bloc-energie').style.display = 'none';
          document.getElementById('bloc-connaissance').style.display = 'flex';
          document.getElementById('bloc-roches').style.display = 'none'; 
        }
        if (blocBoutique) {
          blocBoutique.style.display = 'flex';
          document.getElementById('boutique-terrestre').style.display = 'none'; 
          document.getElementById('boutique-observatoire').style.display = 'block'; 
        }
        
        mettreAjourCouleurCiel();
        initialiserControlesEspace();
        
        const btnOuvrir = document.getElementById('btn-ouvrir-livre');
        if (btnOuvrir) btnOuvrir.style.display = techActivees.livre ? 'block' : 'none';

        // 🌟 FORCE LE CALCUL DYNAMIQUE DU CIEL DU 9 OCTOBRE CONSTAMMENT
        initialiserLeCiel();

        if (!tutoObservationFait) {
          document.getElementById('modal-tuto-spatial').style.display = 'flex';
          tutoObservationFait = true;
        }
      }

      else if (nom === 'Base') {
        if (blocRessources) {
          blocRessources.style.display = 'flex';
          blocRessources.style.background = 'transparent'; 
          blocRessources.style.borderBottom = 'none'; 
          document.getElementById('bloc-bois').style.display = 'flex';
          document.getElementById('bloc-pierre').style.display = upgradePierreAchetee ? 'flex' : 'none';
          document.getElementById('bloc-energie').style.display = planCentraleAchete ? 'flex' : 'none';
          document.getElementById('bloc-connaissance').style.display = 'none';
        }
        if (blocBoutique) {
          blocBoutique.style.display = 'flex';
          document.getElementById('boutique-terrestre').style.display = 'block'; 
          document.getElementById('boutique-observatoire').style.display = 'none';
        }
      }

      else if (nom === 'Fusée') {
        if (blocRessources) {
          blocRessources.style.display = 'flex';
          blocRessources.style.background = 'transparent';
          blocRessources.style.borderBottom = 'none';
          
          document.getElementById('bloc-bois').style.display = 'flex';
          document.getElementById('bloc-pierre').style.display = 'flex';
          document.getElementById('bloc-energie').style.display = 'flex'; 
          document.getElementById('bloc-connaissance').style.display = 'flex'; 
          document.getElementById('bloc-roches').style.display = etatFusee.lancee ? 'flex' : 'none';
        }
        if (blocBoutique) {
          blocBoutique.style.display = 'flex';
          document.getElementById('boutique-terrestre').style.display = 'none'; 
          document.getElementById('boutique-observatoire').style.display = 'none'; 
          document.getElementById('boutique-fusee').style.display = 'block';
        }
      }

      else if (nom === 'Espace') {
        
        if (premiereFoisOngletEspace){
          premiereFoisOngletEspace = false;
          changerMusiqueTemporaire("sons/ambiance/outerwild.mp3");
        }

        if (blocRessources) {
          blocRessources.style.display = 'flex';
          blocRessources.style.background = 'transparent';
          blocRessources.style.borderBottom = 'none';
          
          // 🔓 COMPOSITION COMPLÈTE DU TABLEAU DE BORD : Bois + Pierre + Énergie + Roches
          document.getElementById('bloc-bois').style.display = 'flex';         // Allumé !
          document.getElementById('bloc-pierre').style.display = 'flex';       // Allumé !
          document.getElementById('bloc-energie').style.display = 'flex';      // Allumé !
          document.getElementById('bloc-connaissance').style.display = 'none'; // Masqué !
          document.getElementById('bloc-roches').style.display = 'flex';       // Allumé !
        }
        
        if (blocBoutique) {
          blocBoutique.style.display = 'flex';
          document.getElementById('boutique-terrestre').style.display = 'none'; 
          document.getElementById('boutique-observatoire').style.display = 'none'; 
          document.getElementById('boutique-fusee').style.display = 'none';
          document.getElementById('boutique-espace').style.display = 'block';
        }
        
        const vueEspace = document.getElementById('vue-espace');
        if (vueEspace) {
          if (premierChargementEspace) {
            zoomActuel = 6.0; 
            const radFelina = (anglesPlanetes.felina - 90) * Math.PI / 180;
            const felinaX = Math.cos(radFelina) * 190;
            const felinaY = Math.sin(radFelina) * 190;

            panX = -(felinaX * zoomActuel);
            panY = -((felinaY - 190) * zoomActuel); 
            
            premierChargementEspace = false;
          }
          appliquerTransformationsCamera();
        }

        configurerControlesInteractifsEspace();
      }

      else if (nom === 'Voyage Final') {
        if (premiereFoisOngletVoyage){
          premiereFoisOngletVoyage = false;
          changerMusiqueTemporaire("sons/ambiance/resurrection.mp3");
        }

        if (blocRessources) {
          blocRessources.style.display = 'flex';
          blocRessources.style.background = 'transparent';
          blocRessources.style.borderBottom = 'none';
          
          // On cache tout l'ancien monde...
          document.getElementById('bloc-bois').style.display = 'none';
          document.getElementById('bloc-pierre').style.display = 'none';
          document.getElementById('bloc-energie').style.display = 'none';
          document.getElementById('bloc-connaissance').style.display = 'none';
          document.getElementById('bloc-roches').style.display = 'none';
          
          // ... pour ne garder que la Matière Noire !
          const blocMN = document.getElementById('bloc-matiere-noire');
          if (blocMN) blocMN.style.display = 'flex';
        }
        
        if (blocBoutique) {
          blocBoutique.style.display = 'flex';
          document.getElementById('boutique-terrestre').style.display = 'none'; 
          document.getElementById('boutique-observatoire').style.display = 'none'; 
          document.getElementById('boutique-fusee').style.display = 'none';
          document.getElementById('boutique-espace').style.display = 'none';
          
          // On affiche la boutique des lasers et moteurs
          const bVoyage = document.getElementById('boutique-voyage');
          if (bVoyage) bVoyage.style.display = 'block';
        }
      }

      mettreAjourInterface();
    });
  });

  const planete = document.getElementById('planete-terre');
  let anglePlanete = 0;
  window.addEventListener('wheel', (evenement) => {
    if (document.getElementById('vue-base').style.display === 'none') return; 
    if (evenement.deltaY > 0) anglePlanete += 5;
    else if (evenement.deltaY < 0) anglePlanete -= 5;
    planete.style.transform = `rotate(${anglePlanete}deg)`;

    if(!etapeTutoRotateOk) {
      etapeTutoRotateOk = true;
      document.getElementById('tuto-scroll').style.opacity = '0';
      setTimeout(() => {
        document.getElementById('tuto-scroll').style.display = 'none';
        if(!etapeTutoClicOk) {
          const iconeClic = document.getElementById('tuto-clic');
          iconeClic.style.display = 'block';
          setTimeout(() => iconeClic.style.opacity = '1', 50);
        }
      }, 400);
    }
  });


  /* =========================================================================
     ⚙️ FONCTIONNALITÉS CONSERVÉES À L'IDENTIQUE : TRADUCTION & CONSTELLATIONS
     ========================================================================= */

  const alphabetReponses = { 'A':'A','B':'B','C':'C','D':'D','E':'E','F':'F','G':'G','H':'H','I':'I','J':'J','K':'K','L':'L','M':'M','N':'N','O':'O','P':'P','Q':'Q','R':'R','S':'S','T':'T','U':'U','V':'V','W':'W','X':'X','Y':'Y','Z':'Z' };
  const grilleCHA = document.getElementById('grille-lettres-cha');
  const btnTradGlobale = document.getElementById('btn-traduction-globale');

  let lettresMelangees = Object.keys(alphabetReponses);
  for (let i = lettresMelangees.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lettresMelangees[i], lettresMelangees[j]] = [lettresMelangees[j], lettresMelangees[i]];
  }

  lettresMelangees.forEach(lettre => {
    const boite = document.createElement('div');
    boite.className = 'lettre-boite';
    const symbole = document.createElement('span');
    symbole.className = 'symbole-cha';
    symbole.textContent = lettre; 
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1; 
    input.className = 'input-trad';
    input.dataset.lettreOriginale = lettre;
    if (MODE_DEBUG) { input.value = lettre; input.classList.add('correct'); }
    input.addEventListener('input', () => {
      input.classList.remove('correct', 'incorrect');
      input.value = input.value.toUpperCase(); 
      verifierRemplissageGrille();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === "Backspace" || e.key === "Delete") input.classList.remove('correct', 'incorrect');
    });
    boite.appendChild(symbole);
    boite.appendChild(input);
    grilleCHA.appendChild(boite);
  });
  verifierRemplissageGrille();

  function verifierRemplissageGrille() {
    const inputs = document.querySelectorAll('.input-trad');
    let toutesLesCasesRemplies = true;
    inputs.forEach(input => { if (input.value.toUpperCase().trim() === "") toutesLesCasesRemplies = false; });
    if (toutesLesCasesRemplies) {
      btnTradGlobale.removeAttribute('disabled');
      btnTradGlobale.style.borderColor = 'var(--accent)';
      btnTradGlobale.textContent = "Vérifier les correspondances";
    } else {
      btnTradGlobale.setAttribute('disabled', 'true');
      btnTradGlobale.style.borderColor = '#3d4146';
      btnTradGlobale.textContent = "Complétez les 26 lettres pour tenter le décodage";
    }
  }

  btnTradGlobale.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.input-trad');
    let sansErreur = true;
    inputs.forEach(input => {
      if (input.value.toUpperCase().trim() === input.dataset.lettreOriginale) {
        input.classList.add('correct'); input.classList.remove('incorrect');
      } else {
        input.classList.add('incorrect'); input.classList.remove('correct'); sansErreur = false; 
      }
    });
    if (sansErreur) {
      SON_SUCCES.currentTime = 0;
      SON_SUCCES.play();
      document.body.classList.add('traduit');
      avancerCalendrierVirtuel(0);
      btnTradGlobale.textContent = "Traduction intégrée avec succès !";
      btnTradGlobale.setAttribute('disabled', 'true');
      btnTradGlobale.style.borderColor = '#3d4146';
      const alphabetNormal = Object.keys(alphabetReponses); 
      grilleCHA.innerHTML = ""; 
      alphabetNormal.forEach(lettre => {
        const boite = document.createElement('div');
        boite.className = 'lettre-boite';
        boite.innerHTML = `<span class="symbole-cha">${lettre}</span><input type="text" class="input-trad correct" value="${lettre}" disabled>`;
        grilleCHA.appendChild(boite);
      });
    } else {
      SON_ECHEC.currentTime = 0;
      SON_ECHEC.play();
      btnTradGlobale.textContent = "Erreurs détectées. Corrigez les cases rouges !";
      btnTradGlobale.style.borderColor = '#ff4d4d';
    }
  });

  function mettreAjourCouleurCiel() {
    const cielObserv = document.getElementById('carte-du-ciel');
    const hangarFusee = document.getElementById('hangar-visuel-fusee');
    const vueBase = document.getElementById('vue-base'); 
    const vueEspace = document.getElementById('vue-espace'); 
    const fondEtoilesEspace = document.getElementById('fond-etoiles-espace'); 

    const maintenant = obtenirDateFrancaiseReelle();
    const heure = maintenant.getHours();
    let couleurFond = ""; 
    let estLaNuit = false;

    if (heure >= 6 && heure < 8) {
      couleurFond = "linear-gradient(to bottom, #1f305e, #e66465)";
    } else if (heure >= 8 && heure < 17) {
      couleurFond = "linear-gradient(to bottom, #1a81b3, #6cb6db)";
    } else if (heure >= 17 && heure < 20) {
      couleurFond = "linear-gradient(to bottom, #2c3e50, #fd746c)";
    } else {
      couleurFond = "linear-gradient(to bottom, #050508, #111424)";
      estLaNuit = true;
    }

    // 🌟 On génère la chaîne des étoiles ET leurs règles de répétition (Correctif du demi-ciel)
    if (!window.chaineEtoilesNuit) {
      let bgString = [];
      const couleurs = ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#cceeff', '#ffffcc', '#ff6666', '#66ff66', '#99ccff', '#ffcc00', '#ff99ff'];
      for(let i = 0; i < 90; i++) { 
          let x = Math.floor(Math.random() * 600);
          let y = Math.floor(Math.random() * 600);
          let size = Math.random() * 2.5 + 0.5;
          let col = couleurs[Math.floor(Math.random() * couleurs.length)];
          bgString.push(`radial-gradient(circle at ${x}px ${y}px, ${col} ${size}px, transparent ${size + 1}px)`);
      }
      window.chaineEtoilesNuit = bgString.join(', ');
      
      // On donne la taille 600x600px et l'ordre de se répéter à CHACUNE des 90 étoiles
      window.chaineTaillesNuit = Array(90).fill('600px 600px').join(', ') + ', 100% 100%';
      window.chaineRepetNuit = Array(90).fill('repeat').join(', ') + ', no-repeat';
    }

    // 1. OBSERVATOIRE (Dégradé uniquement)
    if (cielObserv) {
      cielObserv.style.background = couleurFond;
      cielObserv.style.backgroundSize = "100% 100%";
      cielObserv.style.backgroundRepeat = "no-repeat";
    }

    // 2. BASE & FUSÉE (Dégradé + Étoiles CSS qui tapissent l'écran sans se couper)
    [hangarFusee, vueBase].forEach(el => {
      if (el) {
        el.style.background = estLaNuit ? `${window.chaineEtoilesNuit}, ${couleurFond}` : couleurFond;
        el.style.backgroundSize = estLaNuit ? window.chaineTaillesNuit : "100% 100%";
        el.style.backgroundRepeat = estLaNuit ? window.chaineRepetNuit : "no-repeat";
      }
    });

    // 3. ESPACE (Toujours le noir profond de l'espace, jour et nuit !)
    if (vueEspace) {
        vueEspace.style.background = "#050508";
        vueEspace.style.backgroundSize = "100% 100%";
    }

    // 🌟 ÉTOILES DOM DE L'ESPACE : TOUJOURS VISIBLES !
    if (fondEtoilesEspace) {
      fondEtoilesEspace.style.opacity = "1";
    }
  }

  setInterval(mettreAjourCouleurCiel, 60000);

  const PATTERNS_CONSTELLATIONS = [
    { nom: "Bélier", etoiles: [{ id: 0, x: 19, y: 54 },{ id: 1, x: 50, y: 40 },{ id: 2, x: 67, y: 36 },{ id: 3, x: 80, y: 40 }], liensAttendus: [[0, 1], [1, 2], [2, 3]] },
    { nom: "Taureau", etoiles: [{ id: 0, x: 30, y: 13 },{ id: 1, x: 37, y: 40 },{ id: 2, x: 8, y: 38 },{ id: 3, x: 52, y: 56 },{ id: 4, x: 85, y: 67 }], liensAttendus: [[0,1],[1,2],[1,3],[3,4]] },
    { nom: "Gémeaux", etoiles: [{ id: 0, x: 20, y: 17 },{ id: 1, x: 33, y: 38 },{ id: 2, x: 14, y: 45 },{ id: 3, x: 47, y: 66 },{ id: 4, x: 57, y: 83 },{ id: 5, x: 29, y: 76 },{ id: 6, x: 39, y: 90 },{ id: 7, x: 65, y: 28 },{ id: 8, x: 51, y: 12 },{ id: 9, x: 77, y: 15 },{ id: 10, x: 79, y: 55 },{ id: 11, x: 80, y: 73 },{ id: 12, x: 93, y: 61 }], liensAttendus: [[0,1], [1,2], [1,3], [3,4], [3,5], [5,6], [1,7], [7,8], [7,9], [7,10],[10,11], [10,12]] },
    { nom: "Cancer", etoiles: [{ id: 0, x: 45, y: 15 },{ id: 1, x: 48, y: 40 },{ id: 2, x: 50, y: 60 },{ id: 3, x: 25, y: 80 },{ id: 4, x: 75, y: 75 }], liensAttendus: [[0, 1], [1, 2], [2, 3], [2, 4]] },
    { nom: "Lion", etoiles: [{ id: 0, x: 13, y: 25 },{ id: 1, x: 36, y: 15 },{ id: 2, x: 35, y: 85 },{ id: 3, x: 69, y: 47 },{ id: 4, x: 88, y: 72 },{ id: 5, x: 27, y: 61 }], liensAttendus: [[0,1],[1,5],[5,3],[3,4],[4,2],[2,5]] },
    { nom: "Vierge", etoiles: [{ id: 0, x: 15, y: 16 },{ id: 1, x: 32, y: 32 },{ id: 2, x: 56, y: 34 },{ id: 3, x: 73, y: 27 },{ id: 4, x: 29, y: 65 },{ id: 5, x: 38, y: 84 },{ id: 6, x: 58, y: 57 },{ id: 7, x: 76, y: 72 }], liensAttendus: [[0,1], [1,2], [2,3], [2,6], [6,4], [1,4], [6, 7], [4, 5]] },
    { nom: "Balance", etoiles: [{ id: 0, x: 50, y: 20 },{ id: 1, x: 25, y: 45 },{ id: 2, x: 75, y: 50 },{ id: 3, x: 20, y: 80 },{ id: 4, x: 80, y: 85 }], liensAttendus: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4]] },
    { nom: "Scorpion", etoiles: [{ id: 0, x: 40, y: 40 },{ id: 1, x: 47, y: 18 },{ id: 2, x: 12, y: 31 },{ id: 3, x: 27, y: 17 },{ id: 4, x: 50, y: 73 },{ id: 5, x: 71, y: 80 },{ id: 6, x: 82, y: 68 },{ id: 7, x: 70, y: 55 }], liensAttendus: [[0,1], [0,2], [0,3], [0,4], [4,5], [5,6], [6,7]] },
    { nom: "Sagittaire", etoiles: [{ id: 0, x: 68, y: 73 },{ id: 1, x: 85, y: 45 },{ id: 2, x: 38, y: 49 },{ id: 3, x: 16, y: 35 },{ id: 4, x: 24, y: 74 },{ id: 5, x: 57, y: 20 }], liensAttendus: [[0, 1], [1, 2], [2, 3], [2, 4], [2,5]] },
    { nom: "Capricorne", etoiles: [{ id: 0, x: 50, y: 70 },{ id: 1, x: 13, y: 37 },{ id: 2, x: 46, y: 44 },{ id: 3, x: 89, y: 25 }], liensAttendus: [[0, 1], [1, 2], [2, 3], [3, 0]] },
    { nom: "Verseau", etoiles: [{ id: 0, x: 40, y: 80 },{ id: 1, x: 20, y: 60 },{ id: 2, x: 15, y: 30 },{ id: 3, x: 53, y: 14 },{ id: 4, x: 62, y: 42 },{ id: 5, x: 92, y: 24 }], liensAttendus: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5]] },
    { nom: "Poissons", etoiles: [{ id: 0, x: 49, y: 12 },{ id: 1, x: 14, y: 70 },{ id: 2, x: 55, y: 61 },{ id: 3, x: 74, y: 52 },{ id: 4, x: 82, y: 68 },{ id: 5, x: 64, y: 75 }], liensAttendus: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,2]] }
  ];
  PATTERNS_CONSTELLATIONS.sort((a, b) => a.nom.localeCompare(b.nom));
  let etoileSelectionnee = null;
  let constellationsActives = [];

  function initialiserControlesEspace() {
    const fenetreCiel = document.getElementById('carte-du-ciel');
    if (fenetreCiel) fenetreCiel.style.cursor = 'default';
  }

  function initialiserLeCiel() {
    const conteneur = document.getElementById('conteneur-etoiles');
    const svg = document.getElementById('calque-liens-global');
    if (!conteneur || !svg) return;

    if (constellationsActives.length === 0 && !document.getElementById('etoile-speciale-observatoire')) {
      let indexChoisis = [];
      while(indexChoisis.length < 3) {
        let r = Math.floor(Math.random() * PATTERNS_CONSTELLATIONS.length);
        if(!indexChoisis.includes(r)) indexChoisis.push(r);
      }
      indexChoisis.forEach(indexPattern => genererConstellationSansCollision(indexPattern));
      actualiserPositionsCiel();
    }

    let etoileSpeciale = document.getElementById('etoile-speciale-observatoire');

    if (cielMystereActif) {
      svg.style.display = "none";
      const constellesBoites = conteneur.querySelectorAll('.etoile-celeste');
      constellesBoites.forEach(el => el.style.display = "none");

      if (!etoileSpeciale) {
        etoileSpeciale = document.createElement('div');
        etoileSpeciale.id = 'etoile-speciale-observatoire';
        etoileSpeciale.style.position = "absolute";
        etoileSpeciale.style.left = "50%";
        etoileSpeciale.style.top = "50%";
        etoileSpeciale.style.transform = "translate(-50%, -50%) scale(3.5)"; 
        etoileSpeciale.style.width = "24px";
        etoileSpeciale.style.height = "24px";
        etoileSpeciale.style.display = "flex";
        etoileSpeciale.style.alignItems = "center";
        etoileSpeciale.style.justifyContent = "center";
        etoileSpeciale.style.cursor = "pointer"; 
        etoileSpeciale.style.pointerEvents = "auto"; 
        
        const imgCentrale = document.createElement('img');
        imgCentrale.src = "images/espace/etoile.png";
        imgCentrale.style.width = "100%"; 
        imgCentrale.style.height = "100%";
        imgCentrale.style.objectFit = "contain";
        imgCentrale.style.filter = "drop-shadow(0 0 6px #ffed4a) drop-shadow(0 0 15px var(--accent))"; 
        etoileSpeciale.appendChild(imgCentrale);

        etoileSpeciale.addEventListener('click', (e) => {
          e.preventDefault();
          if (!plansInterstellairesDebloques) {
            plansInterstellairesDebloques = true;
            ouvrirNotificationCHA("Plan débloqué","Après avoir vu de vos propres yeux l'Étoile, vous débloquez les plans de la fusée interstellaire !");
            mettreAjourInterface();
            SON_REUSSITE_ETOILE.currentTime = 0;
            SON_REUSSITE_ETOILE.play(); 
          } else {
            ouvrirNotificationCHA("Plan déjà débloqué","Les plans de la fusée interstellaire sont déjà enregistrés dans vos banques de données.")
          }
        });
        conteneur.appendChild(etoileSpeciale);
      }
      etoileSpeciale.style.display = "flex";

    } else {
      if (etoileSpeciale) {
        etoileSpeciale.style.display = "none";
      }
      svg.style.display = "block";
      const constellesBoites = conteneur.querySelectorAll('.etoile-celeste');
      constellesBoites.forEach(el => el.style.display = "block");
      actualiserPositionsCiel();
    }
  }

  function genererConstellationSansCollision(indexPattern) {
    let offsetX = 0, offsetY = 0, hitboxProposee = {}, positionValide = false, tentatives = 0;
    while (!positionValide && tentatives < 1500) {
      tentatives++;
      offsetX = Math.floor(Math.random() * 75) + 2;
      offsetY = Math.floor(Math.random() * 70) + 5;
      hitboxProposee = calculerHitboxConstellation(indexPattern, offsetX, offsetY);
      if (hitboxProposee.xMin < 2 || hitboxProposee.xMax > 96 || hitboxProposee.yMin < 4 || hitboxProposee.yMax > 94) continue; 
      if (hitboxProposee.xMax > 65 && hitboxProposee.yMax > 60) continue; 
      let collisionTrouvee = false;
      for (let i = 0; i < constellationsActives.length; i++) {
        if (verifierIntersectionHitbox(hitboxProposee, constellationsActives[i].hitbox)) { collisionTrouvee = true; break; }
      }
      if (!collisionTrouvee) positionValide = true; 
    }
    if (!positionValide) {
      offsetX = Math.floor(Math.random() * 30) + 5; offsetY = Math.floor(Math.random() * 30) + 5;
      hitboxProposee = calculerHitboxConstellation(indexPattern, offsetX, offsetY);
    }
    ajouterConstellationDonneesFixe(indexPattern, offsetX, offsetY, hitboxProposee);
  }

  function ajouterConstellationDonneesFixe(indexPattern, offsetX, offsetY, hitbox) {
    const donnees = PATTERNS_CONSTELLATIONS[indexPattern];
    if (!donnees) return;
    const constobj = { indexPattern: indexPattern, offsetX: offsetX, offsetY: offsetY, hitbox: hitbox, liensJoueur: [], elementsEtoiles: [] };
    const conteneur = document.getElementById('conteneur-etoiles');
    
    // Même palette de couleurs vives que ton espace et ton voyage final !
    const couleurs = ['#ffffff', '#ffffff', '#ffffff', '#cceeff', '#ffffcc', '#ff6666', '#66ff66', '#99ccff', '#ffcc00', '#ff99ff'];

    donnees.etoiles.forEach(etoile => {
      const divEtoile = document.createElement('div');
      divEtoile.className = 'etoile-celeste';
      divEtoile.style.position = "absolute";
      let xPct = (etoile.x * 0.25) + offsetX;
      let yPct = (etoile.y * 0.25) + offsetY;
      divEtoile.style.left = `${xPct}%`; divEtoile.style.top = `${yPct}%`;
      
      // 🌟 ATTRIBUTION DE LA COULEUR ALÉATOIRE :
      let col = couleurs[Math.floor(Math.random() * couleurs.length)];
      divEtoile.style.backgroundColor = col;
      divEtoile.style.boxShadow = `0 0 6px ${col}, 0 0 12px ${col}`;

      divEtoile.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); gererClicEtoileMulti(etoile.id, divEtoile, constobj); });
      conteneur.appendChild(divEtoile);
      constobj.elementsEtoiles.push({ id: etoile.id, xTheorique: xPct, yTheorique: yPct, div: divEtoile });
    });
    constellationsActives.push(constobj);
  }

  function actualiserPositionsCiel() {
    const fenetreCiel = document.getElementById('carte-du-ciel');
    const svg = document.getElementById('calque-liens-global');
    if (!fenetreCiel || !svg) return;

    let baseW = fenetreCiel.clientWidth || fenetreCiel.parentElement.clientWidth || window.innerWidth;
    let baseH = fenetreCiel.clientHeight || fenetreCiel.parentElement.clientHeight || window.innerHeight;

    // Reset du calque SVG
    svg.innerHTML = "";

    // 🌟 A. GUIDE VISUEL (Lentilles de l'Espace)
    // Si la tech est achetée, on trace les lignes cibles en pointillé bleu transparent
    if (techActivees.lentilles) {
      constellationsActives.forEach(c => {
        const configPattern = PATTERNS_CONSTELLATIONS[c.indexPattern];
        if (configPattern && configPattern.liensAttendus) {
          configPattern.liensAttendus.forEach(lien => {
            let etA = c.elementsEtoiles.find(e => e.id === lien[0]);
            let etB = c.elementsEtoiles.find(e => e.id === lien[1]);
            if (etA && etB) {
              let x1 = (etA.xTheorique / 100) * baseW;
              let y1 = (etA.yTheorique / 100) * baseH;
              let x2 = (etB.xTheorique / 100) * baseW;
              let y2 = (etB.yTheorique / 100) * baseH;
              
              // Dessin du guide : bleu cyan très doux, épaisseur 1.5, et en pointillés ('5,5')
              const ligneGuide = document.createElementNS("http://www.w3.org/2000/svg", "line");
              ligneGuide.setAttribute("x1", x1); ligneGuide.setAttribute("y1", y1);
              ligneGuide.setAttribute("x2", x2); ligneGuide.setAttribute("y2", y2);
              ligneGuide.setAttribute("stroke", "rgba(0, 210, 255, 0.25)"); 
              ligneGuide.setAttribute("stroke-width", "1.5");
              ligneGuide.setAttribute("stroke-dasharray", "5,5"); 
              svg.appendChild(ligneGuide);
            }
          });
        }
      });
    }

    // 🌟 B. LIENS DU JOUEUR (Tracé manuel)
    constellationsActives.forEach(c => {
      c.liensJoueur.forEach(lien => {
        let etA = c.elementsEtoiles.find(e => e.id === lien[0]);
        let etB = c.elementsEtoiles.find(e => e.id === lien[1]);
        if (etA && etB) {
          let x1 = (etA.xTheorique / 100) * baseW, y1 = (etA.yTheorique / 100) * baseH;
          let x2 = (etB.xTheorique / 100) * baseW, y2 = (etB.yTheorique / 100) * baseH;
          
          const ligne = document.createElementNS("http://www.w3.org/2000/svg", "line");
          ligne.setAttribute("x1", x1); ligne.setAttribute("y1", y1);
          ligne.setAttribute("x2", x2); ligne.setAttribute("y2", y2);
          ligne.setAttribute("stroke", "rgba(0, 210, 255, 0.85)"); 
          ligne.setAttribute("stroke-width", "2.5");
          svg.appendChild(ligne);
        }
      });
    });
  }

  function gererClicEtoileMulti(idEtoile, elementDiv, constobj) {
    if (etoileSelectionnee === null) {
      etoileSelectionnee = { idEtoile: idEtoile, indexPattern: constobj.indexPattern, constobj: constobj };
      elementDiv.classList.add('selectionnee');
    } else {
      if (etoileSelectionnee.indexPattern === constobj.indexPattern && etoileSelectionnee.idEtoile !== idEtoile) {
        let premier = Math.min(etoileSelectionnee.idEtoile, idEtoile);
        let deuxieme = Math.max(etoileSelectionnee.idEtoile, idEtoile);
        const indexLien = constobj.liensJoueur.findIndex(l => l[0] === premier && l[1] === deuxieme);
        if (indexLien !== -1){
          constobj.liensJoueur.splice(indexLien, 1);
          SON_DELIER.currentTime = 0;
          SON_DELIER.play();
        }
        else {
          constobj.liensJoueur.push([premier, deuxieme]);
          SON_LIER.currentTime = 0;
          SON_LIER.play();
        }
        actualiserPositionsCiel(); 
        verifierVictoireConstellationMulti(constobj);
      }
      document.querySelectorAll('.etoile-celeste').forEach(el => el.classList.remove('selectionnee'));
      etoileSelectionnee = null;
    }
  }

  function verifierVictoireConstellationMulti(constobj) {
    const config = PATTERNS_CONSTELLATIONS[constobj.indexPattern];
    if (!config) return;
    let trieAttendu = config.liensAttendus.map(l => [Math.min(l[0], l[1]), Math.max(l[0], l[1])]).sort();
    let trieJoueur = constobj.liensJoueur.map(l => [Math.min(l[0], l[1]), Math.max(l[0], l[1])]).sort();
    let gagne = (trieAttendu.length === trieJoueur.length) && trieAttendu.every((l, i) => l[0] === trieJoueur[i][0] && l[1] === trieJoueur[i][1]);
    if (gagne) {
      SON_REUSSITE_ETOILE.currentTime = 0;
      SON_REUSSITE_ETOILE.play();
      ressources.connaissance += (1 + nbEtudiants);
      constobj.elementsEtoiles.forEach(e => { if (e.div) e.div.remove(); });
      let idx = constellationsActives.findIndex(c => c.indexPattern === constobj.indexPattern);
      if (idx !== -1) constellationsActives.splice(idx, 1);
      let indexInedit, indexActuels = constellationsActives.map(c => c.indexPattern), tentativesChoix = 0;
      do { indexInedit = Math.floor(Math.random() * PATTERNS_CONSTELLATIONS.length); tentativesChoix++; } while (indexActuels.includes(indexInedit) && tentativesChoix < 50);
      genererConstellationSansCollision(indexInedit);
      etoileSelectionnee = null;
      document.querySelectorAll('.etoile-celeste').forEach(el => el.classList.remove('selectionnee'));
      actualiserPositionsCiel(); mettreAjourInterface();
    }
  }

  function calculerHitboxConstellation(indexPattern, offsetX, offsetY) {
    const config = PATTERNS_CONSTELLATIONS[indexPattern];
    if (!config || config.etoiles.length === 0) return { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
    let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
    config.etoiles.forEach(etoile => {
      let xReel = (etoile.x * 0.25) + offsetX, yReel = (etoile.y * 0.25) + offsetY;
      if (xReel < xMin) xMin = xReel; if (xReel > xMax) xMax = xReel;
      if (yReel < yMin) yMin = yReel; if (yReel > yMax) yMax = yReel;
    });
    return { xMin: xMin - 5, yMin: yMin - 5, xMax: xMax + 5, yMax: yMax + 5 };
  }

  function verifierIntersectionHitbox(box1, box2) {
    if (box1.xMax < box2.xMin || box2.xMax < box1.xMin) return false;
    if (box1.yMax < box2.yMin || box2.yMax < box1.yMin) return false;
    return true; 
  }

  let pageActuelleLivre = 0; 
  function initialiserEvenementsLivre() {
    const btnOuvrir = document.getElementById('btn-ouvrir-livre');
    const btnFermer = document.getElementById('livre-bouton-fermer');
    const btnPrev = document.getElementById('livre-prev');
    const btnNext = document.getElementById('livre-next');
    const modal = document.getElementById('modal-grand-livre');
    
    if (btnOuvrir) {
      btnOuvrir.addEventListener('click', () => { 
        modeLivre = 'constellations';
        pageActuelleLivre = 0;
        if (modal) modal.style.display = "flex"; 
        renderPagesLivre(); 
      });
    }
    
    if (btnFermer) {
      btnFermer.addEventListener('click', () => { 
        if (modal) modal.style.display = "none"; 
        
        // 🌟 DÉCLENCHEMENT DE LA FIN AVEC LA POPUP STYLISÉE (CHOIX OUI/NON)
        if (modeLivre === 'lore' && vitesseLumierePct >= 100) {
          ouvrirNotificationCHA(
            "Fin du voyage", 
            "Vous êtes sur le point de finir le voyage. Êtes-vous prêt à rentrer en hibernation ?",
            () => {
              // 🎵 1. FADE-OUT TOTAL ET SILENCE DE LA PLAYLIST
              enModeMusiqueSpeciale = true; // Bloque la relance de la playlist
              let volumeActuel = musiqueFond ? musiqueFond.volume : 0;
              const intervalleSilence = setInterval(() => {
                if (volumeActuel > 0.02 && musiqueFond) {
                  volumeActuel -= 0.02;
                  musiqueFond.volume = Math.max(0, volumeActuel);
                } else {
                  clearInterval(intervalleSilence);
                  if (musiqueFond) {
                    musiqueFond.pause();
                    musiqueFond.src = ""; // Vide la source pour garantir le silence absolu
                  }
                }
              }, 100); // Atténuation en douceur sur environ 500ms à 1s

              // 🌍 2. Lancement de la cinématique visuelle de fin
              declencherFinDuJeu();
            },
            "Engager l'hibernation", 
            true                     
          );
        }
      });
    }
    
    if (btnPrev) {
      btnPrev.addEventListener('click', () => { 
        if (pageActuelleLivre > 0) { pageActuelleLivre -= 2; renderPagesLivre(); }
        SON_PAGE.currentTime = 0;
        SON_PAGE.play(); 
      });
    }
    
    if (btnNext) {
      btnNext.addEventListener('click', () => { 
        let maxPages = (modeLivre === 'constellations') ? PATTERNS_CONSTELLATIONS.length : pagesLore.length;
        if (pageActuelleLivre + 2 < maxPages) { pageActuelleLivre += 2; renderPagesLivre(); }
        SON_PAGE.currentTime = 0;
        SON_PAGE.play();  
      });
    }
    
    // =========================================================================
    // 🌌 LOGIQUE INTERACTIVE DU TUTORIEL D'OBSERVATION (SCÉNARIO DIRECTIF)
    // =========================================================================
    const demoEt1 = document.getElementById('demo-et-1');
    const demoEt2 = document.getElementById('demo-et-2');
    const demoLigne = document.getElementById('demo-ligne-jointure');
    const btnTutoNext = document.getElementById('btn-tuto-next');
    const txtConsigne = document.querySelector('#etape-tuto-1 p strong');
    const btnTutoClose = document.getElementById('btn-tuto-close');
    
    let p1Selectionne = false;
    let p2Selectionne = false;
    let etapeRelierFaite = false;
    let etapeSupprimerFaite = false;

    function actualiserEtatDemoTuto() {
      if (!demoLigne || !btnTutoNext) return;

      // On cible le paragraphe parent qui englobe tout le texte du tuto
      const conteneurTexteTuto = document.querySelector('#etape-tuto-1 p');

      // 🛑 CAS 1 : Les deux points sont allumés pour la première fois (Création de la ligne)
      if (p1Selectionne && p2Selectionne && !etapeRelierFaite) {
        etapeRelierFaite = true;
        demoLigne.setAttribute('stroke', 'rgba(0, 210, 255, 0.9)');
        
        if (conteneurTexteTuto) {
          // 🌟 NETTOYAGE ABSOLU : On remplace TOUT le bloc HTML par la nouvelle consigne
          conteneurTexteTuto.innerHTML = "Parfait ! Maintenant, reclique sur les DEUX étoiles pour rompre le lien et comprendre comment effacer une erreur.";
        }

        btnTutoNext.setAttribute('disabled', 'true');
        btnTutoNext.style.background = '#2a2c2f';
        btnTutoNext.style.color = '#888a8d';
        btnTutoNext.style.borderColor = '#3d4146';
        btnTutoNext.style.cursor = 'not-allowed';
        btnTutoNext.textContent = 'Supprime la liaison';
      } 
      
      // 🔓 CAS 2 : La ligne était là, et le joueur a éteint les deux points (Suppression validée)
      else if (!p1Selectionne && !p2Selectionne && etapeRelierFaite && !etapeSupprimerFaite) {
        etapeSupprimerFaite = true;
        demoLigne.setAttribute('stroke', 'rgba(0, 210, 255, 0)');
        
        if (conteneurTexteTuto) {
          // 🌟 NETTOYAGE ABSOLU : On remplace TOUT le bloc HTML par la conclusion
          conteneurTexteTuto.innerHTML = "Excellent ! Tu as appris à tracer et à effacer une liaison sans faire d'erreur.";
        }

        btnTutoNext.removeAttribute('disabled');
        btnTutoNext.style.background = '#7CFC6E';
        btnTutoNext.style.color = '#121315';
        btnTutoNext.style.borderColor = 'transparent';
        btnTutoNext.style.cursor = 'pointer';
        btnTutoNext.textContent = 'Continuer ▶';
      }
      
      else if (etapeSupprimerFaite) {
        if (p1Selectionne && p2Selectionne) {
          demoLigne.setAttribute('stroke', 'rgba(0, 210, 255, 0.9)');
        } else {
          demoLigne.setAttribute('stroke', 'rgba(0, 210, 255, 0)');
        }
      }
    }

    if (demoEt1 && demoEt2) {
      demoEt1.addEventListener('click', (e) => {
        e.stopPropagation();
        p1Selectionne = !p1Selectionne;
        demoEt1.classList.toggle('active', p1Selectionne);

        if (p1Selectionne && p2Selectionne && !etapeRelierFaite) {
          SON_LIER.currentTime = 0; SON_LIER.play();
        } else if (!p1Selectionne && etapeRelierFaite && !etapeSupprimerFaite) {
          SON_DELIER.currentTime = 0; SON_DELIER.play();
        }
        actualiserEtatDemoTuto();
      });

      demoEt2.addEventListener('click', (e) => {
        e.stopPropagation();
        p2Selectionne = !p2Selectionne;
        demoEt2.classList.toggle('active', p2Selectionne);

        if (p1Selectionne && p2Selectionne && !etapeRelierFaite) {
          SON_LIER.currentTime = 0; SON_LIER.play();
        } else if (!p1Selectionne && etapeRelierFaite && !etapeSupprimerFaite) {
          SON_DELIER.currentTime = 0; SON_DELIER.play();
        }

        actualiserEtatDemoTuto();
      });
    }
    
    if (btnTutoNext) { 
      btnTutoNext.addEventListener('click', () => {
        SON_ACHAT.currentTime = 0;
        SON_ACHAT.play(); 
        document.getElementById('etape-tuto-1').style.display = 'none'; 
        document.getElementById('etape-tuto-2').style.display = 'block'; 
      }); 
    }
    
    if (btnTutoClose) { 
      btnTutoClose.addEventListener('click', () => {
        SON_ACHAT.currentTime = 0;
        SON_ACHAT.play(); 
        document.getElementById('modal-tuto-spatial').style.display = 'none'; 
      }); 
    }
  }

  function renderPagesLivre() {
    const btnPrev = document.getElementById('livre-prev');
    const btnNext = document.getElementById('livre-next');
    const pageDroiteDom = document.getElementById('page-droite');
    
    let maxPages = (modeLivre === 'constellations') ? PATTERNS_CONSTELLATIONS.length : pagesLore.length;
    
    if (btnPrev) btnPrev.style.visibility = (pageActuelleLivre === 0) ? "hidden" : "visible";
    if (btnNext) btnNext.style.visibility = (pageActuelleLivre + 2 >= maxPages) ? "hidden" : "visible";
    
    if (modeLivre === 'constellations') {
      if (pageDroiteDom) pageDroiteDom.style.visibility = "visible";
      construireContenuPageLivre('page-gauche', pageActuelleLivre); 
      construireContenuPageLivre('page-droite', pageActuelleLivre + 1);
    } else {
      // 🌟 MODE LORE : On s'assure que le bloc de droite est réinitialisé et géré par opacité
      if (pageDroiteDom) pageDroiteDom.style.visibility = "visible";
      
      construireContenuLore('page-gauche', pageActuelleLivre); 
      construireContenuLore('page-droite', pageActuelleLivre + 1);
    }
  }

  function construireContenuLore(idElementPage, indexPage) {
    const pageDom = document.getElementById(idElementPage);
    if (!pageDom) return;
    const titre = pageDom.querySelector('.nom-constellation');
    const miniCiel = pageDom.querySelector('.mini-ciel');
    const indicateurPage = pageDom.querySelector('.num-page');
    
    // Injecte une zone de texte si elle n'existe pas encore
    let textCont = pageDom.querySelector('.lore-texte-container');
    if (!textCont) {
      textCont = document.createElement('div');
      textCont.className = 'lore-texte-container';
      textCont.style.flex = "1";
      textCont.style.width = "100%";
      textCont.style.padding = "20px 10px";
      textCont.style.fontSize = "15px";
      textCont.style.lineHeight = "1.6";
      textCont.style.color = "#4a3320"; // Marron encre
      textCont.style.overflowY = "auto";
      textCont.style.whiteSpace = "pre-wrap";
      pageDom.insertBefore(textCont, indicateurPage);
    }

    if (indexPage < pagesLore.length) {
      const data = pagesLore[indexPage];
      pageDom.style.opacity = "1";
      titre.textContent = data.titre;
      titre.style.borderBottom = "2px solid #2c1d11";
      if (miniCiel) miniCiel.style.display = "none";
      textCont.style.display = "block";
      textCont.innerText = data.texte;
      indicateurPage.textContent = `Page ${indexPage + 1}`;
    } else {
      pageDom.style.opacity = "0"; // Cache la page vide
    }
  }

  function construireContenuPageLivre(idElementPage, indexPattern) {
    const pageDom = document.getElementById(idElementPage);
    if (!pageDom) return;
    const textCont = pageDom.querySelector('.lore-texte-container'); if (textCont) textCont.style.display = "none";
    const titre = pageDom.querySelector('.nom-constellation'), miniCiel = pageDom.querySelector('.mini-ciel'), svg = pageDom.querySelector('.mini-svg'), conteneurEtoiles = pageDom.querySelector('.mini-conteneur-etoiles'), indicateurPage = pageDom.querySelector('.num-page');
    svg.innerHTML = ""; conteneurEtoiles.innerHTML = "";
    const config = PATTERNS_CONSTELLATIONS[indexPattern];
    if (!config) { titre.textContent = ""; indicateurPage.textContent = ""; pageDom.style.opacity = "1"; titre.style.borderBottom = "none"; if (miniCiel) miniCiel.style.display = "none"; return; }
    pageDom.style.opacity = "1"; titre.textContent = config.nom || `Constellation ${indexPattern + 1}`; indicateurPage.textContent = `Page ${indexPattern + 1}`; titre.style.borderBottom = "2px solid #2c1d11"; if (miniCiel) miniCiel.style.display = "block";
    
    const baseW = 385, baseH = 280;
    const couleurs = ['#ffffff', '#ffffff', '#ffffff', '#cceeff', '#ffffcc', '#ff6666', '#66ff66', '#99ccff', '#ffcc00', '#ff99ff'];

    config.etoiles.forEach(etoile => {
      const point = document.createElement('div');
      point.className = 'etoile-livre'; point.style.position = "absolute"; point.style.width = "6px"; point.style.height = "6px"; point.style.borderRadius = "50%"; point.style.transform = "translate(-50%, -50%)";
      
      // 🌟 ATTRIBUTION DE LA COULEUR ALÉATOIRE DANS LE LIVRE :
      let col = couleurs[Math.floor(Math.random() * couleurs.length)];
      point.style.background = col;
      point.style.boxShadow = `0 0 5px ${col}`;

      let posX = ((etoile.x * 0.6) + 10) * (baseW / 100), posY = ((etoile.y * 0.6) + 20) * (baseH / 100);
      point.style.left = `${posX}px`; point.style.top = `${posY}px`; conteneurEtoiles.appendChild(point);
    });
    config.liensAttendus.forEach(lien => {
      const etA = config.etoiles.find(e => e.id === lien[0]), etB = config.etoiles.find(e => e.id === lien[1]);
      if (etA && etB) {
        let x1 = ((etA.x * 0.6) + 10) * (baseW / 100), y1 = ((etA.y * 0.6) + 20) * (baseH / 100), x2 = ((etB.x * 0.6) + 10) * (baseW / 100), y2 = ((etB.y * 0.6) + 20) * (baseH / 100);
        const ligne = document.createElementNS("http://www.w3.org/2000/svg", "line");
        ligne.setAttribute("x1", x1); ligne.setAttribute("y1", y1); ligne.setAttribute("x2", x2); ligne.setAttribute("y2", y2); ligne.setAttribute("stroke", "rgba(0, 210, 255, 0.7)"); ligne.setAttribute("stroke-width", "1.5");
        svg.appendChild(ligne);
      }
    });
  }

  // Lier les sliders aux textes
  ['ratio', 'puissance', 'angle'].forEach(param => {
    document.getElementById(`slider-${param}`).addEventListener('input', (e) => {
      document.getElementById(`val-${param}`).textContent = e.target.value;
    });
  });

  // ==========================================
  // 🧩 MÉCANIQUE D'ASSEMBLAGE PAR MAGNÉTISME GLOBAL
  // ==========================================
  
  function tenterPlacementPiece(typePiece) {
    if (typePiece === 'moteur' && !etatFusee.moteurPose) {
      etatFusee.moteurPose = true;
      document.getElementById('piece-posee-moteur').style.display = 'block';
    } else if (typePiece === 'reservoir' && !etatFusee.reservoirPose) {
      etatFusee.reservoirPose = true;
      document.getElementById('piece-posee-reservoir').style.display = 'block';
    } else if (typePiece === 'cockpit' && !etatFusee.cockpitPose) {
      etatFusee.cockpitPose = true;
      document.getElementById('piece-posee-cockpit').style.display = 'block';
    }

    SON_PUZZLE.currentTime = 0;
    SON_PUZZLE.play();

    actualiserMiniJeuFusee(); // Met à jour les pièces au sol et vérifie la fin
  }

  const piecesPuzzle = [
    { id: 'puzzle-moteur', type: 'moteur' },
    { id: 'puzzle-reservoir', type: 'reservoir' },
    { id: 'puzzle-cockpit', type: 'cockpit' }
  ];

  piecesPuzzle.forEach(piece => {
    const el = document.getElementById(piece.id);
    if (!el) return;
    
    // 🌟 POUR PC (Souris) - LIBRE ET FLUIDE
    el.addEventListener('dragstart', (e) => {
      // On vérifie juste si la pièce n'est pas déjà posée sur la fusée
      const dejaPosee = etatFusee[piece.type + 'Pose'];
      
      if (!dejaPosee) {
        e.dataTransfer.setData('typePiece', piece.type);
        // On ne touche plus à el.style.opacity ici pour laisser l'entité native flotter proprement !
      } else {
        e.preventDefault();
      }
    });

    // 🌟 POUR MOBILE / TAP DE SECOURS
    el.addEventListener('click', () => {
      tenterPlacementPiece(piece.type);
    });
  });

  // 🌟 LE HANGAR ENTIER CAPTURE LE LÂCHER DE SOURIS
  const hangarGlobal = document.getElementById('hangar-visuel-fusee');
  
  hangarGlobal.addEventListener('dragover', (e) => {
    e.preventDefault(); // Obligatoire pour autoriser le drop n'importe où
  });

  hangarGlobal.addEventListener('drop', (e) => {
    e.preventDefault();
    const typePiece = e.dataTransfer.getData('typePiece');
    tenterPlacementPiece(typePiece); // Valide et construit la pièce
  });

  // ==========================================
  // ⚙️ FONCTIONS DE MISE À JOUR VISUELLE
  // ==========================================
  function preparerMiniJeuFusee() {
    document.getElementById('zone-pieces-au-sol').style.display = 'block';
    document.getElementById('modal-lancement-fusee').style.display = 'none';
    actualiserMiniJeuFusee();
  }

  function actualiserMiniJeuFusee() {
    // 🌟 SÉCURITÉ FIXE : Si la fusée a déjà décollé, elle RESTE visible et assemblée en permanence !
    if (etatFusee.lancee) {
      document.getElementById('zone-pieces-au-sol').style.display = 'none';
      document.getElementById('piece-posee-moteur').style.display = 'block';
      document.getElementById('piece-posee-reservoir').style.display = 'block';
      document.getElementById('piece-posee-cockpit').style.display = 'block';
      return; 
    }

    const pMoteur = document.getElementById('puzzle-moteur');
    const pReservoir = document.getElementById('puzzle-reservoir');
    const pCockpit = document.getElementById('puzzle-cockpit');

    if (pMoteur) pMoteur.style.visibility = etatFusee.moteurPose ? 'hidden' : 'visible';
    if (pReservoir) pReservoir.style.visibility = etatFusee.reservoirPose ? 'hidden' : 'visible';
    if (pCockpit) pCockpit.style.visibility = etatFusee.cockpitPose ? 'hidden' : 'visible';

    document.getElementById('piece-posee-moteur').style.display = etatFusee.moteurPose ? 'block' : 'none';
    document.getElementById('piece-posee-reservoir').style.display = etatFusee.reservoirPose ? 'block' : 'none';
    document.getElementById('piece-posee-cockpit').style.display = etatFusee.cockpitPose ? 'block' : 'none';

    if (etatFusee.moteurPose && etatFusee.reservoirPose && etatFusee.cockpitPose) {
      setTimeout(() => {
        document.getElementById('zone-pieces-au-sol').style.display = 'none';
        document.getElementById('modal-lancement-fusee').style.display = 'flex';
      }, 600);
    }
  }

  document.getElementById('btn-simuler-lancement').addEventListener('click', () => {
    // 1. Récupération et archivage immédiat des valeurs des sliders
    const vRatio = parseInt(document.getElementById('slider-ratio').value);
    const vPuiss = parseInt(document.getElementById('slider-puissance').value);
    const vAngle = parseInt(document.getElementById('slider-angle').value);

    if (!valeursTesteesRatio.includes(vRatio)) valeursTesteesRatio.push(vRatio);
    if (!valeursTesteesPuissance.includes(vPuiss)) valeursTesteesPuissance.push(vPuiss);
    if (!valeursTesteesAngle.includes(vAngle)) valeursTesteesAngle.push(vAngle);

    document.getElementById('historique-ratio').textContent = valeursTesteesRatio.sort((a,b)=>a-b).join(', ') + '%';
    document.getElementById('historique-puissance').textContent = valeursTesteesPuissance.sort((a,b)=>a-b).join(', ') + '%';
    document.getElementById('historique-angle').textContent = valeursTesteesAngle.sort((a,b)=>a-b).join(', ') + '°';

    // 2. Masquage immédiat de la salle des commandes pour voir le hangar et le décompte
    document.getElementById('modal-lancement-fusee').style.display = 'none';

    // 3. Création visuelle du texte du décompte à l'écran
    const hangar = document.getElementById('hangar-visuel-fusee');
    const baliseDecompte = document.createElement('div');
    baliseDecompte.style.cssText = "position:absolute; top:40%; left:50%; transform:translate(-50%, -50%); font-size:80px; font-weight:bold; color:#fff; z-index:999; text-shadow: 0 0 20px rgba(0,0,0,0.9); font-family:sans-serif !important;";
    if (hangar) hangar.appendChild(baliseDecompte);

    let etapeDecompte = 3;
    baliseDecompte.textContent = etapeDecompte;

    // 4. Lancement de la boucle du décompte (3 -> 2 -> 1 -> Mise à feu)
    const intervalleDecompte = setInterval(() => {
      etapeDecompte--;
      if (etapeDecompte > 0) {
        baliseDecompte.textContent = etapeDecompte;
      } else {
        clearInterval(intervalleDecompte);
        baliseDecompte.remove(); // Supprime le texte du décompte
        executerMiseAFeuFinal(vRatio, vPuiss, vAngle); // Déclenche le verdict !
      }
    }, 1000);
  });

  // 🌟 NOUVELLE FONCTION COMPAGNONNE POUR TRAITER LE VERDICT APRÈS LE 3, 2, 1
  function executerMiseAFeuFinal(vRatio, vPuiss, vAngle) {
    const vyanRatio = document.getElementById('voyant-ratio');
    const flcRatio = document.getElementById('fleche-ratio');
    if (vRatio === fuseeCibles.ratio) {
      if (vyanRatio) { vyanRatio.style.background = '#4eff67'; vyanRatio.style.boxShadow = '0 0 8px #4eff67'; }
    } else {
      if (vyanRatio) { vyanRatio.style.background = '#ff4d4d'; vyanRatio.style.boxShadow = '0 0 8px #ff4d4d'; }
      if (flcRatio) flcRatio.innerHTML = vRatio < fuseeCibles.ratio 
      ? '<img src="images/fleche_haut.png" style="width:16px; height:16px; vertical-align:middle;">' 
      : '<img src="images/fleche_bas.png" style="width:16px; height:16px; vertical-align:middle;">';
    }

    const vyanPuiss = document.getElementById('voyant-puissance');
    const flcPuiss = document.getElementById('fleche-puissance');
    if (vPuiss === fuseeCibles.puissance) {
      if (vyanPuiss) { vyanPuiss.style.background = '#4eff67'; vyanPuiss.style.boxShadow = '0 0 8px #4eff67'; }
    } else {
      if (vyanPuiss) { vyanPuiss.style.background = '#ff4d4d'; vyanPuiss.style.boxShadow = '0 0 8px #ff4d4d'; }
      if (flcPuiss) flcPuiss.innerHTML = vPuiss < fuseeCibles.puissance
      ? '<img src="images/fleche_haut.png" style="width:16px; height:16px; vertical-align:middle;">' 
      : '<img src="images/fleche_bas.png" style="width:16px; height:16px; vertical-align:middle;">';
    }

    const vyanAngle = document.getElementById('voyant-angle');
    const flcAngle = document.getElementById('fleche-angle');
    if (vAngle === fuseeCibles.angle) {
      if (vyanAngle) { vyanAngle.style.background = '#4eff67'; vyanAngle.style.boxShadow = '0 0 8px #4eff67'; }
    } else {
      if (vyanAngle) { vyanAngle.style.background = '#ff4d4d'; vyanAngle.style.boxShadow = '0 0 8px #ff4d4d'; }
      if (flcAngle) flcAngle.innerHTML = vAngle < fuseeCibles.angle
      ? '<img src="images/fleche_haut.png" style="width:16px; height:16px; vertical-align:middle;">' 
      : '<img src="images/fleche_bas.png" style="width:16px; height:16px; vertical-align:middle;">';
    }

    if (vRatio === fuseeCibles.ratio && vPuiss === fuseeCibles.puissance && vAngle === fuseeCibles.angle) {
      // === 🚀 SCÉNARIO RÉUSSITE : ENVOL ===
      SON_ROCKET.currentTime = 0;
      SON_ROCKET.play();
      etatFusee.lancee = true;
      const zoneJeu = document.querySelector('.zone-jeu');
      if (zoneJeu) zoneJeu.classList.add('shake-camera-active');

      const blocFusee = document.getElementById('couches-fusee-normale');
      if (blocFusee) {
        blocFusee.style.display = 'block';
        blocFusee.classList.add('fusee-takeoff-active');
      }

      setTimeout(() => {
        if (zoneJeu) zoneJeu.classList.remove('shake-camera-active');
        if (blocFusee) {
          blocFusee.style.transition = 'none';
          blocFusee.style.opacity = '0';
          blocFusee.classList.remove('fusee-takeoff-active');
          setTimeout(() => { blocFusee.style.opacity = '1'; }, 50);
        }
        const tabEspace = document.getElementById('tab-espace');
        if (tabEspace) {
          tabEspace.style.display = 'block'; 
          tabEspace.classList.add('nouveau-clignotant'); 
        }

        genererNouvellesCiblesFusee(true);
        mettreAjourInterface();
        ouvrirNotificationCHA("Décollage réussi !","Votre fusée a quitté l'atmosphère avec succès ! L'onglet Espace est débloqué");
        SON_SUCCES.currentTime = 0;
        SON_SUCCES.play();
      }, 2500);

    } else {
      // === 💥 SCÉNARIO ÉCHEC : EXPLOSION ===
      SON_EXPLOSION.currentTime = 0;
      SON_EXPLOSION.play();
      etatFusee.tentatives++;
      const txtTentative = document.getElementById('fusee-tentatives-txt');
      if (txtTentative) txtTentative.textContent = etatFusee.tentatives;
      
      const ecran = document.getElementById('ecran-lancement');
      if (ecran) ecran.classList.add('tremblement-erreur');
      
      const blocFusee = document.getElementById('couches-fusee-normale');
      if (blocFusee) blocFusee.style.display = 'none';

      const hangar = document.getElementById('hangar-visuel-fusee');
      const explosionImg = document.createElement('img');
      explosionImg.src = "images/fusee/explosion.png";
      explosionImg.className = "image-explosion-animation";
      if (hangar) hangar.appendChild(explosionImg);

      setTimeout(() => {
         if (ecran) ecran.classList.remove('tremblement-erreur');
         explosionImg.remove();
         ouvrirNotificationCHA("BOUM !","Paramètres incorrects. La fusée a explosé sur le pas de tir.");
         
         SON_ECHEC.currentTime = 0;
         SON_ECHEC.play();
  
         etatFusee.piecesAssemblees = 0;
         etatFusee.moteurPose = false;
         etatFusee.reservoirPose = false;
         etatFusee.cockpitPose = false;
         
         document.getElementById('piece-posee-moteur').style.display = 'none';
         document.getElementById('piece-posee-reservoir').style.display = 'none';
         document.getElementById('piece-posee-cockpit').style.display = 'none';
         
         if (blocFusee) blocFusee.style.display = 'block';
         etatFusee.kitAchete = false;
         document.getElementById('zone-pieces-au-sol').style.display = 'none';
         
         actualiserMiniJeuFusee();
         mettreAjourInterface();
       }, 1500); 
    }
  }

  function avancerCalendrierVirtuel(nbJours, estSautManuel = false) {
    joursVirtuelsEcoules += nbJours;
    
    let totalJours = joursVirtuelsEcoules;
    let an = 0;
    let m = 0;
    
    while (totalJours >= 365) {
      totalJours -= 365;
      an++;
    }
    
    while (totalJours >= JOURS_PAR_MOIS[m]) {
      totalJours -= JOURS_PAR_MOIS[m];
      m++;
    }
    
    dateVirtuelle.jour = totalJours + 1;
    dateVirtuelle.mois = m;
    dateVirtuelle.annee = an;

    let jourAffiche = "";
    let anneeAffiche = "";

    if (document.body.classList.contains('traduit')) {
      jourAffiche = dateVirtuelle.jour.toString();
      anneeAffiche = dateVirtuelle.annee.toString();
    } else {
      // Sinon, on passe par ta fonction CHA qui convertit proprement en base 5
      jourAffiche = convertirNombreCHA(dateVirtuelle.jour);
      anneeAffiche = convertirNombreCHA(dateVirtuelle.annee);
    }

    // Injection dans la barre d'horloge globale
    document.getElementById('txt-date-virtuelle').textContent = `${jourAffiche} ${NOMS_MOIS[dateVirtuelle.mois]} ${anneeAffiche}`;

    if (nbJours > 0) {
      if (estSautManuel) {
        for (let planete in colonisation) {
          if (colonisation[planete].enVoyage) {
            colonisation[planete].timestampDepart -= (nbJours * 10 * 1000);
          }
        }

        anglesPlanetes.croquetis += (VITESSES_REVOLUTION.croquetis * nbJours);
        anglesPlanetes.felina += (VITESSES_REVOLUTION.felina * nbJours);
        anglesPlanetes.luna += (VITESSES_REVOLUTION.luna * nbJours);
        anglesPlanetes.ronronis += (VITESSES_REVOLUTION.ronronis * nbJours);
        anglesPlanetes.calinous += (VITESSES_REVOLUTION.calinous * nbJours);
        anglesPlanetes.sardinia += (VITESSES_REVOLUTION.sardinia * nbJours);
        
        if (typeof angleSatellitesBase !== 'undefined') {
          angleSatellitesBase += (5 * nbJours);
        }
      }
    }

    const carteSolaire = document.getElementById('carte-systeme-solaire');
    if (carteSolaire) {
      const angleAbsoluLuna = anglesPlanetes.felina + anglesPlanetes.luna;

      document.getElementById('pivot-croquetis').style.width = '220px';
      document.getElementById('pivot-croquetis').style.height = '220px';
      
      document.getElementById('pivot-felina').style.width = '380px';
      document.getElementById('pivot-felina').style.height = '380px';
      
      document.getElementById('pivot-ronronis').style.width = '600px'; 
      document.getElementById('pivot-ronronis').style.height = '600px'; 
      
      document.getElementById('pivot-calinous').style.width = '840px'; 
      document.getElementById('pivot-calinous').style.height = '840px'; 
      
      document.getElementById('pivot-sardinia').style.width = '1100px'; 
      document.getElementById('pivot-sardinia').style.height = '1100px'; 

      function obtenirXYOrbite(angleDeg, rayon) {
        const rad = (angleDeg - 90) * Math.PI / 180;
        return {
          x: Math.cos(rad) * rayon,
          y: (Math.sin(rad) * rayon) - 190
        };
      }

      const txtLuna = document.getElementById('hud-txt-luna');
      if (txtLuna) {
        txtLuna.innerHTML = nbSatellites >= 1 ? `Luna<br><span style="color:var(--accent);">+${convertirNombreCHA(colonisation.luna.niveau * 1)}/s</span>` : `???`;
      }

      const posCroq = obtenirXYOrbite(anglesPlanetes.croquetis, 110);
      const txtCroq = document.getElementById('hud-txt-croquetis');
      if (txtCroq) {
        txtCroq.style.left = `${posCroq.x}px`;
        txtCroq.style.top = `${posCroq.y + 18}px`;
        txtCroq.innerHTML = nbSatellites >= 5 ? `Croquetis<br><span style="color:var(--accent);">+${convertirNombreCHA(colonisation.croquetis.niveau * 5)}/s</span>` : `???`;
      }

      const posFel = obtenirXYOrbite(anglesPlanetes.felina, 190);
      document.getElementById('hud-txt-felina').style.left = `${posFel.x}px`;
      document.getElementById('hud-txt-felina').style.top = `${posFel.y + 22}px`;

      const posRon = obtenirXYOrbite(anglesPlanetes.ronronis, 300);
      const txtRon = document.getElementById('hud-txt-ronronis');
      if (txtRon) {
        txtRon.style.left = `${posRon.x}px`;
        txtRon.style.top = `${posRon.y + 20}px`;
        txtRon.innerHTML = nbSatellites >= 10 ? `Ronronis<br><span style="color:var(--accent);">+${convertirNombreCHA(colonisation.ronronis.niveau * 25)}/s</span>` : `???`;
      }

      const posCal = obtenirXYOrbite(anglesPlanetes.calinous, 420);
      const txtCal = document.getElementById('hud-txt-calinous');
      if (txtCal) {
        txtCal.style.left = `${posCal.x}px`;
        txtCal.style.top = `${posCal.y + 18}px`;
        txtCal.innerHTML = nbSatellites >= 15 ? `Ceinture Calinous<br><span style="color:var(--accent);">+${convertirNombreCHA(colonisation.calinous.niveau * 100)}/s</span>` : `???`;
      }

      const posSard = obtenirXYOrbite(anglesPlanetes.sardinia, 550);
      const txtSard = document.getElementById('hud-txt-sardinia');
      if (txtSard) {
        txtSard.style.left = `${posSard.x}px`;
        txtSard.style.top = `${posSard.y + 20}px`;
        txtSard.innerHTML = nbSatellites >= 20 ? `Sardinia<br><span style="color:var(--accent);">+${convertirNombreCHA(colonisation.sardinia.niveau * 500)}/s</span>` : `???`;
      }

      const radLuna = (angleAbsoluLuna - 90) * Math.PI / 180;
      const lunaX = posFel.x + (Math.cos(radLuna) * 40); 
      const lunaY = posFel.y + (Math.sin(radLuna) * 40);
      
      if (txtLuna) {
        txtLuna.style.left = `${lunaX}px`;
        txtLuna.style.top = `${lunaY + 10}px`;
      }
      
      mettreAjourBrouillardSpatial();
    }
    verifierEvenementEtoileMystere();

    const hudHH = document.getElementById('hud-status-happyhour');
    const tooltip = document.getElementById('etoile-tooltip');
    
    const heureActuelle = new Date().getHours();
    
    if (hudHH) {
      if (happyHourAchete) {
        hudHH.style.display = 'block';
        const imgHH = hudHH.querySelector('img');
        
        if (heureActuelle >= 20 || heureActuelle < 6) {
          hudHH.style.borderColor = 'var(--accent)';
          if (imgHH) imgHH.style.opacity = '1';
          
          hudHH.onmouseenter = (e) => {
            hudHH.style.background = '#141517';
            tooltip.textContent = "🌌 Alignement Cosmique Actif ! Multiplicateur x2 appliqué sur toutes les ressources.";
            tooltip.style.display = "block";
          };
          hudHH.onmouseleave = () => { 
            hudHH.style.background = '#000';
            tooltip.style.display = "none"; 
          };
        } else {
          hudHH.style.borderColor = '#3d4146';
          if (imgHH) imgHH.style.opacity = '0.3';
          
          hudHH.onmouseenter = (e) => {
            hudHH.style.background = '#141517';
            tooltip.textContent = "⏳ Alignement Cosmique Inactif. Multiplicateur x2 disponible entre 20h00 et 6h00 (Heure Réelle).";
            tooltip.style.display = "block";
          };
          hudHH.onmouseleave = () => { 
            hudHH.style.background = '#000';
            tooltip.style.display = "none"; 
          };
        }
        
        hudHH.onmousemove = (e) => {
          tooltip.style.left = (e.clientX + 15) + "px";
          tooltip.style.top = (e.clientY + 15) + "px";
        };
      } else {
        hudHH.style.display = 'none';
      }
    }

    // 🌟 CORRECTIF ANTI-LAG : On n'appelle la fonction d'affichage du ciel QUE SI l'état change vraiment !
    const estLeBonJour = (dateVirtuelle.jour === 9 && dateVirtuelle.mois === 9);
    const estLHeureReelle = MODE_DEBUG || (heureActuelle >= 20 && heureActuelle < 24);
    const doitEtreMystere = (happyHourAchete && estLeBonJour && estLHeureReelle);

    if (doitEtreMystere !== cielMystereActif) {
      cielMystereActif = doitEtreMystere;
      if (ongletActif === 'Observation') initialiserLeCiel();
    }
  }

  function verifierEvenementEtoileMystere() {
    const imgEtoile = document.getElementById('img-etoile-mystere');
    const txtEtoile = document.getElementById('hud-txt-etoile');
    const tooltip = document.getElementById('etoile-tooltip');
    
    if (!imgEtoile || !txtEtoile || !tooltip) return;

    let texteIndice = "";
    
    if (nbSatellites >= 30) {
      // 🌟 LE 9 OCTOBRE EST TOUJOURS OBLIGATOIRE, MÊME EN DEBUG MODE
      if (dateVirtuelle.jour === 9 && dateVirtuelle.mois === 9) {
        imgEtoile.src = "images/espace/etoile.png";
        imgEtoile.style.filter = "drop-shadow(0 0 15px #ffed4a) drop-shadow(0 0 30px var(--accent))";
        imgEtoile.style.transform = "scale(1.3)";
        txtEtoile.textContent = "Étoile Mystère";
        txtEtoile.style.color = "var(--accent)";
        
        imgEtoile.style.cursor = "pointer";
        txtEtoile.style.cursor = "pointer";

        // 🌟 INDICE DYNAMIQUE POST-CLIC
        if (etoileDecouverte) {
          texteIndice = "Maintenant que l'on connait le bon jour, on pourrait mieux l'observer dans l'observatoire avec l'Happy Hour";
        } else {
          texteIndice = "Cliquez sur l'Étoile pour capter ses secrets !";
        }
      } else {
        imgEtoile.src = "images/espace/etoile_cachee.png";
        imgEtoile.style.filter = "drop-shadow(0 0 5px rgba(255,255,255,0.1))";
        imgEtoile.style.transform = "scale(1.0)";
        txtEtoile.textContent = "???";
        txtEtoile.style.color = "var(--texte-sombre)";
        
        imgEtoile.style.cursor = "help";
        txtEtoile.style.cursor = "help";
        
        if (etoileDecouverte) {
          texteIndice = "Maintenant que l'on connait le bon jour, on pourrait mieux l'observer dans l'observatoire avec l'Happy Hour";
        } else {
          texteIndice = "Pour observer cet endroit il faut trouver le bon jour...";
        }
      }
    } else {
      imgEtoile.src = "images/espace/etoile_cachee.png";
      imgEtoile.style.filter = "drop-shadow(0 0 5px rgba(255,255,255,0.02))";
      imgEtoile.style.transform = "scale(1.0)";
      txtEtoile.textContent = "???";
      txtEtoile.style.color = "rgba(255,255,255,0.15)";
      
      imgEtoile.style.cursor = "help";
      txtEtoile.style.cursor = "help";
      texteIndice = "Signal trop faible. Déployez plus de satellites pour analyser cette zone.";
    }

    imgEtoile.onmouseenter = txtEtoile.onmouseenter = null;
    imgEtoile.onmousemove = txtEtoile.onmousemove = null;
    imgEtoile.onmouseleave = txtEtoile.onmouseleave = null;

    if (texteIndice !== "") {
      const gererEntree = () => {
        tooltip.textContent = texteIndice;
        tooltip.style.display = "block";
      };
      
      const gererMouvement = (e) => {
        tooltip.style.left = (e.clientX + 15) + "px";
        tooltip.style.top = (e.clientY + 15) + "px";
      };
      
      const gererSortie = () => {
        tooltip.style.display = "none";
      };

      imgEtoile.onmouseenter = txtEtoile.onmouseenter = gererEntree;
      imgEtoile.onmousemove = txtEtoile.onmousemove = gererMouvement;
      imgEtoile.onmouseleave = txtEtoile.onmouseleave = gererSortie;
    } else {
      tooltip.style.display = "none";
    }
  }

  function appliquerTransformationsCamera() {
    const cam = document.getElementById('caméra-espace');
    const conteneurEspace = document.getElementById('vue-espace');
    
    if (cam && conteneurEspace) {
      // 1. Récupérer la taille de l'écran du joueur
      const ecranLargeur = conteneurEspace.clientWidth;
      const ecranHauteur = conteneurEspace.clientHeight;
      
      // 2. Définir la taille absolue de la zone d'Espace (là où sont les étoiles et les planètes)
      const TAILLE_UNIVERS_ESPACE = 4000;
      
      // 3. Calculer les limites pour que le bord du calque de 4000px ne rentre jamais dans l'écran !
      // Le calcul prend en compte le niveau de zoom actuel.
      const limiteX = (TAILLE_UNIVERS_ESPACE * zoomActuel - ecranLargeur) / 2;
      const limiteY = (TAILLE_UNIVERS_ESPACE * zoomActuel - ecranHauteur) / 2;

      // 4. Bloquer rigoureusement les coordonnées de la caméra (Clamp)
      // On s'assure que panX et panY ne dépassent ni le mur de gauche/haut (valeurs positives), ni le mur de droite/bas (valeurs négatives)
      panX = Math.max(-limiteX, Math.min(limiteX, panX));
      panY = Math.max(-limiteY, Math.min(limiteY, panY));
      
      // 5. Appliquer la transformation CSS finale
      cam.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomActuel})`;
    }
  }

let controlesEspaceConfigures = false;
  
  function configurerControlesInteractifsEspace() {
    if (controlesEspaceConfigures) return;
    controlesEspaceConfigures = true;

    const conteneurEspace = document.getElementById('vue-espace');
    const cam = document.getElementById('caméra-espace');

    if (!conteneurEspace || !cam) return;

    conteneurEspace.addEventListener('wheel', (e) => {
      if (ongletActif !== 'Espace') return;
      e.preventDefault();

      const ancienZoom = zoomActuel;

      if (e.deltaY < 0) {
        zoomActuel = Math.min(zoomActuel + 0.15, 6.0);
      } else {
        zoomActuel = Math.max(zoomActuel - 0.15, 0.5);
      }
      
      const rect = conteneurEspace.getBoundingClientRect();
      const sourisX = e.clientX - rect.left;
      const sourisY = e.clientY - rect.top;

      panX = sourisX - (sourisX - panX) * (zoomActuel / ancienZoom);
      panY = sourisY - (sourisY - panY) * (zoomActuel / ancienZoom);

      appliquerTransformationsCamera();
    }, { passive: false });

    conteneurEspace.addEventListener('mousedown', (e) => {
      if (ongletActif !== 'Espace') return;
      
      if (e.target.closest('button') || e.target.closest('#hud-meditation-temps')) {
        return;
      }

      estEnTrainDeGlisser = true;
      conteneurEspace.style.cursor = 'grabbing';
      
      debutX = e.clientX - panX;
      debutY = e.clientY - panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!estEnTrainDeGlisser || ongletActif !== 'Espace') return;
      
      panX = e.clientX - debutX;
      panY = e.clientY - debutY;
      
      appliquerTransformationsCamera();
    });

    window.addEventListener('mouseup', () => {
      estEnTrainDeGlisser = false;
      if (conteneurEspace) conteneurEspace.style.cursor = 'default';
    });

    const btn1J = document.getElementById('btn-temps-plus1j');
    const btn1M = document.getElementById('btn-temps-plus1m');

    if (btn1J && !btn1J.dataset.ecouteur) {
      btn1J.dataset.ecouteur = "true"; 
      btn1J.addEventListener('click', (e) => {
        e.stopPropagation(); 
        avancerCalendrierVirtuel(1, true); // 🌟 AJOUT DU TRUE ICI
      });
      
      btn1J.addEventListener('mouseenter', () => btn1J.style.background = '#34373b');
      btn1J.addEventListener('mouseleave', () => btn1J.style.background = '#2a2c2f');
    }

    if (btn1M && !btn1M.dataset.ecouteur) {
      btn1M.dataset.ecouteur = "true";
      btn1M.addEventListener('click', (e) => {
        e.stopPropagation();
        avancerCalendrierVirtuel(30, true); // 🌟 AJOUT DU TRUE ICI
      });
      
      btn1M.addEventListener('mouseenter', () => btn1M.style.background = '#34373b');
      btn1M.addEventListener('mouseleave', () => btn1M.style.background = '#2a2c2f');
    }
  }

  function recentrerCameraSurFelina() {
    const vueEspace = document.getElementById('vue-espace');
    if (!vueEspace) return;

    // Le rayon de l'orbite de Félina est de 190px (380px de largeur / 2)
    const rayonOrbite = 190;
    
    // Conversion de l'angle actuel de Félina en radians pour la trigonométrie
    // On applique un décalage de -90° (ou -PI/2) car en CSS le top: 0 d'un pivot commence en haut
    const angleRadians = (anglesPlanetes.felina - 90) * Math.PI / 180;

    // Calcul de la position X et Y de Félina par rapport au Soleil
    const felinaX = Math.cos(angleRadians) * rayonOrbite;
    const felinaY = Math.sin(angleRadians) * rayonOrbite;

    // Pour centrer la caméra sur Félina, on prend le centre de l'écran 
    // et on applique l'inverse de sa position par rapport au Soleil (décalé de -190px de base)
    panX = (vueEspace.clientWidth / 2) - (felinaX * zoomActuel);
    panY = (vueEspace.clientHeight / 2) - ((felinaY + 190) * zoomActuel);

    appliquerTransformationsCamera();
  }

  // ☄️ GÉNÉRATION DYNAMIQUE DE LA CEINTURE D'ASTÉROÏDES (DENSE ET VOLUMINEUSE)
  function genererCeintureAsteroides() {
    const conteneur = document.getElementById('pivot-calinous');
    if (!conteneur) return;

    // On nettoie le conteneur au cas où la fonction est appelée deux fois
    conteneur.innerHTML = "";

    const nombreAsteroides = 45; // 🔓 Augmenté de 16 à 45 pour une vraie ceinture dense !
    const rayonCeinture = 420;   // 840px de diamètre / 2

    for (let i = 0; i < nombreAsteroides; i++) {
      // 1. Répartition régulière tout autour du cercle (360° / 45)
      // On garde une légère variation aléatoire pour briser l'alignement trop parfait
      const angleDeBase = (360 / nombreAsteroides) * i;
      const angleAleatoire = angleDeBase + (Math.random() * 12 - 6);
      const rad = (angleAleatoire - 90) * Math.PI / 180;

      // 2. Sélection d'une image au hasard entre ma1.png et ma6.png
      const indexImage = Math.floor(Math.random() * 6) + 1;

      // 3. Création du sprite de l'astéroïde
      const asteroide = document.createElement('img');
      asteroide.src = `images/espace/ma${indexImage}.png`;
      
      // 🔓 TAILLE AUGMENTÉE : Les astéroïdes feront désormais entre 22px et 35px (au lieu de 12-22)
      const taille = Math.floor(Math.random() * 14) + 22; 
      
      asteroide.style.position = 'absolute';
      asteroide.style.width = `${taille}px`;
      asteroide.style.height = `${taille}px`;
      asteroide.style.objectFit = 'contain';

      // 4. Positionnement trigonométrique à l'intérieur du conteneur de 840x840px
      // On applique un très léger décalage radial pour étaler un peu la ceinture en largeur
      const epaisseurCeinture = Math.random() * 20 - 10; // Variation de +-10px autour de l'orbite
      const x = 420 + Math.cos(rad) * (rayonCeinture + epaisseurCeinture);
      const y = 420 + Math.sin(rad) * (rayonCeinture + epaisseurCeinture);

      asteroide.style.left = `${x}px`;
      asteroide.style.top = `${y}px`;
      asteroide.style.transform = 'translate(-50%, -50%)';

      conteneur.appendChild(asteroide);
    }
  }

  // 📡 INJECTION VISUELLE D'UN SATELLITE PLUS PETIT AUTOUR DE FÉLINA
  function ajouterUnSatelliteGraphique(index) {
    const conteneur = document.getElementById('cont-pivots-satellites');
    if (!conteneur) return;

    const pivotSat = document.createElement('div');
    pivotSat.className = `pivot-sat-individuel`;
    pivotSat.id = `pivot-sat-${index}`;
    pivotSat.style.position = 'absolute';
    pivotSat.style.width = '100%';
    pivotSat.style.height = '100%';
    pivotSat.style.top = '0';
    pivotSat.style.left = '0';
    
    const angleRepartie = (360 / 30) * index;
    pivotSat.style.transform = `rotate(${angleRepartie}deg)`;

    const imgSat = document.createElement('img');
    imgSat.src = 'images/espace/satellite.png'; 
    imgSat.style.position = 'absolute';
    imgSat.style.top = '-3px'; // Ajusté pour le rayon
    imgSat.style.left = 'calc(50% - 3px)';
    imgSat.style.width = '6px';  // 🔓 Réduit à 6px pour faire plus discret et miniature !
    imgSat.style.height = '6px'; // 🔓 Réduit à 6px
    imgSat.style.objectFit = 'contain';

    pivotSat.appendChild(imgSat);
    conteneur.appendChild(pivotSat);
  }

  function mettreAjourBrouillardSpatial() {
    const calque = document.getElementById('calque-brouillard-spatial');
    if (!calque) return;

    // 🌟 SÉCURITÉ : À 30 satellites ou plus, on efface complètement le calque noir !
    if (nbSatellites >= 30) {
      calque.style.display = 'none';
      return; 
    } else {
      calque.style.display = 'block'; 
    }

    // 🪐 CALCULE CONTINU DU RAYON (Progression fluide à chaque upgrade)
    // Base de départ à 30px (autour de Félina), et on augmente de ~26px par satellite 
    // pour atteindre environ 800px au 29e satellite.
    let rayonTransparent = 30 + (nbSatellites * 26.5);

    // 🌟 UN FLOU DE TRANSITION (Pour garder le dégradé d'ombre propre autour de la zone)
    const rayonFlou = rayonTransparent + 50; 

    // Récupération des coordonnées en direct de Félina pour centrer le brouillard
    const txtFelina = document.getElementById('hud-txt-felina');
    let xTerre = 0;
    let yTerre = 0; 
    
    if (txtFelina && txtFelina.style.left) {
      xTerre = parseFloat(txtFelina.style.left);
      yTerre = parseFloat(txtFelina.style.top) - 22; 
    }

    calque.style.left = `${xTerre}px`;
    calque.style.top = `${yTerre}px`;
    
    // Application du masque radial dynamique
    calque.style.background = `radial-gradient(circle at 50% 50%, transparent ${rayonTransparent}px, rgba(0,0,0,0.99) ${rayonFlou}px)`;
  }

  let dernierTempsEcoule = performance.now();

  function animerSystemeSolaireFluide(tempsActuel) {
    const dt = (tempsActuel - dernierTempsEcoule) / 1000;
    dernierTempsEcoule = tempsActuel;

    const facteurVitesseSg = dt / 10;

    anglesPlanetes.croquetis += (VITESSES_REVOLUTION.croquetis * facteurVitesseSg);
    anglesPlanetes.felina += (VITESSES_REVOLUTION.felina * facteurVitesseSg);
    anglesPlanetes.luna += (VITESSES_REVOLUTION.luna * facteurVitesseSg);
    anglesPlanetes.ronronis += (VITESSES_REVOLUTION.ronronis * facteurVitesseSg);
    anglesPlanetes.calinous += (VITESSES_REVOLUTION.calinous * facteurVitesseSg);
    anglesPlanetes.sardinia += (VITESSES_REVOLUTION.sardinia * facteurVitesseSg);
    
    if (typeof angleSatellitesBase !== 'undefined') {
      angleSatellitesBase += (5 * facteurVitesseSg);
    }

    const carteSolaire = document.getElementById('carte-systeme-solaire');
    if (carteSolaire && ongletActif === 'Espace') {
      
      // 📐 On applique les pivots CSS en continu
      document.getElementById('pivot-croquetis').style.transform = `translate(-50%, -50%) rotate(${anglesPlanetes.croquetis}deg)`;
      document.getElementById('pivot-felina').style.transform = `translate(-50%, -50%) rotate(${anglesPlanetes.felina}deg)`;
      document.getElementById('pivot-luna').style.transform = `translate(-50%, -50%) rotate(${anglesPlanetes.luna}deg)`;
      document.getElementById('pivot-ronronis').style.transform = `translate(-50%, -50%) rotate(${anglesPlanetes.ronronis}deg)`;
      document.getElementById('pivot-calinous').style.transform = `translate(-50%, -50%) rotate(${anglesPlanetes.calinous}deg)`;
      document.getElementById('pivot-sardinia').style.transform = `translate(-50%, -50%) rotate(${anglesPlanetes.sardinia}deg)`;

      // On appelle immédiatement la fonction pour positionner les textes au pixel près à cette frame exacte
      avancerCalendrierVirtuel(0); 

      // 🌟 ÉCOUTEUR ET GESTION DU CLIC SUR L'ÉTOILE MYSTÈRE
      const imgEtoile = document.getElementById('img-etoile-mystere');
      const txtEtoile = document.getElementById('hud-txt-etoile');
      
      const gererClicEtoile = () => {
        // 🌟 Le 9 octobre est requis impérativement ici aussi
        if (nbSatellites >= 30 && dateVirtuelle.jour === 9 && dateVirtuelle.mois === 9) {
          if (!etoileDecouverte) {
            etoileDecouverte = true;
            ouvrirNotificationCHA("Trajectoire décodée !","L'Étoile Mystère diffuse une onde d'énergie étrange... La compétence 'Happy Hour' est maintenant disponible à l'achat dans l'Observatoire !");
            avancerCalendrierVirtuel(0); // Forcer le rafraîchissement immédiat de l'indice de l'infobulle
            mettreAjourInterface();
            SON_REUSSITE_ETOILE.currentTime = 0;
            SON_REUSSITE_ETOILE.play();
          }
        }
      };

      if (imgEtoile && !imgEtoile.dataset.ecouteurEtoile) {
        imgEtoile.dataset.ecouteurEtoile = "true";
        imgEtoile.addEventListener('click', gererClicEtoile);
      }
      if (txtEtoile && !txtEtoile.dataset.ecouteurEtoile) {
        txtEtoile.dataset.ecouteurEtoile = "true";
        txtEtoile.addEventListener('click', gererClicEtoile);
      }

      // 🚀 RECUPERATION DES COORDONNEES EN DIRECT ET FLUIDES POUR LE TRANSIT DES FUSEES
      const txtFelina = document.getElementById('hud-txt-felina');
      const startX = txtFelina ? parseFloat(txtFelina.style.left) : 0;
      const startY = txtFelina ? parseFloat(txtFelina.style.top) - 22 : -190;

      for (let planete in colonisation) {
        if (colonisation[planete].enVoyage) {
          const spFusee = document.getElementById(`transit-fusee-${planete}`);
          const posCible = document.getElementById(`hud-txt-${planete}`);

          if (spFusee && posCible) {
            let endX = parseFloat(posCible.style.left);
            let endY = parseFloat(posCible.style.top) - (planete === 'luna' ? 10 : 20);

            let tempsEcouleMs = tempsActuel - colonisation[planete].timestampDepart;
            let pctVisuel = Math.min(1, Math.max(0, tempsEcouleMs / colonisation[planete].dureeTotaleMs));

            if (pctVisuel >= 1) {
              spFusee.style.left = `${endX}px`;
              spFusee.style.top = `${endY}px`;
              
              colonisation[planete].enVoyage = false;
              colonisation[planete].niveau++;

              setTimeout(() => {
                spFusee.remove(); 
                let boostRoches = planete === 'luna' ? 1 : (planete === 'croquetis' ? 5 : (planete === 'ronronis' ? 25 : (planete === 'calinous' ? 100 : 500)));
                multiplicateursPassifs.roches += boostRoches;

                if (!colonisation[planete].drapeauPose) {
                  colonisation[planete].drapeauPose = true;
                  creerDrapeauVisuelSurPlanete(planete);
                }
                mettreAjourInterface();
              }, 50);

            } else {
              let actuelX = startX + (endX - startX) * pctVisuel;
              let actuelY = startY + (endY - startY) * pctVisuel;
              const angleVisuel = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

              spFusee.style.left = `${actuelX}px`;
              spFusee.style.top = `${actuelY}px`;
              spFusee.style.transform = `translate(-50%, -50%) rotate(${angleVisuel + 90}deg)`;
            }
          }
        }
      }

      for (let i = 1; i <= nbSatellites; i++) {
        const satElement = document.getElementById(`pivot-sat-${i}`);
        if (satElement) satElement.style.transform = `rotate(${((360 / 30) * i) + angleSatellitesBase}deg)`;
      }
    }
    requestAnimationFrame(animerSystemeSolaireFluide);
  }

  function lancerFuseeColonisation(planeteKey, dureeDeBase) {
    // 1. Définition de la vitesse physique de base (en pixels par seconde réelle)
    let vitesseFusee = 1; 
    
    // Les améliorations augmentent directement la vitesse linéaire (en pixels/s) de la fusée
    if (upgradesFusee.croquettes)       vitesseFusee += 1;  
    if (upgradesFusee.plasma)           vitesseFusee += 2;  
    if (upgradesFusee.hyperpropulsion)  vitesseFusee += 5;  
    if (upgradesFusee.distorsion)       vitesseFusee += 10; 

    // 2. Récupération des coordonnées pour calculer la vraie distance sur l'écran (sans jump)
    const carteSolaire = document.getElementById('carte-systeme-solaire');
    
    // On calcule la position de départ fluide de Félina en radians
    const radFelina = (anglesPlanetes.felina - 90) * Math.PI / 180;
    const startX = Math.cos(radFelina) * 190;
    const startY = (Math.sin(radFelina) * 190) - 190;

    // On récupère les coordonnées de la planète cible
    let endX = 0, endY = 0;
    const posCible = document.getElementById(`hud-txt-${planeteKey}`); 
    if (posCible) {
      endX = parseFloat(posCible.style.left);
      endY = parseFloat(posCible.style.top) - 20;
    }

    if (carteSolaire) {
      // Calcul mathématique de la distance en pixels (Théorème de Pythagore)
      const distancePixels = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - (startY - 22), 2));

      // Calcul du temps de voyage réel en secondes (Temps = Distance / Vitesse)
      const tempsVoyageSecondes = distancePixels / vitesseFusee;
      const dureeTotaleMs = tempsVoyageSecondes * 1000;

      // Calcul équivalent en "jours virtuels" pour l'affichage (1j = 10s réelles)
      let joursEstimes = Math.max(1, Math.round(tempsVoyageSecondes / 10));

      // Enregistrement des données de mission
      colonisation[planeteKey].enVoyage = true;
      colonisation[planeteKey].joursRestants = joursEstimes; 
      colonisation[planeteKey].timestampDepart = performance.now();
      colonisation[planeteKey].dureeTotaleMs = dureeTotaleMs;

      // 3. Création visuelle de la fusée
      const fuséeVisuelle = document.createElement('img');
      fuséeVisuelle.src = "images/fusee/fusee.png";
      fuséeVisuelle.id = `transit-fusee-${planeteKey}`;
      fuséeVisuelle.style.position = "absolute";
      fuséeVisuelle.style.width = "20px";
      fuséeVisuelle.style.height = "20px";
      fuséeVisuelle.style.zIndex = "450";
      fuséeVisuelle.style.transform = "translate(-50%, -50%)";
      fuséeVisuelle.style.filter = "drop-shadow(0 0 5px var(--accent))";
      
      fuséeVisuelle.style.left = `${startX}px`;
      fuséeVisuelle.style.top = `${startY - 22}px`; // Ajusté sur le centre de Félina

      carteSolaire.appendChild(fuséeVisuelle);
    }

    mettreAjourInterface();
  }

  function creerDrapeauVisuelSurPlanete(planeteKey) {
    const corpsPlanete = document.getElementById(`corps-${planeteKey}`);
    if (!corpsPlanete) return;

    const drapeau = document.createElement('img');
    drapeau.src = "images/drapeau.png"; 
    drapeau.style.position = "absolute";
    
    // 🌟 REGLAGE DE PRECISION POUR LUNA
    if (planeteKey === 'luna') {
      drapeau.style.top = "-7px";    // Remonté légèrement pour sortir du cratère
      drapeau.style.left = "4px";    // Toujours aligné sur les 16px de Luna
      drapeau.style.width = "14px";
    } else if (planeteKey === 'croquetis') {
      // Pour les autres planètes plus grandes
      drapeau.style.top = "-13px";
      drapeau.style.left = "10px";
      drapeau.style.width = "22px";
    } else if (planeteKey === 'sardinia'){
      drapeau.style.top = "-12px";
      drapeau.style.left = "10px";
      drapeau.style.width = "22px";
    } else {
      drapeau.style.top = "-7px";
      drapeau.style.left = "10px";
      drapeau.style.width = "22px";
    }
    
    drapeau.style.height = "auto";
    drapeau.style.zIndex = "500";
    drapeau.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.6))";

    corpsPlanete.appendChild(drapeau);
  }

  function verifierLancementInterstellaire() {
    if (elementsInterstellaires.coque && elementsInterstellaires.reservoir && elementsInterstellaires.propulseur && !elementsInterstellaires.pret) {
      elementsInterstellaires.pret = true;
   
      const btnLancement = document.getElementById('btn-lancer-voyage-final');
      if (btnLancement) {
        btnLancement.style.display = 'block';
        btnLancement.onclick = () => {
          voyageDemarre = true;
          genererEtoilesVitesse(); // 🌟 ON GÉNÈRE LES ÉTOILES ICI
          const tabVoyage = document.getElementById('tab-voyage');
          if (tabVoyage) {
            tabVoyage.style.display = 'block'; //
            tabVoyage.classList.add('nouveau-clignotant'); // 🌟 MODIFICATION ICI
          }
          ouvrirNotificationCHA("Décollage réussi !","Vous quittez le système solaire et devez récolter de la Matière Noire pour aller à la vitesse de la lumière !");
          document.getElementById('tab-voyage').click();
        };
      }
    }
  }

  // --- MOTEUR DU VOYAGE FINAL ---
  setInterval(boucleVoyageFinal, 50);

  function boucleVoyageFinal() {
    if (!voyageDemarre || ongletActif !== 'Voyage Final') return;

    // Plus de gain passif de vitesse ici. L'UI se met juste à jour.
    document.getElementById('remplissage-lumiere').style.width = `${vitesseLumierePct}%`;
    document.getElementById('texte-lumiere').textContent = `VITESSE LUMIÈRE : ${vitesseLumierePct.toFixed(1)}%`;
    
    // Défilement des étoiles vers la gauche (Changement du sens de backgroundPosition)
    document.getElementById('fond-etoiles-vitesse').style.backgroundPosition = `${-performance.now() * (0.05 + vitesseLumierePct/100)}px 0px`;

    verifierLoreVoyage();

    // Spawn des astéroïdes
    let chanceSpawn = 0.02 + (vitesseLumierePct / 500);
    if (Math.random() < chanceSpawn && asteroidesActifs.length < 15) {
      creerAsteroideCible();
    }

    // Déplacement des astéroïdes (vers la gauche !)
    for (let i = asteroidesActifs.length - 1; i >= 0; i--) {
      let ast = asteroidesActifs[i];
      ast.posX -= ast.vitesse; 
      ast.element.style.left = `${ast.posX}px`;
      
      if (ast.posX < -100) { // Disparait à gauche
        ast.element.remove();
        asteroidesActifs.splice(i, 1);
      }
    }

    // 🔫 LASERS AUTOMATIQUES AVEC COOLDOWN (Équilibrage)
    // Le délai diminue avec les améliorations (minimum 200ms)
    let delaiMax = Math.max(500, 3000 - (lasersVoyage.tourelle * 50) - (lasersVoyage.canon * 150) - (lasersVoyage.ia * 300));
    let degatsTir = (lasersVoyage.tourelle * 1) + (lasersVoyage.canon * 5) + (lasersVoyage.ia * 25);

    if (!window.timerLaserAutomatique) window.timerLaserAutomatique = 0;
    window.timerLaserAutomatique += 50;

    if (degatsTir > 0 && asteroidesActifs.length > 0 && window.timerLaserAutomatique >= delaiMax) {
      window.timerLaserAutomatique = 0;
      let cible = asteroidesActifs[0];
      cible.hp -= degatsTir;
      
      dessinerRayonLaser(cible.element);

      if (cible.hp <= 0) {
        ressources.matiereNoire += cible.gainMax;
        cible.element.remove();
        asteroidesActifs.shift();
        mettreAjourInterface();
      } else {
        cible.element.textContent = Math.ceil(cible.hp);
      }
    }
  }

  function creerAsteroideCible() {
    const isTop = Math.random() > 0.5;
    const conteneur = document.getElementById(isTop ? 'zone-asteroides-top' : 'zone-asteroides-bottom');
    const ast = document.createElement('div');
    ast.className = 'asteroide-cible';
    
    // 🌟 HP de base beaucoup plus élevés au début (minimum 5 à 15 PV)
    let hpBase = Math.floor(Math.random() * 15) + 10 + Math.floor(vitesseLumierePct * 5);
    let taille = 50 + Math.min(80, hpBase); // Hitbox beaucoup plus grande
    
    ast.style.width = `${taille}px`;
    ast.style.height = `${taille}px`;
    ast.style.top = `${Math.random() * 70}%`;
    
    // 🌟 Textures et couleurs
    ast.style.backgroundImage = "url('images/espace/ma1.png')";
    ast.style.backgroundSize = "contain";
    ast.style.backgroundRepeat = "no-repeat";
    ast.style.backgroundPosition = "center";
    ast.style.backgroundColor = "transparent"; 
    ast.style.boxShadow = "none";
    ast.style.color = "black";
    ast.style.fontWeight = "900";
    ast.style.fontSize = "16px";
    ast.style.textShadow = "0 0 6px white"; // Petit halo blanc pour la lisibilité
    
    ast.textContent = hpBase;

    // L'astéroïde démarre à l'extrémité droite de l'écran
    let objAsteroide = { element: ast, posX: window.innerWidth + 50, vitesse: 3 + Math.random() * 4 + (vitesseLumierePct / 10), hp: hpBase, gainMax: hpBase };
    
    // Remplacer ast.onclick par ceci dans creerAsteroideCible :
    let intervalleTirManuel = null;

    const effectuerTirManuel = () => {
      if (objAsteroide.hp <= 0) {
        clearInterval(intervalleTirManuel);
        return;
      }
      let bonusManuel = (nbLasersManuels || 0) * 10;
      let degatsClic = 2 + (lasersVoyage.tourelle * 1) + (lasersVoyage.canon * 2) + bonusManuel; 
      
      objAsteroide.hp -= degatsClic;
      ast.textContent = Math.ceil(objAsteroide.hp);
      dessinerRayonLaser(ast);

      if (objAsteroide.hp <= 0) {
        let multiMoissonneurGlobal = Math.pow(2, lvlVoyageMoissonneurVide);
        ressources.matiereNoire += (objAsteroide.gainMax * multiMoissonneurGlobal);
        
        ast.remove();
        asteroidesActifs = asteroidesActifs.filter(a => a !== objAsteroide);
        mettreAjourInterface();
        clearInterval(intervalleTirManuel);
      }
    };

    const stopperTirManuel = () => {
      if (intervalleTirManuel) {
        clearInterval(intervalleTirManuel);
        intervalleTirManuel = null;
      }
    };

    ast.addEventListener('mouseup', stopperTirManuel);
    ast.addEventListener('mouseleave', stopperTirManuel);

    conteneur.appendChild(ast);
    asteroidesActifs.push(objAsteroide);
  }

  // 🌟 SYSTÈME DE TIR ULTRA-FLUIDE : UNIFIÉ (VIDE + ASTÉROÏDES EN CONTINU)
  const zoneVoyageGlobal = document.getElementById('vue-voyage');
  let intervalleLaserGlobal = null;

  if (zoneVoyageGlobal) {
    const gererCadenceTirUnique = (clientX, clientY) => {
      // 🛒 SÉCURITÉ : Bloque le tir si on survole la boutique ou le carnet
      const elementSurvole = document.elementFromPoint(clientX, clientY);
      if (!elementSurvole || elementSurvole.closest('.zone-boutique') || elementSurvole.closest('.icone-lore')) return;

      const rectVue = zoneVoyageGlobal.getBoundingClientRect();
      const departX = rectVue.width / 2;
      const departY = rectVue.height / 2;
      const arriveeX = clientX - rectVue.left;
      const arriveeY = clientY - rectVue.top;

      // 1. Dessin visuel du laser (Nettoyé pour éviter le clignotement)
      const distance = Math.sqrt(Math.pow(arriveeX - departX, 2) + Math.pow(arriveeY - departY, 2));
      const angle = Math.atan2(arriveeY - departY, arriveeX - departX) * 180 / Math.PI;

      // 🌟 SUPPRIME L'ANCIEN LASER S'IL EXISTE DÉJÀ POUR ÉVITER LE CLIGNOTEMENT
      const ancienLaser = zoneVoyageGlobal.querySelector('.laser-beam');
      if (ancienLaser) ancienLaser.remove();

      const laser = document.createElement('div');
      laser.className = 'laser-beam';
      laser.style.width = `${distance}px`;
      laser.style.left = `${departX}px`;
      laser.style.top = `${departY}px`;
      laser.style.transform = `translateY(-50%) rotate(${angle}deg)`;

      zoneVoyageGlobal.appendChild(laser);
      
      // Augmenté à 160ms pour couvrir parfaitement l'intervalle de tir de 150ms
      setTimeout(() => laser.remove(), 160);

      // 2. Traitement des dégâts si l'élément survolé est (ou contient) un astéroïde
      const cibleAsteroide = elementSurvole.closest('.asteroide-cible');
      if (cibleAsteroide) {
        const objAsteroide = asteroidesActifs.find(a => a.element === cibleAsteroide);
        if (objAsteroide && objAsteroide.hp > 0) {
          let bonusManuel = (nbLasersManuels || 0) * 10;
          let degatsClic = 2 + (lasersVoyage.tourelle * 1) + (lasersVoyage.canon * 2) + bonusManuel;

          objAsteroide.hp -= degatsClic;
          cibleAsteroide.textContent = Math.ceil(objAsteroide.hp);

          if (objAsteroide.hp <= 0) {
            let multiMoissonneurGlobal = Math.pow(2, lvlVoyageMoissonneurVide);
            ressources.matiereNoire += (objAsteroide.gainMax * multiMoissonneurGlobal);
            
            cibleAsteroide.remove();
            asteroidesActifs = asteroidesActifs.filter(a => a !== objAsteroide);
            mettreAjourInterface();
          }
        }
      }
    };

    // Variables pour mémoriser la dernière position de la souris
    let sourisX = 0;
    let sourisY = 0;

    zoneVoyageGlobal.addEventListener('mousedown', (e) => {
      sourisX = e.clientX;
      sourisY = e.clientY;
      
      // Premier tir instantané
      gererCadenceTirUnique(sourisX, sourisY);
      
      // Rafraîchissement automatique à 150ms
      intervalleLaserGlobal = setInterval(() => {
        gererCadenceTirUnique(sourisX, sourisY);
      }, 150);
    });

    // Actualise en continu la visée si on déplace la souris pendant le clic
    zoneVoyageGlobal.addEventListener('mousemove', (e) => {
      sourisX = e.clientX;
      sourisY = e.clientY;
    });

    const stopperTirGlobal = () => {
      if (intervalleLaserGlobal) {
        clearInterval(intervalleLaserGlobal);
        intervalleLaserGlobal = null;
      }
    };

    zoneVoyageGlobal.addEventListener('mouseup', stopperTirGlobal);
    zoneVoyageGlobal.addEventListener('mouseleave', stopperTirGlobal);
  }

  function dessinerRayonLaser(cibleDiv) {
    const vueVoyage = document.getElementById('vue-voyage');
    if (!vueVoyage || !cibleDiv) return;

    const rectVue = vueVoyage.getBoundingClientRect();
    const rectCible = cibleDiv.getBoundingClientRect();
    
    const departX = rectVue.width / 2;
    const departY = rectVue.height / 2;
    const arriveeX = rectCible.left - rectVue.left + (rectCible.width / 2);
    const arriveeY = rectCible.top - rectVue.top + (rectCible.height / 2);

    const distance = Math.sqrt(Math.pow(arriveeX - departX, 2) + Math.pow(arriveeY - departY, 2));
    const angle = Math.atan2(arriveeY - departY, arriveeX - departX) * 180 / Math.PI;

    const laser = document.createElement('div');
    laser.className = 'laser-beam';
    laser.style.width = `${distance}px`;
    laser.style.left = `${departX}px`;
    laser.style.top = `${departY}px`;
    laser.style.transform = `translateY(-50%) rotate(${angle}deg)`;

    vueVoyage.appendChild(laser);

    // Le laser disparaît très vite
    setTimeout(() => laser.remove(), 100);
  }

  // 🌟 FONCTION DE PAGINATION AUTOMATIQUE DU LIVRE
  function ajouterTexteLivrePagine(titreInitial, texteComplet) {
    const LIMITE_CARACTERES = 610; // Nombre max de caractères par page (ajustable)
    let lignes = texteComplet.split('\n');
    let pageCourante = "";
    let indexSuite = 1;

    for (let l = 0; l < lignes.length; l++) {
      let mots = lignes[l].split(' ');
      for (let m = 0; m < mots.length; m++) {
        let mot = mots[m];
        // Si ajouter ce mot dépasse la limite, on valide la page et on en crée une nouvelle
        if (pageCourante.length + mot.length > LIMITE_CARACTERES) {
          pagesLore.push({ 
            titre: indexSuite === 1 ? titreInitial : `${titreInitial} (Suite)`, 
            texte: pageCourante.trim() 
          });
          pageCourante = "";
          indexSuite++;
        }
        pageCourante += mot + " ";
      }
      pageCourante += "\n"; // Conserve les sauts de ligne d'origine
    }
    
    // Ajoute le reste du texte sur la dernière page
    if (pageCourante.trim().length > 0) {
      pagesLore.push({ 
        titre: indexSuite === 1 ? titreInitial : `${titreInitial} (Suite)`, 
        texte: pageCourante.trim() 
      });
    }
  }

  function verifierLoreVoyage() {
    let declencheur = null;
    if (vitesseLumierePct >= 5 && !loreVoyage.l5.lu) declencheur = loreVoyage.l5;
    else if (vitesseLumierePct >= 25 && !loreVoyage.l25.lu) declencheur = loreVoyage.l25;
    else if (vitesseLumierePct >= 50 && !loreVoyage.l50.lu) declencheur = loreVoyage.l50;
    
    // 🌟 PALIER 75% : On intercepte le moment précis du déclenchement
    else if (vitesseLumierePct >= 75 && !loreVoyage.l75.lu) {
      declencheur = loreVoyage.l75;
      // 🎵 JOUE LA MUSIQUE DIRECTEMENT AU PASSAGE DES 75% !
      changerMusiqueTemporaire("sons/ambiance/grief_and_sorrow.mp3"); 
    }
    
    else if (vitesseLumierePct >= 100 && !loreVoyage.l100.lu) declencheur = loreVoyage.l100;

    if (declencheur && !nouveauLoreEnAttente) {
      if (vitesseLumierePct >= 5) loreVoyage.l5.lu = true; 
      if (vitesseLumierePct >= 25) loreVoyage.l25.lu = true; 
      if (vitesseLumierePct >= 50) loreVoyage.l50.lu = true; 
      if (vitesseLumierePct >= 75) loreVoyage.l75.lu = true; 
      if (vitesseLumierePct >= 100) loreVoyage.l100.lu = true; 

      let indexNouvellePage = 0; // 🌟 ON PRÉPARE LA MÉMORISATION DE LA PAGE

      pagesLore = [];
      
      if (vitesseLumierePct >= 5) {
        if (declencheur === loreVoyage.l5) indexNouvellePage = pagesLore.length; // 🌟 CAPTURE L'INDEX
        ajouterTexteLivrePagine("5%", "Cela fait maintenant quelques jours que la Terre n'est plus qu'un lointain souvenir. Nous sommes entourés d'un décor féerique, une toile infinie où scintillent des milliers d'étoiles colorées. Nous contemplons ce spectacle, le cœur empli d'un émerveillement presque enfantin. Également, les chats ingénieurs ont découvert que l’on pouvait exploiter les astéroïdes pour améliorer le vaisseau. Chaque débris récolté devient une promesse, un pas de plus vers notre Étoile sacrée. Notre épopée ne fait que commencer.");
      }
      if (vitesseLumierePct >= 25) {
        if (declencheur === loreVoyage.l25) indexNouvellePage = pagesLore.length;
        ajouterTexteLivrePagine("25%", "Nous venons de franchir le quart de la vitesse maximale. Nos technologies s'affinent à mesure que nos lasers fendent la matière noire. Mais l'espace est cruel, et le temps, trop long pour nos existences éphémères. Pour espérer contempler un jour notre Étoile de nos propres yeux, nous avons inventé la cryogénisation. Nous allons nous endormir, bercés par le bourdonnement des moteurs. Juste avant de sombrer dans ce grand sommeil, une étrange lueur a capté nos capteurs... Un signal lointain, vibrant au cœur d'un système similaire au nôtre. Une autre vie bat-elle dans cet Univers?");
      }
      if (vitesseLumierePct >= 50) {
        if (declencheur === loreVoyage.l50) indexNouvellePage = pagesLore.length;
        ajouterTexteLivrePagine("50%", "Moitié de la vitesse maximale atteinte. À notre réveil, le vertige nous saisit : nous ne sommes pas seuls. L'Univers abrite d'autres âmes, une espèce mystérieuse se faisant appeler les Chiens. Leur savoir et leur technologie dépassent tout ce que nous avions osé imaginer. Pourtant, nulle ombre de menace ne plane sur cette rencontre. Derrière la barrière de nos langues encore maladroites, nous ne lisons que de la bienveillance dans leurs regards. Ils nous tendent la main, prêts à guider nos pas maladroits à travers le vide.");
      }
      if (vitesseLumierePct >= 75) {
        if (declencheur === loreVoyage.l75) indexNouvellePage = pagesLore.length;
        ajouterTexteLivrePagine("75%", "Trois quarts de la vitesse de la lumière. Grâce à l’alliance née avec les Chiens, notre traducteur murmure enfin des mots clairs. Mais la vérité qu'il nous apporte a l'effet d'un coup de poignard. En tournant leurs instruments vers la position de l'Étoile, les Chiens parviennent à l’interroger. Leur rapport est effroyable : autrefois, elle a posé son regard sur les chats et elle s'est rendu compte que notre nature ne lui correspondait pas. Elle a choisi de se tourner vers les astres, préférant la compagnie des autres étoiles à nos visages. Depuis ce jour, un voile de deuil s’est abattu sur le vaisseau. Le silence est devenu lourd de larmes invisibles. À quoi bon continuer ? Pourquoi avoir consenti à tant de sacrifices, tant de nuits blanches passées les yeux rivés vers le ciel, à tenter de l'effleurer du regard, si notre Étoile ne nous aime plus ?");
      }
      if (vitesseLumierePct >= 100) {
        if (declencheur === loreVoyage.l100) indexNouvellePage = pagesLore.length;
        ajouterTexteLivrePagine("100%", "La mélancolie nous rongeait l'âme, nous étions prêts à couper les moteurs et à nous laisser dériver à jamais. C'est alors qu'au milieu des décombres de nos espoirs, un chat a pris la parole : \n“Je me console en pensant qu'ailleurs, dans un autre repli du temps, une autre version de nous qui a réussi nous sourit. Mais si cette version existe, c’est qu’elle est née de la même étincelle que nous. Alors je m'accroche. Parce que si cet idéal est assez vaste pour remplir un autre monde, il est peut-être assez puissant pour finir par s’imposer dans celui-ci.”\nCes mots ont rallumé un feu que nous croyions éteint. Qu'importe le refus de l'Étoile, qu'importe si le voyage doit durer une éternité. Nous choisissons de continuer à avancer, quitte à souffrir encore. On nous traitera peut-être d'idiots, de fous obstinés courant après un mirage indifférent. Mais il y a une chose que l'immensité de l'Univers ne pourra jamais nous arracher : la pureté de notre dévouement et la beauté de notre amour inébranlable pour elle. Nous ne fermons pas nos yeux au reste du cosmos, car il existe sans doute d'autres étoiles plus clémentes et plus brillantes dans l'infini. Mais pour l'instant, pour nos cœurs de minou, elle reste la plus belle chose que nos yeux aient jamais contemplée. Et pour cela, nous attendrons le temps qu'il faudra. Nous sommes prêts à nous endormir pour l’éternité si il le faut…");
      }

      modeLivre = 'lore'; 
      
      // 🌟 SE POSITIONNE PARFAITEMENT SUR LA DOUBLE PAGE DU NOUVEAU TEXTE
      pageActuelleLivre = Math.floor(indexNouvellePage / 2) * 2; 
      
      const modal = document.getElementById('modal-grand-livre'); 
      if (modal) modal.style.display = "flex"; 
      renderPagesLivre(); 
      
      // Nettoie l'état du bouton cliquable au cas où
      document.getElementById('btn-carnet-voyage').classList.remove('nouveau'); 
      nouveauLoreEnAttente = false; 
    }
  }

  const btnCarnetVoyage = document.getElementById('btn-carnet-voyage');
  if (btnCarnetVoyage) {
    btnCarnetVoyage.addEventListener('click', () => {
      btnCarnetVoyage.classList.remove('nouveau');
      nouveauLoreEnAttente = false;

      if (vitesseLumierePct >= 5) loreVoyage.l5.lu = true;
      if (vitesseLumierePct >= 25) loreVoyage.l25.lu = true;
      if (vitesseLumierePct >= 50) loreVoyage.l50.lu = true;
      if (vitesseLumierePct >= 75) loreVoyage.l75.lu = true;
      if (vitesseLumierePct >= 100) loreVoyage.l100.lu = true;

      pagesLore = [];
      
      if (vitesseLumierePct >= 5) {
        ajouterTexteLivrePagine("5%", "Cela fait maintenant quelques jours que la Terre n'est plus qu'un lointain souvenir. Nous sommes entourés d'un décor féerique, une toile infinie où scintillent des milliers d'étoiles colorées. Nous contemplons ce spectacle, le cœur empli d'un émerveillement presque enfantin. Également, les chats ingénieurs ont découvert que l’on pouvait exploiter les astéroïdes pour améliorer le vaisseau. Chaque débris récolté devient une promesse, un pas de plus vers notre Étoile sacrée. Notre épopée ne fait que commencer.");
      }
      if (vitesseLumierePct >= 25) {
        ajouterTexteLivrePagine("25%", "Nous venons de franchir le quart de la vitesse maximale. Nos technologies s'affinent à mesure que nos lasers fendent la matière noire. Mais l'espace est cruel, et le temps, trop long pour nos existences éphémères. Pour espérer contempler un jour notre Étoile de nos propres yeux, nous avons inventé la cryogénisation. Nous allons nous endormir, bercés par le bourdonnement des moteurs. Juste avant de sombrer dans ce grand sommeil, une étrange lueur a capté nos capteurs... Un signal lointain, vibrant au cœur d'un système similaire au nôtre. Une autre vie bat-elle dans cet Univers?");
      }
      if (vitesseLumierePct >= 50) {
        ajouterTexteLivrePagine("50%", "Moitié de la vitesse maximale atteinte. À notre réveil, le vertige nous saisit : nous ne sommes pas seuls. L'Univers abrite d'autres âmes, une espèce mystérieuse se faisant appeler les Chiens. Leur savoir et leur technologie dépassent tout ce que nous avions osé imaginer. Pourtant, nulle ombre de menace ne plane sur cette rencontre. Derrière la barrière de nos langues encore maladroites, nous ne lisons que de la bienveillance dans leurs regards. Ils nous tendent la main, prêts à guider nos pas maladroits à travers le vide.");
      }
      if (vitesseLumierePct >= 75) {
        ajouterTexteLivrePagine("75%", "Trois quarts de la vitesse de la lumière. Grâce à l’alliance née avec les Chiens, notre traducteur murmure enfin des mots clairs. Mais la vérité qu'il nous apporte a l'effet d'un coup de poignard. En tournant leurs instruments vers la position de l'Étoile, les Chiens parviennent à l’interroger. Leur rapport est effroyable : autrefois, elle a posé son regard sur les chats et elle s'est rendu compte que notre nature ne lui correspondait pas. Elle a choisi de se tourner vers les astres, préférant la compagnie des autres étoiles à nos visages. Depuis ce jour, un voile de deuil s’est abattu sur le vaisseau. Le silence est devenu lourd de larmes invisibles. À quoi bon continuer ? Pourquoi avoir consenti à tant de sacrifices, tant de nuits blanches passées les yeux rivés vers le ciel, à tenter de l'effleurer du regard, si notre Étoile ne nous aime plus ?");
      }
      if (vitesseLumierePct >= 100) {
        ajouterTexteLivrePagine("100%", "La mélancolie nous rongeait l'âme, nous étions prêts à couper les moteurs et à nous laisser dériver à jamais. C'est alors qu'au milieu des décombres de nos espoirs, un chat a pris la parole : \n“Je me console en pensant qu'ailleurs, dans un autre repli du temps, une autre version de nous qui a réussi nous sourit. Mais si cette version existe, c’est qu’elle est née de la même étincelle que nous. Alors je m'accroche. Parce que si cet idéal est assez vaste pour remplir un autre monde, il est peut-être assez puissant pour finir par s’imposer dans celui-ci.”\nCes mots ont rallumé un feu que nous croyions éteint. Qu'importe le refus de l'Étoile, qu'importe si le voyage doit durer une éternité. Nous choisissons de continuer à avancer, quitte à souffrir encore. On nous traitera peut-être d'idiots, de fous obstinés courant après un mirage indifférent. Mais il y a une chose que l'immensité de l'Univers ne pourra jamais nous arracher : la pureté de notre dévouement et la beauté de notre amour inébranlable pour elle. Nous ne fermons pas nos yeux au reste du cosmos, car il existe sans doute d'autres étoiles plus clémentes et plus brillantes dans l'infini. Mais pour l'instant, pour nos cœurs de minou, elle reste la plus belle chose que nos yeux aient jamais contemplée. Et pour cela, nous attendrons le temps qu'il faudra. Nous sommes prêts à nous endormir pour l’éternité si il le faut…");
      }

      modeLivre = 'lore';
      pageActuelleLivre = 0;
      
      const modal = document.getElementById('modal-grand-livre');
      if (modal) modal.style.display = "flex";
      renderPagesLivre();
    });
  }

  // Si on clique directement sur la jauge pleine, ça ouvre le livre
  document.getElementById('barre-lumiere').addEventListener('click', () => {
    if (vitesseLumierePct >= 100) {
      document.getElementById('btn-carnet-voyage').click();
    }
  });

  function declencherFinDuJeu() {
    const conteneurGlobal = document.getElementById('conteneur-secret-final');
    if (!conteneurGlobal) return;

    // 🌟 INJECTION DYNAMIQUE DES ÉCRANS CACHÉS AU MOMENT DU DÉCLENCHEMENT
    conteneurGlobal.innerHTML = `
      <div id="ecran-hibernation" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: white; z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 4s ease-in-out; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center;">
        <div id="conteneur-textes-fin" style="opacity: 0; transition: opacity 2s ease-in-out 3s; display: flex; flex-direction: column; gap: 30px; max-width: 800px;">
          <p style="color: black; font-size: 24px; font-weight: bold; font-family: sans-serif !important; line-height: 1.6; margin: 0;">
            Les chats parcourent désormais l'Univers à la vitesse de la lumière à la poursuite de leur Étoile. Un jour, peut-être, ils atteindront leur but...
          </p>
          <p style="color: #555; font-size: 18px; font-weight: bold; font-family: sans-serif !important; margin: 0; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 15px 0;">
            Temps écoulé depuis l'envoi de la lettre : <span id="compteur-temps-reel-fin" style="color: #000;">0j 0h 0min 0s</span>
          </p>
          <p style="color: #666; padding: 10px; font-size: 32px; font-family: 'AlphabetCHA', sans-serif !important; margin: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
            Maintenant j'espère que tu as compris le vrai sens caché...
          </p>
          <div id="zone-bouton-secret" style="text-align: center; margin-top: 20px; display: none;">
            <button id="btn-secret-pas-fin" style="background: transparent; border: 1px dashed #333; color: #555; padding: 12px 24px; cursor: pointer; font-size: 18px; border-radius: 4px; transition: all 0.3s; font-family: sans-serif !important;">
              et si ce n'était la fin...
            </button>
          </div>
        </div>
      </div>

      <div id="ecran-question-secrete" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: white; z-index: 10000; flex-direction: column; align-items: center; justify-content: center; color: black; padding: 20px;">
        <p style="font-size: 36px; margin-bottom: 25px; text-align: center; max-width: 700px; line-height: 1.4; font-family: 'AlphabetCHA', sans-serif !important;">Quelle est le nom de l'Etoile que les chats admirent tant ?</p>
        <input type="text" id="input-reponse-secrete" style="padding: 12px; font-size: 22px; border: 2px solid #ccc; border-radius: 6px; text-align: center; width: 320px; margin-bottom: 20px; outline: none; font-family: 'AlphabetCHA', sans-serif !important;">
        <button id="btn-valider-reponse-secrete" style="padding: 12px 28px; font-size: 18px; background: #333; color: white; border: none; border-radius: 6px; cursor: pointer; font-family: sans-serif !important;">Valider</button>
      </div>

      <div id="ecran-enigme-ultime" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: white; z-index: 10001; flex-direction: column; align-items: center; justify-content: center; color: black; padding: 40px; text-align: center;">
        <p style="font-size: 36px; max-width: 850px; line-height: 1.5; font-family: 'AlphabetCHA', sans-serif !important;">Tu penses pas que les pages ont chaud ?</p>
        <div id="indice-chiffre-secret" style="color: white !important; font-size: 28px; font-family: sans-serif !important; margin-top: 15px; user-select: text !important; text-shadow: none !important;">CODE SECRET : 1031</div>
      </div>
    `;

    const ecranBlanc = document.getElementById('ecran-hibernation');
    const conteneurTextes = document.getElementById('conteneur-textes-fin');
    const txtCompteur = document.getElementById('compteur-temps-reel-fin');
    
    if (!ecranBlanc || !conteneurTextes) return;

    // Déclenche l'affichage progressif de la fin
    setTimeout(() => {
      ecranBlanc.style.opacity = '1';
      ecranBlanc.style.pointerEvents = 'auto';
    }, 50);

    setTimeout(() => {
      conteneurTextes.style.opacity = '1';
      const boutonSecretZone = document.getElementById('zone-bouton-secret');
      if (boutonSecretZone) {
        setTimeout(() => { boutonSecretZone.style.display = 'block'; }, 10000);
      }
    }, 3000);

    function actualiserCompteurFin() {
      const tempsEcouleMs = Date.now() - TIMESTAMP_DEBUT_PARTIE;
      let totalSecondes = Math.floor(tempsEcouleMs / 1000);
      let j = Math.floor(totalSecondes / (24 * 3600));
      totalSecondes %= (24 * 3600);
      let h = Math.floor(totalSecondes / 3600);
      totalSecondes %= 3600;
      let min = Math.floor(totalSecondes / 60);
      let s = totalSecondes % 60;

      if (document.body.classList.contains('traduit')) {
        txtCompteur.textContent = `${j} j ${h} h ${min} min ${s} s`;
      } else {
        txtCompteur.textContent = `${convertirNombreCHA(j)} j ${convertirNombreCHA(h)} h ${convertirNombreCHA(min)} min ${convertirNombreCHA(s)} s`;
      }
    }

    actualiserCompteurFin();
    setInterval(actualiserCompteurFin, 1000);

    // Réattachement dynamique des écouteurs sur les nouveaux éléments injectés
    const btnSecret = document.getElementById('btn-secret-pas-fin');
    const ecranQuestion = document.getElementById('ecran-question-secrete');
    const inputReponse = document.getElementById('input-reponse-secrete');
    const btnValider = document.getElementById('btn-valider-reponse-secrete');
    const ecranUltime = document.getElementById('ecran-enigme-ultime');

    if (btnSecret) {
      btnSecret.addEventListener('click', () => {
        if (musiqueFond) {
          musiqueFond.src = "sons/ambiance/prof_layton.mp3";
          musiqueFond.volume = VOLUME_MAX_CIBLE;
          musiqueFond.onended = null;
          musiqueFond.play().catch(e => {});
        }
        if (ecranQuestion) {
          ecranQuestion.style.display = 'flex';
          if (!document.getElementById('btn-retour-secret')) {
            const btnRetour = document.createElement('button');
            btnRetour.id = 'btn-retour-secret';
            btnRetour.textContent = '◀ Retour';
            btnRetour.style.cssText = "position: absolute; top: 20px; left: 20px; padding: 8px 15px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-family: sans-serif !important;";
            btnRetour.addEventListener('click', () => { ecranQuestion.style.display = 'none'; });
            ecranQuestion.appendChild(btnRetour);
          }
        }
      });
    }

    if (btnValider && inputReponse && ecranUltime) {
      const verifierReponse = () => {
        if (inputReponse.value.trim().toLowerCase() === 'estelle') {
          ecranUltime.style.display = 'flex';
          
          const btnRetourUltime = document.createElement('button');
          btnRetourUltime.id = 'btn-retour-ultime';
          btnRetourUltime.textContent = '◀ Page précédente';
          btnRetourUltime.style.cssText = "position: absolute; top: 20px; left: 20px; padding: 10px 20px; background: #2a2c2f; color: white; border: 1px solid #3d4146; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold; font-family: sans-serif !important; z-index: 10002;";
          btnRetourUltime.addEventListener('click', () => { ecranUltime.style.display = 'none'; });
          
          const btnRetourJeuUltime = document.createElement('button');
          btnRetourJeuUltime.id = 'btn-retour-jeu-ultime';
          btnRetourJeuUltime.textContent = 'Retourner au jeu';
          btnRetourJeuUltime.style.cssText = "position: absolute; top: 70px; left: 20px; padding: 10px 20px; background: #1a1b1d; color: var(--accent); border: 1px solid var(--accent); border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold; font-family: sans-serif !important; z-index: 10002;";
          btnRetourJeuUltime.addEventListener('click', () => {
            ecranUltime.style.display = 'none';
            ecranQuestion.style.display = 'none';
            ecranBlanc.style.opacity = '0';
            ecranBlanc.style.pointerEvents = 'none';
          });

          const btnResetUltime = document.createElement('button');
          btnResetUltime.id = 'btn-reset-ultime';
          btnResetUltime.textContent = 'Recommencer depuis le début (à faire UNIQUEMENT si vous avez fini)';
          btnResetUltime.style.cssText = "position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); padding: 12px 25px; background: #ff4d4d; color: #121315; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; font-family: sans-serif !important; z-index: 10002; box-shadow: 0 4px 15px rgba(255, 77, 77, 0.4);";
          btnResetUltime.addEventListener('click', () => {
            if (confirm("Êtes-vous sûr de vouloir effacer définitivement vos fichiers de données ?")) {
              localStorage.removeItem('cha_save_data');
              localStorage.removeItem('cha_save_hash');
              window.location.reload();
            }
          });
          
          ecranUltime.appendChild(btnRetourUltime);
          ecranUltime.appendChild(btnRetourJeuUltime);
          ecranUltime.appendChild(btnResetUltime);
        } else {
          inputReponse.style.borderColor = '#ff4d4d';
          inputReponse.classList.add('tremblement-erreur');
          setTimeout(() => { inputReponse.classList.remove('tremblement-erreur'); }, 400);
        }
      };

      btnValider.addEventListener('click', verifierReponse);
      inputReponse.addEventListener('keydown', (e) => { if (e.key === 'Enter') verifierReponse(); });
    }
  }

  const btnSwitch = document.getElementById('btn-switch-fusee');
  if (btnSwitch) {
    btnSwitch.addEventListener('click', () => {
      const hangarNormale = document.getElementById('couches-fusee-normale');
      const hangarInter = document.getElementById('couches-fusee-interstellaire');
      const boutiqueNormale = document.getElementById('boutique-fusee');
      const boutiqueInter = document.getElementById('boutique-fusee-interstellaire');

      if (modeFuseeActuel === "normale") {
        modeFuseeActuel = "interstellaire";
        btnSwitch.textContent = "<- Mode: Normale";
        if (hangarNormale) hangarNormale.style.display = 'none';
        if (hangarInter) hangarInter.style.display = 'block';
        if (boutiqueNormale) boutiqueNormale.style.display = 'none';
        if (boutiqueInter) boutiqueInter.style.display = 'block';
      } else {
        modeFuseeActuel = "normale";
        btnSwitch.textContent = "Mode: Interstellaire ->";
        if (hangarNormale) hangarNormale.style.display = 'block';
        if (hangarInter) hangarInter.style.display = 'none';
        if (boutiqueNormale) boutiqueNormale.style.display = 'block';
        if (boutiqueInter) boutiqueInter.style.display = 'none';
      }
      mettreAjourInterface();
    });
  }

  function genererEtoilesVitesse() {
    const fond = document.getElementById('fond-etoiles-vitesse');
    if (!fond) return;
    
    let bgString = [];
    // Un mélange de blanc basique et de couleurs rares (Bleu, Jaune, Rouge, Vert, Rose, Doré)
    const couleurs = ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#cceeff', '#ffffcc', '#ff6666', '#66ff66', '#99ccff', '#ffcc00', '#ff99ff'];
    
    for(let i = 0; i < 90; i++) { // Plus d'étoiles !
        let x = Math.floor(Math.random() * 600);
        let y = Math.floor(Math.random() * 600);
        let size = Math.random() * 2.5 + 0.5;
        let col = couleurs[Math.floor(Math.random() * couleurs.length)];
        bgString.push(`radial-gradient(circle at ${x}px ${y}px, ${col} ${size}px, transparent ${size + 1}px)`);
    }
    
    fond.style.backgroundImage = bgString.join(', ');
    fond.style.backgroundSize = "600px 600px";
    fond.style.opacity = "0.9";
  }

  function genererEtoilesEspaceDOM() {
    const conteneur = document.getElementById('fond-etoiles-espace');
    if (!conteneur) return;
    conteneur.innerHTML = ''; // Sécurité : on vide avant de remplir

    const couleurs = ['#ffffff', '#ffffff', '#ffffff', '#cceeff', '#ffffcc', '#ff6666', '#66ff66', '#99ccff', '#ffcc00', '#ff99ff'];

    // On disperse 350 étoiles aléatoirement sur les 4000px
    for (let i = 0; i < 5000; i++) {
      let etoile = document.createElement('div');
      let size = Math.random() * 2.5 + 0.5;
      let col = couleurs[Math.floor(Math.random() * couleurs.length)];
      
      etoile.style.position = 'absolute';
      etoile.style.width = `${size}px`;
      etoile.style.height = `${size}px`;
      etoile.style.background = col;
      etoile.style.borderRadius = '50%';
      etoile.style.left = `${Math.random() * 4000}px`;
      etoile.style.top = `${Math.random() * 4000}px`;
      etoile.style.boxShadow = `0 0 ${Math.random() * 4 + 2}px ${col}`; // Petit halo
      
      conteneur.appendChild(etoile);
    }
  }

  function synchroniserVraieHeureInternet() {
    // On s'appelle soi-même sur Netlify pour choper l'en-tête HTTP 'Date'
    fetch(window.location.href, { method: 'HEAD' })
      .then(res => {
        const dateHeader = res.headers.get('Date');
        if (!dateHeader) throw new Error("Pas d'en-tête Date");
        
        const vraieDateInternet = new Date(dateHeader);
        const heurePC = new Date();
        
        // 1. Calcul du décalage brut en millisecondes (latence réseau)
        decalageHeureReelleMs = vraieDateInternet.getTime() - heurePC.getTime();

        // 2. Extraction des deux heures au format numérique pour comparer les fuseaux
        const optionsFrance = { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false };
        const heureFrStr = vraieDateInternet.toLocaleTimeString('fr-FR', optionsFrance);
        const hFrance = parseInt(heureFrStr, 10);
        const hPC = heurePC.getHours();

        // Config pour les logs de la console
        const optionsFranceComplete = { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        console.log(`[SYNCHRO] Horloge synchronisée avec le serveur !`);
        console.log(` -> Heure du PC : ${heurePC.toLocaleTimeString()}`);
        console.log(` -> Heure Réelle (FR) : ${vraieDateInternet.toLocaleTimeString('fr-FR', optionsFranceComplete)}`);

        // 🌟 3. PROTECTION FUSEAU HORAIRE & HEURE INTERNET (Marge d'erreur de 3 minutes maximum)
        // On calcule la différence absolue en millisecondes. Si le fuseau horaire est changé, l'écart hFrance et hPC va exploser !
        const ecartFuseauOuHeure = Math.abs(vraieDateInternet.getTime() - heurePC.getTime());

        if (ecartFuseauOuHeure > 180000 || hFrance !== hPC) {
          // Si le PC triche sur les minutes/secondes OU s'il a changé de fuseau horaire (hFrance différent de hPC)
          setTimeout(() => {
            ouvrirNotificationCHA(
              "Tricheuse", 
              "Tu pensais vraiment que tu n'allais pas attendre ^^ ! En attendant, tu peux farm des ressources tu en auras peut-être besoin..."
            );
          }, 1000);
        }
      })
      .catch(error => {
        console.log("[SYNCHRO] Mode local activé. Protection anti-triche matérielle active.");
        decalageHeureReelleMs = 0;
      });
  }

  // 🔒 Fonction de hachage anti-triche ultra-légère
  function genererHashSauvegarde(chaine) {
    let hash = 0;
    const chaineComplete = chaine + SECRET_KEY_SAVE;
    for (let i = 0; i < chaineComplete.length; i++) {
      const char = chaineComplete.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // 💾 Fonction d'enregistrement global modifiée
  function sauvegarderProgression(estManuel = false) {
    if (!SOUHAITE_SAUVEGARDER) {
      if (estManuel) console.log("[TEST] Sauvegarde manuelle bloquée par le mode de test.");
      return;
    }
    
    const donneesDuJeu = {
      ressources, //
      clics, //
      multiplicateursPassifs, //
      nbBucherons, //
      nbMineurs, //
      nbCentrales, //
      nbEtudiants, //
      nbAstronomes, //
      upgradePierreAchetee, //
      upgradeTradAchetee, //
      upgradeObservAchetee, //
      planCentraleAchete, //
      upgradesActivees, //
      techActivees, //
      etatFusee, //
      upgradesFusee, //
      dateVirtuelle, //
      joursVirtuelsEcoules, //
      nbSatellites, //
      etapeDyson, //
      colonisation, //
      happyHourAchete, //
      etoileDecouverte, //
      plansInterstellairesDebloques, //
      elementsInterstellaires, //
      lasersVoyage, //
      upgradesVoyage, //
      vitesseLumierePct, //
      voyageDemarre, //
      lvlVoyageOpti, //
      lvlVoyageDeflecteur, //
      lvlVoyageProcesseur, //
      lvlVoyageMoissonneurVide, //
      nbLasersManuels: window.nbLasersManuels || 0, //
      modeFuseeActuel, //
      cielMystereActif, //
      etapeTutoRotateOk, //
      etapeTutoClicOk, //
      tutoObservationFait, //
      premiereFoisOngletEspace,
      premiereFoisOngletVoyage,
      musiquesRestantes: musiquesRestantes,
      derniereMusiqueJouee: derniereMusiqueJouee,
      cheminMusiqueActuelle: cheminMusiqueActuelle,
      tempsSauvegardeMusique: musiqueFond ? musiqueFond.currentTime : 0, 
      enModeMusiqueSpeciale: enModeMusiqueSpeciale,
      estTraduit: document.body.classList.contains('traduit'), //
    };

    const chaineDonnees = JSON.stringify(donneesDuJeu); //
    const hashSecurite = genererHashSauvegarde(chaineDonnees); //

    localStorage.setItem('cha_save_data', chaineDonnees); //
    localStorage.setItem('cha_save_hash', hashSecurite); //
    console.log("[SAUVEGARDE] Partie enregistrée automatiquement et sécurisée."); //

    // 🌟 FENÊTRE FLOTTANTE DE VALIDATION (TOAST NOTIFICATION)
    const toast = document.createElement('div');
    toast.style.cssText = "position: fixed; bottom: 20px; right: 20px; background: #1c1e21; border: 2px solid var(--accent); color: white; padding: 12px 20px; border-radius: 6px; font-weight: bold; font-family: sans-serif !important; z-index: 99999; box-shadow: 0 4px 15px rgba(0,0,0,0.5); animation: popNotifEntree 0.2s ease-out;";
    toast.innerHTML = estManuel ? "💾 Sauvegarde manuelle effectuée !" : "⏳ Sauvegarde automatique effectuée !";
    
    document.body.appendChild(toast);

    // Disparaît au bout de 2 secondes
    setTimeout(() => {
      toast.style.transition = "opacity 0.3s ease";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // 📂 Fonction de chargement globale et unifiée
  function chargerProgression() {
    if (!SOUHAITE_SAUVEGARDER) {
      return;
    }
    const chaineDonnees = localStorage.getItem('cha_save_data');
    const hashEnregistre = localStorage.getItem('cha_save_hash');

    if (!chaineDonnees || !hashEnregistre) return;

    // Vérification anti-triche
    if (genererHashSauvegarde(chaineDonnees) !== hashEnregistre) {
      console.warn("[SÉCURITÉ] Sauvegarde corrompue ou modifiée manuellement ! Réinitialisation.");
      localStorage.removeItem('cha_save_data');
      localStorage.removeItem('cha_save_hash');
      return;
    }

    try {
      const charge = JSON.parse(chaineDonnees);
      
      // Restauration des variables d'état
      ressources = charge.ressources;
      clics = charge.clics;
      multiplicateursPassifs = charge.multiplicateursPassifs;
      nbBucherons = charge.nbBucherons;
      nbMineurs = charge.nbMineurs;
      nbCentrales = charge.nbCentrales;
      nbEtudiants = charge.nbEtudiants;
      nbAstronomes = charge.nbAstronomes;
      upgradePierreAchetee = charge.upgradePierreAchetee;
      upgradeTradAchetee = charge.upgradeTradAchetee;
      upgradeObservAchetee = charge.upgradeObservAchetee;
      planCentraleAchete = charge.planCentraleAchete;
      upgradesActivees = charge.upgradesActivees;
      techActivees = charge.techActivees;
      etatFusee = charge.etatFusee;
      if (charge.upgradesFusee) upgradesFusee = charge.upgradesFusee;
      dateVirtuelle = charge.dateVirtuelle;
      joursVirtuelsEcoules = charge.joursVirtuelsEcoules;
      nbSatellites = charge.nbSatellites;
      etapeDyson = charge.etapeDyson || 0;
      colonisation = charge.colonisation;
      happyHourAchete = charge.happyHourAchete;
      etoileDecouverte = charge.etoileDecouverte;
      plansInterstellairesDebloques = charge.plansInterstellairesDebloques;
      elementsInterstellaires = charge.elementsInterstellaires;
      lasersVoyage = charge.lasersVoyage;
      upgradesVoyage = charge.upgradesVoyage;
      vitesseLumierePct = charge.vitesseLumierePct;
      voyageDemarre = charge.voyageDemarre;
      lvlVoyageOpti = charge.lvlVoyageOpti || 0;
      lvlVoyageDeflecteur = charge.lvlVoyageDeflecteur || 0;
      lvlVoyageProcesseur = charge.lvlVoyageProcesseur || 0;
      lvlVoyageMoissonneurVide = charge.lvlVoyageMoissonneurVide || 0;
      window.nbLasersManuels = charge.nbLasersManuels || 0;
      modeFuseeActuel = charge.modeFuseeActuel || "normale";
      cielMystereActif = charge.cielMystereActif || false;
      if (charge.musiquesRestantes) musiquesRestantes = charge.musiquesRestantes;
      if (charge.derniereMusiqueJouee) derniereMusiqueJouee = charge.derniereMusiqueJouee;
      if (charge.enModeMusiqueSpeciale) enModeMusiqueSpeciale = charge.enModeMusiqueSpeciale;
      if (charge.tempsSauvegardeMusique) tempsSauvegardeMusique = charge.tempsSauvegardeMusique;
      
      if (charge.cheminMusiqueActuelle) {
        cheminMusiqueActuelle = charge.cheminMusiqueActuelle;
        window.addEventListener('click', () => {
          if (!musiqueFond) musiqueFond = new Audio();
          if (enModeMusiqueSpeciale) {
            changerMusiqueTemporaire(cheminMusiqueActuelle);
          } else {
            lancerPlaylistAleatoire();
          }
        }, { once: true });
      }

      // 🌟 RESTAURATION DES TUTOS ET DE LA TRADUCTION GLYPHES
      etapeTutoRotateOk = charge.etapeTutoRotateOk || false;
      etapeTutoClicOk = charge.etapeTutoClicOk || false;
      tutoObservationFait = charge.tutoObservationFait || false;

      if (typeof charge.premiereFoisOngletEspace !== 'undefined') premiereFoisOngletEspace = charge.premiereFoisOngletEspace;
      if (typeof charge.premiereFoisOngletVoyage !== 'undefined') premiereFoisOngletVoyage = charge.premiereFoisOngletVoyage;

      if (etapeTutoRotateOk) {
        const tScroll = document.getElementById('tuto-scroll');
        if (tScroll) tScroll.style.display = 'none';
      }
      if (etapeTutoClicOk) {
        const tClic = document.getElementById('tuto-clic');
        if (tClic) tClic.style.display = 'none';
      }
      if (charge.estTraduit) {
        document.body.classList.add('traduit');
        const btnTraduction = document.getElementById('btn-traduction-globale');
        if (btnTraduction) {
          btnTraduction.textContent = "Traduction intégrée avec succès !";
          btnTraduction.setAttribute('disabled', 'true');
          btnTraduction.style.borderColor = '#3d4146';
        }
      }

      // Reconstitution visuelle de l'interface et des éléments débloqués
      if (upgradePierreAchetee) {
        document.getElementById('bloc-pierre').style.display = 'flex';
        document.getElementById('zone-pierre').style.display = 'flex';
      }
      if (upgradeTradAchetee) document.getElementById('tab-trad').style.display = 'block';
      if (upgradeObservAchetee) document.getElementById('tab-observ').style.display = 'block';
      if (planCentraleAchete) {
        document.getElementById('bloc-energie').style.display = 'flex';
        document.getElementById('zone-energie').style.display = 'flex';
      }
      if (techActivees.fusee) document.getElementById('tab-fusee').style.display = 'block';
      if (etatFusee.lancee) document.getElementById('tab-espace').style.display = 'block';
      if (voyageDemarre) {
        document.getElementById('tab-voyage').style.display = 'block';
        genererEtoilesVitesse();
      }

      // 🚀 RECONSTITUTION VISUELLE COMPLÈTE DE LA FUSÉE AU SOL
      if (etatFusee.moteurPose) document.getElementById('piece-posee-moteur').style.display = 'block';
      if (etatFusee.reservoirPose) document.getElementById('piece-posee-reservoir').style.display = 'block';
      if (etatFusee.cockpitPose) document.getElementById('piece-posee-cockpit').style.display = 'block';

      // Calage immédiat du bon mode (Normale ou Interstellaire) pour les hangars et boutons de la boutique
      const hangarNormale = document.getElementById('couches-fusee-normale');
      const hangarInter = document.getElementById('couches-fusee-interstellaire');
      const boutiqueNormale = document.getElementById('boutique-fusee');
      const boutiqueInter = document.getElementById('boutique-fusee-interstellaire');
      const btnSwitch = document.getElementById('btn-switch-fusee');

      if (modeFuseeActuel === "interstellaire") {
        if (btnSwitch) btnSwitch.textContent = "<- Mode: Normale";
        if (hangarNormale) hangarNormale.style.display = 'none';
        if (hangarInter) hangarInter.style.display = 'block';
        if (boutiqueNormale) boutiqueNormale.style.display = 'none';
        if (boutiqueInter) boutiqueInter.style.display = 'block';
      } else {
        if (btnSwitch) btnSwitch.textContent = "Mode: Interstellaire ->";
        if (hangarNormale) hangarNormale.style.display = 'block';
        if (hangarInter) hangarInter.style.display = 'none';
        if (boutiqueNormale) boutiqueNormale.style.display = 'block';
        if (boutiqueInter) boutiqueInter.style.display = 'none';
      }

      // Re-générer les ouvriers sur la planète
      document.getElementById('chats-conteneur-bois').innerHTML = "";
      document.getElementById('chats-conteneur-pierre').innerHTML = "";
      document.getElementById('chats-conteneur-energie').innerHTML = "";
      for (let i = 1; i <= nbBucherons; i++) ajouterUnChatOuvrierSurPlanete('bois', i, 'images/minichat-bucheron.png');
      for (let i = 1; i <= nbMineurs; i++) ajouterUnChatOuvrierSurPlanete('pierre', i, 'images/minichat-mineur.png');
      for (let i = 1; i <= nbCentrales; i++) ajouterUnChatOuvrierSurPlanete('energie', i, 'images/minichat-elec.png');

      // Re-générer les satellites visuels et drapeaux
      document.getElementById('cont-pivots-satellites').innerHTML = "";
      for (let i = 1; i <= nbSatellites; i++) ajouterUnSatelliteGraphique(i);
      for (let p in colonisation) {
        if (colonisation[p].drapeauPose) creerDrapeauVisuelSurPlanete(p);
      }

      // Recalage visuel de la Sphère de Dyson
      const imgSoleil = document.getElementById('img-soleil');
      if (imgSoleil && etapeDyson > 0) {
        imgSoleil.src = `images/espace/soleil_etape${etapeDyson}.png`;
        imgSoleil.style.filter = etapeDyson === 4 ? "drop-shadow(0 0 25px #7CFC6E) drop-shadow(0 0 50px #000)" : `drop-shadow(0 0 ${10 + etapeDyson * 5}px var(--accent))`;
      }

      // Lancement automatique du mini-jeu d'assemblage si un kit est en cours
      if (etatFusee.kitAchete && !etatFusee.lancee) {
        actualiserMiniJeuFusee();
      }

      console.log("[CHARGEMENT] Progression récupérée avec succès !");
    } catch (e) {
      console.error("Erreur lors du traitement de la sauvegarde", e);
    }
  }


  // Appeler la fonction dès que le script est prêt
  synchroniserVraieHeureInternet();

  // Démarrage global
  genererCeintureAsteroides();
  initialiserBoutique();
  initialiserEvenementsLivre();
  initialiserControlesEspace();
  chargerProgression();
  mettreAjourInterface();
  mettreAjourCouleurCiel();
  genererNouvellesCiblesFusee();
  genererEtoilesEspaceDOM();
  requestAnimationFrame(animerSystemeSolaireFluide);

  setTimeout(() => {
    mettreAjourCouleurCiel();
  }, 50);

  if (intervalleSauvegardeAuto) clearInterval(intervalleSauvegardeAuto);
  intervalleSauvegardeAuto = setInterval(sauvegarderProgression, 60000);

// 🌟 INITIALISATION DU LECTEUR AU PREMIER CLIC SI PAS DE SAUVEGARDE ACTIVE
  const activerMusiqueAuPremierClic = () => {
    if (!cheminMusiqueActuelle) {
      lancerPlaylistAleatoire();
    }
    window.removeEventListener('click', activerMusiqueAuPremierClic);
  };
  window.addEventListener('click', activerMusiqueAuPremierClic);
  
  // 💾 ENCASTRÉ ICI DANS LE DOMCONTENTLOADED POUR ÉVITER LE PLANTE REFERENCEERROR
  const btnSauvegarde = document.getElementById('btn-sauvegarde-manuelle');
  if (btnSauvegarde) {
    btnSauvegarde.addEventListener('mouseenter', () => btnSauvegarde.style.background = '#34373b'); //
    btnSauvegarde.addEventListener('mouseleave', () => btnSauvegarde.style.background = '#2a2c2f'); //
    
    btnSauvegarde.addEventListener('click', () => {
      if (typeof SON_ACHAT !== 'undefined') { //
        SON_ACHAT.currentTime = 0; //
        SON_ACHAT.play().catch(e => {}); //
      }
      sauvegarderProgression(true); // Appelle maintenant proprement avec true !
    });
  }

}); // 🔓 Fin du DOMContentLoaded