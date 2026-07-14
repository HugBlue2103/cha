document.addEventListener('DOMContentLoaded', () => {
  
  // 🔑 LE CODE SECRET UNIQUE (CHIFFRES UNIQUEMENT)
  const CODE_ATTENDU = "1031"; 

  // 📝 TON TEXTE LONG COMPLET SÉCURISÉ ICI
  const LE_TEXTE_PROTEGE = `Ici, tu mets tout ton très long texte final en Clash Display. 
  Tu peux faire des sauts de ligne normaux directement dans le texte si tu utilises les backticks (l'accent grave \` ).
  
  Deuxième paragraphe de ton histoire...
  Troisième paragraphe de ton histoire...`;


  // Éléments du DOM
  const ecranVerif = document.getElementById('ecran-verif');
  const zoneTexte = document.getElementById('zone-texte-final');
  const inputCode = document.getElementById('code-saisi');
  const btnValider = document.getElementById('btn-valider-code');

  if (!ecranVerif || !zoneTexte || !inputCode || !btnValider) return;

  // Fonction de vérification
  const verifierLeCodeFinal = () => {
    inputCode.classList.remove('erreur-secoue');

    if (inputCode.value.trim() === CODE_ATTENDU) {
      // 🎉 CODE CORRECT : On efface l'écran de verrouillage et on injecte/affiche le texte
      ecranVerif.style.display = 'none';
      zoneTexte.innerText = LE_TEXTE_PROTEGE;
      zoneTexte.style.display = 'block';
    } else {
      // 💥 CODE FAUX : Effet de secousse visuelle
      setTimeout(() => {
        inputCode.classList.add('erreur-secoue');
      }, 10);
    }
  };

  // Événements
  btnValider.addEventListener('click', verifierLeCodeFinal);
  inputCode.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verifierLeCodeFinal();
  });
});