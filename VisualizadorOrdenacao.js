import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders.js';

export class VisualizadorOrdenacao {
    constructor(cena, quantidade = 10) {
        this.cena = cena;
        this.barras = [];
        this.dados = [];
        this.quantidade = quantidade;
        this.criarElementos();
    }

    criarElementos() {
        const geometria = new THREE.BoxGeometry(0.8, 1, 0.8);
        const larguraTotal = (this.quantidade - 1) * 1.2;
        const offset = larguraTotal / 2;

        for (let i = 0; i < this.quantidade; i++) {
            const valor = Math.random() * 5 + 1;
            const material = new THREE.RawShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uColor: { value: new THREE.Color(0x00ffcc) },
                    uHighlight: { value: 0.0 }
                }
            });

            const barra = new THREE.Mesh(geometria, material);
            barra.position.x = (i * 1.2) - offset;
            barra.scale.y = valor;
            barra.position.y = valor / 2; 

            this.cena.add(barra);
            this.barras.push(barra);
        }
    }

    destacar(indice, ligar) {
        if(this.barras[indice]) {
            this.barras[indice].material.uniforms.uHighlight.value = ligar ? 1.0 : 0.0;
        }
    }

    limpar() {
        this.barras.forEach(b => {
            b.geometry.dispose();
            b.material.dispose();
            this.cena.remove(b);
        });
        this.barras = [];
    }
}