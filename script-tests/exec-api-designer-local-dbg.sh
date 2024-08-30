#!/bin/bash

PROJECT_PATH="~/Workspaces/meta-platform-repo"
ECOSYSTEM_DATA_PATH="$PROJECT_PATH/EcosystemData"

PACKAGE_PATH="$PROJECT_PATH/repos/PlatformAppsRepo/Apps.Module/Tools.layer/APIDesigner.group/api-designer.webapp"
STARTUP_JSON="$PROJECT_PATH/repos/PlatformAppsRepo/Apps.Module/Tools.layer/APIDesigner.group/api-designer.webapp/metadata/startup-params.json"
ECOSYSTEM_DEFAULT="$ECOSYSTEM_DATA_PATH/config-files/MyPlatform.platform-params.json"
NODEJS_DEPS_PATH="$ECOSYSTEM_DATA_PATH/nodejs-dependencies"

SOCKET_PATH="./pkgexec.sock"

pkg-exec-dbg --packagePath "$PACKAGE_PATH" \
         --startupJson "$STARTUP_JSON" \
         --ecosystemDefault "$ECOSYSTEM_DEFAULT" \
         --nodejsProjectDependencies "$NODEJS_DEPS_PATH" \
         --socket "$SOCKET_PATH"