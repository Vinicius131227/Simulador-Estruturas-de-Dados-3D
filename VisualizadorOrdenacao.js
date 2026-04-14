import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders.js';

export class VisualizadorOrdenacao {
    constructor(scene, quantidade = 15) {
        this.scene = scene;
        this.barras = [];
        this.dados = [];
        this.quantidade = quantidade;
        this.pausado = false;
        this.passoAPasso = false;
        this.proximoPasso = false;
        this.delayMs = 200; 
        this.abortar = false;
        this.criarElementos();
    }

    setVelocidade(valor) {
        this.delayMs = 1001 - valor;
    }

    async controlarFluxo() {
        if (this.abortar) throw new Error("Abortado");
        if (this.passoAPasso) {
            while (!this.proximoPasso && !this.abortar) {
                await new Promise(r => setTimeout(r, 50));
            }
            this.proximoPasso = false; 
        } else {
            while (this.pausado && !this.abortar) {
                await new Promise(r => setTimeout(r, 100));
            }
            // O delay é controlado pela velocidade da animação de deslize
        }
    }

    criarElementos() {
        const geometria = new THREE.BoxGeometry(0.8, 1, 0.8);
        const espacamento = 1.5;
        const offset = ((this.quantidade - 1) * espacamento) / 2;

        for (let i = 0; i < this.quantidade; i++) {
            const valor = Math.random() * 8 + 1;
            const hue = i / this.quantidade;
            const corBase = new THREE.Color().setHSL(hue, 0.8, 0.5);

            const material = new THREE.RawShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uColor: { value: corBase },
                    uHighlight: { value: 0.0 }
                }
            });

            const barra = new THREE.Mesh(geometria, material);
            barra.position.x = (i * espacamento) - offset;
            barra.scale.y = valor;
            barra.position.y = valor / 2; 

            this.scene.add(barra);
            this.barras.push(barra);
            this.dados.push(valor);
        }
    }

    // Anima o movimento de arrastar
    async animarTroca(idxA, idxB) {
        const objA = this.barras[idxA];
        const objB = this.barras[idxB];
        const destinoA = objB.position.x;
        const destinoB = objA.position.x;

        const duracao = Math.max(100, this.delayMs);
        const inicio = performance.now();

        return new Promise(resolve => {
            const passo = (agora) => {
                const progresso = Math.min((agora - inicio) / duracao, 1);
                
                // Interpolação linear da posição X
                objA.position.x = THREE.MathUtils.lerp(objA.position.x, destinoA, progresso);
                objB.position.x = THREE.MathUtils.lerp(objB.position.x, destinoB, progresso);

                if (progresso < 1) {
                    requestAnimationFrame(passo);
                } else {
                    // Garante que as posições sejam exatas no final
                    objA.position.x = destinoA;
                    objB.position.x = destinoB;
                    resolve();
                }
            };
            requestAnimationFrame(passo);
        });
    }

    async trocar(i, j) {
        if (i === j) return;
        [this.dados[i], this.dados[j]] = [this.dados[j], this.dados[i]];
        await this.animarTroca(i, j);
        [this.barras[i], this.barras[j]] = [this.barras[j], this.barras[i]];
        await this.controlarFluxo();
    }

    async destacar(indices, ligado) {
        indices.forEach(idx => {
            if (this.barras[idx]) this.barras[idx].material.uniforms.uHighlight.value = ligado ? 1.0 : 0.0;
        });
    }

    async bubbleSort() {
        try {
            for (let i = 0; i < this.quantidade; i++) {
                for (let j = 0; j < this.quantidade - i - 1; j++) {
                    await this.destacar([j, j + 1], true);
                    if (this.dados[j] > this.dados[j + 1]) {
                        await this.trocar(j, j + 1);
                    } else {
                        await this.controlarFluxo();
                    }
                    await this.destacar([j, j + 1], false);
                }
            }
        } catch(e) {}
    }

    async selectionSort() {
        try {
            for (let i = 0; i < this.quantidade; i++) {
                let min = i;
                for (let j = i + 1; j < this.quantidade; j++) {
                    await this.destacar([j, min], true);
                    if (this.dados[j] < this.dados[min]) min = j;
                    await this.controlarFluxo();
                    await this.destacar([j, min], false);
                }
                await this.trocar(i, min);
            }
        } catch(e) {}
    }

    async insertionSort() {
        try {
            for (let i = 1; i < this.quantidade; i++) {
                let j = i;
                while (j > 0 && this.dados[j - 1] > this.dados[j]) {
                    await this.destacar([j, j - 1], true);
                    await this.trocar(j, j - 1);
                    await this.destacar([j, j + 1], false);
                    j--;
                }
            }
        } catch(e) {}
    }

    async heapSort() {
        try {
            let n = this.quantidade;
            for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await this.heapify(n, i);
            for (let i = n - 1; i > 0; i--) {
                await this.trocar(0, i);
                await this.heapify(i, 0);
            }
        } catch(e) {}
    }

    async heapify(n, i) {
        let maior = i;
        let esq = 2 * i + 1;
        let dir = 2 * i + 2;
        if (esq < n && this.dados[esq] > this.dados[maior]) maior = esq;
        if (dir < n && this.dados[dir] > this.dados[maior]) maior = dir;
        if (maior !== i) {
            await this.destacar([i, maior], true);
            await this.trocar(i, maior);
            await this.destacar([i, maior], false);
            await this.heapify(n, maior);
        }
    }

    async quickSort(inicio = 0, fim = this.quantidade - 1) {
        try {
            if (inicio >= fim) return;
            let pivoIdx = await this.particionar(inicio, fim);
            await this.quickSort(inicio, pivoIdx - 1);
            await this.quickSort(pivoIdx + 1, fim);
        } catch(e) {}
    }

    async particionar(inicio, fim) {
        let pivoVal = this.dados[fim];
        let pivoIdx = inicio;
        await this.destacar([fim], true);
        for (let i = inicio; i < fim; i++) {
            if (this.dados[i] < pivoVal) {
                await this.trocar(i, pivoIdx);
                pivoIdx++;
            }
        }
        await this.trocar(pivoIdx, fim);
        await this.destacar([pivoIdx, fim], false);
        return pivoIdx;
    }

    limpar() {
        this.abortar = true;
        this.barras.forEach(b => {
            b.geometry.dispose();
            b.material.dispose();
            this.scene.remove(b);
        });
        this.barras = [];
    }
}