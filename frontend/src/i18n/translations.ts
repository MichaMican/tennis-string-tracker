export const languages = ["en", "de", "cs"] as const;

export type Language = (typeof languages)[number];

export const defaultLanguage: Language = "en";

/** Native names shown in the language switcher. */
export const languageNames: Record<Language, string> = {
  en: "English",
  de: "Deutsch",
  cs: "Čeština",
};

/** BCP 47 locales used for date/number formatting. */
export const languageLocales: Record<Language, string> = {
  en: "en-GB",
  de: "de-DE",
  cs: "cs-CZ",
};

const en = {
  "language.label": "Language",

  "common.loading": "Loading…",
  "common.backToHome": "Back to home",
  "common.home": "← Home",
  "common.cancel": "Cancel",
  "common.notSpecified": "—",
  "common.somethingWentWrong": "Something went wrong",

  "landing.title": "Tennis String Tracker",
  "landing.subtitle":
    "Keep a history of every string change on your racket and share it with a simple QR code.",
  "landing.createTracker": "Create tracker",

  "newTracker.title": "Create a new tracker",
  "newTracker.intro":
    "Optionally protect your tracker with an edit password. Anyone with the link can view it, but only people who know the password can make changes. The password cannot be recovered later.",
  "newTracker.passwordLabel": "Edit password (optional)",
  "newTracker.passwordPlaceholder": "Leave empty for no protection",
  "newTracker.submit": "Create tracker",
  "newTracker.submitting": "Creating…",
  "newTracker.failed": "Failed to create tracker",
  "newTracker.readyTitle": "Your tracker is ready",
  "newTracker.readySubtitle":
    "Share this link or place the QR code on your racket to open the tracker.",
  "newTracker.openTracker": "Open tracker",

  "tracker.title": "String history",
  "tracker.history": "History",
  "tracker.edit": "Edit",
  "tracker.done": "Done",
  "tracker.notFound": "Tracker not found",
  "tracker.loadFailed": "Failed to load tracker",
  "tracker.confirmDeleteEntry":
    "Delete this string entry? This cannot be undone.",
  "tracker.passwordTitle": "Edit password required",
  "tracker.passwordIntro":
    "This tracker is protected. Enter the edit password to make changes.",
  "tracker.passwordPlaceholder": "Edit password",
  "tracker.passwordIncorrect": "Incorrect password.",
  "tracker.unlock": "Unlock",
  "tracker.checking": "Checking…",
  "tracker.newEntryTitle": "New string entry",
  "tracker.addEntry": "Add entry",
  "tracker.createEntry": "+ Create new string entry",
  "tracker.noEntries": "No string entries yet.",
  "tracker.noEntriesHint": " Press Edit to add the first one.",

  "entry.editTitle": "Edit string entry",
  "entry.saveChanges": "Save changes",
  "entry.horizontalWeight": "Horizontal weight",
  "entry.verticalWeight": "Vertical weight",
  "entry.stringModel": "String model / manufacturer",
  "entry.knotting": "Knotting technique",
  "entry.delete": "Delete",
  "entry.editButton": "Edit",
  "entry.comments": "Player comments",
  "entry.noComments": "No comments yet.",
  "entry.commentPlaceholder": "Add a comment…",
  "entry.addComment": "Add",
  "entry.deleteComment": "Delete comment",
  "entry.qrSummary": "QR code for this tracker",
  "entry.stringerComments": "Stringer comments",
  "entry.stringerCommentsHint": "Only visible in the edit view — the player never sees these.",
  "entry.noStringerComments": "No stringer comments yet.",
  "entry.stringerCommentPlaceholder": "Add a stringer comment…",

  "form.date": "Date of stringing",
  "form.horizontal": "Horizontal (cross) weight, kg",
  "form.vertical": "Vertical (main) weight, kg",
  "form.model": "String model / manufacturer",
  "form.modelPlaceholder": "e.g. Luxilon ALU Power",
  "form.knotting": "Knotting technique",
  "form.knottingNone": "Not specified",
  "form.saving": "Saving…",
  "form.examplePlaceholder": "e.g. {value}",

  "knotting.2": "2 knots",
  "knotting.4": "4 knots",

  "weight.kg": "{value} kg",

  "copy.copy": "Copy link",
  "copy.copied": "Copied!",

  "qr.download": "Download QR code",

  "history.title": "Change history",
  "history.back": "← Back to tracker",
  "history.backPlain": "Back to tracker",
  "history.loadFailed": "Failed to load history",
  "history.empty": "No changes recorded yet.",
  "history.action.Create": "Create",
  "history.action.Update": "Update",
  "history.action.Delete": "Delete",
  "history.entryLabel": "String entry ({date})",
  "history.created": "Created new string entry",
  "history.commentAdded": '{field} added: "{value}"',
  "history.commentDeleted": '{field} deleted: "{value}"',
  "history.deleted": "Deleted. Last state — {value}",
  "history.field.Horizontal weight": "Horizontal weight",
  "history.field.Vertical weight": "Vertical weight",
  "history.field.String model/manufacturer": "String model / manufacturer",
  "history.field.Knotting technique": "Knotting technique",
  "history.field.Date of stringing": "Date of stringing",
  "history.field.Comment": "Comment",
  "history.field.Player comment": "Player comment",
  "history.field.Stringer comment": "Stringer comment",
};

export type TranslationKey = keyof typeof en;

const de: Record<TranslationKey, string> = {
  "language.label": "Sprache",

  "common.loading": "Lädt…",
  "common.backToHome": "Zurück zur Startseite",
  "common.home": "← Startseite",
  "common.cancel": "Abbrechen",
  "common.notSpecified": "—",
  "common.somethingWentWrong": "Etwas ist schiefgelaufen",

  "landing.title": "Tennis-Besaitungs-Tracker",
  "landing.subtitle":
    "Behalte den Überblick über jede Besaitung deines Schlägers und teile sie per QR-Code.",
  "landing.createTracker": "Tracker erstellen",

  "newTracker.title": "Neuen Tracker erstellen",
  "newTracker.intro":
    "Du kannst deinen Tracker optional mit einem Bearbeitungspasswort schützen. Jeder mit dem Link kann ihn ansehen, aber nur wer das Passwort kennt, kann Änderungen vornehmen. Das Passwort kann später nicht wiederhergestellt werden.",
  "newTracker.passwordLabel": "Bearbeitungspasswort (optional)",
  "newTracker.passwordPlaceholder": "Leer lassen für keinen Schutz",
  "newTracker.submit": "Tracker erstellen",
  "newTracker.submitting": "Wird erstellt…",
  "newTracker.failed": "Tracker konnte nicht erstellt werden",
  "newTracker.readyTitle": "Dein Tracker ist bereit",
  "newTracker.readySubtitle":
    "Teile diesen Link oder bringe den QR-Code an deinem Schläger an, um den Tracker zu öffnen.",
  "newTracker.openTracker": "Tracker öffnen",

  "tracker.title": "Besaitungsverlauf",
  "tracker.history": "Verlauf",
  "tracker.edit": "Bearbeiten",
  "tracker.done": "Fertig",
  "tracker.notFound": "Tracker nicht gefunden",
  "tracker.loadFailed": "Tracker konnte nicht geladen werden",
  "tracker.confirmDeleteEntry":
    "Diesen Besaitungseintrag löschen? Das kann nicht rückgängig gemacht werden.",
  "tracker.passwordTitle": "Bearbeitungspasswort erforderlich",
  "tracker.passwordIntro":
    "Dieser Tracker ist geschützt. Gib das Bearbeitungspasswort ein, um Änderungen vorzunehmen.",
  "tracker.passwordPlaceholder": "Bearbeitungspasswort",
  "tracker.passwordIncorrect": "Falsches Passwort.",
  "tracker.unlock": "Entsperren",
  "tracker.checking": "Wird geprüft…",
  "tracker.newEntryTitle": "Neuer Besaitungseintrag",
  "tracker.addEntry": "Eintrag hinzufügen",
  "tracker.createEntry": "+ Neuen Besaitungseintrag anlegen",
  "tracker.noEntries": "Noch keine Besaitungseinträge.",
  "tracker.noEntriesHint": " Klicke auf Bearbeiten, um den ersten anzulegen.",

  "entry.editTitle": "Besaitungseintrag bearbeiten",
  "entry.saveChanges": "Änderungen speichern",
  "entry.horizontalWeight": "Quersaiten-Härte",
  "entry.verticalWeight": "Längssaiten-Härte",
  "entry.stringModel": "Saitenmodell / Hersteller",
  "entry.knotting": "Knotentechnik",
  "entry.delete": "Löschen",
  "entry.editButton": "Bearbeiten",
  "entry.comments": "Spielerkommentare",
  "entry.noComments": "Noch keine Kommentare.",
  "entry.commentPlaceholder": "Kommentar hinzufügen…",
  "entry.addComment": "Hinzufügen",
  "entry.deleteComment": "Kommentar löschen",
  "entry.qrSummary": "QR-Code für diesen Tracker",
  "entry.stringerComments": "Besaiter-Kommentare",
  "entry.stringerCommentsHint": "Nur in der Bearbeitungsansicht sichtbar — der Spieler sieht diese nie.",
  "entry.noStringerComments": "Noch keine Besaiter-Kommentare.",
  "entry.stringerCommentPlaceholder": "Besaiter-Kommentar hinzufügen…",

  "form.date": "Datum der Besaitung",
  "form.horizontal": "Quersaiten-Härte, kg",
  "form.vertical": "Längssaiten-Härte, kg",
  "form.model": "Saitenmodell / Hersteller",
  "form.modelPlaceholder": "z. B. Luxilon ALU Power",
  "form.knotting": "Knotentechnik",
  "form.knottingNone": "Nicht angegeben",
  "form.saving": "Wird gespeichert…",
  "form.examplePlaceholder": "z. B. {value}",

  "knotting.2": "2 Knoten",
  "knotting.4": "4 Knoten",

  "weight.kg": "{value} kg",

  "copy.copy": "Link kopieren",
  "copy.copied": "Kopiert!",

  "qr.download": "QR-Code herunterladen",

  "history.title": "Änderungsverlauf",
  "history.back": "← Zurück zum Tracker",
  "history.backPlain": "Zurück zum Tracker",
  "history.loadFailed": "Verlauf konnte nicht geladen werden",
  "history.empty": "Noch keine Änderungen aufgezeichnet.",
  "history.action.Create": "Erstellt",
  "history.action.Update": "Geändert",
  "history.action.Delete": "Gelöscht",
  "history.entryLabel": "Besaitungseintrag ({date})",
  "history.created": "Neuer Besaitungseintrag erstellt",
  "history.commentAdded": '{field} hinzugefügt: "{value}"',
  "history.commentDeleted": '{field} gelöscht: "{value}"',
  "history.deleted": "Gelöscht. Letzter Stand — {value}",
  "history.field.Horizontal weight": "Quersaiten-Härte",
  "history.field.Vertical weight": "Längssaiten-Härte",
  "history.field.String model/manufacturer": "Saitenmodell / Hersteller",
  "history.field.Knotting technique": "Knotentechnik",
  "history.field.Date of stringing": "Datum der Besaitung",
  "history.field.Comment": "Kommentar",
  "history.field.Player comment": "Spielerkommentar",
  "history.field.Stringer comment": "Besaiter-Kommentar",
};

const cs: Record<TranslationKey, string> = {
  "language.label": "Jazyk",

  "common.loading": "Načítání…",
  "common.backToHome": "Zpět na úvod",
  "common.home": "← Úvod",
  "common.cancel": "Zrušit",
  "common.notSpecified": "—",
  "common.somethingWentWrong": "Něco se pokazilo",

  "landing.title": "Sledování výpletu rakety",
  "landing.subtitle":
    "Uchovejte si historii každé výměny výpletu rakety a sdílejte ji pomocí jednoduchého QR kódu.",
  "landing.createTracker": "Vytvořit sledování",

  "newTracker.title": "Vytvořit nové sledování",
  "newTracker.intro":
    "Své sledování můžete volitelně chránit heslem pro úpravy. Kdokoli s odkazem si jej může prohlédnout, ale změny může provádět jen ten, kdo zná heslo. Heslo nelze později obnovit.",
  "newTracker.passwordLabel": "Heslo pro úpravy (volitelné)",
  "newTracker.passwordPlaceholder": "Ponechte prázdné pro žádnou ochranu",
  "newTracker.submit": "Vytvořit sledování",
  "newTracker.submitting": "Vytváření…",
  "newTracker.failed": "Sledování se nepodařilo vytvořit",
  "newTracker.readyTitle": "Vaše sledování je připraveno",
  "newTracker.readySubtitle":
    "Sdílejte tento odkaz nebo umístěte QR kód na raketu, abyste sledování otevřeli.",
  "newTracker.openTracker": "Otevřít sledování",

  "tracker.title": "Historie výpletů",
  "tracker.history": "Historie",
  "tracker.edit": "Upravit",
  "tracker.done": "Hotovo",
  "tracker.notFound": "Sledování nenalezeno",
  "tracker.loadFailed": "Sledování se nepodařilo načíst",
  "tracker.confirmDeleteEntry":
    "Smazat tento záznam o výpletu? Tuto akci nelze vrátit zpět.",
  "tracker.passwordTitle": "Vyžadováno heslo pro úpravy",
  "tracker.passwordIntro":
    "Toto sledování je chráněno. Pro provedení změn zadejte heslo pro úpravy.",
  "tracker.passwordPlaceholder": "Heslo pro úpravy",
  "tracker.passwordIncorrect": "Nesprávné heslo.",
  "tracker.unlock": "Odemknout",
  "tracker.checking": "Ověřování…",
  "tracker.newEntryTitle": "Nový záznam o výpletu",
  "tracker.addEntry": "Přidat záznam",
  "tracker.createEntry": "+ Vytvořit nový záznam o výpletu",
  "tracker.noEntries": "Zatím žádné záznamy o výpletu.",
  "tracker.noEntriesHint": " Stiskněte Upravit a přidejte první.",

  "entry.editTitle": "Upravit záznam o výpletu",
  "entry.saveChanges": "Uložit změny",
  "entry.horizontalWeight": "Tvrdost příčných strun",
  "entry.verticalWeight": "Tvrdost podélných strun",
  "entry.stringModel": "Model / výrobce výpletu",
  "entry.knotting": "Technika uzlování",
  "entry.delete": "Smazat",
  "entry.editButton": "Upravit",
  "entry.comments": "Komentáře hráče",
  "entry.noComments": "Zatím žádné komentáře.",
  "entry.commentPlaceholder": "Přidat komentář…",
  "entry.addComment": "Přidat",
  "entry.deleteComment": "Smazat komentář",
  "entry.qrSummary": "QR kód pro toto sledování",
  "entry.stringerComments": "Komentáře vypletače",
  "entry.stringerCommentsHint": "Viditelné pouze v režimu úprav — hráč je nikdy neuvidí.",
  "entry.noStringerComments": "Zatím žádné komentáře vypletače.",
  "entry.stringerCommentPlaceholder": "Přidat komentář vypletače…",

  "form.date": "Datum vypletení",
  "form.horizontal": "Tvrdost příčných strun, kg",
  "form.vertical": "Tvrdost podélných strun, kg",
  "form.model": "Model / výrobce výpletu",
  "form.modelPlaceholder": "např. Luxilon ALU Power",
  "form.knotting": "Technika uzlování",
  "form.knottingNone": "Neuvedeno",
  "form.saving": "Ukládání…",
  "form.examplePlaceholder": "např. {value}",

  "knotting.2": "2 uzly",
  "knotting.4": "4 uzly",

  "weight.kg": "{value} kg",

  "copy.copy": "Kopírovat odkaz",
  "copy.copied": "Zkopírováno!",

  "qr.download": "Stáhnout QR kód",

  "history.title": "Historie změn",
  "history.back": "← Zpět na sledování",
  "history.backPlain": "Zpět na sledování",
  "history.loadFailed": "Historii se nepodařilo načíst",
  "history.empty": "Zatím nebyly zaznamenány žádné změny.",
  "history.action.Create": "Vytvořeno",
  "history.action.Update": "Změněno",
  "history.action.Delete": "Smazáno",
  "history.entryLabel": "Záznam o výpletu ({date})",
  "history.created": "Vytvořen nový záznam o výpletu",
  "history.commentAdded": '{field} přidán: "{value}"',
  "history.commentDeleted": '{field} smazán: "{value}"',
  "history.deleted": "Smazáno. Poslední stav — {value}",
  "history.field.Horizontal weight": "Tvrdost příčných strun",
  "history.field.Vertical weight": "Tvrdost podélných strun",
  "history.field.String model/manufacturer": "Model / výrobce výpletu",
  "history.field.Knotting technique": "Technika uzlování",
  "history.field.Date of stringing": "Datum vypletení",
  "history.field.Comment": "Komentář",
  "history.field.Player comment": "Komentář hráče",
  "history.field.Stringer comment": "Komentář vypletače",
};

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  de,
  cs,
};
