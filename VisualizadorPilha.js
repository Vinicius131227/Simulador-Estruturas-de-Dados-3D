import * as THREE from 'three';

export class VisualizadorPilha {
    constructor(cena) {
        this.cena = cena;
        this.itens = [];
        this.limite = 15;
        this.loader = new THREE.TextureLoader();
        this.textura = this.loader.load('https://threejs.org/examples/textures/crate.gif');
        this.buscando = false;
    }

    empilhar() {
        if (this.itens.length >= this.limite) {
            console.warn('Limite da pilha atingido!');
            return;
        }

        const geometria = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            map: this.textura,
            emissive: 0x000000,
            emissiveIntensity: 0
        });

        const cubo = new THREE.Mesh(geometria, material);
        cubo.position.set(0, this.itens.length + 0.5, 0);

        this.cena.add(cubo);
        this.itens.push(cubo);
    }

    desempilhar() {
        if (this.itens.length === 0) return;

        const ultimo = this.itens.pop();

        if (ultimo.geometry) ultimo.geometry.dispose();
        if (ultimo.material) ultimo.material.dispose();

        this.cena.remove(ultimo);
    }

    async buscar() {
        if (this.buscando || this.itens.length === 0) return;

        this.buscando = true;

        for (let i = this.itens.length - 1; i >= 0; i--) {
            const cubo = this.itens[i];

            cubo.material.emissive.setHex(0x00ffff);
            cubo.material.emissiveIntensity = 1.0;

            await this.esperar(350);

            cubo.material.emissive.setHex(0x00ff00);
            cubo.material.emissiveIntensity = 0.9;

            await this.esperar(180);

            cubo.material.emissive.setHex(0x000000);
            cubo.material.emissiveIntensity = 0;
        }

        this.buscando = false;
    }

    esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    limpar() {
        this.itens.forEach(i => {
            if (i.geometry) i.geometry.dispose();
            if (i.material) i.material.dispose();
            this.cena.remove(i);
        });

        this.itens = [];
        this.buscando = false;
    }
}