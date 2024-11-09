
const CreateScriptLoader = require("../CreateScriptLoader")

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
    const TaskExecutor = LoaderScript("task-executor.lib/src/TaskExecutor") 
    const taskLoaders = {
        'install-nodejs-package-dependencies' : LoaderScript("install-nodejs-package-dependencies.lib/src/InstallNodejsPackageDependencies.taskLoader"),
        'nodejs-package'                      : LoaderScript("nodejs-package.lib/src/NodeJSPackage.taskLoader"),
        'application-instance'                : LoaderScript("application-instance.lib/src/ApplicationInstance.taskLoader"),
        'command-application'                 : LoaderScript("command-application.lib/src/CommandApplication.taskLoader"),
        'service-instance'                    : LoaderScript("service-instance.lib/src/ServiceInstance.taskLoader"),
        'endpoint-instance'                   : LoaderScript("endpoint-instance.lib/src/EndpointInstance.taskLoader")
    }

    return TaskExecutor({
        taskLoaders
    })
}

module.exports = CreateTaskExecutorMachine