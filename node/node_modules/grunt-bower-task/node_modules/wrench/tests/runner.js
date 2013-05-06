// `nodeunit tests/runner`
// will run all the tests

module.exports = {
    group_mkdir: require('./mkdir'),
    group_readdir: require('./readdir'),
    group_copydir: require('./copydirsync_unix')
};
