import * as THREE from 'three';

export class VisualizadorLista {
    constructor(cena) {
        this.cena = cena;
        this.nos = [];
        this.tipo = 'simples';
        this.espacamento = 2.5;
        this.raioNo = 0.5;
        this.alturaChao = this.raioNo + 0.2;
        this.buscando = false;
        this.versaoAtualizacao = 0;
        this.ultimaAtualizacao = Promise.resolve();
    }

    criarLabel(valor, indice) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;

        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(valor.toString(), 128, 50);

        ctx.fillStyle = '#00ffcc';
        ctx.font = 'bold 30px Arial';
        ctx.fillText(`idx: ${indice}`, 128, 100);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(2, 1, 1);
        return sprite;
    }

    async inserir(valorEntrada = null, index = -1) {
        const valorReal = (valorEntrada !== null && !isNaN(valorEntrada))
            ? valorEntrada
            : Math.floor(Math.random() * 100);

        const geo = new THREE.SphereGeometry(this.raioNo, 32, 32);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x00d4ff,
            emissive: 0x000000,
            emissiveIntensity: 0
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(12, this.alturaChao, 0);
        this.cena.add(mesh);

        const label = this.criarLabel(valorReal, '?');
        label.position.set(12, this.alturaChao + 1.2, 0);
        this.cena.add(label);

        const novoNo = {
            mesh,
            valor: valorReal,
            label,
            linhaDir: null,
            linhaEsq: null
        };

        if (index === -1 || index >= this.nos.length) {
            this.nos.push(novoNo);
        } else {
            const idxReal = Math.max(0, index);
            this.nos.splice(idxReal, 0, novoNo);
        }

        await this.agendarAtualizacao();
    }

    async remover(index = 0) {
        if (this.nos.length === 0) {
            alert('A lista está vazia!');
            return;
        }

        if (isNaN(index) || index < 0 || index >= this.nos.length) {
            alert(`Índice ${index} inválido! A lista vai de 0 a ${this.nos.length - 1}.`);
            return;
        }

        const removido = this.nos.splice(index, 1)[0];
        this.removerNoCena(removido);
        await this.agendarAtualizacao();
    }

    async buscar(alvoValor) {
        if (this.nos.length === 0) return;

        if (alvoValor === null || isNaN(alvoValor)) {
            alert('Escreva um VALOR no campo de input para procurar!');
            return;
        }

        if (this.buscando) return;
        this.buscando = true;

        let encontrou = false;

        for (let i = 0; i < this.nos.length; i++) {
            const no = this.nos[i];

            no.mesh.material.emissive.setHex(0xff00ff);
            no.mesh.material.emissiveIntensity = 0.9;
            await new Promise(r => setTimeout(r, 350));

            if (no.valor === alvoValor) {
                no.mesh.material.color.setHex(0x00ff00);
                no.mesh.material.emissive.setHex(0x00ff00);
                no.mesh.material.emissiveIntensity = 0.9;
                await new Promise(r => setTimeout(r, 1200));

                no.mesh.material.color.setHex(0x00d4ff);
                no.mesh.material.emissive.setHex(0x000000);
                no.mesh.material.emissiveIntensity = 0;
                encontrou = true;
                break;
            } else {
                no.mesh.material.emissive.setHex(0x000000);
                no.mesh.material.emissiveIntensity = 0;
            }
        }

        this.buscando = false;

        if (!encontrou) {
            alert(`O valor ${alvoValor} não existe na lista.`);
        }
    }

    async agendarAtualizacao() {
        const versao = ++this.versaoAtualizacao;

        this.ultimaAtualizacao = this.ultimaAtualizacao
            .catch(() => {})
            .then(() => this.atualizarVisual(versao));

        return this.ultimaAtualizacao;
    }

    async atualizarVisual(versao) {
        this.limparLinhas();

        const larguraTotal = (this.nos.length - 1) * this.espacamento;
        const inicioX = -larguraTotal / 2;

        const promessas = this.nos.map((no, i) => {
            const destinoX = inicioX + (i * this.espacamento);

            if (no.label) {
                this.removerObjeto3D(no.label);
            }

            no.label = this.criarLabel(no.valor, i);
            no.label.position.set(destinoX, this.alturaChao + 1.2, 0);
            this.cena.add(no.label);

            return this.animarMovimento(no, destinoX, versao);
        });

        await Promise.all(promessas);

        if (versao !== this.versaoAtualizacao) return;

        this.limparLinhas();

        for (let i = 0; i < this.nos.length; i++) {
            if (i < this.nos.length - 1) {
                this.nos[i].linhaDir = this.criarLinha(
                    this.nos[i].mesh.position,
                    this.nos[i + 1].mesh.position,
                    0x00ff00,
                    0
                );
            } else if (this.tipo === 'circular' && this.nos.length > 1) {
                this.nos[i].linhaDir = this.criarLinha(
                    this.nos[i].mesh.position,
                    this.nos[0].mesh.position,
                    0xff0000,
                    -1
                );
            }

            if (this.tipo === 'dupla' && i > 0) {
                this.nos[i].linhaEsq = this.criarLinha(
                    this.nos[i].mesh.position,
                    this.nos[i - 1].mesh.position,
                    0xffff00,
                    0.3
                );
            }
        }
    }

    limparLinhas() {
        this.nos.forEach(no => {
            if (no.linhaDir) {
                this.removerObjeto3D(no.linhaDir);
                no.linhaDir = null;
            }

            if (no.linhaEsq) {
                this.removerObjeto3D(no.linhaEsq);
                no.linhaEsq = null;
            }
        });
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

    animarMovimento(no, xFinal, versao) {
        return new Promise(resolve => {
            const xInicial = no.mesh.position.x;
            const tempoInicio = performance.now();

            const frame = (agora) => {
                if (versao !== this.versaoAtualizacao) {
                    resolve();
                    return;
                }

                const progresso = Math.min((agora - tempoInicio) / 500, 1);
                const curX = THREE.MathUtils.lerp(xInicial, xFinal, progresso);

                no.mesh.position.x = curX;
                no.mesh.position.y = this.alturaChao;

                if (no.label) {
                    no.label.position.set(curX, this.alturaChao + 1.2, 0);
                }

                if (progresso < 1) requestAnimationFrame(frame);
                else resolve();
            };

            requestAnimationFrame(frame);
        });
    }

    removerObjeto3D(obj) {
        if (!obj) return;

        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => {
                    if (mat.map) mat.map.dispose();
                    mat.dispose();
                });
            } else {
                if (obj.material.map) obj.material.map.dispose();
                obj.material.dispose();
            }
        }

        this.cena.remove(obj);
    }

    removerNoCena(no) {
        if (!no) return;
        this.removerObjeto3D(no.mesh);
        this.removerObjeto3D(no.label);
        this.removerObjeto3D(no.linhaDir);
        this.removerObjeto3D(no.linhaEsq);
    }

    setTipo(novoTipo) {
        this.tipo = novoTipo;
        this.agendarAtualizacao();
    }

    limpar() {
        this.versaoAtualizacao++;

        this.nos.forEach(no => this.removerNoCena(no));
        this.nos = [];
        this.buscando = false;
        this.ultimaAtualizacao = Promise.resolve();
    }
}