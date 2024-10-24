/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { useFunction } from '../../shared/function.util';
import { useVariable } from '../../shared/channel.config';
import * as readline from 'readline';
import { Page, BrowserContext, chromium } from 'playwright';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { ChannelService, SendMessageResponse } from './channel.service';
import { Contact } from '../../contact/entities/contact.entity';


const BROWSER_SELECT = chromium;

const { sleep } = useFunction();
const { message_info, myTime, whatsappUrl, balise_replace, problem } = useVariable();

@Injectable()
export class WhatsappChannelService implements ChannelService {
  public actionBeforeSendAllMessage = async (
    page: Page
  
  ): Promise<SendMessageResponse> => {
    return new SendMessageResponse(true, '');
  }
  public sendMessage = async (
    page: Page,
    contact: Contact,
    message: string,
    attachment?: string,
  ): Promise<SendMessageResponse> => {

    let success = false;
    try {
      await page
        .locator('div._aigv._aigw button._ah_y')
        .click({ timeout: myTime.TIME_OUT }); //annuler la recherche
    } catch (e) {
      
    }
    await sleep(myTime.TIME_WAIT_ACTION);
    try {
      // ecriture du numero dans la bar de recherche de contact
      await page
        .locator('div._aigv._aigw p.selectable-text.copyable-text.x15bjb6t.x1n2onr6')
        .first()
        .fill(contact.phoneNumber, { timeout: myTime.TIME_OUT });
    } catch (e) {
      //logger.error(contact,problem.search_contact);
      return new SendMessageResponse(false, problem.search_contact);
    }
    await sleep(myTime.TIME_WAIT_ACTION);

    //clique sur le contact trouvé
    try {
      const zone_contacts = await page.$$('#pane-side > div:nth-child(1) > div > div > div.x10l6tqk')
        
      for (let zone_contact of zone_contacts) {
        const transformValue = await zone_contact.evaluate(el => window.getComputedStyle(el).transform);
        // Vérifier si la transformation est 'translateY(72px)'
        if (transformValue.startsWith('matrix')) {
          // Extraire la dernière valeur de la matrice, qui est la translation Y
          const matrixValues = transformValue.match(/matrix\((.*)\)/)[1].split(', ');
          const translateY = parseFloat(matrixValues[5]); // 5ème valeur est la translation Y

          // Vérifier si la translation Y est de 72 pixels
          if (translateY === 72) {
            await zone_contact.click({ timeout: myTime.TIME_OUT });
          }
        }
      }
      
    } catch (e) {
      //logger.error(contact, problem.select_contact);
      return new SendMessageResponse(false, problem.select_contact);
    }
    await sleep(myTime.TIME_WAIT_ACTION);
    //Vérification de la personne à qui ont envoie le message

    //clique sur le header pour avoir les information de l'utilisateur
    try {
      await page
        .locator('#main header._amid')
        .click({ timeout: myTime.TIME_OUT });
    } catch (e) {
      //logger.error(contact, problem.check_select_detail_contact);
      return new SendMessageResponse(false, problem.check_select_detail_contact);
    }

    await sleep(myTime.TIME_WAIT_ACTION);
    try {
      //recupération du numero de telephone de l'utilisateur et test avec le numero courant
      let spanLocator;
      try {
        spanLocator = await page.waitForSelector(
          'div._aigv._aig-  span.x1jchvi3.x1fcty0u.x40yjcy',
          { timeout: myTime.TIME_OUT },
        );
      } catch (e) {
      }

      //Pour gérer le cas des comptes professionnels
      if (!spanLocator) {
        spanLocator = await page.waitForSelector(
          'div._aigv._aig-  span._ao3e > span.x1lkfr7t.xdbd6k5.x1fcty0u.xw2npq5',
          { timeout: myTime.TIME_OUT },
        );
      }
      const span = await spanLocator.innerText();

      //on recupère le numero en enlevant le + et les espaces
      const numberChecked = span ? span.slice(1).replace(/\s/g, '') : '';

      if (contact.phoneNumber.trim() !== numberChecked) {
        //logger.error(contact, problem.check_detail_contact);
        return new SendMessageResponse(false, problem.check_detail_contact);
      }
    } catch (e) {
      //logger.error(contact, problem.check_select_detail_contact_get);
      return new SendMessageResponse(false, problem.check_select_detail_contact_get);
    }

    await sleep(myTime.TIME_WAIT_ACTION);
    //On ferme la fenetre d'information detaillé
    try {
      await page
        .locator('div._aigv._aig- header.x9f619 div.x1okw0bk.x16dsc37')
        .click({ timeout: myTime.TIME_OUT });
    } catch (e) {
      return new SendMessageResponse(false, e.message);
    }

    //selection de la zone de message
    try {
      const zone_message = await page.waitForSelector(
        '#main > footer  p.selectable-text.copyable-text.x15bjb6t.x1n2onr6',
      );
      zone_message.fill(message);
    } catch (e) {
      //logger.error(contact, problem.select_zone_message);
      return new SendMessageResponse(false, problem.select_zone_message);
    }
    console.log('attachment = ', attachment)
    if (attachment != undefined) {
      await sleep(myTime.TIME_WAIT_ACTION);

      try {
        // Sélectionner le bouton pour joindre un fichier
        await page
          .locator(
            '#main > footer div._ak1q div._ajv7 > div._ajv6',
          )
          .first()
          .click({ timeout: myTime.TIME_OUT });
      } catch (e) {
        //logger.error(contact, problem.select_button_attach);
        return new SendMessageResponse(false, problem.select_button_attach);
      }

      await sleep(myTime.TIME_WAIT_ACTION);

      try {
        // Chargement de l'image
        await page
          .locator(
            '#main > footer div._ak4w div.xyqdw3p > div:nth-child(2) input[type=file]',
          )
          .setInputFiles(attachment);
      } catch (e) {
        //logger.error(contact, problem.load_image);
        return new SendMessageResponse(false, problem.load_image);
      }
      await sleep(myTime.TIME_WAIT_ACTION);
      //clic sur le bouton envoyer avec image
      try {
        await page
                  .locator(
                    'div._aigv._aigz div.x1247r65 > div',
                  )
                  .first()
                  .click({ timeout: myTime.TIME_OUT });
        success = true;
      } catch (e) {
        //logger.error(contact, problem.select_button_send);
        return new SendMessageResponse(false, problem.select_button_send);
      }
    } else {
      await sleep(myTime.TIME_WAIT_ACTION);
      try {
        await page
                  .locator(
                    '#main > footer button.x1c4vz4f.x2lah0s',
                  )
                  .first()
                  .click({ timeout: myTime.TIME_OUT });
        success = true;
      } catch (e) {
        //logger.error(contact, problem.select_button_send);
        return new SendMessageResponse(false, problem.select_button_send);
      }
    }
    await sleep(myTime.TIME_WAIT_ACTION);

    //logger.info(contact, success ? message_info.send : message_info.send_failed);
    return new SendMessageResponse(success, '');
  };
}
