# Quellcode-Editor

Das Quellcode-Editor es durch einen Link in der Sidebar von normalen Editor zugänglich: 
> ![](../public/static/docs/templating/quellcode-link.png)

Es gibt 2 wichtige Usecases dafür:

* [Templating](#Templating): bestehende Dokumente kopieren und als Muster für neue Dokumente verwenden
* [Copy-paste](#copy-paste): komplexe Elemente (z.B. Liste, Infoboxen) in einem Dokument verschieben

## Templating

Bestehende Dokumente kopieren und als Muster für neue Dokumente verwenden, how-to.

- Im Dokument, was zu kopieren ist, rein, und im Quellcode-Editor.

- Metadaten einblenden:
> ![](../public/static/docs/templating/metadaten-checkbox.png)

- Im Editior rein (einfach drauf clicken), das ganze Inhalt selektieren (ctrl-A/cmd-A funktioniert auch) und kopieren:
> ![](../public/static/docs/templating/select-all.png)

- Neues Dokument erstellen oder im Dokument rein, was die Template verwenden soll.

- Quellcode-Editor aufmachen.

- Metadaten einblenden.

- Existierendes Text selektieren und löschen.
> ![](../public/static/docs/templating/empty-editor.png)

- Inhalt von 3. reinpasten.

- Änderungen übernehmen:
> ![](../public/static/docs/templating/save.png)

- Et voila!

## Copy-paste

Komplexe Elemente im selben Dokument verschieben. Hier wollen wir z.B. diese Umfrage im Mitte des Artikel bewegen:
> ![](../public/static/docs/copypaste/init.png)
 

- Im Quellcode-Editor rein.

- Das relevante Teil finden:
> ![](../public/static/docs/copypaste/find-section.png)

- Das Teil kopieren. Lange `<section>...</section>` können durch das `>` Zeichen auf der  link Seite kompressiert werden:
> ![](../public/static/docs/copypaste/copy-closed-section.png) 

- Irgendwo anders pasten:
> ![](../public/static/docs/copypaste/paste-section.png) 

- Änderungen übernehmen:
> ![](../public/static/docs/copypaste/save.png)

- Et voila!
> ![](../public/static/docs/copypaste/end-result.png) 
