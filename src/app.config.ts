export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/production/index',
    'pages/frying/index',
    'pages/delivery/index',
    'pages/accounting/index',
    'pages/soaking/index',
    'pages/grinding/index',
    'pages/coagulating/index',
    'pages/pressing/index',
    'pages/batch/index',
    'pages/customerLedger/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F5A623',
    navigationBarTitleText: '豆香坊作坊',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFF8E7'
  },
  tabBar: {
    color: '#A1887F',
    selectedColor: '#F5A623',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/production/index',
        text: '生产'
      },
      {
        pagePath: 'pages/frying/index',
        text: '卤炸'
      },
      {
        pagePath: 'pages/delivery/index',
        text: '配送'
      },
      {
        pagePath: 'pages/accounting/index',
        text: '记账'
      }
    ]
  }
})
