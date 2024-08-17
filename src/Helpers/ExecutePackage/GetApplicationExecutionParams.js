const { join } = require("path")

const CreateRequireScript = require("../CreateRequireScript")


const GetApplicationExecutionParams = async ({
    environmentPath,
    metadataHierarchy,
    commandLineArgs,
    executableName,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
    ecosystemData,
    DEPENDENCY_LIST
}) => {
    
    const RequireScript = CreateRequireScript({
        ecosystemData, 
        DEPENDENCY_LIST, 
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
    })

    const [
        TranslateMetadataHierarchyForExecutionParams, 
        WriteObjectToFile
    ] = [
        RequireScript("execution-params-generator.lib/src/TranslateMetadataHierarchyForExecutionParams"),
        RequireScript("json-file-utilities.lib/src/WriteObjectToFile")
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