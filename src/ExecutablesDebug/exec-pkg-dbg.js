#!/usr/bin/env node
const { resolve } = require("path")
const ExecuteDebugMode = require("../Helpers/ExecuteDebugMode")

const args = process.argv.slice(2)
const executablesDirPath = resolve(__dirname, "..", "Executables", "exec-pkg.js")
ExecuteDebugMode(executablesDirPath, args)