$deployer_role = "chipi.deployer"
$region = "ap-southeast-2"
#Install-Module -Name AWSPowerShell -Force -SkipPublisherCheck

aws configure set s3.signature_version s3v4
$aws_credentials = aws sts assume-role --role-arn arn:aws:iam::834552453766:role/Deployer --role-session-name "DeployerSession" --profile $deployer_role | ConvertFrom-Json

#$aws_credentials.Credentials

$env:AWS_ACCESS_KEY_ID="$($aws_credentials.Credentials.AccessKeyId)"
$env:AWS_SECRET_ACCESS_KEY="$($aws_credentials.Credentials.SecretAccessKey)"
$env:AWS_SESSION_TOKEN="$($aws_credentials.Credentials.SessionTOken)"

yarn
cd app
yarn
cd ..
yarn add electron-rebuild --dev
yarn rebuild-node 

#Set-AWSCredentials -AccessKey $aws_credentials.Credentials.AccessKeyId -SecretKey $aws_credentials.Credentials.SecretAccessKey -SessionToken $aws_credentials.Credentials.SessionTOken -StoreAs default

#aws s3api list-buckets 

yarn build-and-publish-win