/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { useFunction } from '../../shared/function.util';
import { useVariable } from '../../shared/channel.config';
import { ChannelService, SendMessageResponse } from './channel.service';
import { Page } from 'playwright';
import { Contact } from '../../contact/entities/contact.entity';
import { selectors } from './config/instagram.selectors';

const { sleep } = useFunction();
const { myTime, problem } = useVariable();

@Injectable()
export class InstagramChannelService implements ChannelService {
  public actionBeforeSendAllMessage = async (
    page: Page,
  ): Promise<SendMessageResponse> => {
    try {
      await page
        .locator(selectors.messageIcon)
        .click({ timeout: myTime.TIME_OUT }); // Appuyer sur l'icon de message
    } catch (e) {
      return new SendMessageResponse(false, problem.select_button_sms);
    }
    return new SendMessageResponse(true, '');
  };

  public sendMessage = async (
    page: Page,
    contact: Contact,
    message: string,
    attachment?: string,
  ): Promise<SendMessageResponse> => {
    let success = false;

    try {
      await page
        .locator(selectors.messageIconAgain)
        .click({ timeout: myTime.TIME_OUT }); // Appuyer sur l'icon de message
    } catch (e) {
      return new SendMessageResponse(false, problem.select_button_sms);
    }

    await sleep(myTime.TIME_WAIT_ACTION);

    try {
      await page
        .locator(selectors.newMessageButton)
        .click({ timeout: myTime.TIME_OUT }); // Ouvrir le dialog pour un nouveau message
    } catch (e) {
      return new SendMessageResponse(false, problem.select_button_sms_new);
    }

    try {
      await page
        .locator(selectors.searchFieldInDialog)
        .first()
        .fill(contact.idInsta, { timeout: myTime.TIME_OUT }); // Remplir le champ de recherche
    } catch (e) {
      return new SendMessageResponse(false, problem.search_contact);
    }

    await sleep(myTime.TIME_WAIT_ACTION);

    try {
      await page
        .locator(selectors.foundContact)
        .first()
        .click({ timeout: myTime.TIME_OUT }); // Sélectionner le contact trouvé
    } catch (e) {
      return new SendMessageResponse(false, problem.select_contact);
    }

    await sleep(myTime.TIME_WAIT_ACTION);

    try {
      await page
        .locator(selectors.chatButton)
        .first()
        .click({ timeout: myTime.TIME_OUT }); // Cliquer sur le bouton de chat
    } catch (e) {
      return new SendMessageResponse(
        false,
        problem.check_select_button_discussion,
      );
    }

    await sleep(myTime.TIME_WAIT_ACTION);

    try {
      const messageZone = await page.waitForSelector(selectors.messageZone);
      await messageZone.fill(message); // Remplir la zone de message
    } catch (e) {
      return new SendMessageResponse(false, problem.select_zone_message);
    }

    if (attachment != undefined) {
      await sleep(myTime.TIME_WAIT_ACTION);

      try {
        await page.locator(selectors.attachButton).setInputFiles(attachment); // Charger le fichier
      } catch (e) {
        return new SendMessageResponse(false, problem.load_image);
      }

      await sleep(myTime.TIME_WAIT_ACTION);

      try {
        await page
          .locator(selectors.sendButtonWithImage)
          .first()
          .click({ timeout: myTime.TIME_OUT }); // Envoyer avec image
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
          .click({ timeout: myTime.TIME_OUT }); // Envoyer sans image
        success = true;
      } catch (e) {
        return new SendMessageResponse(false, problem.select_button_send);
      }
    }

    await sleep(myTime.TIME_WAIT_ACTION);
    return new SendMessageResponse(success, '');
  };
}
