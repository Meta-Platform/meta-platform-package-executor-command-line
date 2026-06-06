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

## 2. `EventResponse` no `.proto` sem uso

A mensagem `EventResponse { event_message }` existe no
[`PackageExecutorRPCSpec.proto`](../src/Helpers/CommunicationInterface/IDL/PackageExecutorRPCSpec.proto)
mas não é referenciada por nenhum RPC. `> TODO: confirmar` se é reservada para uso
futuro ou pode ser removida. (Mesma observação no
[Package Executor RPC Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/package-executor-rpc-standard.md).)

---

> Ao resolver/alterar qualquer item no código, atualize este arquivo e o README.
