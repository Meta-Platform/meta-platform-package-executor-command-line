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
# Defina os caminhos para os arquivos e diretórios necessários
PACKAGE_PATH="<LOCAL_PATH>/platform-main-application.[webservice, service, webgui, webapp, app]"
STARTUP_JSON="<LOCAL_PATH>/MainApplication.startup-params.json"
PLATFORM_PARAMS_JSON="<LOCAL_PATH>/MyPlatform.platform-params.json"
NODEJS_DEPS_PATH="<LOCAL_PATH>/MyPlatformData/nodejs-dependencies"
```

Execute o pacote no modo normal:

```bash
pkg-exec --packagePath "$PACKAGE_PATH" \
         --startupJsonFilePath "$STARTUP_JSON" \
         --platformParamsJsonFilePath "$PLATFORM_PARAMS_JSON" \
         --nodejsProjectDependenciesPath "$NODEJS_DEPS_PATH"
```

Para executar em modo de depuração:

```bash
pkg-exec-dbg --packagePath "$PACKAGE_PATH" \
             --startupJsonFilePath "$STARTUP_JSON" \
             --platformParamsJsonFilePath "$PLATFORM_PARAMS_JSON" \
             --nodejsProjectDependenciesPath "$NODEJS_DEPS_PATH"
```

## Parâmetros

- **packagePath**: Caminho onde o pacote está localizado.
- **startupJsonFilePath**: Caminho para o arquivo JSON com parâmetros de inicialização do pacote.
- **platformParamsJsonFilePath**: Caminho para o arquivo JSON com parâmetros específicos da plataforma.
- **nodejsProjectDependenciesPath**: Caminho para o diretório contendo o `node_modules` com as dependências necessárias.
- **awaitFirstConnectionWithLogStreaming**: Aguarda a primeira conexão com streaming de logs para continuar o carregamento.
