/**
 * Script de diagnostic WhatsApp Web
 * Lance : node scripts/diagnose-whatsapp.js
 *
 * Scanne le QR code si besoin, attend que WhatsApp soit prêt,
 * puis affiche tous les sélecteurs réels trouvés dans le DOM.
 */

const { chromium } = require('playwright');
const path = require('path');

const USER_DATA_DIR = path.join(__dirname, '../.whatsapp-profile');

async function diagnose() {
    console.log('🚀 Lancement du navigateur avec profil persistant...');
    console.log(`   Profil sauvegardé dans : ${USER_DATA_DIR}`);
    console.log('   (La prochaine fois, pas besoin de rescanner le QR)\n');

    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
        headless: false,
        args: ['--no-sandbox'],
    });

    const page = await context.newPage();
    await page.goto('https://web.whatsapp.com', { waitUntil: 'domcontentloaded' });

    console.log('⏳ En attente de la connexion WhatsApp...');
    console.log('   Scannez le QR code si demandé.\n');

    // Attendre que WhatsApp soit chargé (présence du sidebar)
    try {
        await page.waitForSelector('#side', { timeout: 120_000 });
        console.log('✅ WhatsApp Web connecté !\n');
    } catch {
        console.error('❌ Timeout : WhatsApp n\'a pas chargé en 2 minutes.');
        await context.close();
        return;
    }

    await page.waitForTimeout(2000);

    // ─── DIAGNOSTIC 1 : Champ de recherche ───────────────────────────────────
    console.log('═══════════════════════════════════════════════');
    console.log('  DIAGNOSTIC 1 : Champ de recherche');
    console.log('═══════════════════════════════════════════════');

    const editables = await page.evaluate(() => {
        const els = document.querySelectorAll('[contenteditable], [role="textbox"], [role="searchbox"], input');
        return Array.from(els).map(el => ({
            tag: el.tagName,
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label'),
            placeholder: el.getAttribute('placeholder'),
            contenteditable: el.getAttribute('contenteditable'),
            dataTestid: el.getAttribute('data-testid'),
            id: el.id || null,
            parentId: el.parentElement?.id || null,
            classes: (el.getAttribute('class') || '').substring(0, 100),
        }));
    });
    console.log(JSON.stringify(editables, null, 2));

    // ─── DIAGNOSTIC 2 : Boutons dans le sidebar ──────────────────────────────
    console.log('\n═══════════════════════════════════════════════');
    console.log('  DIAGNOSTIC 2 : Boutons/icônes dans #side');
    console.log('═══════════════════════════════════════════════');

    const sideButtons = await page.evaluate(() => {
        const els = document.querySelectorAll('#side [role="button"], #side button, #side [data-icon]');
        return Array.from(els).slice(0, 20).map(el => ({
            tag: el.tagName,
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label'),
            dataIcon: el.getAttribute('data-icon'),
            title: el.getAttribute('title'),
            classes: (el.getAttribute('class') || '').substring(0, 80),
        }));
    });
    console.log(JSON.stringify(sideButtons, null, 2));

    // ─── DIAGNOSTIC 3 : Simuler une recherche et observer ────────────────────
    console.log('\n═══════════════════════════════════════════════');
    console.log('  DIAGNOSTIC 3 : Clic sur loupe + résultat');
    console.log('═══════════════════════════════════════════════');

    // Essayer de cliquer sur l'icône loupe
    const searchIconSelectors = [
        '#side span[data-icon="search"]',
        '#side div[data-icon="search"]',
        '#side button[aria-label*="echerch"]',
        '#side div[role="button"][aria-label*="echerch"]',
        'span[data-icon="search"]',
    ];

    let clicked = false;
    for (const sel of searchIconSelectors) {
        try {
            const el = await page.$(sel);
            if (el) {
                await el.click();
                console.log(`✅ Loupe cliquée avec : ${sel}`);
                clicked = true;
                break;
            }
        } catch {}
    }

    if (!clicked) {
        console.log('❌ Loupe non trouvée avec les sélecteurs testés');
    }

    await page.waitForTimeout(1000);

    const afterClick = await page.evaluate(() => {
        const els = document.querySelectorAll('[contenteditable], [role="textbox"], [role="searchbox"], input');
        return Array.from(els).map(el => ({
            tag: el.tagName,
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label'),
            placeholder: el.getAttribute('placeholder'),
            contenteditable: el.getAttribute('contenteditable'),
            dataTestid: el.getAttribute('data-testid'),
            visible: el.getBoundingClientRect().height > 0,
            classes: (el.getAttribute('class') || '').substring(0, 100),
        }));
    });
    console.log('\nChamps éditables APRÈS clic sur loupe :');
    console.log(JSON.stringify(afterClick, null, 2));

    // ─── DIAGNOSTIC 4 : Bouton d'envoi (depuis une conv ouverte) ─────────────
    console.log('\n═══════════════════════════════════════════════');
    console.log('  DIAGNOSTIC 4 : Bouton d\'envoi dans #main footer');
    console.log('  (Ouvrez une conversation manuellement puis appuyez sur Entrée)');
    console.log('═══════════════════════════════════════════════');

    console.log('\nAppuyez sur Entrée dans ce terminal quand une conversation est ouverte...');
    await new Promise(resolve => process.stdin.once('data', resolve));

    const footerElements = await page.evaluate(() => {
        const els = document.querySelectorAll('#main footer *');
        return Array.from(els).slice(0, 60).map(el => ({
            tag: el.tagName,
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label'),
            dataIcon: el.getAttribute('data-icon'),
            contenteditable: el.getAttribute('contenteditable'),
            dataTestid: el.getAttribute('data-testid'),
            placeholder: el.getAttribute('placeholder'),
            type: el.getAttribute('type'),
            classes: (el.getAttribute('class') || '').substring(0, 80),
        }));
    });
    // Afficher seulement les éléments intéressants
    const interesting = footerElements.filter(e =>
        e.role || e.ariaLabel || e.dataIcon || e.contenteditable || e.dataTestid || e.type
    );
    console.log('Éléments intéressants dans le footer :');
    console.log(JSON.stringify(interesting, null, 2));

    // ─── DIAGNOSTIC 5 : Panneau détails du contact ────────────────────────────
    console.log('\n═══════════════════════════════════════════════');
    console.log('  DIAGNOSTIC 5 : Header + bouton "Détails" du contact');
    console.log('  Depuis une conversation ouverte, appuyez sur Entrée');
    console.log('═══════════════════════════════════════════════');

    console.log('\nAppuyez sur Entrée pour capturer le header de la conversation...');
    await new Promise(resolve => process.stdin.once('data', resolve));

    const headerElements = await page.evaluate(() => {
        const els = document.querySelectorAll('#main header *');
        return Array.from(els).map(el => ({
            tag: el.tagName,
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label'),
            dataIcon: el.getAttribute('data-icon'),
            dataTestid: el.getAttribute('data-testid'),
            title: el.getAttribute('title'),
            classes: (el.getAttribute('class') || '').substring(0, 80),
        })).filter(e => e.role || e.ariaLabel || e.dataIcon || e.dataTestid || e.title);
    });
    console.log('Éléments intéressants dans #main header :');
    console.log(JSON.stringify(headerElements, null, 2));

    // ─── DIAGNOSTIC 6 : Panneau infos/détails ouvert ─────────────────────────
    console.log('\n═══════════════════════════════════════════════');
    console.log('  DIAGNOSTIC 6 : Panneau détails ouvert + bouton fermer');
    console.log('  Cliquez sur le nom/photo du contact pour ouvrir les détails');
    console.log('  Puis appuyez sur Entrée');
    console.log('═══════════════════════════════════════════════');

    console.log('\nAppuyez sur Entrée quand le panneau détails est ouvert...');
    await new Promise(resolve => process.stdin.once('data', resolve));

    const detailsElements = await page.evaluate(() => {
        // Chercher les boutons/éléments de fermeture dans tout le DOM (hors footer/main)
        const candidates = document.querySelectorAll('button, [role="button"], [data-icon]');
        return Array.from(candidates).slice(0, 50).map(el => ({
            tag: el.tagName,
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label'),
            dataIcon: el.getAttribute('data-icon'),
            dataTestid: el.getAttribute('data-testid'),
            title: el.getAttribute('title'),
            parentTag: el.parentElement?.tagName,
            parentClass: (el.parentElement?.getAttribute('class') || '').substring(0, 60),
            classes: (el.getAttribute('class') || '').substring(0, 80),
        })).filter(e => e.ariaLabel || e.dataIcon || e.dataTestid);
    });
    console.log('Boutons/icônes dans le panneau détails :');
    console.log(JSON.stringify(detailsElements, null, 2));

    console.log('\n✅ Diagnostic terminé. Copiez la sortie ci-dessus et partagez-la.');
    await context.close();
}

diagnose().catch(console.error);
