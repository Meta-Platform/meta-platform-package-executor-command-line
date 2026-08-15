const CreateScriptLoader = require("./CreateScriptLoader")

/*
 * Ensina o processo a resolver `.ts` em `require` sem extensão, a partir da
 * `module-resolution.lib` do EssentialRepo instalado — o mesmo caminho pelo qual
 * a `logger.lib` já é carregada.
 *
 * Vem ANTES do logger, e não junto: se a `logger.lib` for TypeScript, ela só
 * carrega depois que a resolução existir. Esta é a primeira coisa que o executor
 * faz com o repositório instalado.
 *
 * Falhar aqui NÃO pode impedir a execução do pacote. Com um EssentialRepo
 * anterior a esta lib, o processo segue sem resolução de `.ts` — o que também é
 * correto, porque nesse repositório não há `.ts` para resolver.
 */
const InstallTypeScriptResolution = async ({
    ecosystemData,
    ecosystemDefaultParams,
    verbose
}) => {

    const {
        REPOS_CONF_FILENAME_REPOS_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
    } = ecosystemDefaultParams

    try{

        const LoaderScript = await CreateScriptLoader({
            ecosystemData,
            REPOS_CONF_FILENAME_REPOS_DATA,
            ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
        })

        return LoaderScript("module-resolution.lib/src/InstallTypeScriptResolution")()

    }catch(error){

        if(verbose){
            /* Ponto anterior ao logger: `Log` ainda não existe. */
            process.stdout.write(`[InstallTypeScriptResolution] resolução TypeScript indisponível (${error.message || error})\n`)
        }

        return false
    }

}

module.exports = InstallTypeScriptResolution
