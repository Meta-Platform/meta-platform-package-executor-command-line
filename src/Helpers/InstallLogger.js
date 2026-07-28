const { basename, resolve } = require("path")

const CreateScriptLoader = require("./CreateScriptLoader")
const PrintDataLog       = require("./PrintDataLog")

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
            PrintDataLog({
                sourceName : "InstallLogger",
                type       : "warning",
                message    : `Logger global indisponível (${error.message || error}) — a execução segue sem ele`
            })
        }

        return null
    }
}

module.exports = InstallLogger
