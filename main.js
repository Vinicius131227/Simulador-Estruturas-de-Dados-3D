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
    // 1. Configuração da Cena
    cena = new THREE.Scene();
    cena.background = new THREE.Color(0x050505);
    
    const aspect = window.innerWidth / window.innerHeight;

    // 2. Configuração das Câmeras (Requisito: Pelo menos duas câmeras)
    cameraPersp = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    cameraPersp.position.set(0, 10, 15);

    const d = 12;
    cameraOrtho = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    cameraOrtho.position.set(0, 25, 0);
    cameraOrtho.lookAt(0, 0, 0);

    cameraAtiva = cameraPersp;

    // 3. Renderizador
    renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderizador.domElement);

    // 4. Iniciar com a primeira estrutura (Ordenação)
    trocarEstrutura('ordenacao');

    // 5. Eventos
    window.addEventListener('keydown', tratarTeclado);
    window.addEventListener('resize', tratarRedimensionamento);

    animar();
}

/**
 * Limpa a cena e os recursos de memória antes de trocar de estrutura
 */
function limparCena() {
    if (estruturaAtual && estruturaAtual.limpar) {
        estruturaAtual.limpar();
    }
    
    // Remove todos os objetos, luzes e auxiliares da cena
    while(cena.children.length > 0) { 
        const obj = cena.children[0];
        if(obj.geometry) obj.geometry.dispose();
        if(obj.material) obj.material.dispose();
        cena.remove(obj); 
    }

    // Restaura a Iluminação (Essencial para texturas e materiais Standard)
    const luzDirecional = new THREE.DirectionalLight(0xffffff, 2);
    luzDirecional.position.set(5, 10, 7);
    cena.add(luzDirecional);
    
    const luzAmbiente = new THREE.AmbientLight(0x404040, 2.5);
    cena.add(luzAmbiente);

    // Grade de referência (GridHelper)
    const grade = new THREE.GridHelper(25, 25, 0x333333, 0x111111);
    cena.add(grade);
}

/**
 * Gerencia a troca entre as 6 estruturas solicitadas
 */
function trocarEstrutura(tipo) {
    console.log("Visualizando: " + tipo.toUpperCase());
    limparCena();
    tipoAtual = tipo;

    switch(tipo) {
        case 'ordenacao': 
            estruturaAtual = new VisualizadorOrdenacao(cena, 15); 
            break;
        case 'pilha': 
            estruturaAtual = new VisualizadorPilha(cena); 
            break;
        case 'fila': 
            estruturaAtual = new VisualizadorFila(cena); 
            break;
        case 'arvore': 
            estruturaAtual = new VisualizadorArvore(cena); 
            estruturaAtual.gerarArvore(0, 6, 0, 0); 
            break;
        case 'grafo': 
            estruturaAtual = new VisualizadorGrafo(cena); 
            estruturaAtual.desenhar(); 
            break;
        case 'matriz':
            estruturaAtual = new VisualizadorMatriz(cena);
            estruturaAtual.desenhar();
            break;
    }

    // Reposiciona a câmera para focar no centro da nova estrutura
    cameraPersp.position.set(0, 8, 12);
    cameraPersp.lookAt(0, 0, 0);
}

/**
 * Mapeamento de Teclado para Algoritmos e Interações
 */
function tratarTeclado(e) {
    const tecla = e.key.toLowerCase();
    
    // Seleção de Estrutura (Teclas 1 a 6)
    const seletor = {
        '1': 'ordenacao', 
        '2': 'pilha', 
        '3': 'fila', 
        '4': 'arvore', 
        '5': 'grafo', 
        '6': 'matriz'
    };
    
    if (seletor[tecla]) {
        trocarEstrutura(seletor[tecla]);
        return;
    }

    // Troca de Câmera (Requisito: Pelo menos duas câmeras)
    if (tecla === 'c') {
        cameraAtiva = (cameraAtiva === cameraPersp) ? cameraOrtho : cameraPersp;
    }

    // --- LOGICA DE ALGORITMOS DE ORDENAÇÃO (Modo 1) ---
    if (tipoAtual === 'ordenacao') {
        if (tecla === 'b') estruturaAtual.bubbleSort();
        if (tecla === 'i') estruturaAtual.insertionSort();
        if (tecla === 's') estruturaAtual.selectionSort();
        if (tecla === 'q') estruturaAtual.quickSort();
        if (tecla === 'h') estruturaAtual.heapSort();
    }

    // --- LOGICA DE GRAFOS (Modo 5) ---
    if (tipoAtual === 'grafo') {
        if (tecla === 'a') estruturaAtual.rodarDijkstra();
        if (tecla === 'b') estruturaAtual.rodarBellmanFord();
    }

    // --- OPERAÇÕES BÁSICAS (Pilha e Fila) ---
    if (tecla === 'w' && estruturaAtual) {
        if (estruturaAtual.empilhar) estruturaAtual.empilhar();
        if (estruturaAtual.enfileirar) estruturaAtual.enfileirar();
    }
    if (tecla === 's' && estruturaAtual) {
        if (estruturaAtual.desempilhar) estruturaAtual.desempilhar();
        if (estruturaAtual.desenfileirar) estruturaAtual.desenfileirar();
    }
}

function tratarRedimensionamento() {
    const largura = window.innerWidth;
    const altura = window.innerHeight;
    renderizador.setSize(largura, altura);
    
    cameraPersp.aspect = largura / altura;
    cameraPersp.updateProjectionMatrix();

    const aspect = largura / altura;
    const d = 12;
    cameraOrtho.left = -d * aspect;
    cameraOrtho.right = d * aspect;
    cameraOrtho.top = d;
    cameraOrtho.bottom = -d;
    cameraOrtho.updateProjectionMatrix();
}

function animar() {
    requestAnimationFrame(animar);
    
    // Movimento Simples (Requisito: Rotação leve para dar profundidade)
    if (estruturaAtual) {
        // Se houver objetos para rotacionar, adicione lógica aqui ou nas classes
    }

    renderizador.render(cena, cameraAtiva);
}

// Início da aplicação
inicializar();