module.exports = {
    hooks: {
        readPackage
    }
}

function readPackage(pkg) {
    if (pkg.name === 'accord') {
        pkg.dependencies = {
            less: '*'
        }
    }
    return pkg
}