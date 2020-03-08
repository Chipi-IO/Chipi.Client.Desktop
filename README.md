### Local Environment
Install `nvm` to manage node version.
    Follow this link https://github.com/nvm-sh/nvm#installing-and-updating to install nvm

    Install node 10.2.1 
        `nvm install 10.2.1`

Install `pyenv` to manage python version
    Follow this link https://github.com/pyenv/pyenv to intall pyenv

Install `yarn`
    `brew install yarn`

Install `jq`
    `brew install jq`


### Install dependencies

    `yarn && cd app && yarn && cd .. && yarn rebuild-node`

### Environment choose

There are 3 different CHIPI platform environmets available (development, uat and prod). By default the local develoment should use the CHIPI UAT evnviornment. Different environment values are stored within /app/environment folder. 

To choose different environment for running the `yarn dev`, please change the `Environment` alias resolve in the `webpack.config.base.js` file.

### Run development

    `yarn dev`

### Package app

    `yarn package`

### Release MAC app to S3 (outdated)

1. Talk to Jing to add your AWS IAM user into Deployer Role

2. Prepare your local machine by following the instruction https://docs.google.com/document/d/1Y54xX3RboVw78S5sxpe8F8ljygBlpEl6taTNIq5cVp0/edit?usp=sharing

3. Run the scripts below

    ```bash
        source ~/.bash_profile
        cd ./src
        eval $(assume-role chipi.deployer)
    ```

4. Manually bump the version number in `app/package.json` (e.g. 0.0.1 -> 0.0.2)

5. Run the script `yarn release`


### Release MAC app to Github

1. Save application certifiacte at a secure place.

2. Generate a GitHub access token by going to <https://github.com/settings/tokens/new>.  The access token should have the `repo` scope/permission. Once you have the token, assign it to an environment variable (e.g. add it to your `~/.bash_profile`).

    On macOS/linux:

        export GH_TOKEN="<YOUR_TOKEN_HERE>"
        export CSC_LINK="<PATH_TO_CERTIFICATE>"
        export CSC_KEY_PASSWORD="<CERTIFICATE_PASSWORD>"

    On Windows, run in powershell:

        [Environment]::SetEnvironmentVariable("GH_TOKEN","<YOUR_TOKEN_HERE>","User")

    Make sure to restart your IDE/Terminal to inherit the latest environment variable.

3. Manually bump the version number in `app/package.json` (e.g. 0.0.1 -> 0.0.2), then publish the release to GitHub.

    yarn release

    i.e. release script only publishes the MAC dmg installer

4. Release the release on GitHub by going to <https://github.com/Chipi-IO/Chipi.Client.Desktop/releases>, editing the release and clicking "Publish release."
