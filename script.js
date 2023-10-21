let savedStuff = [
    'Nome',
    [
        [/*Tamanho da tela*/],
        [/*Cores*/]
    ]
];

const grid = document.querySelector('#grid');
const inpRow = document.getElementById('rows');
const inpCol = document.getElementById('columns');


let confirmed = null;
let needConfirm = false;
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

        const inpRow = document.getElementById('rows');
        const inpCol = document.getElementById('columns');
    
        let rows = inpRow.value;
        let columns = inpCol.value;
    
        grid.innerHTML = '';
    
        grid.style.gridTemplateRows = 'repeat('+ rows + ', 1fr)';
        grid.style.gridTemplateColumns = 'repeat(' + columns + ', 1fr)';
    
        for (let i = 0; i < rows * columns; i++) {
            createButton();
        }
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



const colorPicker = document.querySelector('#colorPicker');
function changeColor(e) {
    let button = undefined;
    if (e.type === 'button') {
        button = e;
    } else if (e.target) {
        button = e.target;
    } else {return false;}

    button.style.backgroundColor = colorPicker.value;
}

function selectColor(className) {
    colorPicker.value = className;
}

let holdToPaint = false;
let mouseHold = undefined;
let mousePos = [undefined, undefined];
document.addEventListener('mousedown', (e) => {
    if (!holdToPaint) {
        return false;
    }

    mouseHold = setInterval(() => {
        const elem = document.elementFromPoint(mousePos[0], mousePos[1]);

        changeColor(elem);
    }, 1);
})
document.addEventListener('mouseup', (e) => {
    clearInterval(mouseHold);
    mouseHold = undefined;
})

document.addEventListener('mousemove', (e) => {
    mousePos[0] = e.clientX;
    mousePos[1] = e.clientY;
})

function changeHoldState() {
    if (holdToPaint) {
        holdToPaint = false;
    } else {
        holdToPaint = true;

        if (mouseHold != undefined) {
            clearInterval(mouseHold);
            mouseHold = undefined;
        }
    }
}

const showGridButton = document.querySelector('#grid');
function showGrid() {
    showGridButton.classList.toggle('hideGrid');
}

let proportional = false
function fixProportion(btn) {

    if (inpCol.value > 300) {
        inpCol.value = 300
    }

    if (inpRow.value > 170) {
        inpRow.value = 170
    }

    if (!proportional) {
        return false;
    }

    if (btn == inpRow) {
        inpCol.value = Math.ceil(inpRow.value * 1.75)
    } else {
        inpRow.value = Math.ceil(inpCol.value / 1.75)
    }
}

function toggleProportion(inp) {
    proportional = inp.checked;

    fixProportion(document.querySelector('#rows'));
}


function saveDrawing(name) {
    const pixels = grid.children;
    const newSave = savedStuff[1];
    const newResolutionSave = [];
    const newColorsSave = [];

    newResolutionSave[0] = inpRow.value;
    newResolutionSave[1] = inpCol.value;

    for (const btn of pixels) {
        const color = btn.style.backgroundColor;
        const lastItem = newColorsSave[newColorsSave.length - 1];
        const penultimate = newColorsSave[newColorsSave.length - 2];

        if (newColorsSave.length == 0) {
            newColorsSave.push(color);
            continue;
        }

        
        if (typeof lastItem === 'number') {

            if (penultimate == color) {
                newColorsSave.pop();
                newColorsSave.push(lastItem + 1);
            } else {
                newColorsSave.push(color);
            }
        } else {
            if (lastItem == color) {
                newColorsSave.push(1);
            } else {
                newColorsSave.push(color);
            }
        }
    }

    newSave[0] = newResolutionSave;
    newSave[1] = newColorsSave;

    localStorage.setItem('drawings', JSON.stringify(savedStuff));

    console.log(newSave);
}


function loadDrawning(name) {
    if (confirmed === null) {
        createConfirm('Tem certeza que deseja carregar o projeto? Seu desenho atual pode ser perdido!');
    }

    if (confirmed === undefined) {
        window.setTimeout(loadDrawning, 100);
    } else {
        clearConfirm();

        if (!confirmed) {
            return false;
        }


        const gridSize = savedStuff[1][0];
        const load = savedStuff[1][1];
        grid.innerHTML = '';

        inpRow.value = gridSize[0];
        inpCol.value = gridSize[1];

        grid.style.gridTemplateRows = 'repeat('+ gridSize[0] + ', 1fr)';
        grid.style.gridTemplateColumns = 'repeat(' + gridSize[1] + ', 1fr)';

        let last = undefined;
        for (const pixel of load) {
            if (typeof pixel == 'number') {
                for (let i = 0; i < pixel; i++) {
                    createButton(last);
                }
            } else {
                console.log('pixel: ' + pixel);
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
    const saved = JSON.parse(localStorage.getItem('drawings'));

    if (!saved) {
        return;
    }

    savedStuff = saved;
}

getSavedDrawings();