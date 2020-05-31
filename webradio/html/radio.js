const {
    ipcRenderer,
    remote
} = require('electron');
const {
    ipcMain,
    BrowserWindow
} = remote;


let list_radio = document.getElementById("list");
let radio;

window.onload = function () {

    let windowTopBar = document.createElement('div');
        windowTopBar.style.width = "100%";
        windowTopBar.style.height = "32px";
        windowTopBar.style.backgroundColor = "#1aa181";
        windowTopBar.style.position = "absolute";
        windowTopBar.style.top = windowTopBar.style.left = 0;
        windowTopBar.style.webkitAppRegion = "drag";
    document.body.appendChild(windowTopBar);

    let tab_radio = ipcRenderer.sendSync('config', 'liste_radios');

    document.getElementById('ui').setAttribute('data-playstation', radio);
    document.getElementById('exit').style.visibility = 'visible';
    document.getElementById('list').style.visibility = 'visible';

    if (!radio) {
        let val_radio = ipcRenderer.sendSync('webradio', 'infos');
        radio = val_radio.radio;
    }

    let select = document.getElementById('list');

    for (let i in tab_radio) {
        let opt = tab_radio[i]['radio'];
        let opt1 = tab_radio[i]['e_radio'];

        let el = document.createElement('option');
        el.textContent = opt;
        el.value = opt1;
        select.appendChild(el);
    }

    research_radio();

    setTimeout(function () {
        let share = document.getElementsByClassName("rde-share-popup")[0];
        share.parentNode.removeChild(share);

        let open = document.getElementsByClassName("rde-open-popup")[0];
        open.parentNode.removeChild(open);

        let radiolink = document.getElementsByClassName('rde-top-bar-logotype')[0];
        radiolink.remove();   
             
    }, 1500);


    ipcRenderer.sendSync('webradio', 'player');

}


document.getElementById('exit').addEventListener('click', function () {
    close();
});


document.getElementById('list').addEventListener('change', function () {
    radio = list_radio.options[list_radio.selectedIndex].value
    let reponse = ipcRenderer.sendSync('radio', radio)
})


function close() {
    ipcRenderer.sendSync('webradio', 'quit');
}

function research_radio() {
    document.getElementById('ui').setAttribute('data-playstation', radio);
    let s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.id = "radio-de-embedded";
    s.src = "https://www.radio.fr/inc/microsite/js/full.js";
    document.getElementsByTagName("head")[0].appendChild(s);
}