workflow "Publish branches to S3" {
  on = "push"
  resolves = ["upload to S3"]
}

action "exclude master" {
  uses = "actions/bin/filter@46ffca7632504e61db2d4cb16be1e80f333cb859"
  args = "not branch master"
}

action "npm install" {
  uses = "actions/npm@4633da3702a5366129dca9d8cc3191476fc3433c"
  args = "install"
  needs = ["exclude master"]
}

action "npm test" {
  uses = "actions/npm@4633da3702a5366129dca9d8cc3191476fc3433c"
  args = "test"
  needs = ["npm install"]
}

action "npm build:lib" {
  uses = "actions/npm@4633da3702a5366129dca9d8cc3191476fc3433c"
  args = "run build:lib"
  needs = ["npm test"]
}

action "npm pack" {
  uses = "actions/npm@4633da3702a5366129dca9d8cc3191476fc3433c"
  needs = ["npm build:lib"]
  args = "pack"
}

action "upload to S3" {
  uses = "actions/aws/cli@efb074ae4510f2d12c7801e4461b65bf5e8317e6"
  needs = ["npm pack"]
  secrets = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
  args = "s3 cp $PKG_NAME-0.0.0-development.tgz s3://$S3_PATH/$PKG_NAME-`echo $GITHUB_REF | cut -d/ -f3`.tgz --acl public-read"
  env = {
    PKG_NAME = "project-r-styleguide"
    S3_PATH = "republik-assets-dev/npm"
  }
}
