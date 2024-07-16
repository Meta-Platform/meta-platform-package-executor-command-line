
const RequirePlatformScript = require("../RequirePlatformScript")


const CreateTaskExecutorMachine = (ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST) => {
    const TaskExecutor = RequirePlatformScript("task-executor.lib/src/TaskExecutor", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST) 
    const taskLoaders = {
        'install-nodejs-package-dependencies' : RequirePlatformScript("task-loaders.lib/src/TaskLoaders/InstallNodejsPackageDependencies.taskLoader", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST),
        'nodejs-package'                      : RequirePlatformScript("task-loaders.lib/src/TaskLoaders/NodeJSPackage.taskLoader", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST),
        'application-instance'                : RequirePlatformScript("task-loaders.lib/src/TaskLoaders/ApplicationInstance.taskLoader", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST),
        'command-application'                 : RequirePlatformScript("task-loaders.lib/src/TaskLoaders/CommandApplication.taskLoader", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST),
        'service-instance'                    : RequirePlatformScript("task-loaders.lib/src/TaskLoaders/ServiceInstance.taskLoader", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST),
        'endpoint-instance'                   : RequirePlatformScript("task-loaders.lib/src/TaskLoaders/EndpointInstance.taskLoader", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST)
    }

    return TaskExecutor({
        taskLoaders
    })
}

module.exports = CreateTaskExecutorMachine