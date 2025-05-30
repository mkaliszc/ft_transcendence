import { createRouter, createWebHistory } from "vue-router";
import Home from "./components/Home.vue";
import Game from "./components/Gameia.vue";
import Profile from "./components/profile.vue";
import Signin from "./components/signin.vue";
import Gamemulti from "./components/Gamemulti.vue";
import Signup from "./components/signup.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
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
    path: '/multiplayer',
    name: 'MultiplayerHub',
    component: () => import('./components/MultiplayerHub.vue'),
  },
  {
    path: '/multiplayer/create',
    name: 'CreateGame',
    component: () => import('./components/CreateGame.vue'),
  },
  {
    path: '/multiplayer/join',
    name: 'JoinGame',
    component: () => import('./components/JoinGame.vue'),
  },
  
//   {
//     path: "/register",
//     name: "Register",
//     component: Register,
//   },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
