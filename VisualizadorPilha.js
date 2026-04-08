import * as THREE from 'three';

export class VisualizadorPilha {
    constructor(cena) {
        this.cena = cena;
        this.itens = [];
        this.limite = 15;
        this.loader = new THREE.TextureLoader();
        this.textura = this.loader.load('https://threejs.org/examples/textures/crate.gif'); 
    }

    empilhar() {
        if (this.itens.length >= this.limite) {
            console.warn("Limite da pilha atingido!");
            return;
        }

        const geometria = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ map: this.textura });
        const cubo = new THREE.Mesh(geometria, material);

        cubo.position.set(0, this.itens.length + 0.5, 0); 
        this.cena.add(cubo);
        this.itens.push(cubo);
    }

    desempilhar() {
        if (this.itens.length === 0) return;
        const ultimo = this.itens.pop();
        this.cena.remove(ultimo);
    }

    limpar() {
        this.itens.forEach(i => this.cena.remove(i));
        this.itens = [];
    }
}