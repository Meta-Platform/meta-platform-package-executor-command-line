
const CreateScriptLoader = require("../CreateScriptLoader")
const GetRepositories = require("../GetRepositories")

const CreateTaskExecutorMachine = async ({
    ecosystemData,
    REPOS_CONF_FILENAME_REPOS_DATA,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
}) => {
    const LoaderScript = await CreateScriptLoader({
        ecosystemData,
        REPOS_CONF_FILENAME_REPOS_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
    })
    const TaskExecutor      = LoaderScript("task-executor.lib/src/TaskExecutor")
    const CreateTaskLoaders = LoaderScript("taskloader-registry.lib/src/CreateTaskLoaders")

    // Descoberta dinâmica: monta o mapa de object loaders a partir dos
    // taskloaders.json dos repositórios instalados (em vez de um mapa hard-coded).
    const repositoriesData = await GetRepositories({
        installDataDirPath: ecosystemData,
        REPOS_CONF_FILENAME_REPOS_DATA
    })
    const taskLoaders = CreateTaskLoaders({ repositoriesData })

    return TaskExecutor({
        taskLoaders
    })
}

module.exports = CreateTaskExecutorMachine
