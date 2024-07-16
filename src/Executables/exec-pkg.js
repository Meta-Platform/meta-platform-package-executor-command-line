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
	socketPath,
	awaitFirstConnectionWithLogStreaming,
	executableName,
	commandLineArgs,
	verbose,
 }) => ExecutePlatformPackageCommand({
	packageRelativePath                   : packagePath,
	startupJsonFileRelativePath           : startupJsonFilePath,
	platformParamsJsonFileRelativePath    : platformParamsJsonFilePath,
	nodejsProjectDependenciesRelativePath : nodejsProjectDependenciesPath,
	socketRelativePath	     			  : socketPath,
	awaitFirstConnectionWithLogStreaming,
	executableName,
	commandLineArgs,
	verbose
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
	.option('socketPath', {
		describe: 'Caminho onde será criado o socket de comunicação do processo executor de pacotes',
		type: 'string',
		default: false,
		demandOption: false
	})
	.option('executableName', {
		describe: 'Nome do executável para pacote de linha dec comando',
		type: 'string',
		default: false,
		demandOption: false
	})
	.option('commandLineArgs', {
		describe: 'Argumentos para o executable de linha de comando',
		type: 'string',
		default: false,
		demandOption: false
	})
	.option('verbose', {
		describe: 'Aguardar pela primeira conexão com streaming de logs',
		type: 'boolean',
		default: false,
		demandOption: false
	})
	.help()
	.alias('help', 'h')
	.argv

ExecutePlatformPackageCommandWrapped(argv)