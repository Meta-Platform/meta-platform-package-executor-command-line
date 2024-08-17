#!/bin/bash

ECOSYSTEM_DATA_PATH="~/Workspaces/meta-platform-repo/EcosystemData"
REPOSITORY_PATH="$ECOSYSTEM_DATA_PATH/repos/PlatformCoreRepo"

PACKAGE_PATH="$REPOSITORY_PATH/$PACKAGE_REPO_PATH"
STARTUP_JSON="$REPOSITORY_PATH/$PACKAGE_REPO_PATH/metadata/startup-params.json"
ECOSYSTEM_DEFAULT="$ECOSYSTEM_DATA_PATH/config-files/MyPlatform.platform-params.json"
NODEJS_DEPS_PATH="$ECOSYSTEM_DATA_PATH/nodejs-dependencies"

pkg-exec --packagePath "$PACKAGE_PATH" \
         --startupJson "$STARTUP_JSON" \
         --ecosystemDefault "$ECOSYSTEM_DEFAULT" \
         --nodejsProjectDependencies "$NODEJS_DEPS_PATH" \
         --executableName "$EXEC_NAME" \
         --commandLineArgs "$*"
