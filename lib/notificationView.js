const { remote } = require('electron')

class NotificationView {
  constructor(title, options) {
    this.element = document.getElementById('notification')
    this.iconEl = document.getElementById('icon')
    this.titleEl = document.getElementById('title11')
    this.messageEl = document.getElementById('message')
    this.closeEl = document.getElementById('close111')
    this.title = title
    this.options = options
  }

  render () {
    this.titleEl.innerHTML = this.title
    this.iconEl.src = this.options.icon || '3iclass-logo.png'

    this.messageEl.innerHTML = this.options.message
    this.setupClose()
    }

  setupClose () {
    this.closeEl.addEventListener('click', (event) => {
      const mainWindow = remote.getCurrentWindow()
      mainWindow.close()
    })
  }
}

module.exports = NotificationView
