# Decor-add

Application web de création de visuels promo pour l’événement Afro-Latino Carnaval. Elle permet de charger une photo ou une vidéo, d’ajuster le cadrage avec un zoom et des décalages, puis de télécharger le résultat final avec une surcouche graphique.

## ✨ Fonctionnalités

- Upload d’une image ou d’une vidéo
- Aperçu en direct dans un canvas
- Ajustement du zoom, du décalage X et Y
- Ajout d’une couche visuelle de promo / flyer
- Téléchargement du résultat final :
  - image JPG pour les photos
  - vidéo MP4 pour les vidéos
- Support de la langue française et anglaise
- Déploiement prêt pour Vercel

## 🧩 Stack technique

- HTML5
- CSS3
- JavaScript vanilla
- Canvas 2D
- FFmpeg WebAssembly pour la conversion vidéo
- MediaRecorder pour l’export vidéo

## 📁 Structure du projet

```text
Decor-add/
├── index.html          # Structure de la page
├── style.css           # Styles de l’interface
├── script.js           # Logique de chargement, rendu et export
├── decor-flyer.png     # Overlay visuel principal
├── vercel.json         # Configuration Vercel (headers COOP/COEP)
├── README.md           # Documentation du projet
└── .gitignore          # À ajouter selon votre besoin
```

## ▶️ Lancer le projet localement

### Option 1 : ouvrir directement le fichier

Vous pouvez simplement ouvrir `index.html` dans votre navigateur.

### Option 2 : servir le projet via un serveur local

Depuis le dossier du projet :

```bash
python -m http.server 8000
```

Puis ouvrez :

```text
http://localhost:8000
```

> Il est recommandé d’utiliser un serveur local plutôt qu’un simple fichier, surtout pour le traitement vidéo et les contraintes de sécurité du navigateur.

## 🌐 Déploiement sur Vercel

Le projet est prévu pour être déployé sur Vercel.

### Étapes

1. Connectez le dépôt GitHub à Vercel
2. Importez le dossier du projet
3. Vérifiez que la configuration de build est vide / par défaut
4. Publiez le site

La configuration de Vercel est déjà présente dans `vercel.json` pour activer les en-têtes requis par FFmpeg WebAssembly :

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
```

## 🛠️ Utilisation

1. Sélectionnez une image ou une vidéo
2. Ajustez le zoom et le positionnement
3. Vérifiez le rendu dans le prévisualiseur
4. Cliquez sur le bouton de téléchargement
5. Le fichier est exporté selon le type sélectionné

## ⚠️ Remarques importantes

- Le traitement vidéo dépend du support navigateur pour `MediaRecorder` et FFmpeg WebAssembly
- L’export MP4 peut prendre quelques secondes selon la taille du fichier
- La qualité du rendu dépend de la taille d’origine du média et de la configuration du navigateur

## 📌 À retenir

Ce projet sert à générer rapidement des visuels promo personnalisés en rajoutant un cadre/overlay sur des contenus photo ou vidéo, avec un export directement utilisable pour les réseaux sociaux.
