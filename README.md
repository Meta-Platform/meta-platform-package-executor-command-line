# Executor de Pacotes da Plataforma

Este executor permite a execução de pacotes da plataforma fora do ecossistema padrão.

## Pré-requisitos
- Node.js versão 18

## Instalação

Clone o repositório e instale as dependências:

```bash
npm install
```

Crie os links simbólicos para os executáveis `pkg-exec` e `pkg-exec-dbg`:

```bash
npm link
```

## Uso

Para executar um pacote da plataforma, configure os caminhos e parâmetros necessários:

```bash
#!/bin/bash

PROJECT_PATH="/home/kadisk/Workspaces/meta-platform-repo"
ECOSYSTEM_DATA_PATH="$PROJECT_PATH/EcosystemData"

PACKAGE_PATH="$PROJECT_PATH/repos/PlaformApplicationsRepo/Apps.Module/Tools.layer/APIDesigner.group/api-designer.webapp"
STARTUP_JSON="$PROJECT_PATH/repos/PlaformApplicationsRepo/Apps.Module/Tools.layer/APIDesigner.group/api-designer.webapp/metadata/startup-params.json"
ECOSYSTEM_DEFAULT="$ECOSYSTEM_DATA_PATH/config-files/MyPlatform.platform-params.json"
NODEJS_DEPS_PATH="$ECOSYSTEM_DATA_PATH/nodejs-dependencies"

pkg-exec --packagePath "$PACKAGE_PATH" \
         --startupJson "$STARTUP_JSON" \
         --ecosystemDefault "$ECOSYSTEM_DEFAULT" \
         --nodejsProjectDependencies "$NODEJS_DEPS_PATH"
```

## Parâmetros

- **packagePath**: Caminho onde o pacote está localizado.
- **startupJson**: Caminho para o arquivo JSON com parâmetros de inicialização do pacote.
- **ecosystemDefault**: Caminho para o arquivo JSON com parâmetros específicos da plataforma.
- **nodejsProjectDependencies**: Caminho para o diretório contendo o `node_modules` com as dependências necessárias.
- **awaitFirstConnectionWithLogStreaming**: Aguarda a primeira conexão com streaming de logs para continuar o carregamento.
- **verbose** Mostra detalhe da execução do pacote
- **supervisorSocket**: Caminho onde será criado o socket de supervisão do processo executor de pacotes
- **executableName** Nome do executável para pacote de linha dec comando
- **commandLineArgs** Argumentos para o executable de linha de comando