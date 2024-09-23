import { Selector } from 'testcafe';
import fs from 'fs';  // Importiere das Filesystem-Modul
import path from 'path';  // Modul zur Handhabung von Dateipfaden
import config from '../config.json';  // Lade die Konfigurationsdatei

fixture('Ask AI')
    .page(config.pageUrl);  // Verwende die URL aus der Konfigurationsdatei

test('Run Ask AI Test and save response', async t => {
    // Definiere die Testwerte
    const similarityValue = '0.75';
    const topResultsValue = '15';
    const documentExpansionsValue = '5';

    // Fülle die Input-Felder aus und überschreibe bestehende Werte
    await t
        // Ersten Radio-Button auswählen
        .click(Selector('.mdc-radio__background').nth(0), { speed: 0.5 })

        // Warte, um sicherzustellen, dass die Aktion abgeschlossen ist
        .wait(250)

        // Similarity-Feld überschreiben
        .selectText(Selector('#mat-input-1')).pressKey('delete') 
        .typeText(Selector('#mat-input-1'), similarityValue) 

        // Warte, um sicherzustellen, dass die Aktion abgeschlossen ist
        .wait(250)

        // Top results (chunks) überschreiben
        .selectText(Selector('#mat-input-2')).pressKey('delete') 
        .typeText(Selector('#mat-input-2'), topResultsValue)    

        // Warte, um sicherzustellen, dass die Aktion abgeschlossen ist
        .wait(250)

        // Document expansions überschreiben
        .selectText(Selector('#mat-input-4')).pressKey('delete') 
        .typeText(Selector('#mat-input-4'), documentExpansionsValue)     

        // Warte, um sicherzustellen, dass die Aktion abgeschlossen ist
        .wait(250)

        // Scrolle zum Button
        .scrollIntoView(Selector('#btnDefault'))

        // Warte, bis der Button nicht mehr deaktiviert ist
        .expect(Selector('#btnDefault').hasAttribute('disabled')).notOk({ timeout: 10000 })  // Warte bis der Button aktiv ist (max. 10 Sekunden)

        // Den "Run (/qa)"-Button drücken
        .click(Selector('#btnDefault'), { speed: 0.5 })  // Erzwinge den Klick

        // Warte bis zu 10 Minuten auf die Antwort
        const answerText = await Selector('#mat-input-7').with({ visibilityCheck: true }).innerText;

        // Logge die Antwort
        console.log('Antwort:', answerText);

        // Erstelle den Dateinamen basierend auf dem Testdatum und den Werten
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');  // Format: 2024.09.23
        const fileName = `TestCafe_${date}_${similarityValue}_${topResultsValue}_${documentExpansionsValue}.txt`;

        // Erstelle den vollständigen Pfad für die Datei
        const outputPath = path.join(config.outputDir, fileName);

        // Prüfe, ob der Ausgabepfad existiert, und erstelle ihn falls nötig
        if (!fs.existsSync(config.outputDir)) {
            fs.mkdirSync(config.outputDir, { recursive: true });
            console.log(`Ordner erstellt: ${config.outputDir}`);
        }

        // Speichere die Antwort in der Datei
        fs.writeFileSync(outputPath, answerText, 'utf8');
        console.log(`Antwort gespeichert in Datei: ${outputPath}`);
});
