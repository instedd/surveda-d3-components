module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'SurvedaD3Components',
      externals: {
        react: 'React'
      }
    }
  }
}
