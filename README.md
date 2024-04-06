# Campaign Message

Ce projet utilise Playwright pour effectuer des tests automatisés sur des navigateurs web.

## Prérequis

- Node.js version >= 16 doit être installé sur votre système. Vous pouvez télécharger Node.js depuis [le site officiel](https://nodejs.org/).

## Installation des navigateurs pour Playwright

Avant de lancer le programme, vous devez installer les navigateurs pour Playwright en utilisant la commande suivante :

```bash
npx playwright install
```

Cette commande téléchargera et installera les navigateurs nécessaires pour Playwright (Chromium, Firefox et WebKit) dans votre environnement.

## Lancement du Programme

### Sur Windows

Pour lancer le programme sur Windows, exécutez le fichier `start.cmd`. Assurez-vous que Node.js est installé sur votre système et que les navigateurs pour Playwright ont été installés à l'étape précédente.

```bash
start.cmd
```

### Sur Linux

Pour lancer le programme sur Linux, exécutez le fichier `start.sh`. Assurez-vous que Node.js est installé sur votre système et que les navigateurs pour Playwright ont été installés à l'étape précédente.

```bash
./start.sh
```


### packaging projet 

```bash
tar -czvf campaign_message_gui.tar.gz dist node_modules package.json pnpm-lock.yaml start.cmd start.sh README.md .env
tar -xzvf campaign_message_gui.tar.gz -C campaign_message_gui
```
