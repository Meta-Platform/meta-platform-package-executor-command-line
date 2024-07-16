#!/bin/bash

PROJECT_PATH="~/Workspaces/meta-platform-repo"
ECOSYSTEM_DATA_PATH="$PROJECT_PATH/EcosystemData"

PACKAGE_PATH="$PROJECT_PATH/repos/EcosystemRepo/Apps.Module/Tools.layer/APIDesigner.group/api-designer.webapp"
STARTUP_JSON="$PROJECT_PATH/repos/EcosystemRepo/Apps.Module/Tools.layer/APIDesigner.group/api-designer.webapp/metadata/startup-params.json"
PLATFORM_PARAMS_JSON="$ECOSYSTEM_DATA_PATH/config-files/MyPlatform.platform-params.json"
NODEJS_DEPS_PATH="$ECOSYSTEM_DATA_PATH/nodejs-dependencies"

SOCKET_PATH="./pkgexec.sock"

pkg-exec-dbg --packagePath "$PACKAGE_PATH" \
         --startupJsonFilePath "$STARTUP_JSON" \
         --platformParamsJsonFilePath "$PLATFORM_PARAMS_JSON" \
         --nodejsProjectDependenciesPath "$NODEJS_DEPS_PATH" \
         --socketPath "$SOCKET_PATH"