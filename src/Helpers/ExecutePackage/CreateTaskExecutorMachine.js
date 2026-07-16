
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
        'install-nodejs-package-dependencies' : LoaderScript("install-nodejs-package-dependencies.taskLoader/src/InstallNodejsPackageDependencies.taskLoader"),
        'nodejs-package'                      : LoaderScript("nodejs-package.taskLoader/src/NodeJSPackage.taskLoader"),
        'application-instance'                : LoaderScript("application-instance.taskLoader/src/ApplicationInstance.taskLoader"),
        'command-application'                 : LoaderScript("command-application.taskLoader/src/CommandApplication.taskLoader"),
        'service-instance'                    : LoaderScript("service-instance.taskLoader/src/ServiceInstance.taskLoader"),
        'endpoint-instance'                   : LoaderScript("endpoint-instance.taskLoader/src/EndpointInstance.taskLoader"),
        'desktop-window-instance'             : LoaderScript("desktop-window-instance.taskLoader/src/DesktopWindowInstance.taskLoader")
    }

    return TaskExecutor({
        taskLoaders
    })
}

module.exports = CreateTaskExecutorMachine