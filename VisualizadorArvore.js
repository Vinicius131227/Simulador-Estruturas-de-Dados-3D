import * as THREE from 'three';

export class VisualizadorArvore {
    constructor(cena) {
        this.cena = cena;
        this.nos = [];
        this.conexoes = [];
    }

    gerarArvore(x, y, z, nivel) {
        if (nivel > 2) return;

        // Criar o Nó (Esfera)
        const geoNo = new THREE.SphereGeometry(0.5, 16, 16);
        const matNo = new THREE.MeshStandardMaterial({ color: 0x00aaff });
        const no = new THREE.Mesh(geoNo, matNo);
        no.position.set(x, y, z);
        this.cena.add(no);
        this.nos.push(no);

        // Criar Filhos
        const espacamento = 4 / (nivel + 1);
        
        // Filho Esquerda
        this.gerarArvore(x - espacamento, y - 2, z, nivel + 1);
        // Filho Direita
        this.gerarArvore(x + espacamento, y - 2, z, nivel + 1);
    }
}