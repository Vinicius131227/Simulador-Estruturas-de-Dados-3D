import * as THREE from 'three';

export class VisualizadorGrafo {
    constructor(cena) {
        this.cena = cena;
        this.nos = [];
        this.arestas = [];
        this.raioNo = 0.7;
        this.yMin = this.raioNo + 0.35;

        this.posicoes = [
            new THREE.Vector3(-6, 2.2, 0),  // 0: Início
            new THREE.Vector3(-2, 5.0, 0),  // 1
            new THREE.Vector3(2, 5.0, 0),   // 2
            new THREE.Vector3(6, 2.2, 0),   // 3: Fim
            new THREE.Vector3(0, 1.4, 0)    // 4: Nó inferior, acima do chão
        ];

        this.conexoes = [
            [0, 1],
            [1, 2],
            [2, 3],
            [0, 4],
            [4, 2]
        ];
    }

    desenhar() {
        this.limpar();

        const geoNo = new THREE.IcosahedronGeometry(this.raioNo, 1);

        this.posicoes.forEach((posOriginal, indice) => {
            const pos = posOriginal.clone();
            pos.y = Math.max(this.yMin, pos.y);

            const matNo = new THREE.MeshStandardMaterial({
                color: 0x888888,
                emissive: 0x111111,
                emissiveIntensity: 0.2
            });

            const no = new THREE.Mesh(geoNo, matNo);
            no.position.copy(pos);
            this.cena.add(no);
            this.nos.push(no);

            const label = this.criarLabel(`${indice}`, pos.x, pos.y + 1.1, 0);
            this.cena.add(label);
            this.nos.push(label);
        });

        this.conexoes.forEach(([i, j]) => this.conectar(i, j));
    }

    conectar(i, j) {
        const p1 = this.pegarPosicaoNo(i);
        const p2 = this.pegarPosicaoNo(j);

        const geoLinha = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const matLinha = new THREE.LineBasicMaterial({ color: 0x444444 });
        const linha = new THREE.Line(geoLinha, matLinha);

        this.cena.add(linha);
        this.arestas.push(linha);
    }

    pegarPosicaoNo(indice) {
        const p = this.posicoes[indice].clone();
        p.y = Math.max(this.yMin, p.y);
        return p;
    }

    criarLabel(texto, x, y, z) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 128, 128);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 54px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(texto, 64, 64);

        const textura = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: textura,
            transparent: true
        });

        const sprite = new THREE.Sprite(material);
        sprite.position.set(x, y, z);
        sprite.scale.set(1.2, 0.7, 1);

        return sprite;
    }

    async rodarDijkstra() {
        this.resetarCores();

        const caminhoNos = [0, 1, 2, 3];
        const caminhoArestas = [0, 1, 2];

        for (let i = 0; i < caminhoNos.length; i++) {
            const no = this.nos[caminhoNos[i] * 2];
            no.material.color.set(0x00ffff);
            no.material.emissive.set(0x00ffff);

            if (i > 0) {
                this.arestas[caminhoArestas[i - 1]].material.color.set(0x00ffff);
            }

            await new Promise(r => setTimeout(r, 600));

            no.material.color.set(0x00ff00);
            no.material.emissive.set(0x003300);
        }
    }

    async rodarBellmanFord() {
        this.resetarCores();

        for (let i = 0; i < this.arestas.length; i++) {
            this.arestas[i].material.color.set(0xffaa00);
            await new Promise(r => setTimeout(r, 400));
        }

        this.arestas[3].material.color.set(0xff0000);
        this.arestas[4].material.color.set(0xff0000);

        const noCiclo = this.nos[4 * 2];
        noCiclo.material.color.set(0xff0000);
        noCiclo.material.emissive.set(0x440000);

        console.warn('Ciclo negativo detectado!');
    }

    resetarCores() {
        for (let i = 0; i < this.nos.length; i++) {
            const obj = this.nos[i];

            if (obj instanceof THREE.Mesh) {
                obj.material.color.set(0x888888);
                obj.material.emissive.set(0x111111);
            }
        }

        this.arestas.forEach(a => a.material.color.set(0x444444));
    }

    limpar() {
        this.nos.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material?.map) obj.material.map.dispose();
            if (obj.material) obj.material.dispose();
            this.cena.remove(obj);
        });

        this.arestas.forEach(a => {
            if (a.geometry) a.geometry.dispose();
            if (a.material) a.material.dispose();
            this.cena.remove(a);
        });

        this.nos = [];
        this.arestas = [];
    }
}