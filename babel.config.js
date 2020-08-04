// 这是项目发布阶段要用到的babel插件，去除console语句
const prodolugins = []
if (process.env.NODE_ENV === 'production') {
  prodolugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 发布产品时候的插件数组
    ...prodolugins,
    // 'transform-remove-console'
    // 路由懒加载插件导入
    '@babel/plugin-syntax-dynamic-import'
  ]
}
