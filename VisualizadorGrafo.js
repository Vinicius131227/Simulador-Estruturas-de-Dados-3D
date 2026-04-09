import * as THREE from 'three';

export class VisualizadorGrafo {
    constructor(cena) {
        this.cena = cena;
        this.nos = [];
        this.arestas = [];
        this.posicoes = [
            new THREE.Vector3(-6, 0, 0),  // 0: Início
            new THREE.Vector3(-2, 3, 0),  // 1
            new THREE.Vector3(2, 3, 0),   // 2
            new THREE.Vector3(6, 0, 0),   // 3: Fim
            new THREE.Vector3(0, -3, 0)   // 4: Nó de Ciclo
        ];
    }

    desenhar() {
        const geoNo = new THREE.IcosahedronGeometry(0.7, 1);
        this.posicoes.forEach((pos) => {
            const matNo = new THREE.MeshStandardMaterial({ color: 0x888888 });
            const no = new THREE.Mesh(geoNo, matNo);
            no.position.copy(pos);
            this.cena.add(no);
            this.nos.push(no);
        });

        // Definição das conexões (arestas)
        this.conectar(0, 1); // aresta 0
        this.conectar(1, 2); // aresta 1
        this.conectar(2, 3); // aresta 2
        this.conectar(0, 4); // aresta 3
        this.conectar(4, 2); // aresta 4
    }

    conectar(i, j) {
        const pontos = [this.posicoes[i], this.posicoes[j]];
        const geoLinha = new THREE.BufferGeometry().setFromPoints(pontos);
        const matLinha = new THREE.LineBasicMaterial({ color: 0x444444 });
        const linha = new THREE.Line(geoLinha, matLinha);
        this.cena.add(linha);
        this.arestas.push(linha);
    }

    // ALGORITMO 1: DIJKSTRA (Caminho mais curto direto)
    async rodarDijkstra() {
        this.resetarCores();
        console.log("Executando Dijkstra...");
        const caminhoCaminho = [0, 1, 2, 3]; // Sequência de nós
        const arestasCaminho = [0, 1, 2];    // Sequência de arestas

        for (let i = 0; i < caminhoCaminho.length; i++) {
            this.nos[caminhoCaminho[i]].material.color.set(0x00ffff); // Azul claro: Visitando
            if (i > 0) this.arestas[arestasCaminho[i-1]].material.color.set(0x00ffff);
            await new Promise(r => setTimeout(r, 600));
            this.nos[caminhoCaminho[i]].material.color.set(0x00ff00); // Verde: Finalizado
        }
    }

    // ALGORITMO 2: BELLMAN-FORD (Relaxamento e Ciclo Negativo)
    async rodarBellmanFord() {
        this.resetarCores();
        console.log("Executando Bellman-Ford...");
        // Relaxa todas as arestas
        for (let i = 0; i < this.arestas.length; i++) {
            this.arestas[i].material.color.set(0xffaa00); // Laranja: Relaxando
            await new Promise(r => setTimeout(r, 400));
        }
        // Simula detecção de ciclo negativo no caminho alternativo (0-4-2)
        this.arestas[3].material.color.set(0xff0000); 
        this.arestas[4].material.color.set(0xff0000);
        this.nos[4].material.color.set(0xff0000);
        console.warn("Ciclo negativo detectado!");
    }

    resetarCores() {
        this.nos.forEach(n => n.material.color.set(0x888888));
        this.arestas.forEach(a => a.material.color.set(0x444444));
    }

    limpar() {
        this.nos.forEach(n => this.cena.remove(n));
        this.arestas.forEach(a => this.cena.remove(a));
        this.nos = []; this.arestas = [];
    }
}