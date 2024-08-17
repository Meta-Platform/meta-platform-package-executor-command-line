const { resolve } = require("path")

const GetPackageName = (uri) => {
    const [ packageName ] = uri.split('/')
    return packageName
}

const GetLayerURI = (packageName, DEPENDENCY_LIST) => {
    
    const fullPackageURI = DEPENDENCY_LIST
        .find(uri => uri.includes(packageName))

    if (!fullPackageURI) {
        throw `Pacote não encontrado [${packageName}]`
    }
    const layerURI = fullPackageURI.substring(0, fullPackageURI.lastIndexOf("/"))
    return layerURI
    
}

const CreateRequireScript = ({
    ecosystemData, 
    DEPENDENCY_LIST, 
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
}) => {
    

    return (fileURI) => {
        const packageName = GetPackageName(fileURI)
        const layerURI = GetLayerURI(packageName, DEPENDENCY_LIST)
        const filePath = resolve(ecosystemData, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES, layerURI, fileURI)
        return require(filePath)
    }
}

module.exports = CreateRequireScript