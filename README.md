# Executor de Pacotes da Plataforma

![Node.js Version](https://img.shields.io/badge/node-%3E%3D22-brightgreen)
![License](https://img.shields.io/badge/license-BSD--3--Clause-blue)

O Executor de Pacotes da Plataforma é uma ferramenta robusta que permite a execução de pacotes da plataforma fora do ecossistema padrão, fornecendo controle completo sobre o ambiente de execução e integração com sistemas de supervisão.

## Papel dentro da Meta Platform

O **Package Executor** (`pkg-exec`) é o **executor isolado de pacotes** da Meta
Platform (ver [portal](https://github.com/Meta-Platform) e
[mapa de repositórios](https://github.com/Meta-Platform/.github/blob/main/docs/repository-map.md)).
Ele é quem efetivamente transforma um package em uma **instância em execução**:
cria um [Runtime Environment](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/runtime-environment.md)
isolado, resolve as dependências por namespace, gera o plano de execução e o
entrega ao **Task Executor**. É usado tanto diretamente (linha de comando) quanto
por dentro do ecossistema (pelo `task-executor-machine.service` do
[ecosystem-core](https://github.com/Meta-Platform/meta-platform-ecosystem-core-repository)).

## Visão arquitetural

```
pkg-exec --package <caminho> ...
   │
   ├─ CreateScriptLoader        carrega libs de runtime do EssentialRepo
   ├─ ListPackages              varre os repositórios instalados
   ├─ BuildMetadataHierarchy    resolve dependências por namespace
   │        ↓ grava
   │   metadata-hierarchy.json  (no Runtime Environment: environments/<nome>-<hash>/)
   ├─ TranslateMetadataHierarchyForExecutionParams
   │        ↓ grava
   │   execution-params.json
   ├─ CreateTaskExecutorMachine
   └─ CreateTasks → Task Executor instancia cada unidade (object loaders)
           ↓
       Package Instance  ──(opcional)──►  Supervisor Socket (gRPC/Unix)
```

As libs de runtime carregadas vêm do
[essential-repository](https://github.com/Meta-Platform/meta-platform-essential-repository)
e estão listadas em
[`src/Configs/dependency-references.json`](./src/Configs/dependency-references.json).

## Fluxo: metadata-hierarchy → execution-params → task-executor → instância

1. **`metadata-hierarchy.json`** — grafo do package raiz + dependências resolvidas
   por namespace (ver
   [Dependency Resolution Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/dependency-resolution-standard.md)).
2. **`execution-params.json`** — plano de execução traduzido do grafo: as unidades
   (`objectLoaderType`) e suas ligações (ver
   [Execution Params Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/packages/execution-params-standard.md)).
3. **Task Executor** — executa o plano instanciando cada unidade via o **object
   loader** correspondente (ver
   [Environment Runtime Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/environment-runtime-standard.md)).
4. **Package Instance** — o pacote no ar; considerado "funcionando" quando as
   tasks estão `ACTIVE`/`FINISHED` sem `FAILURE`.

## Funcionalidades

- Execução isolada de pacotes da plataforma
- Configuração flexível de ambientes de execução
- Suporte a parâmetros de inicialização via JSON
- Integração com dependências Node.js externas
- Streaming de logs e supervisão de processos
- Modo verbose para depuração detalhada
- Suporte a aplicações CLI e serviços


## Instalação

Para instalar globalmente e disponibilizar os comandos `pkg-exec` e `pkg-exec-dbg` no seu sistema:

```bash
npm install -g package-executor
```

## Uso Básico

Execute um pacote da plataforma com o comando:

```bash
pkg-exec --package "/caminho/do/pacote" \
         --startupJson "/caminho/startup-params.json" \
         --ecosystemDefault "/caminho/platform-params.json" \
         --nodejsProjectDependencies "/caminho/nodejs-dependencies" \
         --ecosystemData "/caminho/EcosystemData"
```

## Parâmetros de Configuração

Os parâmetros abaixo refletem as `option`s declaradas em
[`src/Executables/exec-pkg.js`](./src/Executables/exec-pkg.js).

| Parâmetro | Obrigatório | Tipo | Padrão | Descrição |
|-----------|-------------|------|--------|-----------|
| `--package` | Sim | string | — | Caminho do pacote a ser executado |
| `--startupJson` | Sim | string | — | Caminho do arquivo JSON com os parâmetros de inicialização |
| `--ecosystemData` | Sim | string | — | Caminho do diretório `EcosystemData` válido |
| `--ecosystemDefault` | Sim | string | — | Caminho do arquivo JSON de parâmetros da plataforma |
| `--nodejsProjectDependencies` | Sim | string | — | Caminho do projeto com as dependências Node.js (contém `node_modules`) |
| `--awaitFirstConnectionWithLogStreaming` | Não | boolean | `false` | Aguarda a primeira conexão (com streaming de logs) antes de executar. Exige `--supervisorSocket`. |
| `--supervisorSocket` | Não | string | — | Caminho onde será criado o socket de supervisão (gRPC) do processo |
| `--executableName` | Não | string | — | Nome do executável, para pacotes de linha de comando (CLI) |
| `--commandLineArgs` | Não | string | — | Argumentos repassados ao executável de linha de comando |
| `--verbose` | Não | boolean | `false` | Habilita o log detalhado no terminal |

> **Atenção (mudança de nome de parâmetro):** o parâmetro do caminho do pacote é
> `--package` no código atual (`v0.0.26`). Os scripts em
> [`script-tests/`](./script-tests/) ainda usam o nome antigo `--packagePath` e,
> portanto, não funcionam com o binário atual sem ajuste.
> `> TODO: confirmar` se os scripts devem ser atualizados para `--package`.

### Regras de validação observadas no código

- `--ecosystemDefault` é obrigatório (validação explícita além do `yargs`).
- Se `--awaitFirstConnectionWithLogStreaming` for `true`, `--supervisorSocket`
  passa a ser obrigatório.
- Sem `--supervisorSocket`, o pacote é executado diretamente, sem expor a
  interface de supervisão.

## Exemplo Completo

```bash
#!/bin/bash

PROJECT_PATH="/home/user/Workspaces/platform-project"
ECOSYSTEM_DATA_PATH="$PROJECT_PATH/EcosystemData"

PACKAGE_PATH="$PROJECT_PATH/repos/MyApp/Tools.layer/App.group/webapp"
STARTUP_JSON="$PACKAGE_PATH/metadata/startup-params.json"
ECOSYSTEM_DEFAULT="$ECOSYSTEM_DATA_PATH/config-files/PlatformParams.json"
NODEJS_DEPS_PATH="$ECOSYSTEM_DATA_PATH/nodejs-dependencies"

pkg-exec --package "$PACKAGE_PATH" \
         --startupJson "$STARTUP_JSON" \
         --ecosystemDefault "$ECOSYSTEM_DEFAULT" \
         --nodejsProjectDependencies "$NODEJS_DEPS_PATH" \
         --ecosystemData "$ECOSYSTEM_DATA_PATH" \
         --verbose
```

## Supervisão via gRPC

Quando iniciado com `--supervisorSocket`, o executor cria um servidor gRPC sobre
um socket Unix e passa a expor operações de **supervisão** do processo:
`KillInstance`, `GetStatus`, `ListTasks`, `GetTask`, `LogStreaming`,
`StatusChangeNotification`, `GetStartupArguments` e `GetProcessInformation`
(ver [`CreateBinaryInterfaceViaSocket.js`](./src/Helpers/CommunicationInterface/CreateBinaryInterfaceViaSocket.js)).

A definição do serviço fica em
[`src/Helpers/CommunicationInterface/IDL/PackageExecutorRPCSpec.proto`](./src/Helpers/CommunicationInterface/IDL/PackageExecutorRPCSpec.proto)
— idêntica à definição canônica do padrão aberto. O contrato completo (RPCs,
enums e mensagens) está documentado em
[Package Executor RPC Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/package-executor-rpc.md).

A CLI `supervisor` (do `instance-supervisor.cli`) é um cliente dessa interface —
veja o
[Guia de Início Rápido](https://github.com/Meta-Platform/.github/blob/main/docs/GUIA-INICIO-RAPIDO.md#5-supervisionar-processos-supervisor).

## Modo de depuração (`pkg-exec-dbg`)

O binário `pkg-exec-dbg` executa o `pkg-exec` sob o inspetor do Node
(`--inspect-brk`), aceitando os mesmos parâmetros. Útil para depurar a execução
de um pacote passo a passo.

## Exemplos em `script-tests/`

A pasta [`script-tests/`](./script-tests/) reúne scripts de exemplo de execução
de pacotes reais (sujeitos ao ajuste de `--packagePath` → `--package` citado
acima):

| Script | Demonstra |
|--------|-----------|
| [`exec-repository-manager-cli.sh`](./script-tests/exec-repository-manager-cli.sh) | Execução de uma CLI com `--supervisorSocket`. |
| [`exec-api-designer-local.sh`](./script-tests/exec-api-designer-local.sh) | Execução de uma `.webapp` local com supervisão. |
| [`exec-api-designer-local-dbg.sh`](./script-tests/exec-api-designer-local-dbg.sh) | A mesma execução em modo de depuração (`pkg-exec-dbg`). |
| [`command-application/run-command-line.sh`](./script-tests/command-application/run-command-line.sh) | Execução de CLI usando `--executableName` e `--commandLineArgs`. |
| [`platform-main-application.app/`](./script-tests/platform-main-application.app/) | Execução de uma `.app` (dev local, binário e depuração), com parâmetros isolados em `pkg-exec-params.sh`. |

## Configuração de dependências

O arquivo [`src/Configs/dependency-references.json`](./src/Configs/dependency-references.json)
lista as libs do `essential-repository` (task executor, task loaders e metadata
helpers) que o executor carrega via *script loader* para montar e rodar o plano
de execução de um pacote.

## Exemplos por tipo de package

Todos usam os mesmos parâmetros base. As diferenças relevantes estão destacadas.

### CLI (`.cli`)

Use `--executableName` e repasse argumentos com `--commandLineArgs`:

```bash
pkg-exec --package "$REPO/Main.Module/Application.layer/repository-manager.cli" \
         --startupJson "$REPO/Main.Module/Application.layer/repository-manager.cli/metadata/startup-params.json" \
         --ecosystemDefault "$ECO/config-files/ecosystem-defaults.json" \
         --nodejsProjectDependencies "$ECO/nodejs-dependencies" \
         --ecosystemData "$ECO" \
         --executableName "repo" \
         --commandLineArgs "list installed"
```

### Service (`.service`)

Sobe um serviço de longa duração; normalmente com `--supervisorSocket` para
permitir supervisão:

```bash
pkg-exec --package "$REPO/Main.Module/Services.layer/server-manager.service" \
         --startupJson "$PKG/metadata/startup-params.json" \
         --ecosystemDefault "$ECO/config-files/ecosystem-defaults.json" \
         --nodejsProjectDependencies "$ECO/nodejs-dependencies" \
         --ecosystemData "$ECO" \
         --supervisorSocket "./server-manager.sock"
```

### WebApp (`.webapp`)

Sobe webgui + webservice sobre um servidor HTTP; com supervisão:

```bash
pkg-exec --package "$REPO/Apps.Module/Tools.layer/APIDesigner.group/api-designer.webapp" \
         --startupJson "$PKG/metadata/startup-params.json" \
         --ecosystemDefault "$ECO/config-files/ecosystem-defaults.json" \
         --nodejsProjectDependencies "$ECO/nodejs-dependencies" \
         --ecosystemData "$ECO" \
         --supervisorSocket "./api-designer.sock"
```

### App (`.app`)

Aplicação/instância do ecossistema (pode subir vários serviços e endpoints):

```bash
pkg-exec --package "$REPO/Main.Module/Application.layer/ecosystem-instance-manager.app" \
         --startupJson "$ECO/config-files/instance-manager.startup-params.json" \
         --ecosystemDefault "$ECO/config-files/ecosystem-defaults.json" \
         --nodejsProjectDependencies "$ECO/nodejs-dependencies" \
         --ecosystemData "$ECO" \
         --supervisorSocket "./instance-manager.sock"
```

> Exemplos reais (sujeitos ao ajuste `--packagePath` → `--package`) em
> [`script-tests/`](./script-tests/).

## Troubleshooting

| Sintoma | Causa provável / solução |
|---------|--------------------------|
| **Socket Unix inexistente** (cliente não conecta) | O socket só existe enquanto o processo roda. Confirme que o `pkg-exec` foi iniciado com `--supervisorSocket` e ainda está ativo; o arquivo fica no caminho passado (ou em `EcosystemData/supervisor-sockets/` quando rodando pelo ecossistema). |
| **Supervisor socket ocupado / em uso** | Sobrou um arquivo de socket de uma execução anterior. Com prefixo `unix:` o executor remove o socket órfão antes do `bind`; sem ele, remova o arquivo manualmente ou use outro caminho. |
| **Erro de parâmetro obrigatório** | `--package`, `--startupJson`, `--ecosystemData`, `--ecosystemDefault` e `--nodejsProjectDependencies` são obrigatórios. Além disso, `--ecosystemDefault` é validado explicitamente e, se `--awaitFirstConnectionWithLogStreaming` for `true`, `--supervisorSocket` passa a ser obrigatório. |
| **`--package` vs `--packagePath`** | O parâmetro correto na versão atual é **`--package`**. Os scripts em `script-tests/` ainda usam o nome antigo `--packagePath`, que **não funciona** com o binário atual — ajuste antes de rodá-los. |
| **Falhas de dependências Node.js** | `--nodejsProjectDependencies` deve apontar para um diretório que contenha `node_modules` com as dependências mínimas (em um ecossistema instalado: `EcosystemData/nodejs-dependencies`). As dependências do package são instaladas no `.dependencies/` do Runtime Environment pelo object loader `install-nodejs-package-dependencies`. |

## Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Distribuído sob licença BSD-3-Clause. Veja `LICENSE` para mais informações.

## Contato

Kaio Cezar - kadisk.shark@gmail.com

Link do Projeto: [https://github.com/Meta-Platform/meta-platform-package-executor-command-line](https://github.com/Meta-Platform/meta-platform-package-executor-command-line)