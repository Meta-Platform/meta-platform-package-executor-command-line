#!/usr/bin/env node

const process     = require('process')
const yargs       = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const ExecutePlatformPackageCommand = require("../Commands/ExecutePlatformPackage.command")

const argv = yargs(hideBin(process.argv))
	.option('package', {
		describe: 'Caminho do pacote',
		type: 'string',
		demandOption: true
	})
	.option('startupJson', {
		describe: 'Caminho do arquivo JSON com os parâmetros de inicialização',
		type: 'string',
		demandOption: true
	})
	.option('ecosystemData', {
		describe: 'Caminho do diretório EcosystemData válido',
		type: 'string',
		demandOption: true
	})
	.option('ecosystemDefault', {
		describe: 'Caminho do arquivo JSON de parâmetros da plataforma',
		type: 'string',
		demandOption: true
	})
	.option('nodejsProjectDependencies', {
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
	.option('supervisorSocket', {
		describe: 'Caminho onde será criado o socket de supervisão do processo executor de pacotes',
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

ExecutePlatformPackageCommand(argv)