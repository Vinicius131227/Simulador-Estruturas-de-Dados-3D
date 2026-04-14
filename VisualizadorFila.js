import * as THREE from 'three';

export class VisualizadorFila {
    constructor(cena) {
        this.cena = cena;
        this.itens = [];
        this.espacamento = 1.5;
        this.tipo = 'simples'; 
        this.capacidadeCircular = 8;
    }

    async inserir() {
        if (this.tipo === 'circular' && this.itens.length >= this.capacidadeCircular) {
            alert("Fila Circular Cheia!");
            return;
        }

        const valor = Math.random() * 5 + 1;
        const geo = new THREE.BoxGeometry(0.8, valor, 0.8);
        const mat = new THREE.MeshStandardMaterial({ 
            color: this.tipo === 'prioridade' ? 0xff3300 : 0x00aaff 
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(10, valor / 2, 0);
        this.cena.add(mesh);

        const novo = { mesh, valor };

        if (this.tipo === 'prioridade') {
            let idx = this.itens.length;
            for (let i = 0; i < this.itens.length; i++) {
                if (valor > this.itens[i].valor) { idx = i; break; }
            }
            this.itens.splice(idx, 0, novo);
        } else {
            this.itens.push(novo);
        }

        await this.atualizarVisual();
    }

    async remover() {
        if (this.itens.length === 0) return;
        const removido = this.itens.shift();
        this.cena.remove(removido.mesh);
        await this.atualizarVisual();
    }

    async buscar() {
        for (let i = 0; i < this.itens.length; i++) {
            const it = this.itens[i];
            it.mesh.material.emissive.setHex(0xffff00);
            await new Promise(r => setTimeout(r, 400));
            it.mesh.material.emissive.setHex(0x000000);
        }
    }

    async atualizarVisual() {
        const promessas = this.itens.map((it, i) => {
            let dx, dz = 0;
            if (this.tipo === 'circular') {
                const ang = (i / this.capacidadeCircular) * Math.PI * 2;
                dx = Math.cos(ang) * 5;
                dz = Math.sin(ang) * 5;
            } else {
                dx = (i * this.espacamento) - ((this.itens.length - 1) * this.espacamento) / 2;
            }
            return this.animar(it.mesh, dx, dz);
        });
        await Promise.all(promessas);
    }

    animar(mesh, xF, zF) {
        return new Promise(resolve => {
            const xI = mesh.position.x, zI = mesh.position.z;
            const start = performance.now();
            const f = (t) => {
                const p = Math.min((t - start) / 500, 1);
                mesh.position.x = THREE.MathUtils.lerp(xI, xF, p);
                mesh.position.z = THREE.MathUtils.lerp(zI, zF, p);
                if (p < 1) requestAnimationFrame(f); else resolve();
            };
            requestAnimationFrame(f);
        });
    }

    setTipo(t) { 
        this.tipo = t; 
        this.atualizarVisual(); 
    }

    limpar() {
        this.itens.forEach(i => this.cena.remove(i.mesh));
        this.itens = [];
    }
}