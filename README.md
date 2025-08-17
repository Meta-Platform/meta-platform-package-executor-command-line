# Executor de Pacotes da Plataforma

![Node.js Version](https://img.shields.io/badge/node-%3E%3D22-brightgreen)
![License](https://img.shields.io/badge/license-BSD--3--Clause-blue)

O Executor de Pacotes da Plataforma é uma ferramenta robusta que permite a execução de pacotes da plataforma fora do ecossistema padrão, fornecendo controle completo sobre o ambiente de execução e integração com sistemas de supervisão.

## ✨ Funcionalidades

- Execução isolada de pacotes da plataforma
- Configuração flexível de ambientes de execução
- Suporte a parâmetros de inicialização via JSON
- Integração com dependências Node.js externas
- Streaming de logs e supervisão de processos
- Modo verbose para depuração detalhada
- Suporte a aplicações CLI e serviços


## 🛠 Instalação

Para instalar globalmente e disponibilizar os comandos `pkg-exec` e `pkg-exec-dbg` no seu sistema:

```bash
npm install -g package-executor
```

## 🚀 Uso Básico

Execute um pacote da plataforma com o comando:

```bash
pkg-exec --packagePath "/caminho/do/pacote" \
         --startupJson "/caminho/startup-params.json" \
         --ecosystemDefault "/caminho/platform-params.json" \
         --nodejsProjectDependencies "/caminho/nodejs-dependencies" \
         --ecosystemData "/caminho/EcosystemData"
```

## ⚙️ Parâmetros de Configuração

| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `--packagePath` | Sim | Caminho absoluto para o pacote a ser executado |
| `--startupJson` | Sim | Caminho para o arquivo JSON com parâmetros de inicialização |
| `--ecosystemDefault` | Sim | Caminho para o arquivo JSON com configurações padrão da plataforma |
| `--nodejsProjectDependencies` | Sim | Caminho para o diretório contendo `node_modules` com dependências |
| `--ecosystemData` | Sim | Caminho para o diretório EcosystemData válido |
| `--awaitFirstConnectionWithLogStreaming` | Não | Aguarda conexão inicial para streaming de logs (padrão: false) |
| `--supervisorSocket` | Não | Caminho para criação do socket de supervisão |
| `--executableName` | Não | Nome do executável para pacotes CLI |
| `--commandLineArgs` | Não | Argumentos de linha de comando para o executável |
| `--verbose` | Não | Habilita modo detalhado de logging (padrão: false) |

## 🔍 Exemplo Completo

```bash
#!/bin/bash

PROJECT_PATH="/home/user/Workspaces/platform-project"
ECOSYSTEM_DATA_PATH="$PROJECT_PATH/EcosystemData"

PACKAGE_PATH="$PROJECT_PATH/repos/MyApp/Tools.layer/App.group/webapp"
STARTUP_JSON="$PACKAGE_PATH/metadata/startup-params.json"
ECOSYSTEM_DEFAULT="$ECOSYSTEM_DATA_PATH/config-files/PlatformParams.json"
NODEJS_DEPS_PATH="$ECOSYSTEM_DATA_PATH/nodejs-dependencies"

pkg-exec --packagePath "$PACKAGE_PATH" \
         --startupJson "$STARTUP_JSON" \
         --ecosystemDefault "$ECOSYSTEM_DEFAULT" \
         --nodejsProjectDependencies "$NODEJS_DEPS_PATH" \
         --ecosystemData "$ECOSYSTEM_DATA_PATH" \
         --verbose
```

## 🤝 Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Distribuído sob licença BSD-3-Clause. Veja `LICENSE` para mais informações.

## ✉️ Contato

Kaio Cezar - kadisk.shark@gmail.com

Link do Projeto: [https://github.com/Meta-Platform/meta-platform-package-executor-command-line](https://github.com/Meta-Platform/meta-platform-package-executor-command-line)