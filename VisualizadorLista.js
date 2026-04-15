import * as THREE from 'three';

export class VisualizadorLista {
    constructor(cena) {
        this.cena = cena;
        this.nos = [];
        this.tipo = 'simples'; 
        this.espacamento = 2.5;
        this.raioNo = 0.5;
    }

    criarLabel(valor, indice) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Valor
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(valor.toString(), 128, 50);

        // Indice
        ctx.fillStyle = '#00ffcc';
        ctx.font = 'bold 30px Arial';
        ctx.fillText(`idx: ${indice}`, 128, 100);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(2, 1, 1);
        return sprite;
    }

    // Inserção aceita valor e indice
    async inserir(valorEntrada = null, index = -1) {
        // Se não digitou um valor, gera aleatório
        const valorReal = (valorEntrada !== null && !isNaN(valorEntrada)) ? valorEntrada : Math.floor(Math.random() * 100);
        
        const geo = new THREE.SphereGeometry(this.raioNo, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x00d4ff,
            emissive: 0x000000 
        });
        const mesh = new THREE.Mesh(geo, mat);
        
        mesh.position.set(12, 0, 0);
        this.cena.add(mesh);

        const label = this.criarLabel(valorReal, "?"); 
        this.cena.add(label);

        const novoNo = { 
            mesh: mesh, 
            valor: valorReal, 
            label: label,
            linhaDir: null, 
            linhaEsq: null 
        };

        if (index === -1 || index >= this.nos.length) {
            this.nos.push(novoNo); 
        } else {
            const idxReal = Math.max(0, index);
            this.nos.splice(idxReal, 0, novoNo); 
        }

        await this.atualizarVisual();
    }

    // Remove pela posição/indice
    async remover(index = 0) {
        if (this.nos.length === 0) {
            alert("A lista está vazia!");
            return;
        }

        if (isNaN(index) || index < 0 || index >= this.nos.length) {
            alert(`Índice ${index} inválido! A lista vai de 0 a ${this.nos.length - 1}.`);
            return;
        }
        
        const removido = this.nos.splice(index, 1)[0];
        
        this.cena.remove(removido.mesh);
        this.cena.remove(removido.label);
        if (removido.linhaDir) this.cena.remove(removido.linhaDir);
        if (removido.linhaEsq) this.cena.remove(removido.linhaEsq);

        await this.atualizarVisual();
    }

    // Busca pelo valor da bola, fica Verde quando acha
    async buscar(alvoValor) {
        if (this.nos.length === 0) return;
        
        if (alvoValor === null || isNaN(alvoValor)) {
            alert("Escreva um VALOR no campo de input para o procurar!");
            return;
        }

        let encontrou = false;

        for (let i = 0; i < this.nos.length; i++) {
            const no = this.nos[i];
            
            if (no.valor === alvoValor) {
                // Achou o Valor: Fica Verde
                no.mesh.material.color.setHex(0x00ff00);
                no.mesh.material.emissive.setHex(0x00ff00);
                await new Promise(r => setTimeout(r, 1500));
                
                no.mesh.material.color.setHex(0x00d4ff);
                no.mesh.material.emissive.setHex(0x000000);
                encontrou = true;
                break; // Para de procurar depois de achar o primeiro
            } else {
                // Não é este: Fica Roxo e passa para o próximo
                no.mesh.material.emissive.setHex(0xff00ff);
                await new Promise(r => setTimeout(r, 400));
                no.mesh.material.emissive.setHex(0x000000);
            }
        }

        if(!encontrou) {
            alert(`O valor ${alvoValor} não existe na lista.`);
        }
    }

    async atualizarVisual() {
        this.nos.forEach(no => {
            if (no.linhaDir) this.cena.remove(no.linhaDir);
            if (no.linhaEsq) this.cena.remove(no.linhaEsq);
            no.linhaDir = null;
            no.linhaEsq = null;
        });

        const larguraTotal = (this.nos.length - 1) * this.espacamento;
        const inicioX = -larguraTotal / 2;

        const promessas = this.nos.map((no, i) => {
            const destinoX = inicioX + (i * this.espacamento);
            
            // Recria a Label com o valor da bola e o indice atualizado
            this.cena.remove(no.label);
            no.label = this.criarLabel(no.valor, i);
            this.cena.add(no.label);
            
            return this.animarMovimento(no, destinoX);
        });

        await Promise.all(promessas);

        // Refaz as linhas
        for (let i = 0; i < this.nos.length; i++) {
            if (i < this.nos.length - 1) {
                this.nos[i].linhaDir = this.criarLinha(
                    this.nos[i].mesh.position, 
                    this.nos[i+1].mesh.position, 
                    0x00ff00, 0
                );
            } 
            else if (this.tipo === 'circular' && this.nos.length > 1) {
                this.nos[i].linhaDir = this.criarLinha(
                    this.nos[i].mesh.position, 
                    this.nos[0].mesh.position, 
                    0xff0000, -1
                );
            }

            if (this.tipo === 'dupla' && i > 0) {
                this.nos[i].linhaEsq = this.criarLinha(
                    this.nos[i].mesh.position, 
                    this.nos[i-1].mesh.position, 
                    0xffff00, 0.3
                );
            }
        }
    }

    criarLinha(posA, posB, cor, offY) {
        const pontos = [];
        if (offY < 0) {
            for (let t = 0; t <= 1; t += 0.1) {
                const x = THREE.MathUtils.lerp(posA.x, posB.x, t);
                const y = Math.sin(t * Math.PI) * -2.5;
                pontos.push(new THREE.Vector3(x, y, 0));
            }
        } else {
            pontos.push(new THREE.Vector3(posA.x, posA.y + offY, posA.z));
            pontos.push(new THREE.Vector3(posB.x, posB.y + offY, posB.z));
        }

        const geo = new THREE.BufferGeometry().setFromPoints(pontos);
        const mat = new THREE.LineBasicMaterial({ color: cor });
        const linha = new THREE.Line(geo, mat);
        this.cena.add(linha);
        return linha;
    }

    animarMovimento(no, xFinal) {
        return new Promise(resolve => {
            const xInicial = no.mesh.position.x;
            const tempoInicio = performance.now();

            const frame = (agora) => {
                const progresso = Math.min((agora - tempoInicio) / 500, 1);
                const curX = THREE.MathUtils.lerp(xInicial, xFinal, progresso);
                
                no.mesh.position.x = curX;
                no.label.position.set(curX, 1.5, 0);
                
                if (progresso < 1) requestAnimationFrame(frame);
                else resolve();
            };
            requestAnimationFrame(frame);
        });
    }

    setTipo(novoTipo) {
        this.tipo = novoTipo;
        this.atualizarVisual();
    }

    limpar() {
        this.nos.forEach(no => {
            this.cena.remove(no.mesh);
            this.cena.remove(no.label);
            if (no.linhaDir) this.cena.remove(no.linhaDir);
            if (no.linhaEsq) this.cena.remove(no.linhaEsq);
        });
        this.nos = [];
    }
}