# AvalynxSelect

[![npm version](https://img.shields.io/npm/v/avalynx-select)](https://www.npmjs.com/package/avalynx-select)
[![npm downloads](https://img.shields.io/npm/dt/avalynx-select)](https://www.npmjs.com/package/avalynx-select)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/avalynx-select)](https://www.jsdelivr.com/package/npm/avalynx-select)
[![License](https://img.shields.io/npm/l/avalynx-select)](LICENSE)
[![Tests](https://github.com/avalynx/avalynx-select/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/avalynx/avalynx-select/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/avalynx/avalynx-select/branch/main/graph/badge.svg)](https://codecov.io/gh/avalynx/avalynx-select)
[![GitHub stars](https://img.shields.io/github/stars/avalynx/avalynx-select?style=flat&logo=github)](https://github.com/avalynx/avalynx-select)

AvalynxSelect ist eine leichtgewichtige, anpassbare Select-Dropdown-Komponente für Webanwendungen. Sie wurde für die Verwendung mit Bootstrap Version 5.3 oder höher entwickelt und benötigt keine Framework-Abhängigkeiten.

## Funktionen

- **Anpassbare Dropdowns**: Unterstützt verschiedene Anpassungsoptionen wie Live-Suche, Groß-/Kleinschreibung, scrollbare Listen und mehr.
- **AJAX-Unterstützung**: Dynamisches Laden von Listenelementen über AJAX mit Unterstützung für benutzerdefiniertes Mapping, Debouncing und Prefetching.
- **Bootstrap-Integration**: Entwickelt für die nahtlose Integration mit Bootstrap >= 5.3.
- **Einfach zu bedienen**: Einfache API zum Erstellen und Verwalten von Select-Dropdowns in Ihren Webanwendungen.

## Beispiele

Hier ist ein einfaches Beispiel für die Verwendung von AvalynxSelect in Ihrem Projekt:

* [Übersicht](https://avalynx-select.jbs-newmedia.de/examples/index.html)
* [Einfaches Select](https://avalynx-select.jbs-newmedia.de/examples/simple-select.html)
* [Einfaches Select mit Live-Suche und verschiedenen Optionen](https://avalynx-select.jbs-newmedia.de/examples/simple-select-livesearch.html)
* [Einfaches Select mit AJAX](https://avalynx-select.jbs-newmedia.de/examples/simple-ajax-select.html)
* [Einfaches Select mit responsivem Design](https://avalynx-select.jbs-newmedia.de/examples/simple-select-responsive.html)
* [Einfaches Select mit Event-Listenern](https://avalynx-select.jbs-newmedia.de/examples/simple-select-disabled.html)
* [Deaktiviertes Select](https://avalynx-select.jbs-newmedia.de/examples/simple-select-disabled.html)
* [Select mit Standardwert](https://avalynx-select.jbs-newmedia.de/examples/simple-select-default-value.html)

## Installation

Um AvalynxSelect in Ihrem Projekt zu verwenden, können Sie es direkt in Ihre HTML-Datei einbinden. Stellen Sie sicher, dass Sie Bootstrap 5.3 oder höher in Ihrem Projekt eingebunden haben, damit AvalynxSelect korrekt funktioniert.

Binden Sie zuerst Bootstrap ein:

```html
<!-- Bootstrap -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/js/bootstrap.bundle.min.js"></script>
```

Binden Sie dann AvalynxSelect ein:

```html
<script src="pfad/zu/avalynx-select.js"></script>
```

Ersetzen Sie `pfad/zu/avalynx-select.js` durch den tatsächlichen Pfad zur Datei in Ihrem Projekt.

## Installation über jsDelivr ([Link](https://cdn.jsdelivr.net/npm/avalynx-select/))

AvalynxSelect ist auch über [jsDelivr](https://www.jsdelivr.com/) verfügbar. Sie können es wie folgt in Ihr Projekt einbinden:

```html
<script src="https://cdn.jsdelivr.net/npm/avalynx-select@1.2.1/dist/js/avalynx-select.js"></script>
```

Stellen Sie sicher, dass Sie auch das JS/CSS von Bootstrap in Ihr Projekt einbinden, um eine korrekte Anzeige von AvalynxSelect zu gewährleisten.

## Installation über NPM ([Link](https://www.npmjs.com/package/avalynx-select))

AvalynxSelect ist auch als npm-Paket verfügbar. Sie können es mit dem folgenden Befehl zu Ihrem Projekt hinzufügen:

```bash
npm install avalynx-select
```

Nach der Installation können Sie AvalynxSelect wie folgt in Ihre JavaScript-Datei importieren:

```javascript
import { AvalynxSelect } from 'avalynx-select';
```

Stellen Sie sicher, dass Sie auch das JS/CSS von Bootstrap in Ihr Projekt einbinden, um eine korrekte Anzeige von AvalynxSelect zu gewährleisten.

## Installation über Symfony AssetMapper

```bash
php bin/console importmap:require avalynx-select
```

Nach der Installation können Sie AvalynxSelect wie folgt in Ihre JavaScript-Datei importieren:

```javascript
import { AvalynxSelect } from 'avalynx-select';
```

Stellen Sie sicher, dass Sie auch das JS/CSS von Bootstrap in Ihr Projekt einbinden, um eine korrekte Anzeige von AvalynxSelect zu gewährleisten.

## Installation über Symfony AssetComposer

Weitere Informationen zum Symfony AssetComposer Bundle finden Sie [hier](https://github.com/jbsnewmedia/asset-composer-bundle).

```twig
{% do addAssetComposer('avalynx/avalynx-select/dist/js/avalynx-select.js') %}
```

Stellen Sie sicher, dass Sie auch das JS/CSS von Bootstrap in Ihr Projekt einbinden, um eine korrekte Anzeige von AvalynxSelect zu gewährleisten.

## Installation über Composer ([Link](https://packagist.org/packages/avalynx/avalynx-select))

AvalynxSelect ist auch als Composer-Paket verfügbar. Sie können es mit dem folgenden Befehl zu Ihrem Projekt hinzufügen:

```bash
composer require avalynx/avalynx-select
```

Nach der Installation können Sie AvalynxSelect wie folgt in Ihre HTML-Datei einbinden:

```html
<script src="vendor/avalynx/avalynx-select/dist/js/avalynx-select.js"></script>
``` 

Stellen Sie sicher, dass Sie auch das JS/CSS von Bootstrap in Ihr Projekt einbinden, um eine korrekte Anzeige von AvalynxSelect zu gewährleisten.

## Verwendung

Um ein Select-Dropdown zu erstellen, instanziieren Sie einfach ein neues `AvalynxSelect`-Objekt mit den gewünschten Optionen:

```javascript
new AvalynxSelect("#mySelect", {
  liveSearch: true,
  caseSensitive: false,
  showAll: true,
  scrollList: true,
  scrollItems: 8
}, {
  searchPlaceholder: 'Suchen...',
  selectPlaceholder: 'Bitte wählen...'
});
```

Für AJAX-Unterstützung:

```javascript
new AvalynxSelect("#myAjaxSelect", {
  ajax: {
    url: 'https://api.example.com/data',
    method: 'GET',
    minimumInputLength: 3
  }
});
```

## Optionen

AvalynxSelect erlaubt die folgenden Optionen zur Anpassung:

- `selector`: (string) Der Selektor, der zum Anvisieren von Select-Elementen im DOM verwendet wird (Standard: `'.avalynx-select'`).
- `options`: Ein Objekt, das die folgenden Schlüssel enthält:
    - `className`: (string) Ein benutzerdefinierter Klassenname für das Loader-Element (Standard: `''`).
    - `liveSearch`: (boolean) Live-Suche aktivieren (Standard: `false`).
    - `caseSensitive`: (boolean) Suche mit Beachtung der Groß-/Kleinschreibung aktivieren (Standard: `false`).
    - `showAll`: (boolean) Alle Optionen anzeigen, wenn der Suchbegriff leer ist (Standard: `true`).
    - `showActive`: (boolean) Die aktive Option im Dropdown anzeigen (Standard: `true`).
    - `scrollList`: (boolean) Scrollbare Liste aktivieren (Standard: `true`).
    - `scrollItems`: (number) Anzahl der anzuzeigenden Elemente vor dem Scrollen (Standard: `8`).
    - `maxItemsToShow`: (number|null) Begrenzung der Anzahl der gerenderten Elemente (Standard: `null`).
    - `noDefaultSelection`: (boolean) Standardmäßig keine Option auswählen (Standard: `false`).
    - `disabled`: (boolean) Das Select-Element als deaktiviert initialisieren (Standard: `false`).
    - `defaultValue`: (string|null) Der Standardwert, der bei der Initialisierung ausgewählt werden soll (Standard: `null`).
    - `ajax`: (object|null) Konfiguration für die AJAX-Datenquelle (Standard: `null`).
        - `url`: (string) URL für die AJAX-Anfrage (Standard: `''`).
        - `method`: (string) HTTP-Methode für die AJAX-Anfrage (Standard: `'GET'`).
        - `headers`: (object) Benutzerdefinierte Header für die AJAX-Anfrage (Standard: `{}`).
        - `debounce`: (number) Debounce-Zeit in Millisekunden (Standard: `250`).
        - `minimumInputLength`: (number) Mindestanzahl von Zeichen vor der AJAX-Anfrage (Standard: `0`).
        - `length`: (number) Anzahl der abzurufenden Elemente (Standard: `25`).
        - `start`: (number) Startindex für das Abrufen von Elementen (Standard: `0`).
        - `initialLoad`: (boolean) Initiale Daten über AJAX laden (Standard: `false`).
        - `mapRequest`: (function|null) Funktion zum Mappen von Anfrageparametern (Standard: `null`).
        - `mapResponse`: (function|null) Funktion zum Mappen von Antwortdaten (Standard: `null`).
        - `resolveByValue`: (function|null) Funktion zum Auflösen eines Wertes in ein Label (Standard: `null`).
    - `onChange`: (function) Callback-Funktion, die ausgeführt wird, wenn eine Option ausgewählt wird (Standard: `null`).
    - `onLoaded`: (function) Callback-Funktion, die ausgeführt wird, wenn die Komponente geladen ist (Standard: `null`).
- `language`: Ein Objekt, das die folgenden Schlüssel enthält:
    - `searchPlaceholder`: (string) Platzhaltertext für die Sucheingabe (Standard: `'Suchen...'`).
    - `selectPlaceholder`: (string) Platzhaltertext für das Select-Dropdown (Standard: `'Bitte wählen...'`).
    - `loading`: (string) Text, der beim Laden von Daten angezeigt wird (Standard: `'Wird geladen...'`).
    - `noResults`: (string) Text, der angezeigt wird, wenn keine Ergebnisse gefunden wurden (Standard: `'Keine Ergebnisse'`).
    - `error`: (string) Text, der angezeigt wird, wenn ein Fehler auftritt (Standard: `'Fehler beim Laden der Daten'`).
    - `typeMore`: (string) Text, der für die Mindesteingabeanforderung angezeigt wird (Standard: `'Bitte noch {remaining} weitere Zeichen eingeben...'`).
    - `idleHint`: (string) Hinweistext, wenn das Sucheingabefeld leer ist (Standard: `'Zum Suchen tippen'`).

## Mitwirken

Beiträge sind willkommen! Wenn Sie beitragen möchten, forken Sie bitte das Repository und senden Sie einen Pull-Request mit Ihren Änderungen oder Verbesserungen. Wir suchen nach Beiträgen in den folgenden Bereichen:

- Fehlerbehebungen
- Funktionserweiterungen
- Verbesserungen der Dokumentation

Bevor Sie Ihren Pull-Request einreichen, stellen Sie bitte sicher, dass Ihre Änderungen gut dokumentiert sind und dem bestehenden Codestil des Projekts entsprechen.

## Lizenz

AvalynxSelect ist Open-Source-Software, die unter der [MIT-Lizenz](LICENSE) lizenziert ist.

## Kontakt

Wenn Sie Fragen, Funktionswünsche oder Probleme haben, öffnen Sie bitte ein Issue in unserem [GitHub-Repository](https://github.com/avalynx/avalynx-select/issues) oder senden Sie einen Pull-Request.

Vielen Dank, dass Sie AvalynxSelect für Ihr Projekt in Betracht ziehen!
