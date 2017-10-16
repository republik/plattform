export default k => {
  switch (k) {
    case 'components/CommentComposer/CommentComposer/placeholder':
      return 'Einen Kommentar verfassen…'
    case 'components/CommentComposer/CommentComposer/answer':
      return 'Antworten'
    default:
      return ''
  }
}
