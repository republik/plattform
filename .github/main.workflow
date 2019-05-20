workflow "Unit Testing on push" {
  on = "push"
  resolves = ["yarn test:unit"]
}

action "yarn install" {
  uses = "orbiting/actions-yarn@master"
  args = "install"
}

action "yarn test:unit" {
  uses = "orbiting/actions-yarn@master"
  args = "test:unit"
  needs = ["yarn install"]
}
