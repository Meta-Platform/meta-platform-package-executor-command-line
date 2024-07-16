#!/bin/bash

source ./pkg-exec-params.sh

../../package-executor-0.0.6-preview-linux-x64 --packagePath "$PACKAGE_PATH" \
         --startupJsonFilePath "$STARTUP_JSON" \
         --platformParamsJsonFilePath "$PLATFORM_PARAMS_JSON" \
         --nodejsProjectDependenciesPath "$NODEJS_DEPS_PATH"