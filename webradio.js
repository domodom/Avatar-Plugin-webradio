const fs = require('fs-extra');
const {
  Graph
} = require('cyto-avatar');
const {
  remote,
  ipcRenderer
} = require('electron');
const {
  Menu,
  BrowserWindow,
  ipcMain
} = remote;


let cyto;
let CY;
let menu;
let cytoscape;
let webradioWindow;


exports.action = function (data, callback) {

  let client = data.client;
  let iradio; 
  
  if (data.action.radio) iradio = data.action.radio.toUpperCase();

  let tblCommand = {

    openWebradio: function () {

          if (iradio) {
            if (Config.modules.webradio.eradio.hasOwnProperty(iradio)) {
              e_radio = Config.modules.webradio.eradio[iradio];
            }
          } else {
            for (iradio in Config.modules.webradio.eradio) {
              e_radio = Config.modules.webradio.eradio[iradio];
            }
          }
        
      Avatar.speak('Je lance la radio ' + iradio, client, function () {
        Avatar.Speech.end(client);
        displayRadioWin(e_radio);
      });
    },
    stopWebradio: function () {
      if (webradioWindow) {
        Avatar.speak('Je coupe la radio', client, function () {
          Avatar.Speech.end(client);
          webradioWindow.close();
        });
      }
    }
  };

  info("Action WebRadio: ", data.action.command, "de :", client);
  tblCommand[data.action.command]();
  callback();
}

exports.beforeNodeMenu = function (CY, cytoscape) {
  if (menu) {
    menu.destroy();
    menu = null;
  }
}

exports.addPluginElements = function (CY_param, cyto_param) {

  CY = CY_param;
  cytoscape = cyto_param;
  cyto = new Graph(CY, __dirname);
  cyto.loadAllGraphElements()
    .then(elems => {
      if (elems && elems.length > 0) {
        elems.forEach(function (ele) {
          if (ele.hasClass('webradio')) {
            cyto.onClick(ele, (evt) => {
                addCytoMenu(evt);
              })
              .then(elem => {
                if (_.size(Config.modules.webradio.eradio) >= 1) {
                  cyto.onRightClick(elem, (evt) => {
                    webradioContextMenu(evt);
                  })
                }
                 if (openWebRadioWin()) {
                  setTimeout(function () {
                    displayRadioWin();
                  }, 5000);
                 }
              })
          }
        })
      } else {
        addWebradioNode();
      }
    })
    .catch(err => {
      console.log('Error loading Elements', err);
    })
}

exports.onAvatarClose = function (callback) {
  if (cyto) {
    cyto.saveAllGraphElements("webradio")
      .then(() => {
        callback();
      })
      .catch(err => {
        console.log('Error saving Elements', err)
        callback();
      });
  }
}

function openWebRadioWin() {

  let onOff = false;
  if (fs.existsSync('./resources/core/plugins/webradio/style.json')) {
    let prop = fs.readJsonSync('./resources/core/plugins/webradio/style.json', {
      throws: false
    });
    if (prop) onOff = prop.on;
  }
  return onOff;
}

function addWebradioNode() {

  let color = "rgba(56, 255, 0, 0.75)";

  cyto.getGraph()
    .then(cy => cyto.addGraphElement(cy, "webradio"))
    .then(elem => cyto.addElementClass(elem, "webradio"))
    .then(elem => cyto.addElementImage(elem, __dirname + "/assets/images/webradio.png"))
    .then(elem => cyto.addElementBorder(elem, color, 2, 0.75))
    .then(elem => cyto.addElementSize(elem, 38))
    .then(elem => cyto.addElementRenderedPosition(elem, 200, 260))
    .then(elem => cyto.onClick(elem, (evt) => {
      addCytoMenu(evt);
    }))
    .then(elem => {
      cyto.onRightClick(elem, (evt) => {
        webradioContextMenu(evt);
      })
    })
    .catch(err => {
      console.log('err:', err || 'erreur dans la création de l\'élément')
    })
}


function addCytoMenu(elem) {

  if (elem.hasClass('webradio') && menu == null) {

    let defaults = {
      menuRadius: 50, // the radius of the circular menu in pixels
      selector: 'node',
      commands: [],
      fillColor: 'rgba(33, 189, 242, 0.75)', // the background colour of the menu
      // activeFillColor: 'rgba(3, 109, 144, 0.75)', // the colour used to indicate the selected command
      activePadding: 0, // additional size in pixels for the active command
      indicatorSize: 18, // the size in pixels of the pointer to the active command
      separatorWidth: 0, // the empty spacing in pixels between successive commands
      spotlightPadding: 6, // extra spacing in pixels between the element and the spotlight
      minSpotlightRadius: 12, // the minimum radius in pixels of the spotlight
      maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
      openMenuEvents: 'tap', // space-separated cytoscape events that will open the menu; only `tap` work here
      itemColor: 'white', // the colour of text in the command's content
      itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
      zIndex: 9999, // the z-index of the ui div
      atMouse: false // draw menu at mouse position
    };

    // Création du menu
    menu = CY.cxtmenu(defaults);


  } else if (menu) {
    menu.destroy();
    menu = null;
  }
}


function webradioContextMenu(cyto, elem) {

  let RadioListe = [];

  for (let name_radio in Config.modules.webradio.eradio) {
    let e_radio = Config.modules.webradio.eradio[name_radio];
    let icone;
    if (fs.existsSync('resources/core/plugins/webradio/assets/images/radios/' + name_radio.toLowerCase() + '.png')) {
      icone = 'resources/core/plugins/webradio/assets/images/radios/' + name_radio.toLowerCase() + '.png';
    } else {
      icone = 'resources/core/plugins/webradio/assets/images/radio.png';
    }
    let radio = {

      label: name_radio,
      icon: icone,
      click: () => {
        displayRadioWin(e_radio);
      }
    }
    RadioListe.push(radio);
  }
  RadioListe.push({
    type: 'separator'
  });
  RadioListe.push({
    label: 'Fermer',
    icon: 'resources/core/plugins/webradio/assets/images/close.png',
    click: () => {
      if (webradioWindow) {
        webradioWindow.close();
      }
    }
  });

  // Création du menu
  var handler = function (e) {
    e.preventDefault();
    menu.popup({
      window: remote.getCurrentWindow()
    });
    window.removeEventListener('contextmenu', handler, false);
  }
  const menu = Menu.buildFromTemplate(RadioListe);
  window.addEventListener('contextmenu', handler, false);

}

function reload_player(radio) {
  if (webradioWindow) {
    webradioWindow.close();
    setTimeout(() => {
      displayRadioWin(radio);
    }, 3000);
  }
}

function displayRadioWin(e_radio) {

  if (!e_radio) {
    for (let iradio in Config.modules.webradio.eradio) {
      e_radio = Config.modules.webradio.eradio[iradio];
    }
  }

  if (webradioWindow) {
    webradioWindow.show();
    return;
  }

  let id = ipcRenderer.sendSync('info', 'id');
  let win = BrowserWindow.fromId(id);
  let style = {
    parent: win,
    frame: false,
    width: 320,
    height: 140,
    movable: true,
    resizable: false,
    skipTaskbar: false,
    show: false,
    title: 'Web Radio',
    icon: './assets/images/radio.ico',
  }


  webradioWindow = new BrowserWindow(style);
  webradioWindow.loadFile('../core/plugins/webradio/html/radio.html');

  // Affichage de la console en mode détachée ...

  // let devtools = null;
  // devtools = new BrowserWindow()
  // webradioWindow.webContents.setDevToolsWebContents(devtools.webContents)
  // webradioWindow.webContents.openDevTools({ mode: 'detach' })

  ipcRenderer.sendSync('addPluginWindowID', webradioWindow.id);

  webradioWindow.once('ready-to-show', () => {
    webradioWindow.show();
  });

  webradioWindow.on('closed', function () {
    ipcMain.removeAllListeners('webradio');
    ipcMain.removeAllListeners('webradioWinID');
    webradioWindow = null;
  });

  ipcMain.on('webradioWinID', (event, arg) => {
    event.returnValue = webradioWindow.id;
  });

  ipcMain.on('radio', function (event, arg) {
    radio = arg;
    event.returnValue = true;
    reload_player(radio);
  });

  ipcMain.on('config', function (event, arg) {
    liste_radios = [];
    for (let name_radio in Config.modules.webradio.eradio) {
      let e_radio = Config.modules.webradio.eradio[name_radio];
      let radio = {
        radio: name_radio,
        e_radio: e_radio
      }
      liste_radios.push(radio);
    }
    event.returnValue = liste_radios;
  });


  ipcMain.on('webradio', (event, arg) => {
    switch (arg) {
      case 'reload':
        ipcRenderer.sendSync('removePluginWindowID', webradioWindow.id);
        event.returnValue = {
          radio: e_radio
        };
        break;
      case 'infos':
        ipcRenderer.sendSync('removePluginWindowID', webradioWindow.id);
        event.returnValue = {
          radio: e_radio
        };
        break;
      case 'player':
        ipcRenderer.sendSync('removePluginWindowID', webradioWindow.id);
        event.returnValue = true;
        break;
      case 'quit':
        ipcRenderer.sendSync('removePluginWindowID', webradioWindow.id);
        event.returnValue = true;
        webradioWindow.close();
        break;
    }
  })
}