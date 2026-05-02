import * as THREE from 'three';
import { VisualizadorOrdenacao } from './VisualizadorOrdenacao.js';
import { VisualizadorPilha } from './VisualizadorPilha.js';
import { VisualizadorFila } from './VisualizadorFila.js';
import { VisualizadorLista } from './VisualizadorLista.js';
import { VisualizadorArvore } from './VisualizadorArvore.js';
import { VisualizadorGrafo } from './VisualizadorGrafo.js';
import { VisualizadorMatriz } from './VisualizadorMatriz.js';

let cena, renderizador, cameraAtiva, cameraPersp, cameraOrtho;
let estruturaAtual = null, tipoAtual = '';

function inicializar() {
    cena = new THREE.Scene();
    cena.background = new THREE.Color(0x050505);

    const aspect = window.innerWidth / window.innerHeight;

    cameraPersp = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    cameraPersp.position.set(0, 10, 15);

    const d = 12;
    cameraOrtho = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    cameraOrtho.position.set(0, 25, 0);
    cameraOrtho.lookAt(0, 0, 0);

    cameraAtiva = cameraPersp;

    renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderizador.domElement);

    window.setEstrutura('ordenacao');
    configurarEventosGUI();

    window.addEventListener('keydown', (e) => {
        const tecla = e.key.toLowerCase();

        if (tecla === 'c') {
            cameraAtiva = (cameraAtiva === cameraPersp) ? cameraOrtho : cameraPersp;
        }

        if (tecla === 'w') {
            if (tipoAtual === 'arvore') {
                document.getElementById('btn-add-arvore')?.click();
            } else if (tipoAtual === 'pilha' || tipoAtual === 'fila' || tipoAtual === 'lista') {
                document.getElementById('btn-add-linear')?.click();
            }
        }

        if (tecla === 's') {
            if (tipoAtual === 'arvore') {
                document.getElementById('btn-remove-arvore')?.click();
            } else if (tipoAtual === 'pilha' || tipoAtual === 'fila' || tipoAtual === 'lista') {
                document.getElementById('btn-remove-linear')?.click();
            }
        }
    });

    window.addEventListener('resize', tratarRedimensionamento);
    animar();
}

function limparCena() {
    if (estruturaAtual && estruturaAtual.limpar) {
        estruturaAtual.limpar();
    }

    while (cena && cena.children.length > 0) {
        const obj = cena.children[0];

        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(m => m.dispose());
            } else {
                obj.material.dispose();
            }
        }

        cena.remove(obj);
    }

    const luzDir = new THREE.DirectionalLight(0xffffff, 2);
    luzDir.position.set(5, 10, 7);
    cena.add(luzDir);

    cena.add(new THREE.AmbientLight(0x404040, 2.5));
    cena.add(new THREE.GridHelper(25, 25, 0x333333, 0x111111));
}

window.setEstrutura = (tipo) => {
    limparCena();
    tipoAtual = tipo;

    const pOrd = document.getElementById('panel-ordenacao');
    const pLin = document.getElementById('panel-linear');
    const pArv = document.getElementById('panel-arvore');
    const pGra = document.getElementById('panel-grafo');
    const pMat = document.getElementById('panel-matriz');

    const sFila = document.getElementById('select-tipo-fila');
    const sLista = document.getElementById('select-tipo-lista');
    const sArvore = document.getElementById('select-tipo-arvore');

    const tLinear = document.getElementById('titulo-linear');
    const inputsLista = document.getElementById('inputs-lista');

    pOrd?.classList.add('hidden');
    pLin?.classList.add('hidden');
    pArv?.classList.add('hidden');
    pGra?.classList.add('hidden');
    pMat?.classList.add('hidden');

    sFila?.classList.add('hidden');
    sLista?.classList.add('hidden');
    inputsLista?.classList.add('hidden');

    switch (tipo) {
        case 'ordenacao':
            estruturaAtual = new VisualizadorOrdenacao(cena, 15);
            pOrd?.classList.remove('hidden');
            break;

        case 'pilha':
            estruturaAtual = new VisualizadorPilha(cena);
            pLin?.classList.remove('hidden');
            if (tLinear) tLinear.innerText = 'Operações Pilha';
            break;

        case 'fila':
            estruturaAtual = new VisualizadorFila(cena);
            pLin?.classList.remove('hidden');
            sFila?.classList.remove('hidden');
            if (tLinear) tLinear.innerText = 'Operações Fila';
            break;

        case 'lista':
            estruturaAtual = new VisualizadorLista(cena);
            pLin?.classList.remove('hidden');
            sLista?.classList.remove('hidden');
            inputsLista?.classList.remove('hidden');
            if (tLinear) tLinear.innerText = 'Lista Encadeada';
            break;

        case 'arvore':
            estruturaAtual = new VisualizadorArvore(cena);
            pArv?.classList.remove('hidden');
            if (sArvore && estruturaAtual.setTipo) {
                estruturaAtual.setTipo(sArvore.value);
            }
            break;

        case 'grafo':
            estruturaAtual = new VisualizadorGrafo(cena);
            estruturaAtual.desenhar();
            pGra?.classList.remove('hidden');
            break;

        case 'matriz':
            estruturaAtual = new VisualizadorMatriz(cena);
            estruturaAtual.desenhar();
            pMat?.classList.remove('hidden');
            break;
    }

    cameraPersp.position.set(0, 10, 15);
    cameraPersp.lookAt(0, 0, 0);
    cameraAtiva = cameraPersp;
};

function configurarEventosGUI() {
    document.getElementById('btn-start-auto').onclick = () => {
        estruturaAtual.passoAPasso = false;
        document.getElementById('btn-next-step').classList.add('hidden');
        iniciarSort();
    };

    document.getElementById('btn-start-step').onclick = () => {
        estruturaAtual.passoAPasso = true;
        document.getElementById('btn-next-step').classList.remove('hidden');
        iniciarSort();
    };

    document.getElementById('btn-next-step').onclick = () => {
        if (estruturaAtual.passoAPasso) estruturaAtual.proximoPasso = true;
    };

    document.getElementById('btn-reset-sort').onclick = () => {
        window.setEstrutura('ordenacao');
    };

    document.getElementById('btn-pause-sort').onclick = () => {
        estruturaAtual.pausado = !estruturaAtual.pausado;
    };

    document.getElementById('sort-speed').oninput = (e) => {
        if (estruturaAtual.setVelocidade) estruturaAtual.setVelocidade(e.target.value);
    };

    function iniciarSort() {
        const algo = document.getElementById('select-sort').value;
        if (estruturaAtual[algo + 'Sort']) estruturaAtual[algo + 'Sort']();
    }

    document.getElementById('btn-add-linear').onclick = () => {
        const valStr = document.getElementById('input-valor')?.value ?? '';
        const idxStr = document.getElementById('input-indice')?.value ?? '';

        const valor = valStr === '' ? null : parseInt(valStr);
        const idx = idxStr === '' ? -1 : parseInt(idxStr);

        if (tipoAtual === 'pilha') {
            estruturaAtual.empilhar();
        } else if (tipoAtual === 'fila') {
            estruturaAtual.inserir();
        } else if (tipoAtual === 'lista') {
            estruturaAtual.inserir(valor, idx);
        }
    };

    document.getElementById('btn-remove-linear').onclick = () => {
        const idxStr = document.getElementById('input-indice')?.value ?? '';
        const idx = idxStr === '' ? 0 : parseInt(idxStr);

        if (tipoAtual === 'pilha') {
            estruturaAtual.desempilhar();
        } else if (tipoAtual === 'fila') {
            estruturaAtual.remover();
        } else if (tipoAtual === 'lista') {
            estruturaAtual.remover(idx);
        }
    };

    document.getElementById('btn-buscar-linear').onclick = () => {
        if (!estruturaAtual || !estruturaAtual.buscar) return;

        const valStr = document.getElementById('input-valor')?.value ?? '';
        const valorAlvo = valStr === '' ? null : parseInt(valStr);

        if (tipoAtual === 'pilha') {
            estruturaAtual.buscar();
        } else if (tipoAtual === 'fila') {
            estruturaAtual.buscar(valorAlvo);
        } else if (tipoAtual === 'lista') {
            estruturaAtual.buscar(valorAlvo);
        }
    };

    document.getElementById('btn-reset-linear').onclick = () => {
        if (estruturaAtual && estruturaAtual.limpar) {
            estruturaAtual.limpar();
        }

        const inputValor = document.getElementById('input-valor');
        const inputIndice = document.getElementById('input-indice');
        if (inputValor) inputValor.value = '';
        if (inputIndice) inputIndice.value = '';
    };

    document.getElementById('select-tipo-fila').onchange = (e) => {
        if (tipoAtual === 'fila' && estruturaAtual.setTipo) {
            estruturaAtual.setTipo(e.target.value);
        }
    };

    document.getElementById('select-tipo-lista').onchange = (e) => {
        if (tipoAtual === 'lista' && estruturaAtual.setTipo) {
            estruturaAtual.setTipo(e.target.value);
        }
    };

    const selectTipoArvore = document.getElementById('select-tipo-arvore');
    const btnGerarArvore = document.getElementById('btn-gerar-arvore');
    const btnResetArvore = document.getElementById('btn-reset-arvore');
    const btnAddArvore = document.getElementById('btn-add-arvore');
    const btnRemoveArvore = document.getElementById('btn-remove-arvore');
    const btnBuscarArvore = document.getElementById('btn-buscar-arvore');
    const btnResetGrafo = document.getElementById('btn-reset-grafo');
    const btnResetMatriz = document.getElementById('btn-reset-matriz');

    if (selectTipoArvore) {
        selectTipoArvore.onchange = (e) => {
            if (tipoAtual === 'arvore' && estruturaAtual.setTipo) {
                estruturaAtual.setTipo(e.target.value);
            }
        };
    }

    if (btnGerarArvore) {
        btnGerarArvore.onclick = () => {
            if (tipoAtual === 'arvore' && estruturaAtual.desenharExemplo) {
                estruturaAtual.desenharExemplo();
            }
        };
    }

    if (btnResetArvore) {
        btnResetArvore.onclick = () => {
            if (tipoAtual !== 'arvore' || !estruturaAtual) return;

            if (estruturaAtual.zerar) estruturaAtual.zerar();
            else if (estruturaAtual.limpar) estruturaAtual.limpar();

            const input = document.getElementById('input-valor-arvore');
            if (input) input.value = '';
        };
    }

    if (btnAddArvore) {
        btnAddArvore.onclick = () => {
            if (tipoAtual !== 'arvore') return;
            const valStr = document.getElementById('input-valor-arvore')?.value ?? '';
            const valor = valStr === '' ? null : parseInt(valStr);
            if (estruturaAtual.inserir) estruturaAtual.inserir(valor);
        };
    }

    if (btnRemoveArvore) {
        btnRemoveArvore.onclick = () => {
            if (tipoAtual !== 'arvore') return;
            const valStr = document.getElementById('input-valor-arvore')?.value ?? '';
            const valor = valStr === '' ? null : parseInt(valStr);
            if (estruturaAtual.remover) estruturaAtual.remover(valor);
        };
    }

    if (btnBuscarArvore) {
        btnBuscarArvore.onclick = () => {
            if (tipoAtual !== 'arvore') return;
            const valStr = document.getElementById('input-valor-arvore')?.value ?? '';
            const valor = valStr === '' ? null : parseInt(valStr);
            if (estruturaAtual.buscar) estruturaAtual.buscar(valor);
        };
    }

    if (btnResetGrafo) {
        btnResetGrafo.onclick = () => {
            if (tipoAtual === 'grafo' && estruturaAtual.limpar) {
                estruturaAtual.limpar();
                estruturaAtual.desenhar();
            }
        };
    }

    if (btnResetMatriz) {
        btnResetMatriz.onclick = () => {
            if (tipoAtual === 'matriz' && estruturaAtual) {
                estruturaAtual.limpar();
                estruturaAtual.desenhar();
            }
        };
    }

    document.getElementById('btn-dijkstra').onclick = () => {
        if (tipoAtual === 'grafo' && estruturaAtual.rodarDijkstra) {
            estruturaAtual.rodarDijkstra();
        }
    };

    document.getElementById('btn-bellman').onclick = () => {
        if (tipoAtual === 'grafo' && estruturaAtual.rodarBellmanFord) {
            estruturaAtual.rodarBellmanFord();
        }
    };
}

function tratarRedimensionamento() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    renderizador.setSize(w, h);

    cameraPersp.aspect = w / h;
    cameraPersp.updateProjectionMatrix();

    const d = 12;
    const aspect = w / h;
    cameraOrtho.left = -d * aspect;
    cameraOrtho.right = d * aspect;
    cameraOrtho.top = d;
    cameraOrtho.bottom = -d;
    cameraOrtho.updateProjectionMatrix();
}

function animar() {
    requestAnimationFrame(animar);
    renderizador.render(cena, cameraAtiva);
}

inicializar();