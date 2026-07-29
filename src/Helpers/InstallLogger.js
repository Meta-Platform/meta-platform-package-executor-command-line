const util = require("util")
const { basename, resolve } = require("path")

const CreateScriptLoader = require("./CreateScriptLoader")

const GLOBAL_KEY  = "Log"
const GLOBAL_MARK = Symbol.for("meta-platform.logger.globalLogger")

const LEVELS = ["trace", "debug", "info", "message", "warn", "error", "fatal"]

/*
 * Logger de EMERGÊNCIA — não é uma terceira implementação do Logging Standard.
 * Não formata como o padrão, não escreve JSONL, não faz ponte de console: ele
 * existe só para que `Log.<nível>` NUNCA seja `undefined`.
 *
 * Por que precisa existir: quase todo uso de `Log` no executor está em caminho
 * de ERRO (`catch`, handler de `uncaughtException`, callback de falha). Quando
 * a lib canônica não carrega, esses pontos trocam a exceção original por um
 * `ReferenceError: Log is not defined` — o registro do erro vira a causa da
 * queda e a causa real desaparece. Foi o que escondeu a falha de build do
 * control-panel.
 *
 * Fica marcado como `minimal` para que uma instalação canônica posterior possa
 * substituí-lo.
 */
const InstallEmergencyLogger = (reason) => {

	if (globalThis[GLOBAL_MARK]) {
		return globalThis[GLOBAL_KEY]
	}

	const Emit = (levelName, source, message, data) => {
		try {
			const parts = [
				`[package-executor]`,
				`[${levelName}]`,
				`[${source === undefined || source === null ? "-" : String(source)}]`,
				typeof message === "string" ? message : util.format(message)
			]

			if (data !== undefined) {
				parts.push(util.format(data))
			}

			process.stderr.write(`${parts.join(" ")}\n`)
		} catch (error) {
			/* Log é observabilidade, não caminho crítico. */
		}
	}

	const logger = LEVELS.reduce((built, levelName) => {

		built[levelName] = (source, message, data) =>
			(message === undefined && data === undefined)
				? Emit(levelName, "-", source, undefined)
				: Emit(levelName, source, message, data)

		return built

	}, {})

	logger.source        = (sourceName) => LEVELS.reduce((built, levelName) => {
		built[levelName] = (message, data) => Emit(levelName, sourceName, message, data)
		return built
	}, {})
	logger.child          = () => logger
	logger.Flush          = async () => {}
	logger.FlushSync      = () => {}
	logger.Close          = async () => {}
	logger.OpenFileChannel = () => logger
	logger.minimal        = true
	logger.emergency      = true
	logger.emergencyReason = reason

	globalThis[GLOBAL_KEY] = logger

	Object.defineProperty(globalThis, GLOBAL_MARK, {
		value        : { minimal : true, UninstallBridge : () => {}, UnregisterExitFlush : () => {} },
		configurable : true,
		enumerable   : false,
		writable     : false
	})

	return logger
}

/*
 * Instala o `globalThis.Log` a partir da `logger.lib` do EssentialRepo
 * instalado — o mesmo caminho pelo qual o `taskloader-registry.lib` já é
 * carregado.
 *
 * O package-executor é o ponto UNIVERSAL: todo pacote da plataforma sobe por
 * aqui. Instalar o logger neste ponto é o que torna `Log` disponível em
 * qualquer arquivo de qualquer pacote, sem que nenhum deles declare nada.
 *
 * Falhar aqui NÃO pode impedir a execução do pacote. Se o EssentialRepo
 * instalado for anterior à `logger.lib`, o processo segue sem `globalThis.Log`
 * — exatamente como era antes deste ponto existir.
 */
const InstallLogger = async ({
    packagePath,
    ecosystemData,
    ecosystemDefaultParams,
    verbose
}) => {

    const {
        REPOS_CONF_FILENAME_REPOS_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        LOG_CONF_DIRNAME_LOGS,
        LOG_CONF_LEVEL,
        LOG_CONF_CONSOLE_LEVEL,
        LOG_CONF_MAX_FILE_SIZE_MB,
        LOG_CONF_RETENTION_DAYS
    } = ecosystemDefaultParams

    try {

        const LoaderScript = await CreateScriptLoader({
            ecosystemData,
            REPOS_CONF_FILENAME_REPOS_DATA,
            ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
        })

        const InstallGlobalLogger = LoaderScript("logger.lib/src/InstallGlobalLogger")

        return InstallGlobalLogger({
            origin        : "package-executor",
            package       : packagePath ? basename(packagePath) : null,
            logsDirPath   : resolve(ecosystemData, LOG_CONF_DIRNAME_LOGS || "logs", "ecosystem"),
            level         : LOG_CONF_LEVEL,
            /* `--verbose` abre o terminal para tudo; sem ele vale o piso configurado. */
            consoleLevel  : verbose ? "trace" : LOG_CONF_CONSOLE_LEVEL,
            maxFileSizeMb : LOG_CONF_MAX_FILE_SIZE_MB,
            retentionDays : LOG_CONF_RETENTION_DAYS
        })

    } catch (error) {

        if (verbose) {
            /* Aqui o `Log` canônico não existe (é justamente o que falhou) e
             * `console` pode já estar embrulhado — resta o stdout direto. */
            process.stdout.write(`[InstallLogger] logger canônico indisponível (${error.message || error}) — segue com o logger de emergência\n`)
        }

        /* A execução do pacote NÃO pode parar por causa do logger — mas seguir
         * sem `globalThis.Log` transforma todo caminho de erro em ReferenceError.
         * O logger de emergência preserva as duas coisas. */
        return InstallEmergencyLogger(error.message || String(error))
    }
}

module.exports = InstallLogger
