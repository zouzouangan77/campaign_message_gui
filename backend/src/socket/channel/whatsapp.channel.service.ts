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
    timeouts,
} from './config/whatsapp.selectors';

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

        try {
            // Étape 1: Vérifier que WhatsApp est chargé
            //await this.waitForWhatsAppToLoad(page);

            // Étape 2: Préparation
            await this.cancelSearch(page);
            await sleep(myTime.TIME_WAIT_ACTION);

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
            const sendResult = await this.sendMessageWithAttachment(page, message, attachment);
            if (sendResult.statut) {
                this.logger.log(`Message envoyé avec succès vers ${contact.phoneNumber}`);
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
            await sleep(timeouts.slow);

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
            const headerInfo = await findElementWithFallback(page, 'headerInfo', timeouts.normal);
            await headerInfo.click();
            await sleep(timeouts.normal);

            // Récupérer le numéro de téléphone
            const phoneNumber = await this.getContactPhoneNumber(page);

            // Vérifier la correspondance
            const normalizedContactNumber = contact.phoneNumber.trim();
            if (normalizedContactNumber !== phoneNumber) {
                this.logger.warn(`Numéro ne correspond pas: attendu ${normalizedContactNumber}, trouvé ${phoneNumber}`);
                return new SendMessageResponse(false, problem.check_detail_contact);
            }

            // Fermer les détails
            await this.closeContactDetails(page);

            this.logger.debug('Identité du contact vérifiée');
            return new SendMessageResponse(true, '');
        } catch (error) {
            this.logger.error('Erreur lors de la vérification de l\'identité:', error);
            return new SendMessageResponse(false, problem.check_select_detail_contact);
        }
    }

    private async getContactPhoneNumber(page: Page): Promise<string> {
        try {
            let phoneElement;

            // Essayer d'abord les sélecteurs pour utilisateurs normaux
            try {
                phoneElement = await findElementWithFallback(page, 'spanBusinessNumber', timeouts.normal);
            } catch {
                // Si pas trouvé, essayer les sélecteurs pour comptes business
                phoneElement = await findElementWithFallback(page, 'spanUserNumber', timeouts.normal);
            }

            if (!phoneElement) {
                throw new Error('Numéro de téléphone non trouvé');
            }

            const phoneText = await phoneElement.innerText();
            return phoneText ? phoneText.slice(1).replace(/\s/g, '') : '';
        } catch (error) {
            throw new Error(`Impossible de récupérer le numéro: ${error.message}`);
        }
    }

    private async closeContactDetails(page: Page): Promise<void> {
        try {
            // Essayer d'abord avec le sélecteur localisé
            const closeButton = await findElementWithFallback(page, 'closeDetailsButton', timeouts.normal);

            await closeButton.click();
            await sleep(timeouts.normal);
        } catch (error) {
            throw new Error(`Impossible de fermer les détails: ${error.message}`);
        }
    }

    private async sendMessageWithAttachment(
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
            // Cliquer sur le bouton d'attachement
            const attachButton = await findElementWithFallback(page, 'attachButton', timeouts.normal);
            await attachButton.click();
            await sleep(timeouts.normal);

            // Sélectionner le fichier
            const fileInput = await findElementWithFallback(page, 'fileInput', timeouts.normal);
            await fileInput.setInputFiles(attachment);
            await sleep(timeouts.normal);

            // Envoyer
            const sendButton = await findElementWithFallback(page, 'sendButtonWithImage', timeouts.normal);
            await sendButton.click();

            // Attendre la confirmation d'envoi
            await this.waitForMessageSent(page);

            this.logger.debug('Message avec pièce jointe envoyé');
            return new SendMessageResponse(true, '');
        } catch (error) {
            this.logger.error('Erreur lors de l\'envoi avec pièce jointe:', error);
            return new SendMessageResponse(false, problem.select_button_send);
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
}