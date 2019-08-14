### `<ActiveDebate />`.

Supported props:
- `hasHilight`: boolean, if `true`, the left column will be reserved for the highlighted debate.


```react|noSource
<ActiveDebate>
  <ActiveDebateHeader>Aktive Debatten</ActiveDebateHeader>
  <ActiveDebateTeaser
    path="/2019/08/06/wenn-big-tech-in-bern-nach-regulierung-ruft"
    highlight={false}
    documentTitle="Wenn Big Tech in Bern nach Regulierung ruft"
    preview={{
        string: "Ohnein. Jetzt springt auch die   \"Republik\" auf den Zug auf und suggeriert, dass Elektromobilität schlecht sei wegen angeblicher Brandgefahr. Damit nun auch Republikleser mit gutem Gewissen weiterdieseln können... Elektroautos brennen pro",
        more: true
      }}
    commentCount={20}
    displayAuthor={{
          id: "f815cc7cd2b9a3aed4190d6be5753a835822784b9bd202d5c54b681efd2036fe",
          name: "Simon Schlauri",
          profilePicture: "https://cdn.republik.space/s3/republik-assets/portraits/e7b5fec7809718a9f7b8c038c2747fd6.jpeg.webp?size=900x854&resize=384x384&bw=true"
      }}
    timeago="vor 10 m"
  ></ActiveDebateTeaser>
</ActiveDebate>
```

### `<ActiveDebateTeaser />`
A teaser for the active debates.

Supported props:
- `href`: url to the debate page.
- `highlight`: A quote (`string`) to highlight that will be displayed with a special style.
- `documentTitle`: the title (`string`) of the article that triggered the debate.
- `preview`: an object with the properties:
  - `string`: a `string` that will be display a preview of the last comment.
  - `more`: a `boolean` value.
- `commentCount`: a `number` of the current contributions to the debate, this number will be displayed next to the "comment" icon.
- `displayAuthor`: an object with the properties:
  - `id`: id (`string`) of the last comment's author.
  - `name`: name (`string`) of the last comment's author.
  - `profilePicture`: url to the profile image of the last comment's author.
- `timeago`: string.


```react
<ActiveDebateTeaser
  path="/2019/08/06/wenn-big-tech-in-bern-nach-regulierung-ruft"
  highlight={false}
  documentTitle="Wenn Big Tech in Bern nach Regulierung ruft"
  preview={{
        string: "Ohnein. Jetzt springt auch die   \"Republik\" auf den Zug auf und suggeriert, dass Elektromobilität schlecht sei wegen angeblicher Brandgefahr. Damit nun auch Republikleser mit gutem Gewissen weiterdieseln können... Elektroautos brennen pro",
        more: true
      }}
    commentCount={20}
    displayAuthor={{
          id: "f815cc7cd2b9a3aed4190d6be5753a835822784b9bd202d5c54b681efd2036fe",
          name: "Simon Schlauri",
          profilePicture: "https://cdn.republik.space/s3/republik-assets/portraits/e7b5fec7809718a9f7b8c038c2747fd6.jpeg.webp?size=900x854&resize=384x384&bw=true"
      }}
    timeago="vor 10 m"
/>
```