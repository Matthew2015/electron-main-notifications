const electron = require('electron')
const NotificationView = require('./notificationView')

const { remote } = electron

class Notification {
  constructor (title, options) {
    this.mainWindow = remote.getCurrentWindow()
    this.view = new NotificationView(title, options)
    this.view.render()
  }
}

module.exports = Notification
