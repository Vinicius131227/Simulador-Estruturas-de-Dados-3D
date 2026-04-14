import * as THREE from 'three';
import { VisualizadorOrdenacao } from './VisualizadorOrdenacao.js';
import { VisualizadorPilha } from './VisualizadorPilha.js';
import { VisualizadorFila } from './VisualizadorFila.js';
import { VisualizadorArvore } from './VisualizadorArvore.js';
import { VisualizadorGrafo } from './VisualizadorGrafo.js';
import { VisualizadorMatriz } from './VisualizadorMatriz.js';

let cena, renderizador, cameraAtiva, cameraPersp, cameraOrtho;
let estruturaAtual = null, tipoAtual = '';

function inicializar() {
    // Configuração da Cena
    cena = new THREE.Scene();
    cena.background = new THREE.Color(0x050505);
    const aspect = window.innerWidth / window.innerHeight;

    // Câmeras
    cameraPersp = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    cameraPersp.position.set(0, 10, 15);

    const d = 12;
    cameraOrtho = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    cameraOrtho.position.set(0, 25, 0);
    cameraOrtho.lookAt(0, 0, 0);

    cameraAtiva = cameraPersp;

    // Renderizador
    renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderizador.domElement);

    // Inicialização
    window.setEstrutura('ordenacao');
    configurarEventosGUI();

    // Listeners
    window.addEventListener('keydown', (e) => {
        const tecla = e.key.toLowerCase();
        if (tecla === 'c') cameraAtiva = (cameraAtiva === cameraPersp) ? cameraOrtho : cameraPersp;
        
        // Atalhos de teclado (W e S) para adicionar/remover
        if (tecla === 'w') document.getElementById('btn-add').click();
        if (tecla === 's') document.getElementById('btn-remove').click();
    });
    
    window.addEventListener('resize', () => {
        const largura = window.innerWidth;
        const altura = window.innerHeight;
        renderizador.setSize(largura, altura);
        cameraPersp.aspect = largura / altura;
        cameraPersp.updateProjectionMatrix();
        
        const aspectOrtho = largura / altura;
        cameraOrtho.left = -d * aspectOrtho;
        cameraOrtho.right = d * aspectOrtho;
        cameraOrtho.updateProjectionMatrix();
    });

    animar();
}

// Limpa a cena e instancia a nova classe
window.setEstrutura = (tipo) => {
    // Limpeza
    if (estruturaAtual && estruturaAtual.limpar) estruturaAtual.limpar();
    while(cena.children.length > 0) {
        const obj = cena.children[0];
        if(obj.geometry) obj.geometry.dispose();
        if(obj.material) obj.material.dispose();
        cena.remove(obj);
    }
    
    // Recriar Luzes e Grade
    const luzDirecional = new THREE.DirectionalLight(0xffffff, 2);
    luzDirecional.position.set(5, 10, 7);
    cena.add(luzDirecional);
    cena.add(new THREE.AmbientLight(0x404040, 2.5));
    cena.add(new THREE.GridHelper(25, 25, 0x333333, 0x111111));

    tipoAtual = tipo;

    // Gerenciamento de Painéis do HTML
    const pOrd = document.getElementById('panel-ordenacao');
    const pLin = document.getElementById('panel-linear');
    const pGra = document.getElementById('panel-grafo');
    const sFila = document.getElementById('select-tipo-fila');
    const tLinear = document.getElementById('titulo-linear');

    // Resetar visibilidade
    pOrd.classList.add('hidden'); 
    pLin.classList.add('hidden'); 
    pGra.classList.add('hidden'); 
    sFila.classList.add('hidden');

    switch(tipo) {
        case 'ordenacao': 
            estruturaAtual = new VisualizadorOrdenacao(cena, 15); 
            pOrd.classList.remove('hidden'); 
            break;
        case 'pilha': 
            estruturaAtual = new VisualizadorPilha(cena); 
            pLin.classList.remove('hidden');
            tLinear.innerText = "Operações Pilha";
            break;
        case 'fila': 
            estruturaAtual = new VisualizadorFila(cena); 
            pLin.classList.remove('hidden');
            sFila.classList.remove('hidden'); // Mostra o seletor de tipos de fila
            tLinear.innerText = "Operações Fila";
            break;
        case 'arvore': 
            estruturaAtual = new VisualizadorArvore(cena); 
            estruturaAtual.gerarArvore(0, 6, 0, 0); 
            break;
        case 'grafo': 
            estruturaAtual = new VisualizadorGrafo(cena); 
            estruturaAtual.desenhar(); 
            pGra.classList.remove('hidden'); 
            break;
        case 'matriz': 
            estruturaAtual = new VisualizadorMatriz(cena); 
            estruturaAtual.desenhar(); 
            break;
    }
};

function configurarEventosGUI() {
    // --- ORDENAÇÃO ---
    document.getElementById('btn-start-auto').onclick = () => {
        if (tipoAtual === 'ordenacao') {
            estruturaAtual.passoAPasso = false;
            document.getElementById('btn-next-step').classList.add('hidden');
            const algo = document.getElementById('select-sort').value;
            if (estruturaAtual[algo + 'Sort']) estruturaAtual[algo + 'Sort']();
        }
    };

    document.getElementById('btn-start-step').onclick = () => {
        if (tipoAtual === 'ordenacao') {
            estruturaAtual.passoAPasso = true;
            document.getElementById('btn-next-step').classList.remove('hidden');
            const algo = document.getElementById('select-sort').value;
            if (estruturaAtual[algo + 'Sort']) estruturaAtual[algo + 'Sort']();
        }
    };

    document.getElementById('btn-next-step').onclick = () => {
        if (estruturaAtual && estruturaAtual.passoAPasso) estruturaAtual.proximoPasso = true;
    };

    document.getElementById('btn-pause-sort').onclick = () => {
        if (estruturaAtual) estruturaAtual.pausado = !estruturaAtual.pausado;
    };

    document.getElementById('btn-reset-sort').onclick = () => {
        window.setEstrutura('ordenacao');
    };

    document.getElementById('sort-speed').oninput = (e) => {
        if (estruturaAtual && estruturaAtual.setVelocidade) estruturaAtual.setVelocidade(e.target.value);
    };

    // --- PILHA E FILA ---
    document.getElementById('btn-add').onclick = () => {
        if (tipoAtual === 'pilha' && estruturaAtual.empilhar) estruturaAtual.empilhar();
        if (tipoAtual === 'fila' && estruturaAtual.inserir) estruturaAtual.inserir();
    };

    document.getElementById('btn-remove').onclick = () => {
        if (tipoAtual === 'pilha' && estruturaAtual.desempilhar) estruturaAtual.desempilhar();
        if (tipoAtual === 'fila' && estruturaAtual.remover) estruturaAtual.remover();
    };

    document.getElementById('btn-buscar').onclick = () => {
        if (estruturaAtual && estruturaAtual.buscar) estruturaAtual.buscar();
    };

    document.getElementById('select-tipo-fila').onchange = (e) => {
        if (tipoAtual === 'fila' && estruturaAtual.setTipo) estruturaAtual.setTipo(e.target.value);
    };

    // --- GRAFO ---
    document.getElementById('btn-dijkstra').onclick = () => {
        if (tipoAtual === 'grafo' && estruturaAtual.rodarDijkstra) estruturaAtual.rodarDijkstra();
    };

    document.getElementById('btn-bellman').onclick = () => {
        if (tipoAtual === 'grafo' && estruturaAtual.rodarBellmanFord) estruturaAtual.rodarBellmanFord();
    };
}

function animar() {
    requestAnimationFrame(animar);
    renderizador.render(cena, cameraAtiva);
}

inicializar();