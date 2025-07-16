# ft_transcendence

A modern online Pong game with a web interface, developed as part of the 42 curriculum.

## 🎮 Project overview

ft_transcendence is a complete web application that reimplements the classic game Pong with modern multiplayer features. The project includes an authentication system, user profiles, game statistics and real-time gameplay.

## 📸 ScreenShots

### Home page
![Interface d'accueil](screenshots/home.png)
*Main interface with navigation menu and game options*

### Profil page with stats
![Profil utilisateur](screenshots/profile.png)
*Detailed profile with full statistics and progress charts*

### Gameplay
![Gameplay](screenshots/gameplay.png)
*Pong game in progress with score interface and controls*

### Friend system
![Système d'amis](screenshots/friends.png)
*Manage friends with online status and interaction options*

## ✨ Fonctionnality

### 🏠 Interface Principale
- **Welcome pagee** : Home interface with welcome message
- **Menu** with quick access to the various sections :
  - Classic Gameplay (user vs IA)
  - Multiplayer mode (user vs user up to 4)
  - Local tournament
  - User's profil

### 👤 Système de Profil
- **Comprehensive user profiles** with :
  - Customisable avatar
  - Unique username
  - Online/Offline status
  - Date of registration
- **Data management** :
  - Downloading personal data
  - Anonymising your account
  - Account deletion

### 📊 Detailed statistics
- **Game statistics** :
  - Number of matches played
  - Victories & defeats
  - Ratio
  - Player games
- **Match history** with graphics
- **Evolution of the win rate** over time

### 🎯 Gameplay
- **Classic Pong game** with :
  - Fluid controls (W/S keys)
  - Real-time score display
  - Pause system

### 👥 Social
- **Friends** :
  - Friend list with online status
  - Add/delete friends

### 🔓 Security
- **JSON Web Token**
- **Google authentification**
- **GDPR**
- **Two-factor authentification**

## 🛠️ Technology

- **Frontend** : Vue avec TS
- **Multiplayer** : WebSockets
- **DataBase** : MariDB, SQL
- **Backend** : Fastify, Node.js, TS, Sequelize

## 🚀 Installation et Utilisation

### Prérequis
- .env (see .env.example)
- Docker & Docker Compose
- Web navigator

### Installation
```bash
# Clone the repository
git clone https://github.com/mkaliszc/ft_transcendence.git
cd ft_transcendence

# Launch the application with Makefile, make sure to have a complete .env
make
```

### ✅ Valid modules for 42 evaluation 
- Framework
- Standard user management, authentication, users across
tournaments
- Implementing a remote authentication
- Remote Players
- Multiplayer (more than 3 players in the same game)
- Ai opponent
- User and game dashboard
- GDPR
- Two-factor authentification and JWT
- Microservices in backend
- Support one all devices

### 🤝 Colaborators :
- [calberti](https://github.com/charles-albertini)
- [axburin-](https://github.com/axburin)
