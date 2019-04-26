workflow "Unit Testing on push" {
  on = "push"
  resolves = ["yarn test"]
}

action "yarn install" {
  uses = "borales/actions-yarn@master"
  args = "install"
}

action "yarn test" {
  uses = "borales/actions-yarn@master"
  args = "test:unit"
  needs = ["yarn install"]
}
