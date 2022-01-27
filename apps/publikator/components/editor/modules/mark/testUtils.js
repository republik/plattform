import createMarkModule from './'
import createParagraphModule from '../paragraph'

export const boldModule = createMarkModule({
  TYPE: 'STRONG',
  rule: {
    matchMdast: node => node.type === 'strong',
    editorOptions: {
      type: 'strong'
    }
  },
  subModules: []
})
export const emphasisModule = createMarkModule({
  TYPE: 'EMPHASIS',
  rule: {
    matchMdast: node => node.type === 'emphasis',
    editorOptions: {
      type: 'emphasis'
    }
  },
  subModules: []
})
export const deleteModule = createMarkModule({
  TYPE: 'DELETE',
  rule: {
    matchMdast: node => node.type === 'delete',
    editorOptions: {
      type: 'delete'
    }
  },
  subModules: []
})
export const subModule = createMarkModule({
  TYPE: 'SUB',
  rule: {
    matchMdast: node => node.type === 'sub',
    editorOptions: {
      type: 'sub'
    }
  },
  subModules: []
})
export const supModule = createMarkModule({
  TYPE: 'SUP',
  rule: {
    matchMdast: node => node.type === 'sup',
    editorOptions: {
      type: 'sup'
    }
  },
  subModules: []
})

export const paragraphModule = createParagraphModule({
  TYPE: 'P',
  rule: {},
  subModules: [boldModule, emphasisModule, deleteModule, subModule, supModule]
})
paragraphModule.name = 'paragraph'
