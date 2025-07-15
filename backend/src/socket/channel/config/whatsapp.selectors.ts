// whatsapp.selectors.ts - Version optimisée
export const selectors = {
    // ... (garder tous les sélecteurs existants)
    testWhatsAppOK: {
        primary: 'h1:has-text("WhatsApp Web")',
    },

    cancelButton: {
        primary: '#side button[aria-label="Annuler la recherche"]',
        fallback: '#side button._ah_y',
        alternatives: [
            'button span[data-icon="close-refreshed"]',
            'button:has-text(/cancel|annuler|cancelar/i)'
        ]
    },

    searchField: {
        primary: '#side div[aria-label="Champ de recherche"]',
        fallback: '#side p.selectable-text.copyable-text.x15bjb6t.x1n2onr6',
        alternatives: [
            '#side div[contenteditable="true"]',
            '#side div[contenteditable="true"][role="textbox"]',
            '#side div.x1hx0egp.x6ikm8r.x1odjw0f.x6prxxf.x1k6rcq7.x1whj5v',
        ]
    },

    zoneContacts: {
        primary: '#pane-side div[aria-label="Résultats de la recherche"]',
        fallback: '#pane-side.x1n2onr6._ak9y',
        alternatives: [
            '#pane-side',
            '#pane-side div.x1y332i5.x1n2onr6.x6ikm8r.x10wlt62.xjwt4uw',
        ]
    },

    contactByName: (name: string) => `#pane-side div[role="listitem"]:has-text("${name}")`,

    contactItem: {
        primary: '#pane-side > div:nth-child(1) > div > div >div:nth-child(2)',
        fallback: '#pane-side div[role="listitem"]:nth-child(2)',
        alternatives: [
            '#pane-side div[role="listitem"] div.x1n2onr6',
        ]
    },

    headerInfo: {
        primary: 'header div[title="Détails du profil"]',
        fallback: '#main header.x1n2onr6',
        alternatives: [
            '#main header',
            '#main header div[role="button"]',
            '#main header div.x1c4vz4f',
            '#main header div span[data-icon="default-contact-refreshed"]',
            'header:has-text(/profile|profil|perfil/i)'
        ]
    },

    headerInfoContact: {
        primary: 'header div[title="Infos du contact"]',
    },

    spanUserNumber: {
        primary: 'span div.x1fcty0u.xhslqc4.x6prxxf.x1o2sk6j',
        fallback: 'span.x1rg5ohu.x13faqbe._ao3e.selectable-text.copyable-text',
        alternatives: [
            'span._ao3e.selectable-text.copyable-text div',
            'span[dir="auto"]._ao3e div',
            'span.selectable-text div',
            'span._ao3e div',
            'span:has-text(/^\+\d+/)'
        ]
    },

    spanBusinessNumber: {
        primary: 'span._ao3e > span.x1lkfr7t.xdbd6k5.x1fcty0u.xw2npq5',
        fallback: 'span[dir="auto"]._ao3e >span.x1lkfr7t.xdbd6k5.x1fcty0u.xw2npq5 ',
        alternatives: [
            'span:has-text(/^\+\d+/)'
        ]
    },

    closeDetailsButton: {
        primary: 'header.x14bqcqg > div.x78zum5.x1okw0bk > div:nth-child(1) > div[role="button"]',
        fallback: 'header.x14bqcqg div.x1okw0bk.x1fxk84t',
        alternatives: [
            'button:has-text(/close|fermer|cerrar/i)'
        ]
    },

    messageZone: {
        primary: '#main footer div[contenteditable="true"][role="textbox"]',
        fallback: '#main > footer p.selectable-text.copyable-text.x15bjb6t.x1n2onr6',
        alternatives: [
            '#main footer div[contenteditable="true"]',
        ]
    },

    attachButton: {
        primary: '#main > footer div._ak1q div._ak1r > div >div:nth-child(1)',
        fallback: '#main > footer div._ak1q div.x100vrsf',
        alternatives: [
            'button[title="Attach"]',
            'button[title="Joindre"]',
            'span[data-icon="plus-rounded]',
            'button:has-text(/attach|joindre|adjuntar/i)'
        ]
    },

    fileInput: {
        primary: '#main > footer._ak1i.x1wiwyrm input[type="file"][accept="image/*"] ',
        fallback: '#main > footer input[type="file"][accept="image/*"]',
        alternatives: [
            'input[type="file"][accept*="image/*"]',
            '[accept*="image/*"]',
        ]
    },

    sendButtonWithImage: {
        primary: 'span[data-icon="wds-ic-send-filled"]',
        fallback: 'div.x1247r65 > div',
        alternatives: [
            'div[aria-label="Envoyer"]',
            'div[aria-label="Send"]',
            'span[data-icon="wds-ic-send-filled"]',
            'button:has-text(/send|envoyer|enviar/i)'
        ]
    },

    sendButtonWithoutImage: {
        primary: 'button span[data-icon="wds-ic-send-filled"]',
        fallback: '#main > footer button.x1c4vz4f.x2lah0s',
        alternatives: [
            'button[aria-label="Envoyer"]',
            'button[aria-label="Send"]',
            'button:has-text(/send|envoyer|enviar/i)'
        ]
    },

    chatWindow: {
        primary: '#main',
        fallback: 'div[data-testid="conversation-panel"]',
        alternatives: ['div[data-testid="chat-window"]', '#app div[role="main"]']
    },

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

    messageStatus: {
        sent: 'span[data-icon="msg-check"]',
        delivered: 'span[data-icon="msg-dblcheck"]',
        read: 'span[data-icon="msg-dblcheck-ack"]'
    },

    sidebar: {
        primary: '#side',
        fallback: 'div[data-testid="sidebar"]',
        alternatives: ['aside', 'nav[role="navigation"]']
    },

    appContainer: {
        primary: '#app',
        fallback: 'div[data-testid="app"]',
        alternatives: ['body > div:first-child', '[role="application"]']
    }
};

export const hasTextSelectors = {
    contactByName: (name: string) => `#pane-side div[role="listitem"]:has-text("${name}")`,
    messageByText: (text: string) => `#main div:has-text("${text}")`,
    buttonByText: (text: string) => `button:has-text("${text}")`,
    menuOptionByText: (text: string) => `div[role="menuitem"]:has-text("${text}")`,
    unreadChat: 'div[role="listitem"]:has(span[data-icon="unread"])',
    typingIndicator: 'div:has-text(/typing|en train|escribiendo/i)'
};

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

export async function findHiddenFileInput(page: any, timeout: number = 2000): Promise<any> {
    try {
        console.log('🔍 Recherche optimisée des inputs file...');

        // Recherche rapide des inputs file
        const fileInputs = await page.$$('input[type="file"]');

        if (fileInputs.length > 0) {
            console.log(`📁 ${fileInputs.length} input(s) file trouvé(s)`);

            // Prioriser rapidement les inputs avec accept approprié
            for (const input of fileInputs) {
                const accept = await input.getAttribute('accept');
                if (accept && (accept.includes('image/*') || accept.includes('/*'))) {
                    console.log(`✅ Input file sélectionné: ${accept}`);
                    return input;
                }
            }

            // Si aucun avec accept spécifique, prendre le premier disponible
            return fileInputs[1] || fileInputs[0];
        }

        throw new Error('❌ Aucun input file trouvé');

    } catch (error) {
        throw new Error(`Erreur lors de la recherche d'input file: ${error.message}`);
    }
}

export async function findElementWithFallback(
    page: any,
    selectorKey: string,
    timeout: number = 2000, // Timeout par défaut réduit
    includeHidden: boolean = false
): Promise<any> {
    const selectors = getSelector(selectorKey);
    const timeoutPerSelector = Math.max(timeout / selectors.length, 500); // Minimum 500ms par sélecteur

    for (const selector of selectors) {
        try {
            let element;

            if (includeHidden) {
                element = await page.$(selector);
                if (element) {
                    console.log(`Élément trouvé (incluant cachés): ${selector}`);
                    return element;
                }
            } else {
                element = await page.waitForSelector(selector, { timeout: timeoutPerSelector });
                if (element) {
                    console.log(`Élément trouvé: ${selector}`);
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

// Configuration des timeouts optimisés
export const timeouts = {
    fast: 1000,    // Très rapide pour les éléments immédiats
    normal: 2000,  // Timeout standard réduit
    slow: 4000,    // Éléments qui peuvent prendre du temps (réduit)
    network: 6000  // Opérations réseau (réduit significativement)
};