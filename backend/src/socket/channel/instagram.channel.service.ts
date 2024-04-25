/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { useFunction } from '../../shared/function.util';
import { useVariable } from '../../shared/channel.config';
import {ChannelService, SendMessageResponse} from './channel.service';
import { Page } from 'playwright';
import { Contact } from '../../contact/entities/contact.entity';

const { sleep } = useFunction();
const { myTime, problem } = useVariable();

@Injectable()
export class InstagramChannelService implements ChannelService {
  public actionBeforeSendAllMessage = async (
    page: Page

  ): Promise<SendMessageResponse> => {

    try {
      await page.locator("div.x1iyjqo2.xh8yej3 div.xjp7ctv>div").click({ timeout: myTime.TIME_OUT }); //appuyer  sur l'icon de message
    } catch (e) {
      return new SendMessageResponse(false, problem.select_button_sms);
    }
    return new SendMessageResponse(true, '');
  }
  public sendMessage = async (
    page: Page,
    contact: Contact,
    message: string,
    attachment?: string,
  ): Promise<SendMessageResponse> => {

    let success = false;
    //appuyer  sur l'icon de message
    try {
      await page.locator("div.x1iyjqo2.xh8yej3 div.xjp7ctv div.x1n2onr6.x6s0dn4.x78zum5>a").click({ timeout: myTime.TIME_OUT }); //appuyer  sur l'icon de message
    } catch (e) {
      return new SendMessageResponse(false, problem.select_button_sms);
    }

    await sleep(myTime.TIME_WAIT_ACTION);
    //clicker sur le bouton nouveau message pour ouvrir le dialog
    try {
      await page.locator("section div.x78zum5.x13a6bvl.x1ye3gou>div.x78zum5>div.x1i10hfl.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x6s0dn4.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x1ypdohk.x78zum5.xl56j7k.x1y1aw1k.x1sxyh0.xwib8y2.xurb0ha.xcdnw81").click({ timeout: myTime.TIME_OUT }); //clicker sur le bouton nouveau message pour ouvrir le dialog
    } catch (e) {
      return new SendMessageResponse(false, problem.select_button_sms_new);
    }

    try {
      // ecriture du speudo dans la bar de recherche du dialog
      await page
      .locator("div[role='dialog'] input")
      .first()
      .fill(contact.idInsta, { timeout: myTime.TIME_OUT });
    } catch (e) {
      return new SendMessageResponse(false, problem.search_contact);
    }

    await sleep(myTime.TIME_WAIT_ACTION);

    //clique sur le contact trouvé
    try {
       const zone_speudo = await page
        .locator("div[role='dialog'] div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.x2lah0s.x1qughib.x6s0dn4.xozqiw3.x1q0g3np")
        await zone_speudo.first().click({ timeout: myTime.TIME_OUT });
    } catch (e) {
      return new SendMessageResponse(false, problem.select_contact);
    }

    await sleep(myTime.TIME_WAIT_ACTION);

    //clique sur le bouton chat/discussion
    try {
      const zone_speudo = await page
      .locator("div[role='dialog'] div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.xw7yly9.xktsk01.x1yztbdb.x1d52u69.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1> div")
      await zone_speudo.first().click({ timeout: myTime.TIME_OUT });
    } catch (e) {
      return new SendMessageResponse(false, problem.check_select_button_discussion);
    }

    await sleep(myTime.TIME_WAIT_ACTION);

    //selection de la zone de message
    try {
      const zone_message = await page.waitForSelector(
        'div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x1iyjqo2.x2lwn1j div.x6s0dn4.x78zum5.x1gg8mnh.x1pi30zi.xlu9dua p.xat24cr.xdj266r',
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
        // Chargement de l'image
        await page
          .locator(
            'div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x1iyjqo2.x2lwn1j div.x6s0dn4.x78zum5.x1gg8mnh.x1pi30zi.xlu9dua>div:nth-child(4) input[type=file]',
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
                    'div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x1iyjqo2.x2lwn1j div.x6s0dn4.x78zum5.x1gg8mnh.x1pi30zi.xlu9dua>div:nth-child(3)',
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
                    'div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x1iyjqo2.x2lwn1j div.x6s0dn4.x78zum5.x1gg8mnh.x1pi30zi.xlu9dua>div:nth-child(3)',
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

