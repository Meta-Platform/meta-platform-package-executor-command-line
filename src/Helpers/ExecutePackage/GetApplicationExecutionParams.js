const { join } = require("path")

const RequirePlatformScript = require("../RequirePlatformScript")


const GetApplicationExecutionParams = async ({
    environmentPath,
    metadataHierarchy,
    commandLineArgs,
    executableName,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES,
    ECO_DIRPATH_MAIN_REPO,
    DEPENDENCY_LIST
}) => {
    
    const [
        TranslateMetadataHierarchyForExecutionParams, 
        WriteObjectToFile
    ] = [
        RequirePlatformScript("execution-params-generator.lib/src/TranslateMetadataHierarchyForExecutionParams", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST),
        RequirePlatformScript("utilities.lib/src/WriteObjectToFile", ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST)
    ]

    const applicationExecutionParams = TranslateMetadataHierarchyForExecutionParams({
        metadataHierarchy, 
        environmentPath,
        commandLineArgs,
        executableName,
        EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
    })

    await WriteObjectToFile(join(environmentPath, "execution-params.json"), applicationExecutionParams)
    return applicationExecutionParams
}

module.exports = GetApplicationExecutionParams