const GetRepositories = require("./GetRepositories")
const { resolve, normalize } = require("path")

const DEPENDENCY_REFERENCES = require("../Configs/dependency-references.json")

const GetPackageName = (uri) => {
    const [ packageName ] = uri.split('/')
    return packageName
}

const GetLayerPath = (packageName, dependencies) => {
    
    const fullPackagePath = dependencies
        .find(uri => {
            const [ _packageName ] = uri.split("/").reverse()
            return _packageName === packageName
        })

    if (!fullPackagePath) {
        throw `Pacote não encontrado [${packageName}]`
    }
    const packagePath = fullPackagePath.substring(0, fullPackagePath.lastIndexOf("/"))
    return packagePath

}

const ConverteReferenceToPath = (packageReference, registeredRepositories) => {

    const [ repoNamespace ] = packageReference.split("/")
    const registeredRepository = registeredRepositories[repoNamespace]
    const packagePath = normalize(packageReference.replace(repoNamespace, registeredRepository.installationPath))
    return packagePath

}

const ResolveDependenciesReference = async ({
    REPOS_CONF_FILENAME_REPOS_DATA,
    ecosystemData
}) => {

    const registeredRepositories = await GetRepositories({
        installDataDirPath: ecosystemData,
        REPOS_CONF_FILENAME_REPOS_DATA
    })

    return DEPENDENCY_REFERENCES.map((packageReference) => ConverteReferenceToPath(packageReference, registeredRepositories))

}

const CreateScriptLoader = async ({
    ecosystemData,
    REPOS_CONF_FILENAME_REPOS_DATA,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
}) => {

    const resolvedDependencyPathList = await ResolveDependenciesReference({
        REPOS_CONF_FILENAME_REPOS_DATA,
        ecosystemData
    })

    return (fileURI) => {
        const packageName = GetPackageName(fileURI)
        const packagePath = GetLayerPath(packageName, resolvedDependencyPathList)
        const filePath = resolve(packagePath, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES, packagePath, fileURI)
        return require(filePath)
    }
    
}

module.exports = CreateScriptLoader