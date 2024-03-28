export type MdastNode<V = unknown, D = unknown> = {
  type: string
  depth: number
  identifier: string
  children: Array<MdastNode>
  data?: D
  value?: V
}

export type MdastNodeMatcher = (
  node: MdastNode,
  index?: number,
  parent?: MdastNode,
) => boolean

type MdastNodePropsFunc<P> = (
  node: MdastNode,
  index: number,
  parent?: MdastNode,
  options?: { ancestors?: MdastNode[] },
) => P

type EditorOptions = {
  type: string
  mdastType?: string
  placeholder?: string
  depth?: number
  lookupType?: string
  formatButtonText?: string
  afterType?: string
  insertAfterType?: string
  isStatic?: boolean
}

type MdastRule<P = unknown, EO extends EditorOptions = EditorOptions> = {
  matchMdast: MdastNodeMatcher
  component: React.FC<P>
  props?: MdastNodePropsFunc<P>
  // Rules for the that are to be applied
  // on the child-nodes
  rules?: MdastRule[]
  isVoid?: boolean
  // Defines the name of the editor module
  editorModule?: string
  // Defines the editor options for the editor module
  editorOptions?: EO
}

export type MdastSchema = {
  repoPrefix?: string
  getPath?: (options: { publishDate: Date; slug: string }) => string
  rules: MdastRule[]
}

export type VisitMdastFunction = (
  node: MdastNode,
  index?: number,
  ancestors?: MdastNode[],
) => void
