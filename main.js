import * as THREE from 'three';
import { VisualizadorOrdenacao } from './VisualizadorOrdenacao.js';
import { VisualizadorPilha } from './VisualizadorPilha.js';
import { VisualizadorFila } from './VisualizadorFila.js';
import { VisualizadorArvore } from './VisualizadorArvore.js';
import { VisualizadorGrafo } from './VisualizadorGrafo.js';

let cena, renderizador, cameraAtiva;
let cameraPerspectiva, cameraOrtografica;
let estruturaAtual = null;
let tipoAtual = 'ordenacao'; 

function inicializar() {
    cena = new THREE.Scene();
    cena.background = new THREE.Color(0x050505);
    const aspect = window.innerWidth / window.innerHeight;

    // Configuração das Câmeras
    cameraPerspectiva = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    cameraPerspectiva.position.set(0, 5, 12); 

    const d = 15;
    cameraOrtografica = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    cameraOrtografica.position.set(0, 20, 0);
    cameraOrtografica.lookAt(0, 0, 0);

    cameraAtiva = cameraPerspectiva;

    renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderizador.domElement);

    // Luzes
    const luzDir = new THREE.DirectionalLight(0xffffff, 2);
    luzDir.position.set(5, 10, 5);
    cena.add(luzDir);
    cena.add(new THREE.AmbientLight(0x404040, 2));
    
    // Iniciar com a primeira estrutura
    trocarEstrutura('ordenacao');

    window.addEventListener('keydown', tratarTeclado);
    window.addEventListener('resize', tratarRedimensionamento);

    animar();
}

function limparCena() {
    // Remove tudo o que for Mesh, Line ou Grid da cena
    const paraRemover = [];
    cena.traverse((child) => {
        if (child.isMesh || child.isLine || child.isGridHelper) {
            paraRemover.push(child);
        }
    });
    paraRemover.forEach(obj => cena.remove(obj));
    cena.add(new THREE.GridHelper(20, 20, 0x333333, 0x111111));
}

function trocarEstrutura(tipo) {
    console.log("Trocando para:", tipo);
    limparCena();
    tipoAtual = tipo;

    switch(tipo) {
        case 'ordenacao':
            estruturaAtual = new VisualizadorOrdenacao(cena, 10);
            cameraPerspectiva.position.set(5, 5, 12);
            break;
        case 'pilha':
            estruturaAtual = new VisualizadorPilha(cena);
            cameraPerspectiva.position.set(0, 5, 12);
            break;
        case 'fila':
            estruturaAtual = new VisualizadorFila(cena);
            cameraPerspectiva.position.set(0, 5, 12);
            break;
        case 'arvore':
            estruturaAtual = new VisualizadorArvore(cena);
            estruturaAtual.gerarArvore(0, 6, 0, 0);
            cameraPerspectiva.position.set(0, 2, 15);
            break;
        case 'grafo':
            estruturaAtual = new VisualizadorGrafo(cena);
            estruturaAtual.desenhar();
            cameraPerspectiva.position.set(0, 2, 12);
            break;
    }
    cameraPerspectiva.lookAt(0, 0, 0);
}

function tratarTeclado(evento) {
    const tecla = evento.key;
    console.log("Tecla pressionada:", tecla);

    if (tecla === '1') trocarEstrutura('ordenacao');
    if (tecla === '2') trocarEstrutura('pilha');
    if (tecla === '3') trocarEstrutura('fila');
    if (tecla === '4') trocarEstrutura('arvore');
    if (tecla === '5') trocarEstrutura('grafo');

    // Interações
    const t = tecla.toLowerCase();
    if (t === 'w' && estruturaAtual.empilhar) estruturaAtual.empilhar();
    if (t === 'w' && estruturaAtual.enfileirar) estruturaAtual.enfileirar();
    if (t === 's' && estruturaAtual.desempilhar) estruturaAtual.desempilhar();
    if (t === 's' && estruturaAtual.desenfileirar) estruturaAtual.desenfileirar();
    if (t === 'd' && estruturaAtual.mostrarCaminhoCurto) estruturaAtual.mostrarCaminhoCurto();
    
    if (t === 'c') cameraAtiva = (cameraAtiva === cameraPerspectiva) ? cameraOrtografica : cameraPerspectiva;
}

function tratarRedimensionamento() {
    const largura = window.innerWidth;
    const altura = window.innerHeight;
    renderizador.setSize(largura, altura);
    cameraPerspectiva.aspect = largura / altura;
    cameraPerspectiva.updateProjectionMatrix();
}

function animar() {
    requestAnimationFrame(animar);
    
    // Animação de rotação para os objetos na cena
    cena.children.forEach(obj => {
        if (obj.isMesh) obj.rotation.y += 0.005;
    });

    renderizador.render(cena, cameraAtiva);
}

inicializar();