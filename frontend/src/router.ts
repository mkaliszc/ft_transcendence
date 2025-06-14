import { createRouter, createWebHistory } from "vue-router";
import Home from "./components/Home.vue";
import Home2 from "./components/Home2.vue";
import Game from "./components/Gameia.vue";
import Profile from "./components/profile.vue";
import Signin from "./components/signin.vue";
import Gamemulti from "./components/Gamemulti.vue";
import Signup from "./components/signup.vue";
import Tournamentgame from "./components/tournamentgame.vue";
import Tournamentbracket from "./components/tournamentbracket.vue";
import Tournamentplayer from "./components/tournamentplayer.vue";

// Fonction de vérification d'authentification
const isAuthenticated = () => {
  return localStorage.getItem('user-token') !== null || localStorage.getItem('auth_token') !== null;
};

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/Home2",
    name: "Home2",
    component: Home2,
  },
  {
    path: "/tournamentgame",
    name: "tournamentgame",
    component: Tournamentgame,
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
  },
  {
    path: "/game",
    name: "Game",
    component: Game,
  },
  {
	path: "/Gamemulti",
	name: "Gamemulti",
	component: Gamemulti,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  },
  {
    path: "/signin",
    name: "Signin",
    component: Signin,
  },
  {
    path: "/tournamentbracket",
    name: "tournamentbracket",
    component: Tournamentbracket,
  },
    {
    path: "/tournamentplayer",
    name: "tournamentplayer",
    component: Tournamentplayer,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Ajout d'options pour améliorer la navigation
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  // Liste des routes protégées qui nécessitent une authentification
  const protectedRoutes = ['/profile'];
  
  // Si la route est protégée et que l'utilisateur n'est pas authentifié
  if (protectedRoutes.includes(to.path) && !isAuthenticated()) {
    // Rediriger vers la page de connexion avec une redirection de retour
    next({ 
      path: '/signin',
      query: { redirect: to.fullPath }
    });
  } else {
    next();
  }
});

export default router;