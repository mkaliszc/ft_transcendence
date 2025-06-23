<template>
  <div class="cgu-page min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-10 flex flex-col items-center justify-center">
    <div class="cgu-container">
      <h1 class="text-3xl font-bold text-yellow-400 mb-6 text-center">{{ t('cguTitle') }}</h1>
      <div class="cgu-content">
        <p class="text-sm text-gray-300 mb-2">{{ t('lastUpdated') }}</p>
        <h2 class="text-xl font-semibold text-yellow-300 mt-4">{{ t('whatIsPongBilliard') }}</h2>
        <p>{{ t('pongBilliardDescription') }}</p>
        <h2 class="text-xl font-semibold text-yellow-300 mt-4">{{ t('yourAccount') }}</h2>
        <h3 class="font-bold text-yellow-200 mt-2">{{ t('registration') }}</h3>
        <ul class="list-disc ml-6 mb-2">
          <li>{{ t('canCreateAccount') }}</li>
          <li>{{ t('chooseUniqueUsername') }}</li>
          <li>{{ t('responsibleForPassword') }}</li>
          <li>{{ t('mustBe13OrOlder') }}</li>
        </ul>
        <h3 class="font-bold text-yellow-200 mt-2">{{ t('yourData') }}</h3>
        <p>{{ t('weCollectOnly') }}</p>
        <ul class="list-disc ml-6 mb-2">
          <li>{{ t('accountData') }}</li>
          <li>{{ t('gameData') }}</li>
          <li>{{ t('socialData') }}</li>
        </ul>
        <p>{{ t('googleUserNote') }}</p>
        <h3 class="font-bold text-yellow-200 mt-2">{{ t('whyWeCollect') }}</h3>
        <ul class="list-disc ml-6 mb-2">
          <li>{{ t('accountPurpose') }}</li>
          <li>{{ t('gamePurpose') }}</li>
          <li>{{ t('socialPurpose') }}</li>
        </ul>
        <h2 class="text-xl font-semibold text-yellow-300 mt-4">{{ t('gameRules') }}</h2>
        <div class="flex flex-col md:flex-row gap-6">
          <div class="flex-1">
            <span class="font-bold text-green-400">✅ {{ t('allowed') }}</span>
            <ul class="list-disc ml-6 mb-2">
              <li>{{ t('playNormally') }}</li>
              <li>{{ t('addFriends') }}</li>
              <li>{{ t('customizeAvatar') }}</li>
            </ul>
          </div>
          <div class="flex-1">
            <span class="font-bold text-red-400">❌ {{ t('forbidden') }}</span>
            <ul class="list-disc ml-6 mb-2">
              <li>{{ t('cheatOrBots') }}</li>
              <li>{{ t('harassOthers') }}</li>
            </ul>
          </div>
        </div>
        <h2 class="text-xl font-semibold text-yellow-300 mt-4">{{ t('dataRights') }}</h2>
        <p>{{ t('youCanAlways') }}</p>
        <ul class="list-disc ml-6 mb-2">
          <li>{{ t('viewData') }}</li>
          <li>{{ t('exportData') }}</li>
          <li>{{ t('modifyData') }}</li>
          <li>{{ t('anonymizeData') }}</li>
          <li>{{ t('deleteData') }}</li>
        </ul>
        <h3 class="font-bold text-yellow-200 mt-2">{{ t('dataRetention') }}</h3>
        <ul class="list-disc ml-6 mb-2">
          <li>{{ t('activeAccount') }}</li>
          <li>{{ t('thirtyDaysAfterDeletion') }}</li>
          <li>{{ t('anonymizedHistory') }}</li>
        </ul>
        <h2 class="text-xl font-semibold text-yellow-300 mt-4">{{ t('security') }}</h2>
        <ul class="list-disc ml-6 mb-2">
          <li>{{ t('encryptedPasswords') }}</li>
          <li>{{ t('twoFactorAuthAvailability') }}</li>
          <li>{{ t('noDataSharing') }}</li>
        </ul>
        <h2 class="text-xl font-semibold text-yellow-300 mt-4">{{ t('availability') }}</h2>
        <p>{{ t('gameFreeAlways') }}</p>
        <h2 class="text-xl font-semibold text-yellow-300 mt-4">{{ t('ruleViolations') }}</h2>
        <p>{{ t('weMay') }}</p>
        <ul class="list-disc ml-6 mb-2">
          <li>{{ t('suspendAccount') }}</li>
          <li>{{ t('deleteAccountPermanently') }}</li>
        </ul>
        <h2 class="text-xl font-semibold text-yellow-300 mt-4">{{ t('contact') }}</h2>
        <p>{{ t('questionOrProblem') }}<br>{{ t('emailContact') }} <a href="mailto:kaliszczakm@yahoo.com" class="underline text-yellow-300 hover:text-yellow-400">kaliszczakm@yahoo.com</a></p>
        <p class="mt-6 text-center text-sm text-gray-400">{{ t('acceptanceNote') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.cgu-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%);
  color: #f8f9fa;
  position: relative;
  overflow-x: hidden;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.cgu-container {
  /* Suppression du fond, bordure, ombre, arrondi pour un affichage pleine page */
  background: none;
  border: none;
  box-shadow: none;
  border-radius: 0;
  max-width: 900px;
  width: 100%;
  max-height: none;
  overflow: visible;
  padding: 0;
}
.cgu-content {
  padding: 2rem 1rem;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background: none;
  color: #f8f9fa;
  scrollbar-width: thin;
  scrollbar-color: #d4af37 #2d5a3d;
}
.cgu-content h2 {
  margin-top: 1.5rem;
  color: #d4af37;
}
.cgu-content h3 {
  color: #22c55e;
}
.cgu-content ul {
  color: #f8f9fa;
}
.cgu-content li {
  margin-bottom: 0.3em;
}
.cgu-content a {
  color: #d4af37;
  text-decoration: underline;
  transition: color 0.2s;
}
.cgu-content a:hover {
  color: #22c55e;
}
.cgu-content .text-yellow-200 {
  color: #22c55e;
}
.cgu-content .text-green-400 {
  color: #22c55e;
}
.cgu-content .text-red-400 {
  color: #ef4444;
}
.cgu-content .text-yellow-300 {
  color: #d4af37;
}
.cgu-content .text-gray-300, .cgu-content .text-gray-400 {
  color: #b5b5b5;
}
.cgu-content .font-bold {
  font-weight: 700;
}
.cgu-content .underline {
  text-decoration: underline;
}
.cgu-content::-webkit-scrollbar {
  width: 8px;
}
.cgu-content::-webkit-scrollbar-thumb {
  background: #d4af37;
  border-radius: 4px;
}
.cgu-content::-webkit-scrollbar-track {
  background: #2d5a3d;
  border-radius: 4px;
}
</style>
