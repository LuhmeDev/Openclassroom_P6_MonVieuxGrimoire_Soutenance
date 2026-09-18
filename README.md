# Mon Vieux Grimoire — API

Back-end du site de notation de livres **Mon Vieux Grimoire** (projet 6 OpenClassrooms).
Ce dépôt contient uniquement l'API. Le front-end React est fourni dans ## Front-end

## Prérequis

- Node.js 18 ou supérieur
- Une base MongoDB (locale ou cluster gratuit MongoDB Atlas)

## Installation

```bash
git clone https://github.com/LuhmeDev/Openclassroom_P6_MonVieuxGrimoire_Soutenance.git
cd Openclassroom_P6_MonVieuxGrimoire_Soutenance/backend
npm install
```

## Configuration

Créez le fichier `.env` à partir du modèle fourni : `.env.example`

Renseignez les deux variables :

```ini
MONGODB_URI=mongodb+srv://utilisateur:motdepasse@cluster.mongodb.net/monvieuxgrimoire
JWT_SECRET=une_longue_chaine_aleatoire_et_privee
```

Sur MongoDB Atlas, l'adresse de connexion se récupère via *Connect → Drivers*, et votre
adresse IP doit être autorisée dans *Network Access*.

## Lancement

```bash
npm start     # démarre le serveur
npm run dev   # redémarrage automatique à chaque modification
```

L'API écoute sur **http://localhost:4000**. Deux messages confirment que tout va bien :

```
Serveur démarré sur http://localhost:4000
Connexion à MongoDB réussie
```

Si le second n'apparaît pas, vérifiez `MONGODB_URI` et les autorisations réseau d'Atlas.

## Front-end

Le front-end est disponible dans un dépôt séparé :
https://github.com/LuhmeDev/Openclassroom_P6_MonVieuxGrimoire_Front_Soutenance

Il s'installe où vous voulez, indépendamment de ce dépôt :

```bash
git clone https://github.com/LuhmeDev/Openclassroom_P6_MonVieuxGrimoire_Front_Soutenance.git
cd Openclassroom_P6_MonVieuxGrimoire_Front_Soutenance
npm install
npm start
```

Il se lance sur **http://localhost:3000** et appelle l'API sur le port 4000. Les deux
serveurs doivent tourner en parallèle, chacun dans son propre terminal (ou sa propre
fenêtre VS Code) — peu importe où se trouvent les dossiers sur le disque.
