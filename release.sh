#! /bin/bash
#
# Dependencies:
#   brew install jq
#
# Pre-Setup:
# Bump app version
#
# Setup:
#   chmod +x ./release.sh
#
# Execute:
# eval $(assume-role Deployer)
# source ./release.sh

eval $(assume-role chipi.deployer)

# Build and publish installers
yarn && cd app && yarn && cd ..
yarn add electron-rebuild
yarn rebuild-node
yarn build-and-publish

function yaml2json()
{
    ruby -ryaml -rjson -e \
         'puts JSON.pretty_generate(YAML.load(ARGF))' $*
}

# Identify latest installer names
mac_version=$(aws s3 cp s3://chipi-desktop-client-releases/latest-mac.yml - | yaml2json | jq .version | tr -d '"')
mac_installer="CHIPI-$mac_version.dmg"

win_version=$(aws s3 cp s3://chipi-desktop-client-releases/latest.yml - | yaml2json | jq .version | tr -d '"')
win_installer="CHIPI Setup $win_version.exe"

# Add Content-Disposition metadata to latest installer package
aws s3 cp "s3://chipi-desktop-client-releases/$mac_installer" s3://chipi-desktop-client-releases/mac/latest --acl public-read --content-disposition "attachment;filename=\"$mac_installer\""
aws s3 cp "s3://chipi-desktop-client-releases/$win_installer" s3://chipi-desktop-client-releases/win/latest --acl public-read --content-disposition "attachment;filename=\"$win_installer\""

# Invalidate CloudFront 
aws cloudfront create-invalidation --distribution-id "E21BLQWV3NXYPR" --paths '/*'