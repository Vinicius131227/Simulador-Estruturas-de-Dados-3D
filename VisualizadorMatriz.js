import * as THREE from 'three';

export class VisualizadorMatriz {
    constructor(cena) {
        this.cena = cena;
        this.objetos = [];
        this.tamanho = 5;
    }

    desenhar() {
        this.limpar();

        const espacamento = 1.5;
        const offset = ((this.tamanho - 1) * espacamento) / 2;

        for (let i = 0; i < this.tamanho; i++) {
            for (let j = 0; j < this.tamanho; j++) {
                const x = i * espacamento - offset;
                const z = j * espacamento - offset;

                const geoBase = new THREE.PlaneGeometry(1, 1);
                const matBase = new THREE.MeshBasicMaterial({
                    color: 0x444444,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.12,
                    depthWrite: false
                });

                const base = new THREE.Mesh(geoBase, matBase);
                base.rotation.x = Math.PI / 2;
                base.position.set(x, 0.01, z);
                this.cena.add(base);
                this.objetos.push(base);

                if (Math.random() > 0.75) {
                    const geoDado = new THREE.SphereGeometry(0.4, 16, 16);
                    const matDado = new THREE.MeshStandardMaterial({
                        color: 0x0077ff,
                        emissive: 0x0033ff,
                        emissiveIntensity: 0.5
                    });

                    const dado = new THREE.Mesh(geoDado, matDado);
                    dado.position.set(x, 0.5, z);
                    this.cena.add(dado);
                    this.objetos.push(dado);
                }
            }
        }
    }

    limpar() {
        this.objetos.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();

            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }

            this.cena.remove(obj);
        });

        this.objetos = [];
    }
}