#!/bin/bash

source ./pkg-exec-params.sh

pkg-exec --packagePath "$PACKAGE_PATH" \
         --startupJsonFilePath "$STARTUP_JSON" \
         --platformParamsJsonFilePath "$PLATFORM_PARAMS_JSON" \
         --nodejsProjectDependenciesPath "$NODEJS_DEPS_PATH"