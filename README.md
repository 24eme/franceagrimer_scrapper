# Scrapping des dossiers de France Agri Mer

## Configuration

    cp bin/config.inc.example bin/config.inc

Éditer `bin/config.inc` pour mettre l'utilisateur et le mot de passe qui permet l'accès au portail franceagrimer.

## Installation

    npm i puppeteer

Vérifier que le lien avec chromium est bien fait via le répertoire `node_modules/puppeteer/.local-chromium/`

## Execution

    bash bin/download_all.sh 2020
