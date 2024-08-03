
const RequirePlatformScript = require("../RequirePlatformScript")


const CreateTaskExecutorMachine = (ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST) => {
    const TaskExecutor = RequirePlatformScript("task-executor.lib/src/TaskExecutor", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST) 
    const taskLoaders = {
        'install-nodejs-package-dependencies' : RequirePlatformScript("install-nodejs-package-dependencies.lib/src/InstallNodejsPackageDependencies.taskLoader", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST),
        'nodejs-package'                      : RequirePlatformScript("nodejs-package.lib/src/NodeJSPackage.taskLoader", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST),
        'application-instance'                : RequirePlatformScript("application-instance.lib/src/ApplicationInstance.taskLoader", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST),
        'command-application'                 : RequirePlatformScript("command-application.lib/src/CommandApplication.taskLoader", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST),
        'service-instance'                    : RequirePlatformScript("service-instance.lib/src/ServiceInstance.taskLoader", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST),
        'endpoint-instance'                   : RequirePlatformScript("endpoint-instance.lib/src/EndpointInstance.taskLoader", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST)
    }

    return TaskExecutor({
        taskLoaders
    })
}

module.exports = CreateTaskExecutorMachine