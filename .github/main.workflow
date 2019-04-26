workflow "Unit Testing on push" {
  on = "push"
  resolves = ["yarn test:unit"]
}

action "yarn install" {
  uses = "borales/actions-yarn@master"
  args = "install"
}

action "yarn test:unit" {
  uses = "borales/actions-yarn@master"
  args = "test:unit"
  needs = ["yarn install"]
}
