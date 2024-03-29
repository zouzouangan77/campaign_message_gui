/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { useFunction } from '../../shared/function.util';
import { useVariable } from '../../shared/channel.config';
import * as readline from 'readline';
import { Page, BrowserContext, chromium } from 'playwright';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { ChannelService } from './channel.service';
import { Contact } from '../../contact/entities/contact.entity';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const BROWSER_SELECT = chromium;

const { sleep } = useFunction();
const { message_info, myTime, whatsappUrl, balise_replace } = useVariable();

@Injectable()
export class WhatsappChannelService implements ChannelService {
  public sendMessage = async (
    page: Page,
    contact: Contact,
    message: string,
    attachment?: string,
  ): Promise<boolean> => {
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
      return;
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
      return;
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
      return;
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
      } catch (e) {}

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
        return;
      }
    } catch (e) {
      //logger.error(contact, problem.check_select_detail_contact_get);
      return;
    }

    await sleep(myTime.TIME_WAIT_ACTION);
    //On ferme la fenetre d'information detaillé
    try {
      await page
        .locator('div._2Ts6i._1xFRo header.cm280p3y div.kk3akd72.svlsagor')
        .click({ timeout: myTime.TIME_OUT });
    } catch (e) {}

    //selection de la zone de message
    try {
      const zone_message = await page.waitForSelector(
        '#main > footer > div._2lSWV._3cjY2.copyable-area > div > span:nth-child(2) > div > div._1VZX7 > div._3Uu1_ > div > div.to2l77zo.gfz4du6o.ag5g9lrv.bze30y65.kao4egtt > p',
      );
      zone_message.fill(message);
    } catch (e) {
      //logger.error(contact, problem.select_zone_message);
      return;
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
        return;
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
        return;
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
        return;
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
        return;
      }
    }
    await sleep(myTime.TIME_WAIT_ACTION);

    //logger.info(contact, success ? message_info.send : message_info.send_failed);
    return success;
  };

 /* public
  sendAllMessage = async (your_message, list_contact, image): Promise<void> => {
    const browser = await BROWSER_SELECT.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(whatsappUrl);
    await this.askUser(message_info.prompt_before_start);
    await sleep(myTime.TIME_WHATS_APP_LOADING);

    try {
      const message = fs.readFileSync(your_message, 'utf8');

      const contacts = [];
      const contactsNotSent = [];

      fs.createReadStream(list_contact)
        .pipe(csvParser({ separator: ';', skipLines: 1 }))
        .on('data', (row) => {
          contacts.push(row);
        })
        .on('end', async () => {
          let messagesSentFailedCount = 0;
          let messagesSentSuccedCount = 0;
          let messagesSentAllCount = 0;

          do {
            const contact = contacts.shift();
            const prenom = contact[0];
            const phone = contact[1];

            const messageTransformed = message.replace(
              new RegExp(balise_replace.PRENOM, 'g'),
              prenom,
            );
            const success = await this.sendMessage(
              phone,
              messageTransformed,
              image,
              page,
            );

            if (!success) {
              messagesSentFailedCount++;
              contactsNotSent.push(contact);
            }
            messagesSentSuccedCount++;
          } while (contacts.length > 0);

          messagesSentAllCount =
            messagesSentFailedCount + messagesSentSuccedCount;

          if (messagesSentFailedCount > 0) {
            const answer = await this.askUser(message_info.question);
            if (answer.toLowerCase() === 'oui') {
              for (const contact of contactsNotSent) {
                const prenom = contact[0];
                const phone = contact[1];
                const messageTransformed = message.replace(
                  new RegExp(balise_replace.PRENOM, 'g'),
                  prenom,
                );
                await this.sendMessage(phone, messageTransformed, image, page);
                await sleep(myTime.TIME_WAIT_ACTION);
              }
            }
          }

          rl.close();
          await sleep(myTime.TIME_WAIT_END_ACTION);
          await context.close();
          await browser.close();
        });
    } catch (err) {
      //logger.error(err);
    }
  };

  public askUser = (question: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(question, (answer: string) => {
        resolve(answer);
      });
    });
  };*/
}
