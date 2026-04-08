import * as THREE from 'three';

export class VisualizadorGrafo {
    constructor(cena) {
        this.cena = cena;
        this.nos = [];
        this.arestas = [];
        this.posicoes = [
            new THREE.Vector3(-5, 1, 0),  // Início
            new THREE.Vector3(0, 4, 0),   // Cima
            new THREE.Vector3(0, -2, 0),  // Baixo
            new THREE.Vector3(5, 1, 0)    // Fim
        ];
    }

    desenhar() {
        const geoNo = new THREE.IcosahedronGeometry(0.7, 1);
        this.posicoes.forEach((pos) => {
            const matNo = new THREE.MeshStandardMaterial({ color: 0xff0055 });
            const no = new THREE.Mesh(geoNo, matNo);
            no.position.copy(pos);
            this.cena.add(no);
            this.nos.push(no);
        });

        this.conectar(0, 1);
        this.conectar(0, 2);
        this.conectar(1, 3);
        this.conectar(2, 3);
    }

    conectar(i, j) {
        const materialLinha = new THREE.LineBasicMaterial({ color: 0xffffff });
        const geometriaLinha = new THREE.BufferGeometry().setFromPoints([this.posicoes[i], this.posicoes[j]]);
        const linha = new THREE.Line(geometriaLinha, materialLinha);
        this.cena.add(linha);
        this.arestas.push(linha);
    }

    mostrarCaminhoCurto() {
        [0, 2].forEach(idx => this.arestas[idx].material.color.set(0x00ff00));
        [0, 1, 3].forEach(idx => this.nos[idx].material.color.set(0x00ff00));
    }

    limpar() {
        this.nos.forEach(n => this.cena.remove(n));
        this.arestas.forEach(a => this.cena.remove(a));
        this.nos = [];
        this.arestas = [];
    }
}