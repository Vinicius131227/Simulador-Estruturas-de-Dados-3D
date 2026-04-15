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

function limparCena() {
    if (estruturaAtual && estruturaAtual.limpar) estruturaAtual.limpar();
    
    while(cena && cena.children.length > 0) {
        const obj = cena.children[0];
        if(obj.geometry) obj.geometry.dispose();
        if(obj.material) {
            if(Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
        }
        cena.remove(obj);
    }

    // Recriar luzes e grade base
    const luzDir = new THREE.DirectionalLight(0xffffff, 2);
    luzDir.position.set(5, 10, 7);
    cena.add(luzDir);
    cena.add(new THREE.AmbientLight(0x404040, 2.5));
    cena.add(new THREE.GridHelper(25, 25, 0x333333, 0x111111));
}

window.setEstrutura = (tipo) => {
    limparCena();
    tipoAtual = tipo;

    // Gerenciamento de Painéis do HTML
    const pOrd = document.getElementById('panel-ordenacao');
    const pLin = document.getElementById('panel-linear');
    const pGra = document.getElementById('panel-grafo');
    const sFila = document.getElementById('select-tipo-fila');
    const sLista = document.getElementById('select-tipo-lista');
    const tLinear = document.getElementById('titulo-linear');
    
    const inputsLista = document.getElementById('inputs-lista');

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
        case 'lista':
            estruturaAtual = new VisualizadorLista(cena);
            pLin.classList.remove('hidden');
            sLista.classList.remove('hidden');
            // Mostra a caixa de inputs (Valor e Índice)
            if(inputsLista) inputsLista.classList.remove('hidden'); 
            tLinear.innerText = "Lista Encadeada";
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
    cameraPersp.position.set(0, 10, 15);
    cameraPersp.lookAt(0, 0, 0);
};

function configurarEventosGUI() {
    // --- ORDENAÇÃO ---
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
        if(estruturaAtual.passoAPasso) estruturaAtual.proximoPasso = true;
    };
    document.getElementById('btn-reset-sort').onclick = () => window.setEstrutura('ordenacao');
    document.getElementById('btn-pause-sort').onclick = () => {
        estruturaAtual.pausado = !estruturaAtual.pausado;
    };
    document.getElementById('sort-speed').oninput = (e) => {
        if(estruturaAtual.setVelocidade) estruturaAtual.setVelocidade(e.target.value);
    };
    
    function iniciarSort() {
        const algo = document.getElementById('select-sort').value;
        if(estruturaAtual[algo + 'Sort']) estruturaAtual[algo + 'Sort']();
    }

    // --- PILHA, FILA E LISTA ---
    document.getElementById('btn-add').onclick = () => {
        const valStr = document.getElementById('input-valor') ? document.getElementById('input-valor').value : "";
        const idxStr = document.getElementById('input-indice') ? document.getElementById('input-indice').value : "";
        
        // Se vazio passa null/ -1 para a lista se virar com aleatório/final
        const valor = valStr === "" ? null : parseInt(valStr);
        const idx = idxStr === "" ? -1 : parseInt(idxStr);
        
        if(tipoAtual === 'pilha') estruturaAtual.empilhar();
        else if(tipoAtual === 'fila') estruturaAtual.inserir();
        else if(tipoAtual === 'lista') estruturaAtual.inserir(valor, idx); // Passa o valor e a posição
    };

    document.getElementById('btn-remove').onclick = () => {
        const idxStr = document.getElementById('input-indice') ? document.getElementById('input-indice').value : "";
        const idx = idxStr === "" ? 0 : parseInt(idxStr);

        if(tipoAtual === 'pilha') estruturaAtual.desempilhar();
        else if(tipoAtual === 'fila') estruturaAtual.remover();
        else if(tipoAtual === 'lista') estruturaAtual.remover(idx); // Remove pela posição
    };

    document.getElementById('btn-buscar').onclick = () => {
        if(estruturaAtual.buscar) {
            if (tipoAtual === 'lista') {
                const valStr = document.getElementById('input-valor') ? document.getElementById('input-valor').value : "";
                const valorAlvo = valStr === "" ? null : parseInt(valStr);
                estruturaAtual.buscar(valorAlvo); // Busca pelo valor
            } else {
                estruturaAtual.buscar();
            }
        }
    };

    document.getElementById('select-tipo-fila').onchange = (e) => {
        if (tipoAtual === 'fila' && estruturaAtual.setTipo) estruturaAtual.setTipo(e.target.value);
    };

    document.getElementById('select-tipo-lista').onchange = (e) => {
        if(tipoAtual === 'lista') estruturaAtual.setTipo(e.target.value);
    };  

    // --- GRAFO ---
    document.getElementById('btn-dijkstra').onclick = () => {
        if (tipoAtual === 'grafo' && estruturaAtual.rodarDijkstra) estruturaAtual.rodarDijkstra();
    };

    document.getElementById('btn-bellman').onclick = () => {
        if (tipoAtual === 'grafo' && estruturaAtual.rodarBellmanFord) estruturaAtual.rodarBellmanFord();
    };
}

function tratarRedimensionamento() {
    const w = window.innerWidth, h = window.innerHeight;
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