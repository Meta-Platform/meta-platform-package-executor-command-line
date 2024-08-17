
const CreateRequireScript = require("../CreateRequireScript")

const CreateTaskExecutorMachine = ({
    ecosystemData, 
    DEPENDENCY_LIST, 
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
}) => {
    const RequireScript = CreateRequireScript({
        ecosystemData, 
        DEPENDENCY_LIST, 
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
    })
    const TaskExecutor = RequireScript("task-executor.lib/src/TaskExecutor") 
    const taskLoaders = {
        'install-nodejs-package-dependencies' : RequireScript("install-nodejs-package-dependencies.lib/src/InstallNodejsPackageDependencies.taskLoader"),
        'nodejs-package'                      : RequireScript("nodejs-package.lib/src/NodeJSPackage.taskLoader"),
        'application-instance'                : RequireScript("application-instance.lib/src/ApplicationInstance.taskLoader"),
        'command-application'                 : RequireScript("command-application.lib/src/CommandApplication.taskLoader"),
        'service-instance'                    : RequireScript("service-instance.lib/src/ServiceInstance.taskLoader"),
        'endpoint-instance'                   : RequireScript("endpoint-instance.lib/src/EndpointInstance.taskLoader")
    }

    return TaskExecutor({
        taskLoaders
    })
}

module.exports = CreateTaskExecutorMachine