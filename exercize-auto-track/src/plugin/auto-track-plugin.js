const { declare } = require('@babel/helper-plugin-utils'); // declare主要提供assertVersion,可以指定版本
const importModule = require('@babel/helper-module-imports'); // 引入模块

const autoTrackPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        visitor: {
            Program: {
                enter (path, state) {
                    path.traverse({ // 遍历方式
                        ImportDeclaration (curPath) { // 对根节点先遍历，ImportDeclaration就是访问的节点
                            const requirePath = curPath.get('source').node.value; // 引入路径
                            if (requirePath === options.trackerPath) { // 和选项中的trackPath一致的话
                                const specifierPath = curPath.get('specifiers.0'); // specifierPath是通过获取specifiers[0]获取的， 可以通过astexplorer查看
                                if (specifierPath.isImportSpecifier()) { // 如果是解构import模式
                                    state.trackerImportId = specifierPath.toString();
                                } else if(specifierPath.isImportNamespaceSpecifier()) { // 如果是命名式引入模式
                                    state.trackerImportId = specifierPath.get('local').toString();
                                }
                                // path.stop(); // 终止遍历
                            }
                        }
                    });
                    if (!state.trackerImportId) { // 如果没有引入过
                        state.trackerImportId  = importModule.addDefault(path, 'tracker',{ // tracker是自定义的一个名字
                            nameHint: path.scope.generateUid('tracker')
                        }).name; // 那就记录一下
                        state.trackerAST = api.template.statement(`${state.trackerImportId}()`)(); // 埋点代码的ast
                    }
                }
            },

            // 有的函数没有函数体，这种要包装一下，然后修改下 return 值。如果有函数体，就直接在开始插入就行了
            'ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration'(path, state) {
                const bodyPath = path.get('body');
                if (bodyPath.isBlockStatement()) { // 有函数体直接插入
                    bodyPath.node.body.unshift(state.trackerAST);
                } else { // 没有函数体包裹一下，处理一下返回值
                    const ast = api.template.statement(`{${state.trackerImportId}();return PREV_BODY;}`)({PREV_BODY: bodyPath.node});
                    bodyPath.replaceWith(ast);
                }
            }
        }
    }
});
module.exports = autoTrackPlugin;
