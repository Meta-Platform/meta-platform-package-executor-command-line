#!/bin/bash

source ./pkg-exec-params.sh

../../package-executor-0.0.6-preview-linux-x64 --packagePath "$PACKAGE_PATH" \
         --startupJson "$STARTUP_JSON" \
         --ecosystemDefault "$ECOSYSTEM_DEFAULT" \
         --nodejsProjectDependencies "$NODEJS_DEPS_PATH"