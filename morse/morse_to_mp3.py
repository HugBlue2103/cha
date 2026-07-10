"""
Génère un fichier audio (.wav) à partir d'une séquence morse "custom" sans pydub ni ffmpeg.
- "." = son1 (point)
- "_" = son2 (trait)
- "/" = pause 2s (entre lettres)
- "*" = pause 5s (entre mots)
- son3 = cloche jouée une seule fois, au tout début
"""

import wave
import os

INTRA_SYMBOLE_DELAI_MS = 200  # micro-silence entre 2 symboles collés (ex: "..")
TAUX_ECHANTILLON = 44100      # Fréquence standard

def lire_donnees_wav(chemin_fichier):
    """Lit un fichier WAV et extrait ses métadonnées et ses octets audio bruts"""
    if not os.path.exists(chemin_fichier):
        raise FileNotFoundError(f"Impossible de trouver le fichier requis : {chemin_fichier}. Vérifie qu'il est bien au format .wav !")
    
    with wave.open(chemin_fichier, 'rb') as wav:
        params = wav.getparams()
        frames = wav.readframes(wav.getnframes())
        return frames, params

def generer_silence_octets(duree_ms, params_reference):
    """Génère des octets de silence calibrés sur le format du fichier audio d'origine"""
    nb_echantillons = int((duree_ms / 1000.0) * params_reference.framerate)
    taille_octet_par_echantillon = params_reference.sampwidth * params_reference.nchannels
    return bytearray(nb_echantillons * taille_octet_par_echantillon)

def construire_audio(sequence, son1_path, son2_path, son3_path, sortie_path='morse_output.wav'):
    """
    Assemble les fichiers WAV d'origine et les silences selon la séquence morse donnée.
    """
    # 1. Chargement des sons au format WAV
    octets_son1, params1 = lire_donnees_wav(son1_path)
    octets_son2, _ = lire_donnees_wav(son2_path)
    octets_son3, _ = lire_donnees_wav(son3_path)

    # Le flux binaire final contiendra tous nos morceaux bout à bout
    flux_audio_final = bytearray()
    
    # Ajout de la cloche de début
    flux_audio_final.extend(octets_son3)

    symboles = [c for c in sequence if c in ('.', '_', '/', '*')]

    for i, symbole in enumerate(symboles):
        if symbole == '.':
            flux_audio_final.extend(octets_son1)
        elif symbole == '_':
            flux_audio_final.extend(octets_son2)
        elif symbole == '/':
            flux_audio_final.extend(generer_silence_octets(2000, params1))
        elif symbole == '*':
            flux_audio_final.extend(generer_silence_octets(5000, params1))

        # Micro-silence entre deux symboles "." ou "_" collés
        if symbole in ('.', '_') and i != len(symboles) - 1 and symboles[i + 1] in ('.', '_'):
            flux_audio_final.extend(generer_silence_octets(INTRA_SYMBOLE_DELAI_MS, params1))

    # 2. Écriture du fichier final compilé
    with wave.open(sortie_path, 'wb') as wav_sortie:
        wav_sortie.setparams(params1)  # On applique la même configuration (Stéréo/Mono, Fréquence)
        wav_sortie.writeframes(flux_audio_final)
    
    print(f"🎉 Fichier généré avec succès : {os.path.abspath(sortie_path)}")

if __name__ == '__main__':
    sequence = "_. / .._ / _ _ / . / ._. / _ _ _ * ._ _ . / ._ / _ _ . / . * ._. / . / ._ _ . / . / _ / . / ._. * ._._. * _...._ * _..._ * _._. / _ _ _ / _.. / ."

    construire_audio(
        sequence,
        son1_path='chat_court.wav',
        son2_path='chat_long.wav',
        son3_path='cloche.wav',
        sortie_path='morse_output.wav'
    )