/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { useFunction } from '../../shared/function.util';
import { useVariable } from '../../shared/channel.config';
import { Page } from 'playwright';
import { ChannelService, SendMessageResponse } from './channel.service';
import { Contact } from '../../contact/entities/contact.entity';
import { selectors } from './config/whatsapp.selectors';

const { sleep } = useFunction();
const { message_info, myTime, problem } = useVariable();

@Injectable()
export class WhatsappChannelService implements ChannelService {
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
    console.log('try to send ', contact.phoneNumber);
    let success = false;
    let lastActionTime = 0;

    const cancelSearch = async () => {
      const currentTime = Date.now();
      if (currentTime - lastActionTime < 1000) {
        return; // ignore if less than 1 second since last action
      }
      lastActionTime = currentTime;

      try {
        const cancelButton = await page.locator(selectors.cancelButton);

        if (await cancelButton.isVisible()) {
          await cancelButton.click({ timeout: myTime.TIME_OUT });
        }
      } catch (e) {
        // Logique si l'annulation n'était pas nécessaire
      }
    };

    await cancelSearch();

    await sleep(myTime.TIME_WAIT_ACTION);

    // Tentative d'annulation de la recherche en cliquant sur un bouton
    //await cancelSearch();
    await sleep(myTime.TIME_WAIT_ACTION);

    // Saisie du numéro de téléphone dans la barre de recherche de contact
    try {
      const searchField = await page.locator(selectors.searchField).first();
      await searchField.fill('', { timeout: myTime.TIME_OUT });
      await searchField.fill(contact.phoneNumber, {
        timeout: myTime.TIME_OUT,
      });
    } catch (e) {
      return new SendMessageResponse(false, problem.search_contact);
    }

    await sleep(5000);

    // Clique sur le contact trouvé
    try {
      const zoneContacts = await page.$$(selectors.zoneContacts);
      for (const zoneContact of zoneContacts) {
        const styleAttribute = await zoneContact.getAttribute('style');

        const styleMap = Object.fromEntries(
          styleAttribute
            .split('; ')
            .filter((item) => item)
            .map((item) => item.split(': ').map((str) => str.trim())),
        );

        if (styleMap['transform'] == 'translateY(72px);') {
          await zoneContact.click({ timeout: myTime.TIME_OUT });
        }
      }
    } catch (e) {
      return new SendMessageResponse(false, problem.select_contact);
    }

    await sleep(myTime.TIME_WAIT_ACTION);

    // Vérification de la personne à qui on envoie le message en cliquant sur le header pour obtenir les infos
    try {
      await page
        .locator(selectors.headerInfo)
        .click({ timeout: myTime.TIME_OUT });
    } catch (e) {
      return new SendMessageResponse(
        false,
        problem.check_select_detail_contact,
      );
    }
    console.log('Verification identité OK')

    await sleep(myTime.TIME_WAIT_ACTION);

    // Récupération du numéro de téléphone dans les détails du contact
    try {
      let spanLocator = await page.waitForSelector(selectors.spanUserNumber, {
        timeout: myTime.TIME_OUT,
      });
      if (!spanLocator) {
        spanLocator = await page.waitForSelector(selectors.spanBusinessNumber, {
          timeout: myTime.TIME_OUT,
        });
      }
      const span = await spanLocator.innerText();
      const numberChecked = span ? span.slice(1).replace(/\s/g, '') : '';
      if (contact.phoneNumber.trim() !== numberChecked) {
        return new SendMessageResponse(false, problem.check_detail_contact);
      }
    } catch (e) {
      return new SendMessageResponse(
        false,
        problem.check_select_detail_contact_get,
      );
    }

    await sleep(myTime.TIME_WAIT_ACTION);

    // Fermeture de la fenêtre d'information détaillée
    try {
      await page
        .locator(selectors.closeDetailsButton)
        .click({ timeout: myTime.TIME_OUT });

    } catch (e) {
      return new SendMessageResponse(false, e.message);
    }

    // Sélection de la zone de message
    try {
      const messageZone = await page.waitForSelector(selectors.messageZone);
      messageZone.fill(message);
    } catch (e) {
      return new SendMessageResponse(false, problem.select_zone_message);
    }

    // Si une pièce jointe est présente, gestion de l'envoi
    if (attachment != undefined) {
      await sleep(myTime.TIME_WAIT_ACTION);

      try {
        await page
          .locator(selectors.attachButton)
          .first()
          .click({ timeout: myTime.TIME_OUT });
      } catch (e) {
        return new SendMessageResponse(false, problem.select_button_attach);
      }

      await sleep(myTime.TIME_WAIT_ACTION);

      try {
        await page.locator(selectors.fileInput).setInputFiles(attachment);
      } catch (e) {
        return new SendMessageResponse(false, problem.load_image);
      }

      await sleep(myTime.TIME_WAIT_ACTION);

      try {
        await page
          .locator(selectors.sendButtonWithImage)
          .first()
          .click({ timeout: myTime.TIME_OUT });
        success = true;
      } catch (e) {
        return new SendMessageResponse(false, problem.select_button_send);
      }
    } else {
      await sleep(myTime.TIME_WAIT_ACTION);

      try {
        await page
          .locator(selectors.sendButtonWithoutImage)
          .first()
          .click({ timeout: myTime.TIME_OUT });
        success = true;
      } catch (e) {
        return new SendMessageResponse(false, problem.select_button_send);
      }
    }

    console.log('Sending OK')
    await sleep(myTime.TIME_WAIT_ACTION);
    return new SendMessageResponse(success, '');
  };
}
