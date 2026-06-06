#!/bin/bash

source ./pkg-exec-params.sh

pkg-exec-dbg --package "$PACKAGE_PATH" \
         --startupJson "$STARTUP_JSON" \
         --ecosystemDefault "$ECOSYSTEM_DEFAULT" \
         --nodejsProjectDependencies "$NODEJS_DEPS_PATH"