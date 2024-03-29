/* eslint-disable prettier/prettier */
export function useVariable() {
  const problem = {
    search_contact: 'probleme recherche contact',
    select_contact: "probleme d'envoi selection contact",
    select_zone_message: "probleme d'envoi selection de la zone de message",
    select_button_send: " probleme d'envoi selection du bouton d'envoi",
    select_button_attach:
      " probleme selection du bouton ajout d'une piece jointe",
    select_button_attach_image:
      " probleme selection du bouton ajout d'une piece jointe de type image",
    check_select_detail_contact:
      'probleme affichage des informations detaillées du contact',
    check_select_detail_contact_get:
      'probleme pour récupérer le numéro du contact dans les informations détaillées',
    check_detail_contact: 'probleme mauvais contact',
    load_image: " probleme chargement de l'image",
  };

  const message_info = {
    send: 'message envoyé',
    send_failed: 'message non envoyé',
    load_whatsappUrl: "Attente chargement de l'interface WhatApp",
    start:
      '******************************* DEBUT DE LA CAMPAGNE ********************************',
    end: '******************************* FIN DE LA CAMPAGNE ********************************',
    question:
      "Voulez-vous renvoyer le message aux contacts qui n'ont pas reçu le message? (Oui/Non): ",
    prompt_before_start:
      "Appuyer sur la touche <Entrée> une fois l'interface WhatsApp chargée",
    dline: '=================================================================',
    dline_detail:
      '******************************* DETAIL DE LA CAMPAGNE *******************************',
    dline_1:
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  DES MESSAGES NON ENVOYES !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
  };

  const message_error = {
    file_message_not_found: 'le fichier de message est introuvable',
    file_contact_not_found: 'le fichier de contact est introuvable',
  };

  const whatsappUrl = 'https://web.whatsapp.com';
  const instagramUrl = 'https://www.instagram.com';

  const myTime = {
    TIME_WAIT_END_ACTION: 5000,
    TIME_WHATS_APP_LOADING: 10000,
    TIME_WAIT_CONNECTION: 300000,
    TIME_OUT: 1000,
    TIME_WAIT_ACTION: 2000,
  };

  const balise_replace = {
    PRENOM: '___PRENOM___',
    FIRSTNAME: '___FIRSTNAME___',
  };

  const logger_file = 'campaign_whatsapp.log';

  return {
    problem,
    message_info,
    message_error,
    myTime,
    whatsappUrl,
    instagramUrl,
    balise_replace,
    logger_file,
  };
}
