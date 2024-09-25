import { Selector } from 'testcafe';
import fs from 'fs';  // Importiere das Filesystem-Modul
import path from 'path';  // Modul zur Handhabung von Dateipfaden
import config from '../config.json';  // Lade die Konfigurationsdatei

fixture('Ask AI')
    .page(config.pageUrl);  // Verwende die URL aus der Konfigurationsdatei

test('Run Ask AI Test and save response', async t => {
    // Definiere die Testwerte
    const documentNumber = 0;
    const similarityValue = '0.75';
    const topResultsValue = '15';
    const documentExpansionsValue = '5';

    // Fülle die Input-Felder aus und überschreibe bestehende Werte
    await t
        .click(Selector('.mdc-radio__background').nth(documentNumber), { speed: 0.5 })
        .wait(250)
        .selectText(Selector('#mat-input-1')).pressKey('delete') 
        .typeText(Selector('#mat-input-1'), similarityValue)
        .wait(250)
        .selectText(Selector('#mat-input-2')).pressKey('delete') 
        .typeText(Selector('#mat-input-2'), topResultsValue)
        .wait(250)
        .selectText(Selector('#mat-input-4')).pressKey('delete') 
        .typeText(Selector('#mat-input-4'), documentExpansionsValue)
        .wait(250)
        .scrollIntoView(Selector('#btnDefault'))
        .expect(Selector('#btnDefault').hasAttribute('disabled')).notOk({ timeout: 10000 })
        .click(Selector('#btnDefault'), { speed: 0.5 });

    // Überprüfen, ob das Antwortfeld existiert und sichtbar ist
    const answerField = Selector('#mat-input-7');

    await t
        .expect(answerField.exists).ok('Das Antwortfeld existiert nicht!')
        .expect(answerField.visible).ok('Das Antwortfeld ist nicht sichtbar!');

    // Warte auf die Antwort, aber breche frühzeitig ab, wenn sie vorhanden ist
    const maxWaitTime = 600000; // Maximal 10 Minuten warten
    const pollingInterval = 5000; // Alle 5 Sekunden überprüfen
    let answerText = '';
    let elapsedTime = 0;

    while (elapsedTime < maxWaitTime) {
        // Prüfe, ob das Textfeld mit der Antwort befüllt ist
        answerText = (await answerField.textContent).trim();  // Verwende textContent und entferne unnötige Leerzeichen und Zeilenumbrüche

        // Logge den aktuellen Textinhalt
        console.log(`Aktueller Inhalt des Textfelds: "${answerText}"`);

        // Versuche, die Antwort als JSON zu parsen
        try {
            JSON.parse(answerText);  // Wenn dies erfolgreich ist, ist die Antwort ein gültiges JSON
            console.log('Gültiges JSON erhalten nach:', elapsedTime / 1000, 'Sekunden');
            break; // Beende das Warten, sobald eine gültige JSON-Antwort vorhanden ist
        } catch (error) {
            console.log(`Nach ${elapsedTime / 1000} Sekunden keine gültige JSON-Antwort. Warte weiter...`);
        }

        // Warte 5 Sekunden
        await t.wait(pollingInterval);
        elapsedTime += pollingInterval;
    }

    // Wenn nach 10 Minuten keine Antwort da ist, beende den Test
    if (answerText === '' || elapsedTime >= maxWaitTime) {
        throw new Error('Keine gültige JSON-Antwort nach 10 Minuten.');
    }

    // Datei speichern
    try {
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');
        const fileName = `TestCafe_${date}_${similarityValue}_${topResultsValue}_${documentExpansionsValue}.txt`;
        const outputPath = path.join(config.outputDir, fileName);

        // Prüfe, ob der Ausgabepfad existiert, und erstelle ihn falls nötig
        if (!fs.existsSync(config.outputDir)) {
            fs.mkdirSync(config.outputDir, { recursive: true });
            console.log(`Ordner erstellt: ${config.outputDir}`);
        }

        // Speichere die Antwort in der Datei
        fs.writeFileSync(outputPath, answerText, 'utf8');
        console.log(`Antwort gespeichert in Datei: ${outputPath}`);
    } catch (error) {
        console.error('Fehler beim Speichern der Datei:', error);
        throw error;  // Werfe den Fehler weiter, damit er nicht unbemerkt bleibt
    }
});
