#!/usr/bin/env node

const process     = require('process')
const yargs       = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const ExecutePlatformPackageCommand = require("../Commands/ExecutePlatformPackage.command")

const ExecutePlatformPackageCommandWrapped = ({ 
	packagePath,
	startupJsonFilePath,
	platformParamsJsonFilePath,
	nodejsProjectDependenciesPath,
	awaitFirstConnectionWithLogStreaming
 }) => ExecutePlatformPackageCommand({
	packageRelativePath                   : packagePath,
	startupJsonFileRelativePath           : startupJsonFilePath,
	platformParamsJsonFileRelativePath    : platformParamsJsonFilePath,
	nodejsProjectDependenciesRelativePath : nodejsProjectDependenciesPath,
	awaitFirstConnectionWithLogStreaming
 })

const argv = yargs(hideBin(process.argv))
	.option('packagePath', {
		describe: 'Caminho do pacote',
		type: 'string',
		demandOption: true
	})
	.option('startupJsonFilePath', {
		describe: 'Caminho do arquivo JSON com os parâmetros de inicialização',
		type: 'string',
		demandOption: true
	})
	.option('platformParamsJsonFilePath', {
		describe: 'Caminho do arquivo JSON de parâmetros da plataforma',
		type: 'string',
		demandOption: true
	})
	.option('nodejsProjectDependenciesPath', {
		describe: 'Caminho do projeto com as dependências nodejs para execução do pacote do ecossistema',
		type: 'string',
		demandOption: true
	})
	.option('awaitFirstConnectionWithLogStreaming', {
		describe: 'Aguardar pela primeira conexão com streaming de logs',
		type: 'boolean',
		default: false,
		demandOption: false
	})
	.help()
	.alias('help', 'h')
	.argv

ExecutePlatformPackageCommandWrapped(argv)