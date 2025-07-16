# ft_transcendence

Un jeu de Pong en ligne moderne avec interface web, développé dans le cadre du cursus 42.

## 🎮 Aperçu du Projet

ft_transcendence est une application web complète qui réimplémente le jeu classique Pong avec des fonctionnalités modernes multijoueurs. Le projet comprend un système d'authentification, des profils utilisateur, des statistiques de jeu et un gameplay en temps réel.

## 📸 Captures d'écran

### Interface d'accueil
![Interface d'accueil](screenshots/home.png)
*Interface principale avec menu de navigation et options de jeu*

### Profil utilisateur et statistiques
![Profil utilisateur](screenshots/profile.png)
*Profil détaillé avec statistiques complètes et graphiques de progression*

### Gameplay en action
![Gameplay](screenshots/gameplay.png)
*Jeu Pong en cours avec interface de score et contrôles*

### Système d'amis
![Système d'amis](screenshots/friends.png)
*Gestion des amis avec statuts en ligne et options d'interaction*

## ✨ Fonctionnalités

### 🏠 Interface Principale
- **Accueil personnalisé** : Interface d'accueil avec message de bienvenue
- **Menu principal** avec accès rapide aux différentes sections :
  - Gameplay Classique (jeu contre IA)
  - Mode Multijoueur (jeu contre d'autres joueurs)
  - Jeu Compétitif (tournois)
  - Profil utilisateur

### 👤 Système de Profil
- **Profils utilisateur complets** avec :
  - Avatar personnalisable
  - Nom d'utilisateur unique
  - Statut en ligne/hors ligne
  - Date d'inscription
- **Gestion des données** :
  - Téléchargement des données personnelles
  - Anonymisation du compte
  - Suppression du compte

### 📊 Statistiques Détaillées
- **Statistiques de jeu** :
  - Nombre de matches joués
  - Victoires et défaites
  - Taux de victoire
  - Parties à 4 joueurs
- **Historique des matches** avec graphiques
- **Évolution du taux de victoire** dans le temps

### 🎯 Gameplay
- **Jeu Pong classique** avec :
  - Contrôles fluides (touches W/S)
  - Affichage du score en temps réel
  - Interface de jeu épurée
  - Système de pause

### 👥 Système Social
- **Gestion des amis** :
  - Liste d'amis avec statut en ligne
  - Ajout/suppression d'amis
  - Invitations de jeu

## 🛠️ Technologies Utilisées

- **Frontend** : Vue avec TS
- **Interface** : Interface responsive avec design moderne
- **Temps réel** : WebSockets pour le gameplay multijoueur
- **Authentification** : Système de connexion sécurisé
- **Base de données** : Stockage des profils et statistiques

## 🚀 Installation et Utilisation

### Prérequis
- Docker et Docker Compose
- Navigateur web moderne

### Installation
```bash
# Cloner le repository
git clone https://github.com/votre-username/ft_transcendence.git
cd ft_transcendence

# Lancer l'application avec Docker
docker-compose up --build
