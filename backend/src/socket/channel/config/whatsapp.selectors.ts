// whatsapp.selectors.ts
export const selectors = {

    //load whatApps
    testWhatsAppOK: {
        primary: 'h1:has-text("WhatsApp Web")',
    },

    // Navigation et recherche - Basé sur l'analyse du HTML actuel ***ok
    cancelButton: {
        primary: '#side button[aria-label="Annuler la recherche"]',
        fallback: '#side button._ah_y',
        alternatives: [
            'button span[data-icon="close-refreshed"]',
            'button:has-text(/cancel|annuler|cancelar/i)' // has-text comme fallback
        ]
    },
    // ***ok
    searchField: {
        primary: '#side div[aria-label="Champ de recherche"]',
        fallback: '#side p.selectable-text.copyable-text.x15bjb6t.x1n2onr6',
        alternatives: [
            '#side div[contenteditable="true"]',
            '#side div[contenteditable="true"][role="textbox"]',
            '#side div.x1hx0egp.x6ikm8r.x1odjw0f.x6prxxf.x1k6rcq7.x1whj5v',

        ]
    },

    // Contacts et conversations - avec support has-text **ok
    zoneContacts: {
        primary: '#pane-side div[aria-label="Résultats de la recherche"]', // Le conteneur principal de la liste
        fallback: '#pane-side.x1n2onr6._ak9y',
        alternatives: [
            '#pane-side', // La sidebar complète
            '#pane-side div.x1y332i5.x1n2onr6.x6ikm8r.x10wlt62.xjwt4uw',
        ]
    },

    // Fonction pour sélectionner un contact par nom **ok
    contactByName: (name: string) => `#pane-side div[role="listitem"]:has-text("${name}")`,

    contactItem: {
        primary: '#pane-side > div:nth-child(1) > div > div >div:nth-child(2)', // Un élément de contact individuel
        fallback: '#pane-side div[role="listitem"]:nth-child(2)',
        alternatives: [
            '#pane-side div[role="listitem"] div.x1n2onr6',
        ]
    },

    // Header et informations de contact - Structure actuelle span[data-icon="close-refreshed"] **ok
    headerInfo: {
        primary: 'header div[title="Détails du profil"]',
        fallback: '#main header.x1n2onr6',
        alternatives: [
            '#main header',
            '#main header div[role="button"]',
            '#main header div.x1c4vz4f',
            '#main header div span[data-icon="default-contact-refreshed"]',
            'header:has-text(/profile|profil|perfil/i)' // has-text pour les détails du profil
        ]
    },

    // Numéros de téléphone dans les détails - Classes CSS actuelles **ok
    spanUserNumber: {
        primary: 'span div.x1fcty0u.xhslqc4.x6prxxf.x1o2sk6j',
        fallback: 'span._ao3e.selectable-text.copyable-text div',
        alternatives: [
            'span[dir="auto"]._ao3e div',                              // Avec attribut dir
            'span.selectable-text div',                                // Plus générique
            'span._ao3e div',
            'span:has-text(/^\+\d+/)' // has-text pour les numéros qui commencent par +
        ]
    },
    // **ok
    spanBusinessNumber: {
        primary: 'span._ao3e > span.x1lkfr7t.xdbd6k5.x1fcty0u.xw2npq5',
        fallback: 'span[dir="auto"]._ao3e >span.x1lkfr7t.xdbd6k5.x1fcty0u.xw2npq5 ',
        alternatives: [
            'span:has-text(/^\+\d+/)' // has-text pour les numéros business
        ]
    },

    // Boutons de fermeture - Structure moderne avec has-text **ok
    closeDetailsButton: {
        primary: 'header.x14bqcqg > div.x78zum5.x1okw0bk > div:nth-child(1) > div[role="button"]',
        fallback: 'header.x14bqcqg div.x1okw0bk.x1fxk84t',
        alternatives: [
            'button:has-text(/close|fermer|cerrar/i)' // has-text pour "fermer"
        ]
    },

    // Zone de message - Structure actuelle WhatsApp **ok
    messageZone: {
        primary: '#main footer div[contenteditable="true"][role="textbox"]',
        fallback: '#main > footer p.selectable-text.copyable-text.x15bjb6t.x1n2onr6',
        alternatives: [
            '#main footer div[contenteditable="true"]',

        ]
    },

    // Boutons d'attachement - Icône clip moderne avec has-text **ok
    attachButton: {
        primary: '#main > footer div._ak1q div._ak1r > div >div:nth-child(1)',
        fallback: '#main > footer div._ak1q div.x100vrsf',
        alternatives: [
            'button[title="Attach"]',
            'button[title="Joindre"]',
            'span[data-icon="plus-rounded]',
            'button:has-text(/attach|joindre|adjuntar/i)' // has-text pour "joindre"
        ]
    },

    // Input de fichier - Structure moderne
    /*fileInput: {
        primary: 'input[type="file"][accept*="image"]',
        fallback: '#main > footer input[type="file"]',
        alternatives: [
            'input[type="file"]',
            'input[accept*="*"]',

        ]
    },*/
    fileInput: {
        primary: '#main > footer._ak1i.x1wiwyrm input[type="file"][accept="image/*"] ',
        fallback: '#main > footer input[type="file"][accept="image/*"]',
        alternatives: [
            'input[type="file"][accept*="image/*"]',
            '[accept*="image/*"]',

        ]
    },

    // Boutons d'envoi - Icône send moderne avec has-text
    sendButtonWithImage: {
        primary: 'span[data-icon="wds-ic-send-filled"]',
        fallback: 'div.x1247r65 > div',
        alternatives: [
            'div[aria-label="Envoyer"]',
            'div[aria-label="Send"]',
            'span[data-icon="wds-ic-send-filled"]',
            'button:has-text(/send|envoyer|enviar/i)' // has-text pour "envoyer"
        ]
    },

    sendButtonWithoutImage: {
        primary: 'button span[data-icon="wds-ic-send-filled"]',
        fallback: '#main > footer button.x1c4vz4f.x2lah0s',
        alternatives: [
            'button[aria-label="Envoyer"]',
            'button[aria-label="Send"]',
            'button:has-text(/send|envoyer|enviar/i)' // has-text pour "envoyer"
        ]
    },

    // Sélecteurs additionnels pour une meilleure robustesse
    chatWindow: {
        primary: '#main',
        fallback: 'div[data-testid="conversation-panel"]',
        alternatives: ['div[data-testid="chat-window"]', '#app div[role="main"]']
    },

    // Indicateurs de chargement et d'erreur
    loadingIndicator: {
        primary: 'div[role="progressbar"]',
        fallback: 'div[data-testid="loading"]',
        alternatives: ['div.spinner', 'div[data-testid="spinner"]', 'progress']
    },

    errorMessage: {
        primary: 'div[role="alert"]',
        fallback: 'div[data-testid="error-message"]',
        alternatives: ['div.error', 'div[data-testid="alert"]']
    },

    // Indicateurs de statut de message - Structure actuelle
    messageStatus: {
        sent: 'span[data-icon="msg-check"]',
        delivered: 'span[data-icon="msg-dblcheck"]',
        read: 'span[data-icon="msg-dblcheck-ack"]'
    },

    // Sélecteurs spécifiques pour la sidebar
    sidebar: {
        primary: '#side',
        fallback: 'div[data-testid="sidebar"]',
        alternatives: ['aside', 'nav[role="navigation"]']
    },

    // App container principal
    appContainer: {
        primary: '#app',
        fallback: 'div[data-testid="app"]',
        alternatives: ['body > div:first-child', '[role="application"]']
    }
};

// Fonctions utilitaires avec has-text
export const hasTextSelectors = {
    // Sélectionner un contact par nom
    contactByName: (name: string) => `#pane-side div[role="listitem"]:has-text("${name}")`,

    // Sélectionner un message par contenu
    messageByText: (text: string) => `#main div:has-text("${text}")`,

    // Boutons par texte (multilingue)
    buttonByText: (text: string) => `button:has-text("${text}")`,

    // Menu/option par texte
    menuOptionByText: (text: string) => `div[role="menuitem"]:has-text("${text}")`,

    // Chat non lu
    unreadChat: 'div[role="listitem"]:has(span[data-icon="unread"])',

    // Indicateur de frappe
    typingIndicator: 'div:has-text(/typing|en train|escribiendo/i)'
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

export async function findHiddenFileInput(page: any, timeout: number = 5000): Promise<any> {
    try {
        console.log('🔍 Recherche des inputs file (incluant cachés)...');

        // Rechercher tous les inputs file (même cachés)
        const fileInputs = await page.$$('input[type="file"]');

        if (fileInputs.length > 0) {
            console.log(`📁 ${fileInputs.length} input(s) file trouvé(s)`);

            // Debug: afficher les propriétés de chaque input
            for (let i = 0; i < fileInputs.length; i++) {
                const input = fileInputs[i];
                const accept = await input.getAttribute('accept');
                const style = await input.getAttribute('style');
                console.log(`📄 Input ${i}: accept="${accept}", style="${style}"`);
            }

            // Prioriser les inputs avec accept="image/*" ou similaire
            for (const input of fileInputs) {
                const accept = await input.getAttribute('accept');

                if (accept && (accept.includes('image/*') || accept.includes('/*'))) {
                    console.log(`✅ Input file sélectionné avec accept: ${accept}`);
                    return input;
                }
            }

            // Si aucun avec accept spécifique, prendre le premier
            console.log('⚠️  Aucun input avec accept spécifique, prise du premier disponible');
            return fileInputs[1];
        }

        throw new Error('❌ Aucun input file trouvé');

    } catch (error) {
        throw new Error(`Erreur lors de la recherche d'input file: ${error.message}`);
    }
}

// Fonction pour tester la validité d'un sélecteur
export async function findElementWithFallback(
    page: any,
    selectorKey: string,
    timeout: number = 5000,
    includeHidden: boolean = false // Nouveau paramètre pour inclure les éléments cachés
): Promise<any> {
    const selectors = getSelector(selectorKey);

    for (const selector of selectors) {
        try {
            let element;

            if (includeHidden) {
                // Pour les éléments cachés, utiliser $() au lieu de waitForSelector()
                element = await page.$(selector);
                if (element) {
                    console.log(`Élément trouvé (incluant cachés) avec le sélecteur: ${selector}`);
                    return element;
                }
            } else {
                // Comportement normal pour les éléments visibles
                element = await page.waitForSelector(selector, { timeout: timeout / selectors.length });
                if (element) {
                    console.log(`Élément trouvé avec le sélecteur: ${selector}`);
                    return element;
                }
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