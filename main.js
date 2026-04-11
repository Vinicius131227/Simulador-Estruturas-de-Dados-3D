import * as THREE from 'three';
import { VisualizadorOrdenacao } from './VisualizadorOrdenacao.js';
import { VisualizadorPilha } from './VisualizadorPilha.js';
import { VisualizadorFila } from './VisualizadorFila.js';
import { VisualizadorArvore } from './VisualizadorArvore.js';
import { VisualizadorGrafo } from './VisualizadorGrafo.js';
import { VisualizadorMatriz } from './VisualizadorMatriz.js';

let cena, renderizador, cameraAtiva, cameraPersp, cameraOrtho;
let estruturaAtual = null;
let tipoAtual = '';

function inicializar() {
    cena = new THREE.Scene();
    cena.background = new THREE.Color(0x050505);
    const aspect = window.innerWidth / window.innerHeight;

    cameraPersp = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    cameraPersp.position.set(0, 10, 15);

    const d = 12;
    cameraOrtho = new THREE.OrthographicCamera(-d*aspect, d*aspect, d, -d, 1, 1000);
    cameraOrtho.position.set(0, 25, 0);
    cameraOrtho.lookAt(0,0,0);

    cameraAtiva = cameraPersp;

    renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderizador.domElement);

    // Configurar a primeira estrutura
    window.setEstrutura('ordenacao');
    
    // Ligar os botões do HTML
    configurarEventosGUI();

    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'c') cameraAtiva = (cameraAtiva === cameraPersp) ? cameraOrtho : cameraPersp;
    });
    
    window.addEventListener('resize', tratarRedimensionamento);
    animar();
}

function limparCena() {
    if (estruturaAtual && estruturaAtual.limpar) estruturaAtual.limpar();
    while(cena.children.length > 0) { 
        const obj = cena.children[0];
        if(obj.geometry) obj.geometry.dispose();
        if(obj.material) obj.material.dispose();
        cena.remove(obj); 
    }
    const luz = new THREE.DirectionalLight(0xffffff, 2);
    luz.position.set(5, 10, 7);
    cena.add(luz);
    cena.add(new THREE.AmbientLight(0x404040, 2.5));
    cena.add(new THREE.GridHelper(20, 20, 0x333333, 0x111111));
}

window.setEstrutura = (tipo) => {
    limparCena();
    tipoAtual = tipo;
    
    // Esconder todos os painéis primeiro
    document.getElementById('panel-ordenacao').classList.add('hidden');
    document.getElementById('panel-linear').classList.add('hidden');
    document.getElementById('panel-grafo').classList.add('hidden');

    switch(tipo) {
        case 'ordenacao': 
            estruturaAtual = new VisualizadorOrdenacao(cena, 15); 
            document.getElementById('panel-ordenacao').classList.remove('hidden');
            break;
        case 'pilha': 
            estruturaAtual = new VisualizadorPilha(cena); 
            document.getElementById('panel-linear').classList.remove('hidden');
            break;
        case 'fila': 
            estruturaAtual = new VisualizadorFila(cena); 
            document.getElementById('panel-linear').classList.remove('hidden');
            break;
        case 'arvore': 
            estruturaAtual = new VisualizadorArvore(cena); 
            estruturaAtual.gerarArvore(0, 6, 0, 0); 
            break;
        case 'grafo': 
            estruturaAtual = new VisualizadorGrafo(cena); 
            estruturaAtual.desenhar(); 
            document.getElementById('panel-grafo').classList.remove('hidden');
            break;
        case 'matriz':
            estruturaAtual = new VisualizadorMatriz(cena);
            estruturaAtual.desenhar();
            break;
    }
    cameraPersp.position.set(0, 10, 15);
    cameraPersp.lookAt(0,0,0);
};

function configurarEventosGUI() {
    // BOTÕES DE ORDENAÇÃO
    document.getElementById('btn-start-auto').onclick = () => {
        if (tipoAtual === 'ordenacao') {
            estruturaAtual.passoAPasso = false;
            document.getElementById('btn-next-step').classList.add('hidden');
            executarAlgoritmoOrdenacao();
        }
    };

    document.getElementById('btn-start-step').onclick = () => {
        if (tipoAtual === 'ordenacao') {
            estruturaAtual.passoAPasso = true;
            document.getElementById('btn-next-step').classList.remove('hidden');
            executarAlgoritmoOrdenacao();
        }
    };

    document.getElementById('btn-next-step').onclick = () => {
        if (estruturaAtual && estruturaAtual.passoAPasso) {
            estruturaAtual.proximoPasso = true;
        }
    };

    document.getElementById('btn-pause-sort').onclick = () => {
        if (estruturaAtual) estruturaAtual.pausado = !estruturaAtual.pausado;
    };

    document.getElementById('btn-reset-sort').onclick = () => {
        window.setEstrutura('ordenacao');
    };

    document.getElementById('sort-speed').oninput = (e) => {
        if (estruturaAtual && estruturaAtual.setVelocidade) {
            estruturaAtual.setVelocidade(e.target.value);
        }
    };

    function executarAlgoritmoOrdenacao() {
        const algo = document.getElementById('select-sort').value;
        if (algo === 'bubble') estruturaAtual.bubbleSort();
        if (algo === 'selection') estruturaAtual.selectionSort();
        if (algo === 'insertion') estruturaAtual.insertionSort();
        if (algo === 'quick') estruturaAtual.quickSort();
        if (algo === 'heap') estruturaAtual.heapSort();
    }

    // BOTÕES DE PILHA/FILA
    document.getElementById('btn-add').onclick = () => {
        if (estruturaAtual.empilhar) estruturaAtual.empilhar();
        if (estruturaAtual.enfileirar) estruturaAtual.enfileirar();
    };
    document.getElementById('btn-remove').onclick = () => {
        if (estruturaAtual.desempilhar) estruturaAtual.desempilhar();
        if (estruturaAtual.desenfileirar) estruturaAtual.desenfileirar();
    };

    // BOTÕES DE GRAFO
    document.getElementById('btn-dijkstra').onclick = () => {
        if (tipoAtual === 'grafo') estruturaAtual.rodarDijkstra();
    };
    document.getElementById('btn-bellman').onclick = () => {
        if (tipoAtual === 'grafo') estruturaAtual.rodarBellmanFord();
    };
}

function tratarRedimensionamento() {
    renderizador.setSize(window.innerWidth, window.innerHeight);
    cameraPersp.aspect = window.innerWidth / window.innerHeight;
    cameraPersp.updateProjectionMatrix();
}

function animar() {
    requestAnimationFrame(animar);
    renderizador.render(cena, cameraAtiva);
}

inicializar();