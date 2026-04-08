import * as THREE from 'three';

export class VisualizadorFila {
    constructor(cena) {
        this.cena = cena;
        this.itens = [];
        this.limite = 10;
    }

    enfileirar() {
        if (this.itens.length >= this.limite) return;

        const objeto = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.5, 1, 4, 8),
            new THREE.MeshStandardMaterial({ color: 0xff8800 })
        );

        // Cresce para a direita
        objeto.position.set(this.itens.length * 1.5 - 5, 0.5, 0); 
        
        this.cena.add(objeto);
        this.itens.push(objeto);
    }

    desenfileirar() {
        if (this.itens.length === 0) return;
        const primeiro = this.itens.shift();
        this.cena.remove(primeiro);

        // Todos andam para a esquerda
        this.itens.forEach(item => {
            item.position.x -= 1.5;
        });
    }

    limpar() {
        this.itens.forEach(i => this.cena.remove(i));
        this.itens = [];
    }
}