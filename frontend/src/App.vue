<template>
  <div id="app">
    <!-- Contenu principal -->
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
      <!-- Footer CGU uniquement sur Home et Home2 -->
      <footer
        v-if="route.name === 'Home' || route.name === 'Home2'"
        class="footer-cgu w-full flex justify-center items-center py-4 bg-black/30 border-t border-yellow-500/20 mt-auto"
        style="background: rgba(0,0,0,0.3); border-top: 1px solid rgba(212, 175, 55, 0.2);"
      >
        <router-link to="/cgu" class="cgu-link text-yellow-400 hover:text-yellow-300 text-base underline font-bold transition-colors duration-200">
          Conditions d’utilisation
        </router-link>
      </footer>
    </router-view>
  </div>
</template>

<script setup>
// Pas de code JS nécessaire ici
</script>

<style>
/* Styles globaux */
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
  }
  
  html, body {
	font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	background-color: #0a0a0a;
	color: #ffffff;
	height: 100%;
	min-width: 100vw;
	min-height: 100vh;
	max-width: 100vw;
	max-height: 100vh;
	overflow: hidden;
  }
  
  #app {
	height: 100vh;
	min-height: 100vh;
	max-width: 100vw;
	width: 100vw;
	display: flex;
	flex-direction: column;
  }
  
  /* Pas de styles de navigation nécessaires car elle a été retirée */
  
  .router-link-active {
	color: #d4af37;
	font-weight: 600;
	background-color: rgba(212, 175, 55, 0.1);
	border-color: rgba(212, 175, 55, 0.3);
  }
  
  .auth-link {
	border: 1px solid rgba(212, 175, 55, 0.5);
  }
  
  .auth-link.signup {
	background-color: rgba(212, 175, 55, 0.1);
	color: #d4af37;
	font-weight: 600;
  }
  
  .auth-link.signup:hover {
	background-color: #d4af37;
	color: #1a1a1a;
  }
  
  .logout-btn {
	background-color: rgba(220, 53, 69, 0.1);
	border: 1px solid rgba(220, 53, 69, 0.5);
	color: #ff6b6b;
  }
  
  .logout-btn:hover {
	background-color: rgba(220, 53, 69, 0.2);
	color: #ffffff;
  }
  
  /* Sélecteur de langue */
  .language-switcher {
	margin-left: 1rem;
  }
  
  .language-select {
	padding: 0.375rem 0.75rem;
	border: 1px solid rgba(212, 175, 55, 0.5);
	border-radius: 0.375rem;
	background-color: rgba(0, 0, 0, 0.3);
	color: #ffffff;
	font-size: 0.75rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
  }
  
  .language-select:focus {
	outline: none;
	border-color: #d4af37;
	box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.3);
  }
  
  .language-select:hover {
	background-color: rgba(212, 175, 55, 0.1);
  }
  
  /* Transitions entre les pages */
  .fade-enter-active,
  .fade-leave-active {
	transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
	opacity: 0;
  }
  
  /* Classes utilitaires */
  .container {
	width: 100%;
	max-width: 1280px;
	margin: 0 auto;
  }
  
  .flex {
	display: flex;
  }
  
  .flex-col {
	flex-direction: column;
  }
  
  .items-center {
	align-items: center;
  }
  
  .justify-between {
	justify-content: space-between;
  }
  
  .justify-center {
	justify-content: center;
  }
  
  .gap-2 {
	gap: 0.5rem;
  }
  
  .gap-4 {
	gap: 1rem;
  }
  
  .px-4 {
	padding-left: 1rem;
	padding-right: 1rem;
  }
  
  .py-3 {
	padding-top: 0.75rem;
	padding-bottom: 0.75rem;
  }
  
  .text-xl {
	font-size: 1.25rem;
	line-height: 1.75rem;
  }
  
  .font-bold {
	font-weight: 700;
  }
  
  .text-white {
	color: #ffffff;
  }
  
  .min-h-screen {
	min-height: 100vh;
  }
  .footer-cgu {
  background: rgba(0,0,0,0.3);
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}
.cgu-link {
  color: #d4af37;
  text-decoration: underline;
  font-weight: bold;
  font-size: 1.1em;
  transition: color 0.2s;
}
.cgu-link:hover {
  color: #fffbe6;
}
  </style>