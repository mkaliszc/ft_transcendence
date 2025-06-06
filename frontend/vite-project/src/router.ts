import { createRouter, createWebHistory } from "vue-router";
import Home from "./components/Home.vue";
import Game from "./components/Gameia.vue";
import Profile from "./components/profile.vue";
import Signin from "./components/signin.vue";
import Gamemulti from "./components/Gamemulti.vue";
import Signup from "./components/signup.vue";
import Tournament from "./components/tournament.vue";
import Tournamentgame from "./components/tournamentgame.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
    {
    path: "/touramentgame",
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
    path: "/tournament",
    name: "tournament",
    component: Tournament,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;