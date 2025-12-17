# Quellcode-Editor

Der Quellcode-Editor ist über einen Link im Sidebar des normalen Editors zugänglich: 
> ![](./images/templating/quellcode-link.png)

Es gibt 3 wichtige Usecases dafür:

* [Templating](#templating): bestehende Dokumente kopieren und als Muster für neue Dokumente verwenden
* [Copy-paste](#copy-paste): komplexe Elemente (z.B. Liste, Infoboxen) in einem Dokument verschieben
* [Copy-paste, Front Edition](#copy-paste-front-edition): Kacheln von der Front in ein anderes Dokument duplizieren

## Templating

Bestehende Dokumente kopieren und als Muster für neue Dokumente verwenden:

- Das Dokument, welches als Template verwendet werden soll öffnen und im Quellcode-Editor die Metadaten einblenden:
> ![](./images/templating/metadaten-checkbox.png)

- Den Editior öffnen (einfach drauf clicken), den ganzen Inhalt auswählen (ctrl-A/cmd-A funktioniert auch) und kopieren (ctrl-C/cmd-C):
> ![](./images/templating/select-all.png)

- Neues Dokument erstellen oder bestehendes Dokument öffnen, welches das Template verwenden soll.

- Quellcode-Editor öffnen und Metadaten einblenden auswählen.

- Bestehender Text selektieren und löschen.
> ![](./images/templating/empty-editor.png)

- Kopierter Inhalt reinpasten (ctrl-V/cmd-V).

- Änderungen übernehmen:
> ![](./images/templating/save.png)

- Et voila!

## Copy-paste

Komplexe Elemente im selben Dokument verschieben. Hier wollen wir z.B. eine Umfrage in die Mitte des Artikels verschieben:
> ![](./images/copypaste/init.png)
 
- Den Quellcode-Editor öffnen.

- Den relevanten Code finden (Im Beispiel das `<secion>` Element):
> ![](./images/copypaste/find-section.png)

- Den Code kopieren. Lange Code-Sections `<section>...</section>` können durch das `>` Zeichen auf der linken Seite des Editors kollabiert werden:
> ![](./images/copypaste/copy-closed-section.png) 

- An der gewünschten Stelle pasten:
> ![](./images/copypaste/paste-section.png) 

- Änderungen übernehmen:
> ![](./images/copypaste/save.png)

- Et voila!
> ![](./images/copypaste/end-result.png) 

## Copy-paste, Front Edition

Kacheln von der Front in ein anderes Dokument duplizieren

–  Im Text der Kachel rein: dann wird ein Menu sichtbar (oben links in der Kachel). Kachel Markdown durch das inline UI Menu kopieren:
> ![](./images/copypastefront/inline.png)

 - Im Zieldokument den Quellcode-Editor öffnen und mit Ctrl/Cmd-V das Markdown reinkopieren, entweder ganz oben, ganz unten, oder nach einen `<hr /></section>` Tag.
 > ![](./images/copypastefront/copy.png)
 