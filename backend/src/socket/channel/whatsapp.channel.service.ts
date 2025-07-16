/* eslint-disable prettier/prettier */
import {Injectable, Logger} from '@nestjs/common';
import {useFunction} from '../../shared/function.util';
import {useVariable} from '../../shared/channel.config';
import {Page} from 'playwright';
import {ChannelService, SendMessageResponse} from './channel.service';
import {Contact} from '../../contact/entities/contact.entity';
import {
    selectors,
    findElementWithFallback,
    findHiddenFileInput, // Nouvelle fonction importée
    timeouts,
} from './config/whatsapp.selectors';

import * as path from 'path';
import {existsSync} from 'fs';


const {sleep} = useFunction();
const {message_info, myTime, problem} = useVariable();

@Injectable()
export class WhatsappChannelService implements ChannelService {
    private readonly logger = new Logger(WhatsappChannelService.name);
    private lastActionTime = 0;
    private readonly language = 'fr'; // Configurable selon la langue de l'interface

    public actionBeforeSendAllMessage = async (
        page: Page,
    ): Promise<SendMessageResponse> => {
        return new SendMessageResponse(true, '');
    };

    public sendMessage = async (
        page: Page,
        contact: Contact,
        message: string,
        attachment?: string,
    ): Promise<SendMessageResponse> => {
        this.logger.log(`Tentative d'envoi vers ${contact.phoneNumber}`);
        const startTime = Date.now();

        try {
            // Étape 1: Vérifier que WhatsApp est chargé
            //await this.waitForWhatsAppToLoad(page);

            // Étape 2: Préparation
            await this.cancelSearch(page);
            //await sleep(myTime.TIME_WAIT_ACTION);

            // Étape 3: Recherche du contact
            const searchResult = await this.searchContact(page, contact.phoneNumber);
            if (!searchResult.statut) {
                return searchResult;
            }

            // Étape 4: Sélection du contact
            const selectResult = await this.selectContact(page);
            if (!selectResult.statut) {
                return selectResult;
            }

            // Étape 5: Vérification de l'identité
            const verifyResult = await this.verifyContactIdentity(page, contact);
            if (!verifyResult.statut) {
                return verifyResult;
            }

            // Étape 6: Envoi du message
            const sendResult = await this.sendMessageReally(page, message, attachment);


            const totalTime = Date.now() - startTime;

            if (sendResult.statut) {
                this.logger.log(`Message envoyé en ${totalTime}ms vers ${contact.phoneNumber}`);
            }

            return sendResult;

        } catch (error) {
            this.logger.error(`Erreur lors de l'envoi vers ${contact.phoneNumber}:`, error);
            return new SendMessageResponse(false, `Erreur inattendue: ${error.message}`);
        }
    };

    private async waitForWhatsAppToLoad(page: Page): Promise<void> {
        try {
            await findElementWithFallback(page, 'testWhatsAppOK', timeouts.network);
            this.logger.debug('WhatsApp chargé avec succès');
        } catch (error) {
            throw new Error('WhatsApp n\'a pas pu être chargé');
        }
    }

    private async cancelSearch(page: Page): Promise<void> {
        const currentTime = Date.now();
        if (currentTime - this.lastActionTime < 1000) {
            return;
        }
        this.lastActionTime = currentTime;

        try {
            // Fallback vers les sélecteurs génériques
            const cancelButton = await findElementWithFallback(page, 'cancelButton', timeouts.fast);

            if (cancelButton && await cancelButton.isVisible()) {
                await cancelButton.click({timeout: timeouts.fast});
                this.logger.debug('Bouton d\'annulation cliqué');
            }
        } catch (error) {
            this.logger.debug('Aucun bouton d\'annulation trouvé ou nécessaire');
        }
    }

    private async searchContact(page: Page, phoneNumber: string): Promise<SendMessageResponse> {
        try {
            const searchField = await findElementWithFallback(page, 'searchField', timeouts.normal);

            // Vider le champ et saisir le numéro
            await searchField.fill('');
            await sleep(500);
            await searchField.fill(phoneNumber);

            // Attendre que les résultats de recherche apparaissent
            await this.waitChangeInterface(page, selectors.searchField.primary, timeouts.normal);

            this.logger.debug(`Recherche effectuée pour ${phoneNumber}`);
            return new SendMessageResponse(true, '');
        } catch (error) {
            this.logger.error('Erreur lors de la recherche du contact:', error);
            return new SendMessageResponse(false, problem.search_contact);
        }
    }

    private async selectContact(page: Page): Promise<SendMessageResponse> {
        try {
            // Attendre que les contacts apparaissent
            await page.waitForSelector(selectors.zoneContacts.primary, {
                timeout: timeouts.slow
            }).catch(() => {
                return page.waitForSelector(selectors.zoneContacts.fallback, {
                    timeout: timeouts.slow
                });
            });

            // Méthode améliorée pour sélectionner le contact
            const contactItems = await page.$$(selectors.contactItem.primary);

            if (contactItems.length === 0) {
                // Fallback vers l'ancienne méthode
                return await this.selectContactFallback(page);
            }

            // Cliquer sur le premier contact trouvé
            await contactItems[0].click({timeout: timeouts.normal});
            await sleep(3000)
            this.logger.debug('Contact sélectionné');

            return new SendMessageResponse(true, '');
        } catch (error) {
            this.logger.error('Erreur lors de la sélection du contact:', error);
            return new SendMessageResponse(false, problem.select_contact);
        }
    }

    private async selectContactFallback(page: Page): Promise<SendMessageResponse> {
        try {
            const zoneContacts = await page.$$(selectors.zoneContacts.fallback);

            for (const zoneContact of zoneContacts) {
                const styleAttribute = await zoneContact.getAttribute('style');
                if (!styleAttribute) continue;

                const styleMap = this.parseStyleAttribute(styleAttribute);

                if (styleMap['transform'] === 'translateY(72px);') {
                    await zoneContact.click({timeout: timeouts.normal});
                    this.logger.debug('Contact sélectionné (méthode fallback)');
                    return new SendMessageResponse(true, '');
                }
            }

            throw new Error('Aucun contact trouvé avec le style attendu');
        } catch (error) {
            throw error;
        }
    }

    private async verifyContactIdentity(page: Page, contact: Contact): Promise<SendMessageResponse> {
        try {
            // Ouvrir les détails du contact
            const headerInfo = await findElementWithFallback(page, 'headerInfo', timeouts.fast);
            await headerInfo.click();
            await this.waitChangeInterface(page, selectors.headerInfoContact.primary, timeouts.fast)

            // Récupérer le numéro de téléphone avec retry
            let phoneNumber: string = '';
            phoneNumber = await this.getContactPhoneNumber(page);


            // Normaliser les numéros pour la comparaison
            const normalizedContactNumber = contact.phoneNumber.replace(/^\+/, '').replace(/\s+/g, '');
            const normalizedFoundNumber = phoneNumber.replace(/^\+/, '').replace(/\s+/g, '');

            // Vérifier la correspondance
            if (normalizedContactNumber !== normalizedFoundNumber) {
                this.logger.warn(`Numéro ne correspond pas: attendu ${normalizedContactNumber}, trouvé ${normalizedFoundNumber}`);

                // Fermer les détails avant de retourner l'erreur
                await this.closeContactDetails(page);
                return new SendMessageResponse(false, problem.check_detail_contact);
            }

            // Fermer les détails
            await this.closeContactDetails(page);

            this.logger.debug('Identité du contact vérifiée avec succès');
            return new SendMessageResponse(true, '');

        } catch (error) {
            this.logger.error('Erreur lors de la vérification de l\'identité:', error);

            // Essayer de fermer les détails même en cas d'erreur
            try {
                await this.closeContactDetails(page);
            } catch (closeError) {
                this.logger.warn('Impossible de fermer les détails après erreur');
            }

            return new SendMessageResponse(false, problem.check_select_detail_contact);
        }
    }

    private async getContactPhoneNumber(page: Page): Promise<string> {
        try {
            this.logger.debug('=== Recherche du numéro de téléphone ===');

            let phoneNumber: string = '';

            // Méthode 1: Si pas trouvé en business, essayer utilisateur normal

            try {
                this.logger.debug('Tentative sélecteur utilisateur normal...');
                const phoneElement = await findElementWithFallback(page, 'spanUserNumber', timeouts.fast);
                const phoneText = await phoneElement.innerText();
                this.logger.debug(`Texte trouvé (utilisateur normal): "${phoneText}"`);

                if (phoneText && phoneText.startsWith('+') && /^\+\d{10,15}$/.test(phoneText.replace(/\s+/g, ''))) {
                    phoneNumber = phoneText.replace(/\s+/g, '');
                    this.logger.debug(`✅ Numéro utilisateur normal trouvé: ${phoneNumber}`);
                } else {
                    this.logger.debug(`❌ Texte utilisateur normal ne correspond pas au format attendu: "${phoneText}"`);
                }
            } catch (error) {
                this.logger.debug('Sélecteur utilisateur normal échoué:', error.message);
            }


            // Méthode 2: Essayer d'abord les sélecteurs pour comptes business (plus spécifique)
            if (!phoneNumber) {
                try {
                    this.logger.debug('Tentative sélecteur business...');
                    const phoneElement = await findElementWithFallback(page, 'spanBusinessNumber', timeouts.fast);
                    const phoneText = await phoneElement.innerText();
                    this.logger.debug(`Texte trouvé (business): "${phoneText}"`);

                    if (phoneText && phoneText.startsWith('+') && /^\+\d{10,15}$/.test(phoneText.replace(/\s+/g, ''))) {
                        phoneNumber = phoneText.replace(/\s+/g, '');
                        this.logger.debug(`✅ Numéro business trouvé: ${phoneNumber}`);
                    } else {
                        this.logger.debug(`❌ Texte business ne correspond pas au format attendu: "${phoneText}"`);
                    }
                } catch (error) {
                    this.logger.debug('Sélecteur business échoué:', error.message);
                }
            }

            // Méthode 3: Recherche générale avec has-text
            if (!phoneNumber) {
                try {
                    this.logger.debug('Tentative recherche générale...');
                    const phoneElements = await page.$$('span:has-text(/^\\+\\d+/), div:has-text(/^\\+\\d+/)');

                    for (const element of phoneElements) {
                        const text = await element.innerText();
                        this.logger.debug(`Élément analysé: "${text}"`);

                        if (text && text.startsWith('+') && /^\+\d{10,15}$/.test(text.replace(/\s+/g, ''))) {
                            phoneNumber = text.replace(/\s+/g, '');
                            this.logger.debug(`Numéro trouvé par recherche générale: ${phoneNumber}`);
                            break;
                        }
                    }
                } catch (error) {
                    this.logger.debug('Recherche générale échouée:', error.message);
                }
            }

            // Méthode 4: Recherche dans tous les spans avec classes spécifiques
            if (!phoneNumber) {
                try {
                    this.logger.debug('Tentative recherche dans spans spécifiques...');
                    const spanElements = await page.$$('span._ao3e, span.selectable-text, span[dir="auto"]');

                    for (const element of spanElements) {
                        const text = await element.innerText();

                        if (text && text.startsWith('+') && /^\+\d{10,15}$/.test(text.replace(/\s+/g, ''))) {
                            phoneNumber = text.replace(/\s+/g, '');
                            this.logger.debug(`Numéro trouvé dans span spécifique: ${phoneNumber}`);
                            break;
                        }
                    }
                } catch (error) {
                    this.logger.debug('Recherche spans spécifiques échouée:', error.message);
                }
            }

            // Méthode 5: Recherche par évaluation JavaScript directe
            if (!phoneNumber) {
                try {
                    this.logger.debug('Tentative recherche par évaluation JS...');
                    phoneNumber = await page.evaluate(() => {
                        const phoneRegex = /^\+\d{10,15}$/;

                        // Rechercher dans tous les éléments de texte
                        const allElements = document.querySelectorAll('*');

                        for (const element of allElements) {
                            const text = element.textContent?.trim();
                            if (text && text.startsWith('+') && phoneRegex.test(text.replace(/\s+/g, ''))) {
                                return text.replace(/\s+/g, '');
                            }
                        }
                        return '';
                    });

                    if (phoneNumber) {
                        this.logger.debug(`Numéro trouvé par évaluation JS: ${phoneNumber}`);
                    }
                } catch (error) {
                    this.logger.debug('Évaluation JS échouée:', error.message);
                }
            }

            if (!phoneNumber) {
                // Debug: afficher tous les éléments dans la zone des détails
                //await this.debugContactDetailsElements(page);
                throw new Error('Numéro de téléphone non trouvé avec toutes les méthodes');
            }

            // Normaliser le numéro (supprimer le + initial pour la comparaison)
            const normalizedNumber = phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;

            this.logger.debug(`Numéro final trouvé: ${phoneNumber} (normalisé: ${normalizedNumber})`);
            return normalizedNumber;

        } catch (error) {
            this.logger.error('Erreur lors de la récupération du numéro:', error);
            throw new Error(`Impossible de récupérer le numéro: ${error.message}`);
        }
    }

    // Méthode de debug pour analyser tous les éléments
    private async debugContactDetailsElements(page: Page): Promise<void> {
        try {
            this.logger.debug('=== DEBUG: Analyse complète des éléments ===');

            const allElementsInfo = await page.evaluate(() => {
                const results: any[] = [];
                const allElements = document.querySelectorAll('*');

                allElements.forEach((element, index) => {
                    const text = element.textContent?.trim();
                    if (text && (text.includes('+') || /\d{8,}/.test(text))) {
                        results.push({
                            index,
                            tag: element.tagName,
                            text: text.substring(0, 100), // Limiter la longueur
                            className: element.className,
                            id: element.id,
                            hasPhonePattern: /\+\d{10,15}/.test(text.replace(/\s+/g, ''))
                        });
                    }
                });

                return results;
            });

            this.logger.debug('Éléments avec numéros potentiels:', JSON.stringify(allElementsInfo, null, 2));

        } catch (error) {
            this.logger.debug('Erreur lors du debug des éléments:', error);
        }
    }

    private async closeContactDetails(page: Page): Promise<void> {
        try {
            // Essayer d'abord avec le sélecteur localisé
            const closeButton = await findElementWithFallback(page, 'closeDetailsButton', timeouts.normal);

            await closeButton.click();
            //await sleep(timeouts.normal);
        } catch (error) {
            throw new Error(`Impossible de fermer les détails: ${error.message}`);
        }
    }

    private async sendMessageReally(
        page: Page,
        message: string,
        attachment?: string
    ): Promise<SendMessageResponse> {
        try {
            // Saisir le message
            const messageZone = await findElementWithFallback(page, 'messageZone', timeouts.normal);
            await messageZone.fill(message);
            await sleep(timeouts.fast);

            if (attachment) {
                return await this.sendWithAttachment(page, attachment);
            } else {
                return await this.sendWithoutAttachment(page);
            }
        } catch (error) {
            this.logger.error('Erreur lors de l\'envoi du message:', error);
            return new SendMessageResponse(false, problem.select_zone_message);
        }
    }

    private async sendWithAttachment(page: Page, attachment: string): Promise<SendMessageResponse> {
        try {
            this.logger.debug('=== ENVOI AVEC ATTACHMENT ===');
            this.logger.debug(`Fichier à envoyer: ${attachment}`);

            // Vérification que le fichier existe
            const absolutePath = path.resolve(attachment);
            if (!existsSync(absolutePath)) {
                this.logger.error('❌ Le fichier n\'existe pas :', absolutePath);
                return new SendMessageResponse(false, 'Fichier non trouvé');
            }

            // Cliquer sur le bouton d'attachement
            const attachButton = await findElementWithFallback(page, 'attachButton', timeouts.normal);
            await attachButton.click();
            this.logger.debug('✅ Bouton attach cliqué');

            // Attendre que le menu s'ouvre complètement
            await sleep(timeouts.normal);

            // Recherche de l'input file (même caché)
            this.logger.debug('🔍 Recherche de l\'input file (incluant les éléments cachés)...');

            let fileInput;
            try {
                fileInput = await findHiddenFileInput(page, timeouts.normal);
                this.logger.debug('✅ Input file trouvé avec la fonction spécialisée');
            } catch (error) {
                this.logger.debug('❌ Fonction spécialisée échouée, tentative avec sélecteurs configurés...');

                try {
                    fileInput = await findElementWithFallback(page, 'fileInput', timeouts.normal, true);
                    this.logger.debug('✅ Input file trouvé avec sélecteurs configurés (cachés inclus)');
                } catch (error2) {
                    this.logger.error('❌ Toutes les méthodes de recherche ont échoué');

                    // Debug final : lister tous les inputs
                    const allInputs = await page.$$eval('input', inputs => {
                        return inputs.map((input, i) => ({
                            index: i,
                            type: input.type,
                            accept: input.accept,
                            style: input.style.cssText,
                            className: input.className,
                            display: window.getComputedStyle(input).display
                        }));
                    });

                    this.logger.debug('Tous les inputs sur la page:', JSON.stringify(allInputs, null, 2));

                    return new SendMessageResponse(false, 'Input file non trouvé');
                }
            }

            // Log du champ accept
            const acceptAttr = await fileInput.getAttribute('accept');
            this.logger.debug(`📋 Attribut "accept" de l'input : ${acceptAttr}`);

            // Sélection du fichier
            this.logger.debug('📎 Sélection du fichier...');
            await fileInput.setInputFiles(absolutePath);
            await sleep(5000); // Attente pour laisser WhatsApp générer la preview, On devrait pouvoir ameliorer
            this.logger.debug('✅ Fichier sélectionné');

            // Cliquer sur le bouton d’envoi (icône en bas à droite du média)
            this.logger.debug('🚀 Recherche du bouton d\'envoi...');
            const sendButton = await findElementWithFallback(page, 'sendButtonWithImage', timeouts.normal);
            await sendButton.click();
            this.logger.debug('✅ Bouton d\'envoi cliqué');

            // Attente de confirmation d’envoi
            await this.waitForMessageSent(page);

            this.logger.debug('🎉 Message avec pièce jointe envoyé avec succès');
            return new SendMessageResponse(true, '');

        } catch (error) {
            this.logger.error('💥 Erreur lors de l\'envoi avec pièce jointe:', error);
            return new SendMessageResponse(false, `Erreur envoi attachment: ${error.message}`);
        }
    }

    private async sendWithoutAttachment(page: Page): Promise<SendMessageResponse> {
        try {
            const sendButton = await findElementWithFallback(page, 'sendButtonWithoutImage', timeouts.normal);
            await sendButton.click();

            // Attendre la confirmation d'envoi
            await this.waitForMessageSent(page);

            this.logger.debug('Message sans pièce jointe envoyé');
            return new SendMessageResponse(true, '');
        } catch (error) {
            this.logger.error('Erreur lors de l\'envoi sans pièce jointe:', error);
            return new SendMessageResponse(false, problem.select_button_send);
        }
    }

    private async waitForMessageSent(page: Page): Promise<void> {
        try {
            // Attendre que le message soit marqué comme envoyé
            await page.waitForSelector(selectors.messageStatus.sent, {
                timeout: timeouts.network
            });
            this.logger.debug('Message confirmé comme envoyé');
        } catch (error) {
            this.logger.warn('Impossible de confirmer l\'envoi du message');
        }
    }

    private parseStyleAttribute(styleAttribute: string): Record<string, string> {
        return Object.fromEntries(
            styleAttribute
                .split(';')
                .filter(item => item.trim())
                .map(item => {
                    const [key, value] = item.split(':').map(str => str.trim());
                    return [key, value];
                })
        );
    }

    private async waitChangeInterface(page: Page, selector: string, timeout: number) {
        await Promise.race([
            page.waitForSelector(selector, {
                timeout: timeouts.normal,
                state: 'visible'
            }),
            sleep(timeouts.fast) // Fallback après timeout réduit
        ]);
    }
}