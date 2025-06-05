// src/router.ts
import { createRouter, createWebHistory } from "vue-router";

// Composants importés “statiques”
import Home       from "./components/Home.vue";
import Game       from "./components/Gameia.vue";
import Profile    from "./components/profile.vue";
import Signin     from "./components/signin.vue";
import Signup     from "./components/signup.vue";
import Gamemulti  from "./components/Gamemulti.vue";        // Mode local (2 joueurs écran partagé)

// Les autres (“lazy-loaded”) seront récupérés à la demande
// pour alléger le bundle initial.

const routes = [
  // 1) Accueil
  {
    path: "/",
    name: "Home",
    component: Home
  },
  // 2) Auth
  {
    path: "/signin",
    name: "Signin",
    component: Signin
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile
  },
  // 3) Solo
  {
    path: "/game",
    name: "Game",
    component: Game
  },
  // 4) Local (2 joueurs même écran)
  {
    path: "/gamemulti-local",
    name: "LocalGame",
    component: Gamemulti
  },
  {
    path: "/Gamemulti",
    redirect: { name: "LocalGame" }
  },
  // 5) Hub multijoueur
  {
    path: "/multiplayer",
    name: "MultiplayerHub",
    component: () => import("./components/MultiplayerHub.vue")
  },
  // 6) Choix “Créer ou Rejoindre” (mode en ligne)
  {
    path: "/multiplayer/choose",
    name: "CreateOrJoin",
    component: () => import("./components/CreateOrJoin.vue")
  },
  // 7) Flux en ligne : créer, rejoindre, waiting-room, jeu en ligne
  {
    path: "/multiplayer/create",
    name: "CreateGame",
    component: () => import("./components/CreateGame.vue")
  },
  {
    path: "/multiplayer/join",
    name: "JoinGame",
    component: () => import("./components/JoinGame.vue")
  },
  {
    path: "/waiting-room",
    name: "WaitingRoom",
    component: () => import("./components/WaitingRoom.vue")
  },
  {
    path: "/gamemulti-online",
    name: "GamemultiOnline",
    component: () => import("./components/GamemultiOnline.vue")
  },
  // 8) Route “Local” depuis le hub multijoueur (alias)
  {
    path: "/multiplayer/local",
    name: "MultiplayerLocal",
    component: Gamemulti
  },
  // 9) Fallback : toute route inconnue renvoie à l’accueil
  {
    path: "/:catchAll(.*)",
    redirect: { name: "Home" }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
