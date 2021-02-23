const Notification = require('../notification')

const { ipcRenderer } = require('electron')

ipcRenderer.on('setup', (event, title, options) => {
  new Notification(title, options)
  document.body.style.setProperty('--primary', options.pramary || '#000')
  document.body.style.setProperty('--primary-rgb', options.pramaryRgb || 'rgba(148, 160, 255, 0.95)')
  document.body.style.setProperty('--primary-rgbl', options.pramaryRgbl || 'rgba(189, 199, 255, 0.95)')
})
