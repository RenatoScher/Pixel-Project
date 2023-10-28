let savedStuff = [];
let history = [];
const historyMax = 15;

let serverTime = 0;

const grid = document.querySelector('#grid');
const inpRow = document.getElementById('rows');
const inpCol = document.getElementById('columns');

let gridSize = [0, 0]


let confirmed = null;
let needConfirm = false; //IMPORTANT: Change this before publoshing
function createConfirm(message) {
    if (!needConfirm) {
        confirmed = true;
        clearConfirm();
        return true;
    }

    confirmed = undefined;

    const confirmDiv = document.createElement('div');
    document.querySelector('body').appendChild(confirmDiv);
    confirmDiv.setAttribute('id', 'confirm');

    const div = document.createElement('div');
    confirmDiv.appendChild(div);

    const p = document.createElement('p');
    div.appendChild(p);
    p.innerText = message;

    const confirm = document.createElement('button');
    div.appendChild(confirm);
    confirm.innerText = 'Confirmar';
    confirm.addEventListener('click', (e) => {
        confirmed = true;
    })

    const cancel = document.createElement('button');
    div.appendChild(cancel);
    cancel.innerText = 'Cancelar';
    cancel.addEventListener('click', (e) => {
        confirmed = false;
    })
}

function clearConfirm() {
    const div = document.querySelector('#confirm');
    if (div) {
        div.remove();
    }

    setTimeout(() => {
        confirmed = null;
    }, 100);
}

function toggleConfirm(inp) {
    needConfirm = inp.checked;
}


function configurarJogo() {
    if (confirmed === null) {
        createConfirm('Tem certeza que deseja resetar o painel? Seu desenho atual pode ser perdido!');
    }

    if(confirmed === undefined) {
        window.setTimeout(configurarJogo, 100);
     } else {

        clearConfirm();

        if (!confirmed) {
            return false;
        }

        cleanHistory();
    
        gridSize[0] = Number(inpRow.value);
        gridSize[1] = Number(inpCol.value);
    
        grid.innerHTML = '';
    
        grid.style.gridTemplateRows = 'repeat('+ gridSize[0] + ', 1fr)';
        grid.style.gridTemplateColumns = 'repeat(' + gridSize[1] + ', 1fr)';
    
        for (let i = 0; i < gridSize[0] * gridSize[1]; i++) {
            createButton();
        }

        saveAction();
     }
}

function createButton(color) {
    let elem = document.createElement('input');
    elem.setAttribute('type', 'button');
    grid.appendChild(elem);
    
    elem.addEventListener('click', changeColor);

    if (typeof color == 'string') {
        elem.style.backgroundColor = color;
    }
}

//Shotout to Dtasev on StackOverflow for this function https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    if (hex.split('(')[0] == 'rgb') {
        return hex;
    } else if (hex == '') {
        return 'rgb(255, 255, 255)';
    }

    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return 'rgb(' + r + ", " + g + ", " + b + ')';
}

//Shotout to Michał Perłakowski on StackOverflow for this function https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')


const colorPicker = document.querySelector('#colorPicker');
function changeColor(e) {
    let button = undefined;
    if (e.type === 'button') {
        button = e;
    } else if (e.target) {
        button = e.target;
    } else {return false;}

    
    const tool = document.querySelector('#toolHandler').querySelector('input[type=radio]:checked').id;

    switch (tool) {
        case 'Paint':
        
        button.style.backgroundColor = colorPicker.value;


        break;
    
        case 'Eraser':
        button.removeAttribute('style');

        break;

        case 'Fill':
        const fillColor = button.style.backgroundColor;

        if (fillColor == colorPicker.value) {
            return true;
        }

        let buttonIndexList = [Array.prototype.indexOf.call(grid.children, button)];
        let addedItems = [Array.prototype.indexOf.call(grid.children, button)];

        while (true) {
            let newList = [];

            for (const i of addedItems) {
                const btn = grid.children[i];

                if (i >= gridSize[1] && !buttonIndexList.includes(i - gridSize[1]) && !newList.includes(i - gridSize[1]) && hexToRgb(fillColor) == hexToRgb(grid.children[i - gridSize[1]].style.backgroundColor)) {
                    newList.push(i - gridSize[1])
                }
                if (i + gridSize[1] < gridSize[0] * gridSize[1] && !buttonIndexList.includes(i + gridSize[1]) && !newList.includes(i + gridSize[1]) && hexToRgb(fillColor) == hexToRgb(grid.children[i + gridSize[1]].style.backgroundColor)) {
                    newList.push(i + gridSize[1]);
                }

                if (i % gridSize[1] > 0 && i != 0 && !buttonIndexList.includes(i - 1) && !newList.includes(i - 1) && hexToRgb(fillColor) == hexToRgb(grid.children[i - 1].style.backgroundColor)) {
                    newList.push(i - 1);
                }
                if (i % gridSize[1] < gridSize[1] - 1 && i != (gridSize[0] * gridSize[1]) - 1 && !buttonIndexList.includes(i + 1) && !newList.includes(i + 1) && hexToRgb(fillColor) == hexToRgb(grid.children[i + 1].style.backgroundColor)) {
                    newList.push(i + 1);
                }
            }

            buttonIndexList = [...buttonIndexList, ...newList];
            addedItems = newList;
            if (newList.length == 0) {
                break;
            }
        }

        addedItems = [];
        for (const i of buttonIndexList) {
            const btn = grid.children[i];
            btn.style.backgroundColor = colorPicker.value;
        }
        buttonIndexList = [];

        saveAction();

        break;

        case 'Eyedropper':
        if (button.style.backgroundColor[0] == '#') {
            colorPicker.value = button.style.backgroundColor
        }
        else if (button.style.backgroundColor == '') {
            colorPicker.value = '#ffffff'
        } else {
            const L = '[' + button.style.backgroundColor.split('(')[1].split(')')[0] + ']';
            const colors = JSON.parse(L);
            colorPicker.value = rgbToHex(colors[0], colors[1], colors[2]);
        }
        document.querySelector('#toolHandler').querySelector('#Paint').checked = true;

        break;
    }


    
}

function selectColor(colorValue) {
    colorPicker.value = colorValue;
}

let holdToPaint = false;
let clickCount = 0;
let mouseHold = undefined;
let mouseDown = 0;
let mousePos = [undefined, undefined];
grid.addEventListener('mousedown', (e) => {
    const tool = document.querySelector('#toolHandler').querySelector('input:checked').id;

    if (clickCount > 1280) {clickCount = 0;}
    clickCount++;

    if (clickCount % 3 == 0 && !holdToPaint && ['Paint', 'Eraser'].includes(tool)) {
        saveAction();
    }

    if (!holdToPaint || mouseHold != undefined || mouseDown == 1 || !['Paint', 'Eraser'].includes(tool)) {
        return false;
    }

    mouseDown++;

    mouseHold = setInterval(() => {
        if (mouseDown != 1) {
            clearInterval();
        }

        const elem = document.elementFromPoint(mousePos[0], mousePos[1]);

        changeColor(elem);
    }, 1);
})
document.addEventListener('mouseup', (e) => {
    if (mouseHold != undefined) {
        clearInterval(mouseHold);
        mouseHold = undefined;
        saveAction();
    }
    mouseDown = 0;
})

document.addEventListener('mousemove', (e) => {
    mousePos[0] = e.clientX;
    mousePos[1] = e.clientY;
})

function changeHoldState(inp) {
    holdToPaint = inp.value;

    if (mouseHold != undefined) {
        clearInterval(mouseHold);
        mouseHold = undefined;
    }
    
}

const showGridButton = document.querySelector('#grid');
function showGrid() {
    showGridButton.classList.toggle('hideGrid');
}

let proportional = false
function fixProportion(btn) {

    if (inpCol.value > 100) {
        inpCol.value = 100;
    }

    if (inpRow.value > 58) {
        inpRow.value = 58;
    }

    if (!proportional) {
        return false;
    }

    if (btn == inpRow) {
        inpCol.value = Math.ceil(inpRow.value * 1.75);
    } else {
        inpRow.value = Math.ceil(inpCol.value / 1.75);
    }
}

function toggleProportion(inp) {
    proportional = inp.checked;

    fixProportion(document.querySelector('#rows'));
}


let historyIndex = 0;
function saveAction() {
    const pixels = grid.children;
    const newResolutionAction = [];
    const newColorsAction = [];

    if (history.length >= historyMax) {
        history.pop();
    }

    if (historyIndex != 0) {
        history.splice(0, historyIndex);
        historyIndex = 0;
    }

    history.unshift([]);
    const newAction = history[0];

    newResolutionAction[0] = gridSize[0];
    newResolutionAction[1] = gridSize[1];

    for (const btn of pixels) {
        const color = btn.style.backgroundColor;
        const lastItem = newColorsAction[newColorsAction.length - 1];
        const penultimate = newColorsAction[newColorsAction.length - 2];

        if (newColorsAction.length == 0) {
            newColorsAction.push(color);
            continue;
        }

        
        if (typeof lastItem === 'number') {

            if (penultimate == color) {
                newColorsAction.pop();
                newColorsAction.push(lastItem + 1);
            } else {
                newColorsAction.push(color);
            }
        } else {
            if (lastItem == color) {
                newColorsAction.push(1);
            } else {
                newColorsAction.push(color);
            }
        }
    }

    newAction[0] = newResolutionAction;
    newAction[1] = newColorsAction;

    console.log(history);
}

function cleanHistory() {
    history = [];
}

function loadAction(increment) {
    if (increment) {
        if (historyIndex + increment < history.length && historyIndex + increment >= 0) {
            historyIndex += increment;
        }
    }

    const loadAction = history[historyIndex];

    const gridSavedSize = loadAction[0];
    const load = loadAction[1];
    grid.innerHTML = '';

    inpRow.value = Number(gridSavedSize[0]);
    inpCol.value = Number(gridSavedSize[1]);
    gridSize[0] = Number(gridSavedSize[0]);
    gridSize[1] = Number(gridSavedSize[1]);

    grid.style.gridTemplateRows = 'repeat('+ gridSavedSize[0] + ', 1fr)';
    grid.style.gridTemplateColumns = 'repeat(' + gridSavedSize[1] + ', 1fr)';

    let last = undefined;
    for (const pixel of load) {
        if (typeof pixel == 'number') {
            for (let i = 0; i < pixel; i++) {
                createButton(last);
            }
        } else {
            if (pixel == '') {
                createButton();
            } else {
                createButton(pixel);
            }
        }


        last = pixel;
    }
}


function saveDrawing(name) {
    const newResolutionSave = history[historyIndex][0];
    const newColorsSave = history[historyIndex][1];

    if (!savedStuff.includes(name)) {
        savedStuff.push(name);
        savedStuff.push([[], []])
    }

    const newSave = savedStuff[savedStuff.indexOf(name) + 1];

    newSave[0] = newResolutionSave;
    newSave[1] = newColorsSave;

    console.log(newSave);

    localStorage.setItem(name, JSON.stringify(newSave));
}


function loadDrawning(name) {
    if (confirmed === null) {
        createConfirm('Tem certeza que deseja carregar o projeto? Seu desenho atual pode ser perdido!');
    }

    if (confirmed === undefined) {
        window.setTimeout(loadDrawning, 100);
    } else {
        clearConfirm();

        if (!confirmed || !savedStuff.includes(name)) {
            return false;
        }

        cleanHistory();

        const loadSave = savedStuff[savedStuff.indexOf(name) + 1];

        const gridSavedSize = loadSave[0];
        const load = loadSave[1];
        grid.innerHTML = '';

        inpRow.value = Number(gridSavedSize[0]);
        inpCol.value = Number(gridSavedSize[1]);
        gridSize[0] = Number(gridSavedSize[0]);
        gridSize[1] = Number(gridSavedSize[1]);

        grid.style.gridTemplateRows = 'repeat('+ gridSavedSize[0] + ', 1fr)';
        grid.style.gridTemplateColumns = 'repeat(' + gridSavedSize[1] + ', 1fr)';

        let last = undefined;
        for (const pixel of load) {
            if (typeof pixel == 'number') {
                for (let i = 0; i < pixel; i++) {
                    createButton(last);
                }
            } else {
                if (pixel == '') {
                    createButton();
                } else {
                    createButton(pixel);
                }
            }


            last = pixel;
        }

        console.log('Loaded!');
    }
}

function getSavedDrawings() {
    savedStuff = [];

    for (let i = 0; i < localStorage.length; i++) {
        const savedName = localStorage.key(i);
        const savedDrawning = localStorage.getItem(savedName);

        if (!savedName) {
            return;
        }

        savedStuff.push(savedName, JSON.parse(savedDrawning));
    }

    console.log(savedStuff);
}

getSavedDrawings();


let lastClickTime = 0;
document.addEventListener('mousedown', () => {
    lastClickTime = serverTime;
})


setInterval(() => {
    serverTime++;
    if (serverTime - lastClickTime == 30 && (history[historyIndex][1][0] == 'rgb(0, 0, 0)') && (history[historyIndex][1][1] == gridSize[0] * gridSize[1] - 1)) {
        grid.classList.toggle('prowler');
        setTimeout(() => {
            grid.classList.toggle('prowler')
        }, 5000);
    }
}, 1000);