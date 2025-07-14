// whatsapp.selectors_tony.ts
export const selectors = {

    //load whatApps
    testWhatsAppOK: {
        primary: 'h1:has-text("WhatsApp Web")',
    },


    // Navigation et recherche
    cancelButton: {
        primary: '#side button[aria-label="Annuler la recherche"]',
        fallback: '#side button._ah_y',
        alternatives: [
            '#side button[title="Annuler la recherche"]',
            'button[data-testid="cancel-search"]']
    },

    searchField: {
        primary: '#side div[contenteditable="true"][aria-label="Champ de recherche"]',
        fallback: '#side p.selectable-text.copyable-text.x15bjb6t.x1n2onr6',
        alternatives: [
            '#side div[contenteditable="true"]',
            'div[aria-label="Champ de recherche"]',
            'p[data-testid="search-input"]' //element introuvable
        ]
    },

    // Contacts et conversations
    zoneContacts: {
        primary: '#pane-side > div:nth-child(1) > div > div > div:nth-child(2)',
        fallback: '#pane-side div[role="listitem"]:nth-child(2)',
        alternatives: [
            '#pane-side div[role="listitem"]:nth-child(2)',
            'div[data-testid="conversation-list-item"]',
            'div[data-testid="contact-result"]'
        ]
    },

    contactItem: {
        primary: '#pane-side > div:nth-child(1) > div > div > div:nth-child(2)',
        fallback: '#pane-side div[role="listitem"]:nth-child(2)',
        alternatives: [
            '#pane-side div[role="listitem"]:nth-child(2)',
            'div[data-testid="conversation-list-item"]',
            'div[data-testid="contact-result"]'
        ]
    },

    // Header et informations de contact
    headerInfo: {
        primary: 'header div[title="Détails du profil"]',
        fallback: '#main header.x1n2onr6',
        alternatives: [
            '#main header',
            'header div[title="Détails du profil"]',
            'div[data-testid="conversation-info-header"]'
        ]
    },

    // Numéros de téléphone dans les détails
    spanUserNumber: {
        primary: 'span[data-testid="phone-number"]',
        fallback: 'span.x1jchvi3.x1fcty0u.x40yjcy',
        alternatives: [
            'span[title*="+"]',
            'span[data-testid="contact-phone"]',
            'div[data-testid="contact-details"] span'
        ]
    },

    spanBusinessNumber: {
        primary: 'span[data-testid="business-phone"]',
        fallback: 'span._ao3e > span.x1lkfr7t.xdbd6k5.x1fcty0u.xw2npq5',
        alternatives: [
            'span[data-testid="business-contact-phone"]',
            'div[data-testid="business-info"] span[title*="+"]'
        ]
    },

    // Boutons de fermeture
    closeDetailsButton: {
        primary: 'button[data-testid="close-profile"]',
        fallback: 'header.x9f619 div.x1okw0bk.x16dsc37',
        alternatives: [
            'button[aria-label="Fermer"]',
            'button[aria-label="Close"]',
            'div[data-testid="close-button"]'
        ]
    },

    // Zone de message
    messageZone: {
        primary: 'div[data-testid="conversation-compose-box-input"]',
        fallback: '#main > footer p.selectable-text.copyable-text.x15bjb6t.x1n2onr6',
        alternatives: [
            'div[contenteditable="true"][data-testid="message-input"]',
            'div[role="textbox"]',
            'p[contenteditable="true"]'
        ]
    },

    // Boutons d'attachement
    attachButton: {
        primary: 'button[data-testid="attach-button"]',
        fallback: '#main > footer div._ak1q div._ajv7 > div._ajv6',
        alternatives: [
            'button[aria-label="Joindre"]',
            'button[aria-label="Attach"]',
            'div[data-testid="clip-button"]'
        ]
    },

    // Input de fichier
    fileInput: {
        primary: 'input[type="file"][data-testid="file-input"]',
        fallback: '#main > footer div._ak4w div.xyqdw3p > div:nth-child(2) input[type=file]',
        alternatives: [
            'input[type="file"]',
            'input[accept*="image"]',
            'input[data-testid="media-input"]'
        ]
    },

    // Boutons d'envoi
    sendButtonWithImage: {
        primary: 'button[data-testid="send-button"]',
        fallback: 'div.x1247r65 > div',
        alternatives: [
            'button[aria-label="Envoyer"]',
            'button[aria-label="Send"]',
            'div[data-testid="media-send-button"]'
        ]
    },

    sendButtonWithoutImage: {
        primary: 'button[data-testid="compose-btn-send"]',
        fallback: '#main > footer button.x1c4vz4f.x2lah0s',
        alternatives: [
            'button[aria-label="Envoyer"]',
            'button[aria-label="Send"]',
            'span[data-testid="send"]'
        ]
    },

    // Sélecteurs additionnels pour une meilleure robustesse
    chatWindow: {
        primary: 'div[data-testid="conversation-panel"]',
        fallback: '#main',
        alternatives: ['div[data-testid="chat-window"]']
    },

    loadingIndicator: {
        primary: 'div[data-testid="loading"]',
        fallback: 'div[role="progressbar"]',
        alternatives: ['div.spinner', 'div[data-testid="spinner"]']
    },

    errorMessage: {
        primary: 'div[data-testid="error-message"]',
        fallback: 'div[role="alert"]',
        alternatives: ['div.error', 'div[data-testid="alert"]']
    },

    // Indicateurs de statut de message
    messageStatus: {
        sent: 'span[data-testid="msg-check"]',
        delivered: 'span[data-testid="msg-dblcheck"]',
        read: 'span[data-testid="msg-dblcheck-ack"]'
    }
};

// Fonction utilitaire pour obtenir un sélecteur avec fallbacks
export function getSelector(selectorKey: string): string[] {
    const selectorObj = selectors[selectorKey];
    if (!selectorObj) {
        throw new Error(`Sélecteur '${selectorKey}' non trouvé`);
    }

    if (typeof selectorObj === 'string') {
        return [selectorObj];
    }

    return [
        selectorObj.primary,
        selectorObj.fallback,
        ...(selectorObj.alternatives || [])
    ];
}

// Fonction pour tester la validité d'un sélecteur
export async function findElementWithFallback(
    page: any,
    selectorKey: string,
    timeout: number = 5000
): Promise<any> {
    const selectors = getSelector(selectorKey);

    for (const selector of selectors) {
        try {
            const element = await page.waitForSelector(selector, {timeout: timeout});
            if (element) {
                console.log(`Élément trouvé avec le sélecteur: ${selector}`);
                return element;
            }
        } catch (error) {
            console.warn(`Sélecteur échoué: ${selector}`);
            continue;
        }
    }

    throw new Error(`Aucun sélecteur valide trouvé pour '${selectorKey}'`);
}

// Configuration des timeouts pour différents éléments
export const timeouts = {
    fast: 2000,    // Éléments qui devraient apparaître rapidement
    normal: 5000,  // Timeout standard
    slow: 10000,   // Éléments qui peuvent prendre du temps (chargement de contacts)
    network: 15000 // Opérations réseau (envoi de messages)
};