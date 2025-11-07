import Html from 'slate-html-serializer'

const hasParent = (type, document, key) => {
  const parent = document.getParent(key)
  if (!parent) return
  return parent.type === type ? true : hasParent(type, document, parent.key)
}

const getDescendantNodes = (node, all = []) => {
  node.childNodes.forEach((child) => {
    all.push(child)
    getDescendantNodes(child, all)
  })
  return all
}

const PARAGRAPH_TYPES = ['PARAGRAPH', 'INFOP', 'BLOCKQUOTEPARAGRAPH']

// Tags to blocks.
const BLOCK_TAGS = {
  p: 'PARAGRAPH',
  // li: 'LISTITEM', -> custom handler to flatten nested lists
  // ul: 'LIST',
  // ol: 'LIST',
  blockquote: 'PARAGRAPH',
  h1: 'H2',
  h2: 'H2',
  h3: 'H2',
  h4: 'H2',
  h5: 'H2',
  h6: 'H2',
}

// Tags to marks.
const MARK_TAGS = {
  strong: 'STRONG',
  b: 'STRONG',
  em: 'EMPHASIS',
  i: 'EMPHASIS',
}

// Serializer rules.
const RULES = [
  {
    deserialize(el, next) {
      const block = BLOCK_TAGS[el.tagName.toLowerCase()]
      if (!block) return
      return {
        kind: 'block',
        type: block,
        nodes: next(el.childNodes),
      }
    },
  },
  {
    deserialize(el, next) {
      const mark = MARK_TAGS[el.tagName.toLowerCase()]
      if (!mark) return
      return {
        kind: 'mark',
        type: mark,
        nodes: next(el.childNodes),
      }
    },
  },
  // Special case for lists
  {
    deserialize(el, next) {
      if (!['ul', 'ol'].includes(el.tagName.toLowerCase())) return
      // nested lists are not supported, so we convert them to paragraphs
      if (el.parentNode?.tagName?.toLowerCase() === 'li')
        return {
          kind: 'block',
          type: 'PARAGRAPH',
          nodes: next(el.childNodes),
        }
      return {
        kind: 'block',
        type: 'LIST',
        data: {
          ordered: false,
          compact: true,
        },
        nodes: next(
          getDescendantNodes(el).filter(
            (n) => n.tagName?.toLowerCase() === 'li',
          ),
        ),
      }
    },
  },
  {
    // Special case for images, to grab their src.
    deserialize(el) {
      if (el.tagName.toLowerCase() != 'img') return
      return {
        kind: 'block',
        type: 'FIGURE',
        isVoid: false,
        data: {
          excludeFromGallery: false,
        },
        nodes: [
          {
            kind: 'block',
            type: 'FIGURE_IMAGE',
            isVoid: true,
            data: {
              alt: 'Alt',
              src: el.getAttribute('src'),
              srcDark: el.getAttribute('src'),
            },
          },
          {
            kind: 'block',
            type: 'FIGURE_CAPTION',
            isVoid: false,
            nodes: [
              {
                kind: 'block',
                type: 'CAPTION_TEXT',
                isVoid: false,
                nodes: [
                  {
                    kind: 'text',
                    leaves: [
                      {
                        kind: 'leaf',
                        text: 'Caption',
                      },
                    ],
                  },
                ],
              },
              {
                kind: 'block',
                type: 'EMPHASIS',
                isVoid: false,
                nodes: [
                  {
                    kind: 'text',
                    leaves: [
                      {
                        kind: 'leaf',
                        text: 'Byline',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }
    },
  },
  {
    // Special case for links, to grab their href.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() != 'a') return
      return {
        kind: 'inline',
        type: 'LINK',
        isVoid: false,
        data: {
          title: '',
          href: el.getAttribute('href'),
        },
        nodes: next(el.childNodes),
      }
    },
  },
]

const serializer = new Html({ rules: RULES })

const createPasteHtml = (centerModule) => (event, change, editor) => {
  // const transfer = getEventTransfer(event)
  const transfer = {
    files: [],
    fragment: null,
    html: '<html><body>\n<!--StartFragment--><meta charset="utf-8"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:12pt;" id="docs-internal-guid-3e111819-7fff-4ebf-c4f0-728c2f8aee83"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Nur um das klarzustellen: Ich glaube selbstverständlich nicht an Geister.</span></p><p dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:12pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Sie auch nicht, oder?</span></p><p dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:12pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Wobei, wenn ich ganz ehrlich bin, dann habe ich schon meine Momente, in denen mich ein metaphysisches Gruseln packt. Insbesondere ein Ort fällt mir ein: das Chalet im Berner Oberland, in dem ich seit meiner Kindheit mehrmals pro Jahr Ferien verbringe. Mein Urgrossvater hat es sich zur Pension erbaut. Irgendwie regt sich dieses Chalet nachts besonders stark – es knackst und knarzt überall. </span><span style="font-size:8pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">[NH1] </span><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Früher schlief ich oft schlecht in diesem Haus. Als ich mich, nun nicht mehr Kind, mit meinem Bruder über die Geräusche in der Nacht unterhielt, meinte der: «Ja, da wohnt halt ein Geist.» Er sagte es beiläufig und ernst, als wäre es weder ein Witz noch eine gewagte These.</span></p><p dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:12pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Als ich einer Teamkollegin von meiner Arbeit an diesem Text erzählte, meinte sie: «Das klingt jetzt doof, aber seit meine Mutter gestorben ist, habe ich das Gefühl, dass sie ganz nah bei mir ist.»</span></p><p dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:12pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Auch sonst begegneten mir plötzlich überall Geistergeschichten</span><span style="font-size:8pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">[DG2] </span><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">.</span></p><p dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:12pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Wer den Blick aus dem echten Leben auf die Kunst und Kulturwelt lenkt, wird zur Zeit </span><span style="font-size:8pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">[DG3] </span><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">auf noch viel mehr Geister stossen: Im Film «</span><a href="https://cineworx.ch/movie/in-die-sonne-schauen/" style="text-decoration:none;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">In die Sonne schauen</span></a><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">» von Mascha Schilinski verschwimmen auf einem Hof in Mitteldeutschland die verschiedenen Zeitebenen durch gespenstisches </span><span style="font-size:8pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">[NH4] </span><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Überblenden von vier Lebensgeschichten. Dorothee Elmigers Roman «</span><a href="https://www.hanser-literaturverlage.de/buch/dorothee-elmiger-die-hollaenderinnen-9783446282988-t-5683" style="text-decoration:none;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Die Holländerinnen</span></a><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">» zieht seine Spannung aus dem Grusel – vor dem dunklen Urwald, oder vielleicht eher vor uns selbst. Und das Kunstmuseum Basel widmet den Geistern </span><span style="font-size:8pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">[DG5] </span><a href="https://kunstmuseumbasel.ch/de/ausstellungen/2025/geister" style="text-decoration:none;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">eine grosse Ausstellung</span></a><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">, die vom Spiritismus im 19. Jahrhundert bis heute reicht.</span></p><br /><br /><!--EndFragment-->\n</body>\n</html>',
    node: null,
    rich: null,
    text: 'Nur um das klarzustellen: Ich glaube selbstverständlich nicht an Geister.\nSie auch nicht, oder?\nWobei, wenn ich ganz ehrlich bin, dann habe ich schon meine Momente, in denen mich ein metaphysisches Gruseln packt. Insbesondere ein Ort fällt mir ein: das Chalet im Berner Oberland, in dem ich seit meiner Kindheit mehrmals pro Jahr Ferien verbringe. Mein Urgrossvater hat es sich zur Pension erbaut. Irgendwie regt sich dieses Chalet nachts besonders stark – es knackst und knarzt überall. [NH1] Früher schlief ich oft schlecht in diesem Haus. Als ich mich, nun nicht mehr Kind, mit meinem Bruder über die Geräusche in der Nacht unterhielt, meinte der: «Ja, da wohnt halt ein Geist.» Er sagte es beiläufig und ernst, als wäre es weder ein Witz noch eine gewagte These.\nAls ich einer Teamkollegin von meiner Arbeit an diesem Text erzählte, meinte sie: «Das klingt jetzt doof, aber seit meine Mutter gestorben ist, habe ich das Gefühl, dass sie ganz nah bei mir ist.»\nAuch sonst begegneten mir plötzlich überall Geistergeschichten[DG2] .\nWer den Blick aus dem echten Leben auf die Kunst und Kulturwelt lenkt, wird zur Zeit [DG3] auf noch viel mehr Geister stossen: Im Film «In die Sonne schauen» von Mascha Schilinski verschwimmen auf einem Hof in Mitteldeutschland die verschiedenen Zeitebenen durch gespenstisches [NH4] Überblenden von vier Lebensgeschichten. Dorothee Elmigers Roman «Die Holländerinnen» zieht seine Spannung aus dem Grusel – vor dem dunklen Urwald, oder vielleicht eher vor uns selbst. Und das Kunstmuseum Basel widmet den Geistern [DG5] eine grosse Ausstellung, die vom Spiritismus im 19. Jahrhundert bis heute reicht.\n\n\n',
    type: 'html',
  }

  const cursor = editor.value.selection.anchorKey
  const blockType = editor.value.document.getClosestBlock(cursor).type

  console.log('PASTE EVENT', transfer, blockType)

  if (!transfer?.text) return

  if (transfer.type === 'text' || transfer.type === 'rich') {
    if (PARAGRAPH_TYPES.includes(blockType)) {
      change.insertText(transfer.text.replace(/\n{2,}/g, '\n\n'))
      return true
    }
    change.insertText(transfer.text.replace(/\n+/g, '\n'))
    return true
  }

  if (transfer.type === 'html') {
    console.log('-> CONVERTING HTML')
    const isCenter = hasParent(centerModule.TYPE, editor.value.document, cursor)

    // we only paste html when we are in a paragraph in a center block (aka fliesstext)
    if (!PARAGRAPH_TYPES.includes(blockType) || !isCenter) {
      change.insertText(transfer.text.replace(/\n+/g, '\n'))
      return true
    }

    try {
      const { document } = serializer.deserialize(transfer.html)
      // console.log(JSON.stringify(document, null, 2))
      change.insertFragment(document)
      return true
    } catch (e) {
      console.log('error pasting html', e)
      change.insertText(transfer.text.replace(/\n+/g, '\n'))
      return true
    }
  }
}

export default createPasteHtml
