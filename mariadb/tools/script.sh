#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "===== Initialisation de la base de données pour le jeu de Pong ====="

# Vérifier si MariaDB est installé
if ! command -v mariadb &> /dev/null; then
    echo -e "${RED}MariaDB n'est pas installé. Veuillez installer MariaDB et réessayer.${NC}"
    exit 1
fi

# Créer la base de données si elle n'existe pas déjà
echo "Vérification de l'existence de la base de données..."
if mariadb -u "$DB_USER" ${MARIADB_ROOT_PASSWORD:+-p"$MARIADB_ROOT_PASSWORD"} -e "USE $DB_NAME" 2>/dev/null; then
    echo -e "${GREEN}La base de données $DB_NAME existe déjà.${NC}"
else
    echo "Création de la base de données $DB_NAME..."
    if mariadb -u "$DB_USER" ${MARIADB_ROOT_PASSWORD:+-p"$MARIADB_ROOT_PASSWORD"} -e "CREATE DATABASE IF NOT EXISTS $DB_NAME"; then
        echo -e "${GREEN}Base de données $DB_NAME créée avec succès.${NC}"
    else
        echo -e "${RED}Erreur lors de la création de la base de données $DB_NAME.${NC}"
        exit 1
    fi
fi

# Exécuter le script SQL pour créer les tables
echo "Initialisation des tables..."
if mariadb -u "$DB_USER" ${MARIADB_ROOT_PASSWORD:+-p"$MARIADB_ROOT_PASSWORD"} "$DB_NAME" < init.sql; then
    echo -e "${GREEN}Initialisation des tables réussie !${NC}"
else
    echo -e "${RED}Erreur lors de l'initialisation des tables.${NC}"
    exit 1
fi

echo -e "${GREEN}===== Base de données initialisée avec succès ! =====${NC}"
exit 0