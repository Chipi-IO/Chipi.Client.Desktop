#! /bin/bash
git reset --hard
git pull origin master

aws configure set s3.signature_version s3v4
aws_session=$(aws sts assume-role --role-arn "arn:aws:iam::834552453766:role/Chipi-Cicd-CodeBuild-Service-Role" --role-session-name "CodeBuild-Deploy")
export AWS_ACCESS_KEY_ID=$(echo $aws_session | json .Credentials.AccessKeyId | xargs)
export AWS_SECRET_ACCESS_KEY=$(echo $aws_session | json .Credentials.SecretAccessKey | xargs)
export AWS_SESSION_TOKEN=$(echo $aws_session | json .Credentials.SessionToken | xargs)
export AWS_DEFAULT_REGION="ap-southeast-2"

aws s3 cp s3://chipi-windows-codesigning/CHIPIWindowsCodeSigning.pfx ./wincert.pfx
export CSC_LINK=file://./wincert.pfx
export CSC_KEY_PASSWORD=$(aws ssm get-parameter --name Chipi-Infrastructure-Client-WinSigningCert --with-decryption | json .Parameter.Value | xargs)

yarn && cd app && yarn && cd ..
yarn build-and-publish-win
