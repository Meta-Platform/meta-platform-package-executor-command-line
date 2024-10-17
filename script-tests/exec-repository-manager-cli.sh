#!/bin/bash

PROJECT_PATH="~/Workspaces/meta-platform-repo"
ECOSYSTEM_DATA_PATH="$PROJECT_PATH/EcosystemData"

PACKAGE_PATH="$PROJECT_PATH/repos/meta-platform-ecosystem-core-repository/Main.Module/Application.layer/repository-explorer.cli"
STARTUP_JSON="$PROJECT_PATH/repos/meta-platform-ecosystem-core-repository/Main.Module/Application.layer/repository-explorer.cli/metadata/startup-params.json"
ECOSYSTEM_DEFAULT="$ECOSYSTEM_DATA_PATH/config-files/MyPlatform.platform-params.json"
NODEJS_DEPS_PATH="$ECOSYSTEM_DATA_PATH/nodejs-dependencies"

SUPERVISOR_SOCKET_PATH="./pkgexec.sock"

pkg-exec --packagePath "$PACKAGE_PATH" \
        --startupJson "$STARTUP_JSON" \
        --ecosystemDefault "$ECOSYSTEM_DEFAULT" \
        --nodejsProjectDependencies "$NODEJS_DEPS_PATH" \
        --supervisorSocket "$SUPERVISOR_SOCKET_PATH"

