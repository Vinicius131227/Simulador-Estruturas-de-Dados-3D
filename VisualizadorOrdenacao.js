import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders.js';

export class VisualizadorOrdenacao {
    constructor(scene, quantidade = 15) {
        this.scene = scene;
        this.barras = [];
        this.dados = [];
        this.quantidade = quantidade;
        this.executando = false;
        this.delayMs = 150; 
        this.criarElementos();
    }

    criarElementos() {
        const geometria = new THREE.BoxGeometry(0.8, 1, 0.8);
        
        // AUMENTO DO ESPAÇAMENTO: de 1.2 para 1.5 para separar os itens
        const espacamento = 1.5; 
        const offset = ((this.quantidade - 1) * espacamento) / 2;

        for (let i = 0; i < this.quantidade; i++) {
            const valor = Math.random() * 8 + 1;
            
            // CORES INDIVIDUAIS: Criando um gradiente baseado no índice 'i'
            // Isso gera cores diferentes para cada barra para facilitar a visão
            const hue = i / this.quantidade; // Varia de 0 a 1
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
            
            // Posicionamento com o novo espaçamento
            barra.position.x = (i * espacamento) - offset;
            barra.scale.y = valor;
            barra.position.y = valor / 2; 

            this.scene.add(barra);
            this.barras.push(barra);
            this.dados.push(valor);
        }
    }

    async trocar(i, j) {
        if (i === j) return;
        
        // Troca lógica nos dados
        [this.dados[i], this.dados[j]] = [this.dados[j], this.dados[i]];
        
        // Troca visual suave de posição
        const tempX = this.barras[i].position.x;
        this.barras[i].position.x = this.barras[j].position.x;
        this.barras[j].position.x = tempX;

        // Troca no array de objetos para manter a sincronia
        [this.barras[i], this.barras[j]] = [this.barras[j], this.barras[i]];
        
        await new Promise(r => setTimeout(r, this.delayMs));
    }

    async destacar(indices, ligado) {
        indices.forEach(idx => {
            if (this.barras[idx]) {
                // O Shader mudará a cor para Amarelo se uHighlight for 1.0
                this.barras[idx].material.uniforms.uHighlight.value = ligado ? 1.0 : 0.0;
            }
        });
    }

    // --- ALGORITMOS MANTIDOS ---

    async bubbleSort() {
        for (let i = 0; i < this.quantidade; i++) {
            for (let j = 0; j < this.quantidade - i - 1; j++) {
                await this.destacar([j, j + 1], true);
                if (this.dados[j] > this.dados[j + 1]) await this.trocar(j, j + 1);
                await this.destacar([j, j + 1], false);
            }
        }
    }

    async selectionSort() {
        for (let i = 0; i < this.quantidade; i++) {
            let min = i;
            for (let j = i + 1; j < this.quantidade; j++) {
                await this.destacar([j, min], true);
                if (this.dados[j] < this.dados[min]) min = j;
                await this.destacar([j, min], false);
            }
            await this.trocar(i, min);
        }
    }

    async insertionSort() {
        for (let i = 1; i < this.quantidade; i++) {
            let j = i;
            while (j > 0 && this.dados[j - 1] > this.dados[j]) {
                await this.destacar([j, j - 1], true);
                await this.trocar(j, j - 1);
                await this.destacar([j, j + 1], false);
                j--;
            }
        }
    }

    async heapSort() {
        let n = this.quantidade;
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await this.heapify(n, i);
        for (let i = n - 1; i > 0; i--) {
            await this.trocar(0, i);
            await this.heapify(i, 0);
        }
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
        if (inicio >= fim) return;
        let pivoIdx = await this.particionar(inicio, fim);
        await Promise.all([
            this.quickSort(inicio, pivoIdx - 1),
            this.quickSort(pivoIdx + 1, fim)
        ]);
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
        this.barras.forEach(b => {
            b.geometry.dispose();
            b.material.dispose();
            this.scene.remove(b);
        });
        this.barras = [];
        this.dados = [];
    }
}