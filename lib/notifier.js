const { BrowserWindow, screen } = require('electron');
const isWindows = process.platform === 'win32'
const path = require('path')

// width: 消息宽度、
// height: 消息高度
class Notifier {
  constructor() {
    this.activeNotifications = [];
    this.queue = [];
    this.startBarSizeEstimate = 0;
    this.BrowserWindow = BrowserWindow;
    this.htmlPath = ''
  }

  notify (title, data) {
    const options = Object.assign({}, data);
    const size = screen.getPrimaryDisplay().workAreaSize;
    this.startBarSizeEstimate = (options.height || 80) + 10;
    this.htmlPath = options.htmlPath
    let windowOptions = {
      width: options.width || 400,
      height: options.height || 80,
      x: size.width - (options.width || 400),
      y: 0,
      frame: false,
      // resizable: true,
      // alwaysOnTop: true,
      // skipTaskbar: true,
      webPreferences: {
        devTools: true,
        nodeIntegration: true
      },
      // focusable: false
    };
    if (isWindows) {
      windowOptions.titleBarStyle = 'hidden';
    }
    const notificationWindow = new this.BrowserWindow(windowOptions);
    this.queue.push({
      window: notificationWindow,
      title: title,
      options: options
    });
    this.showNextMessage();
  }

  showNextMessage () {
    if (this.queue.length === 0) {
      return;
    }
    const size = screen.getPrimaryDisplay().workAreaSize;
    var availableHeight = size.height - (isWindows ? this.startBarSizeEstimate : 0);
    for (var j = 0; j < this.activeNotifications.length; j++) {
      availableHeight -= this.activeNotifications[j].window.getBounds().height;
    }
    if (availableHeight < this.queue[0].window.getBounds().height) {
      return;
    }
    const notification = this.queue.shift();
    const title = notification.title;
    const options = notification.options;
    let notificationWindow = notification.window;

    var notificationY = 0;

    for (var i = 0; i < this.activeNotifications.length; i++) {
      var item = this.activeNotifications[i];
      notificationY += item.window.getBounds().height + 10
    }

    this.activeNotifications.push(notification);
    notificationWindow.loadURL('file://' + __dirname + '/assets/notification.html');

    // notificationWindow.loadURL('file://' + __dirname + '/assets/notification.html');
    notificationWindow.webContents.on('did-finish-load', () => {
      notificationWindow.show();
      notificationWindow.webContents.openDevTools();
      notificationWindow.webContents.send('setup', title, options);
    })
    const timeout = setTimeout(() => {
      if (!notificationWindow.isDestroyed()) {
        notificationWindow.close()
      }
    }, options.duration || 200000);

    notificationWindow.setPosition(
      notificationWindow.getPosition()[0],
      isWindows ? size.height - this.startBarSizeEstimate - notificationY : notificationY,
      true
    );

    if (notificationWindow) {
      notificationWindow.on('close', () => {
        this.nextY = 0;
        var loc = this.activeNotifications.indexOf(notification);
        if (loc > -1) {
          this.activeNotifications = this.activeNotifications.filter(function (item) {
            return item.window != this.window;
          }.bind(notification));
        }
        if (notificationWindow) {
          notificationWindow.removeAllListeners();
        }
        for (var i = 0; i < this.activeNotifications.length; i++) {
          var item = this.activeNotifications[i];
          var canMove = true;
          try {
            item.window.getPosition();
          } catch (e) {
            canMove = false;
          }
          if (canMove) {
            console.log("window at index " + [1] + " is moving to position " + this.nextY);
            const size = screen.getPrimaryDisplay().workAreaSize
            // TODO - do a pretty slide up/down to collapse list
            item.window.setPosition(
              item.window.getPosition()[0],
              isWindows ? size.height - this.startBarSizeEstimate - this.nextY : this.nextY,
              true /* TODO : this is electron "animate" param - it's not working on windows */
            );
            var itemHeight = item.window.getBounds().height;
            this.nextY += itemHeight;
          }
        }
        if (this.queue.length) {
          this.showNextMessage();
        }
      });
    }
    this.showNextMessage();
    notificationWindow.on('closed', () => {
      clearTimeout(timeout);
      notificationWindow = null;
    });
  }
}

module.exports = Notifier;
