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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const BROWSER_SELECT = chromium;

const { sleep } = useFunction();
const { message_info, myTime, whatsappUrl, balise_replace, problem } = useVariable();

@Injectable()
export class WhatsappChannelService implements ChannelService {
  public sendMessage = async (
    page: Page,
    contact: Contact,
    message: string,
    attachment?: string,
  ): Promise<SendMessageResponse> => {
    let success = false;
    try {
      await page
        .locator('div#side button.-Jnba')
        .click({ timeout: myTime.TIME_OUT }); //annuler la recherche
    } catch (e) {}
    await sleep(myTime.TIME_WAIT_ACTION);
    try {
      // ecriture du numero dans la bar de recherche de contact
      await page
        .locator('div#side p.selectable-text.copyable-text.iq0m558w.g0rxnol2')
        .first()
        .fill(contact.phoneNumber, { timeout: myTime.TIME_OUT });
    } catch (e) {
      //logger.error(contact,problem.search_contact);
      return new SendMessageResponse(false, problem.search_contact);
    }
    await sleep(myTime.TIME_WAIT_ACTION);

    //clique sur le contact trouvé
    try {
      const zone_contact = await page
        .locator('div#pane-side div._21S-L div.Mk0Bp')
        .locator('../../../../..');
      await zone_contact.first().click({ timeout: myTime.TIME_OUT });
    } catch (e) {
      //logger.error(contact, problem.select_contact);
      return new SendMessageResponse(false, problem.select_contact);
    }
    await sleep(myTime.TIME_WAIT_ACTION);
    //Vérification de la personne à qui ont envoie le message

    //clique sur le header pour avoir les information de l'utilisateur
    try {
      await page
        .locator('#main header.AmmtE')
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
          'div._2Ts6i._1xFRo  span.enbbiyaj.e1gr2w1z.hp667wtd',
          { timeout: myTime.TIME_OUT },
        );
      } catch (e) {
        return new SendMessageResponse(false, e.message);
      }

      //Pour gérer le cas des comptes professionnels
      if (!spanLocator) {
        spanLocator = await page.waitForSelector(
          'div._2Ts6i._1xFRo  span._11JPr > span.fe5nidar.fs7pz031.tl2vja3b.e1gr2w1z',
          { timeout: myTime.TIME_OUT },
        );
      }
      const span = await spanLocator.innerText();

      //on recupère le numero en enlevant le + et les espaces
      const numberChecked = span ? span.slice(1).replace(/\s/g, '') : '';

      if (contact.phoneNumber !== numberChecked) {
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
        .locator('div._2Ts6i._1xFRo header.cm280p3y div.kk3akd72.svlsagor')
        .click({ timeout: myTime.TIME_OUT });
    } catch (e) {
      return new SendMessageResponse(false, e.message);
    }

    //selection de la zone de message
    try {
      const zone_message = await page.waitForSelector(
        '#main > footer > div._2lSWV._3cjY2.copyable-area > div > span:nth-child(2) > div > div._1VZX7 > div._3Uu1_ > div > div.to2l77zo.gfz4du6o.ag5g9lrv.bze30y65.kao4egtt > p',
      );
      zone_message.fill(message);
    } catch (e) {
      //logger.error(contact, problem.select_zone_message);
      return new SendMessageResponse(false, problem.select_zone_message);
    }
    if (attachment != undefined) {
      await sleep(myTime.TIME_WAIT_ACTION);

      try {
        // Sélectionner le bouton pour joindre un fichier
        await page
          .locator(
            '#main > footer > div._2lSWV._3cjY2.copyable-area > div > span:nth-child(2) > div > div._2xy_p._1bAtO > div._1OT67 > div > div > div',
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
            '#main > footer > div._2lSWV._3cjY2.copyable-area > div > span:nth-child(2) > div > div._2xy_p._1bAtO > div._1OT67 > div > span > div > ul > div > div:nth-child(2) input[type=file]',
          )
          .setInputFiles(attachment);
      } catch (e) {
        //logger.error(contact, problem.load_image);
        return new SendMessageResponse(false, problem.load_image);
      }
      await sleep(myTime.TIME_WAIT_ACTION);
      //clic sur le bouton envoyer avec image
      try {
        /*await page
                  .locator(
                    '#app > div > div.two._1jJ70 > div._2QgSC > div._2Ts6i._2xAQV > span > div > span > div > div > div.g0rxnol2.thghmljt.p357zi0d.rjo8vgbg.ggj6brxn.f8m0rgwh.gfz4du6o.r7fjleex.bs7a17vp > div > div.O2_ew > div._3wFFT > div',
                  )
                  .first()
                  .click({ timeout: myTime.TIME_OUT });*/
        success = true;
      } catch (e) {
        //logger.error(contact, problem.select_button_send);
        return new SendMessageResponse(false, problem.select_button_send);
      }
    } else {
      await sleep(myTime.TIME_WAIT_ACTION);
      try {
        /*await page
                  .locator(
                    'button.tvf2evcx.oq44ahr5.lb5m6g5c.svlsagor.p2rjqpw5.epia9gcq',
                  )
                  .first()
                  .click({ timeout: myTime.TIME_OUT });*/
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
