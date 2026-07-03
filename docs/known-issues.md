# Known Issues — Package Executor

Itens conhecidos e divergências entre documentação/código, com o estado de
resolução. Confirmados na versão atual (`v0.0.26`).

## 1. `--packagePath` vs `--package` — RESOLVIDO

O parâmetro do caminho do pacote é **`--package`** (confirmado em
[`src/Executables/exec-pkg.js`](../src/Executables/exec-pkg.js)). Versões antigas
da documentação e os scripts em [`script-tests/`](../script-tests/) usavam o nome
antigo `--packagePath`, que **não funciona** com o binário atual.

**Resolução:** os scripts em `script-tests/` foram **atualizados para `--package`**.
Se você mantém scripts próprios com `--packagePath`, ajuste-os.
Atenção: mesmo migrados, os scripts **continuam quebrados** por outro motivo —
ver o item 2 abaixo.

## 2. Scripts de `script-tests/` não passam `--ecosystemData`

Nenhum dos scripts em [`script-tests/`](../script-tests/) passa o parâmetro
`--ecosystemData`, que é **obrigatório** (`demandOption: true` em
[`src/Executables/exec-pkg.js`](../src/Executables/exec-pkg.js)) — todos falham
na validação do `yargs` como estão. Além disso, os que usam `--supervisorSocket`
passam o caminho **sem o prefixo `unix:`**, então, mesmo corrigido o parâmetro
obrigatório, a supervisão não funcionaria (ver item 3).

**Workaround:** use os scripts apenas como referência, acrescentando
`--ecosystemData` e o prefixo `unix:` no socket.

## 3. Socket órfão não é removido antes do `bind`

O executor só remove o arquivo `.sock` no **encerramento limpo** —
[`SetupSocketFileRemovalOnShutdown.js`](../src/Helpers/CommunicationInterface/SetupSocketFileRemovalOnShutdown.js)
registra handlers para `exit`, `SIGINT`, `SIGTERM` e `uncaughtException`; **não
há `unlink` antes do `bind`**. Se o processo anterior morreu com `kill -9`, o
socket órfão permanece no disco e impede a nova execução.

**Workaround:** remova o arquivo `.sock` manualmente ou use outro caminho.

## 4. `EventResponse` no `.proto` sem uso

A mensagem `EventResponse { event_message }` existe no
[`PackageExecutorRPCSpec.proto`](../src/Helpers/CommunicationInterface/IDL/PackageExecutorRPCSpec.proto)
mas não é referenciada por nenhum RPC. `> TODO: confirmar` se é reservada para uso
futuro ou pode ser removida. (Mesma observação no
[Package Executor RPC Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/package-executor-rpc-standard.md).)

---

> Ao resolver/alterar qualquer item no código, atualize este arquivo e o README.
