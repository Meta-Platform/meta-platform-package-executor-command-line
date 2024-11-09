const { join } = require("path")

const CreateScriptLoader = require("../CreateScriptLoader")

const GetApplicationExecutionParams = async ({
    environmentPath,
    metadataHierarchy,
    commandLineArgs,
    executableName,
    REPOS_CONF_FILENAME_REPOS_DATA,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
    ecosystemData
}) => {
    
    const LoaderScript = await CreateScriptLoader({
        ecosystemData,
        REPOS_CONF_FILENAME_REPOS_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
    })

    const [
        TranslateMetadataHierarchyForExecutionParams, 
        WriteObjectToFile
    ] = [
        LoaderScript("execution-params-generator.lib/src/TranslateMetadataHierarchyForExecutionParams"),
        LoaderScript("json-file-utilities.lib/src/WriteObjectToFile")
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