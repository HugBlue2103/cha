// 🎹 GÉNÉRATION SÉCURISÉE DU CLAVIER DEPUIS LE SCRIPT
document.addEventListener('DOMContentLoaded', () => {
  const conteneurClavier = document.getElementById('clavier');
  
  if (conteneurClavier) {
    // Liste des touches à créer (0 à 4 comme dans ton HTML d'origine)
    const touches = ["0", "1", "2", "3", "4"];
    
    touches.forEach(valeur => {
      const bouton = document.createElement('button');
      bouton.className = 'touche';
      bouton.setAttribute('data-valeur', valeur);
      bouton.textContent = valeur;
      
      conteneurClavier.appendChild(bouton);
    });
  }
  
/* =========================================================================
   ⚙️  CONFIGURATION
   ========================================================================= */

const CONFIG = {
  NB_PANNEAUX: 24,
  SEUIL_CLICS: 3,
  CODE_SECRET: "12120",
  DELAI_AVANT_SON: 500,

  PANNEAUX_SPECIAUX: [
    { id: 3,  type: "indice-texte", contenu: "MIAOU\nMIAOUUUUU" },
    { id: 7,  type: "activation" },
    { id: 18, type: "indice-telechargement", fichier: "sons/cha.wav" }
  ]
};


/* =========================================================================
   ÉTAT DU JEU
   ========================================================================= */
let clicsParPanneau = {};      
let panneauxTombes = new Set();
let timerAide = null;
let saisieActuelle = "";
let elementPremierPanneau = null; 

const sonDur     = document.getElementById('son-dur');
const sonCreux   = document.getElementById('son-creux');
const sonTouche  = document.getElementById('son-touche');
const sonErreur  = document.getElementById('son-erreur');
const sonSucces  = document.getElementById('son-succes');
const musique    = document.getElementById('musique');

function trouverPanneauSpecial(id){
  return CONFIG.PANNEAUX_SPECIAUX.find(p => p.id === id);
}


/* =========================================================================
   CONSTRUCTION DE LA GRILLE DE PLAQUES ET INSCRIPTION DES INDICES
   ========================================================================= */
const grille = document.getElementById('mur-grille');

for (let i = 1; i <= CONFIG.NB_PANNEAUX; i++) {
  // 1. Création d'un conteneur de cellule pour la grille
  const conteneurCase = document.createElement('div');
  conteneurCase.className = 'case-grille';

  // 2. Création de la plaque de métal
  const p = document.createElement('div');
  p.className = 'panneau';
  p.dataset.id = i;

  const special = trouverPanneauSpecial(i);
  if (special) {
    p.dataset.creux = "true";
    if (special.type === "indice-texte") {
      elementPremierPanneau = p;
    }

    // 3. Création de l'élément d'indice, placé DIRECTEMENT dans la case (sous la plaque)
    const divIndice = document.createElement('div');
    divIndice.className = 'contenu-revele';
    divIndice.id = `reveal-${special.type}`;

    if (special.type === "activation") {
      // 1. Le bouton de lecture d'origine
      const rond = document.createElement('div');
      rond.className = 'rond-activation';
      
      // 2. Le conteneur du réglage volume (masqué au début)
      const zoneVolume = document.createElement('div');
      zoneVolume.className = 'controle-volume';
      zoneVolume.style.display = 'none'; // Caché au départ
      zoneVolume.innerHTML = `
        <span>VOLUME</span>
        <input type="range" min="0" max="1" step="0.05" value="0.5">
      `;

      // On écoute le changement de volume sur le curseur
      const curseur = zoneVolume.querySelector('input');
      curseur.addEventListener('input', (e) => {
        const baliseAudioMusique = document.getElementById('musique');
        if (baliseAudioMusique) {
          baliseAudioMusique.volume = e.target.value;
        }
      });

      // Au clic sur le bouton vert, on intervertit les deux éléments
      rond.addEventListener('click', () => {
        rond.style.display = 'none';       // Le bouton vert s'en va
        zoneVolume.style.display = 'flex'; // La barre de volume apparaît au même endroit
        activerMusique();                  // Lance la musique
      }, { once: true });

      divIndice.appendChild(rond);
      divIndice.appendChild(zoneVolume);
    }
    else if (special.type === "indice-texte") {
      divIndice.className += ' texte-indice';
      divIndice.textContent = special.contenu;
    } 
    else if (special.type === "indice-telechargement") {
      const lien = document.createElement('a');
      lien.className = 'btn-telechargement'; // Reçoit le style circulaire vert
      lien.href = special.fichier;
      lien.download = "";
      
      // Pas de texte ici, les flèches CSS font le travail !

      lien.addEventListener('click', () => {
        setTimeout(() => divIndice.classList.remove('visible'), 100);
      });
      divIndice.appendChild(lien);
    }

    conteneurCase.appendChild(divIndice);
  }

  p.addEventListener('click', () => gererClicPanneau(p, i, !!special));
  conteneurCase.appendChild(p);
  grille.appendChild(conteneurCase);
}


function jouerSon(audio){
  if (!audio) {
    console.error("L'élément audio demandé n'existe pas dans le HTML !");
    return;
  }
  audio.currentTime = 0;
  audio.play().catch((erreur) => {
    console.warn("Le navigateur a bloqué le son ou le fichier est introuvable :", erreur);
  });
}

function gererClicPanneau(element, id, estSpecial){
  jouerSon(estSpecial ? sonCreux : sonDur);

  // Si ce n'est pas une plaque spéciale ou si elle est déjà tombée, on ne fait rien
  if (!estSpecial || panneauxTombes.has(id)) return;

  // On incrémente le nombre de clics sur cette plaque
  clicsParPanneau[id] = (clicsParPanneau[id] || 0) + 1;

  // Si on atteint le seuil (3 clics), la plaque tombe !
  if (clicsParPanneau[id] >= CONFIG.SEUIL_CLICS){
    faireTomberPanneau(element, id);
  }
}

function faireTomberPanneau(element, id){
  panneauxTombes.add(id);
  element.classList.add('tombe');

  setTimeout(() => {
    element.style.visibility = 'hidden';
    revelerContenu(element, id);
  }, 100);
}

function revelerContenu(panneauDisparu, id){
  const special = trouverPanneauSpecial(id);
  if (!special) return;

  // Récupère l'indice enfant présent dans la même case
  const elementIndice = panneauDisparu.parentNode.querySelector('.contenu-revele');
  if (elementIndice) {
    elementIndice.classList.add('visible');
  }
}

let morseEnLecture = false;
function activerMusique(){
  const baliseAudioMusique = document.getElementById('musique');
  if (baliseAudioMusique && !morseEnLecture) {
    baliseAudioMusique.src = "sons/cha.wav"; 
    baliseAudioMusique.loop = true; 
    baliseAudioMusique.volume = 0.5; 
    
    baliseAudioMusique.play();
    
    morseEnLecture = true;
  }
}

/* =========================================================================
   CLAVIER DE SAISIE DU CODE (base 5)
   ========================================================================= */
const affichageChiffres = document.getElementById('affichage-chiffres');

document.querySelectorAll('.touche').forEach(bouton => {
  bouton.addEventListener('click', () => {
    if (saisieActuelle.length >= CONFIG.CODE_SECRET.length) {
      return; 
    }

    jouerSon(sonTouche);
    saisieActuelle += bouton.dataset.valeur;
    majAffichage();

    if (saisieActuelle.length === CONFIG.CODE_SECRET.length){
      verifierCode();
    }
  });
});

function majAffichage(){
  const chiffres = saisieActuelle.padEnd(CONFIG.CODE_SECRET.length, '_').split('');
  affichageChiffres.textContent = chiffres.join(' ');
}

function verifierCode(){
  if (saisieActuelle === CONFIG.CODE_SECRET){
    setTimeout(() => {
      jouerSon(sonSucces);
      document.querySelectorAll('.touche').forEach(b => b.classList.add('succes'));
      passerAEcranSuivant();
    }, CONFIG.DELAI_AVANT_SON);
  } else {
    setTimeout(() => {
      jouerSon(sonErreur);
      document.querySelectorAll('.touche').forEach(b => b.classList.add('erreur'));
      setTimeout(() => {
        document.querySelectorAll('.touche').forEach(b => b.classList.remove('erreur'));
        saisieActuelle = "";
        majAffichage();
      }, 400);
    }, CONFIG.DELAI_AVANT_SON);
  }
}

majAffichage();

/* =========================================================================
   TRANSITION VERS LA PAGE SUIVANTE
   ========================================================================= */
function passerAEcranSuivant(){
  setTimeout(() => {
    // 🌟 REDIRECTION DIRECTE : Envoie le joueur vers le fichier du jeu clicker
    window.location.href = "clicker.html";
  }, 500); 
}
});



