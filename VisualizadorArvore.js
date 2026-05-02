import * as THREE from 'three';

export class VisualizadorArvore {
    constructor(cena) {
        this.cena = cena;
        this.tipo = 'abb';

        this.raiz = null;
        this.valores = [];

        this.objetosCena = [];
        this.labels = [];
        this.linhas = [];

        this.raioNo = 0.55;
        this.espY = 1.85;
        this.yInicial = 8.0;
        this.yMin = 1.1;
    }

    setTipo(tipo) {
        this.tipo = tipo || 'abb';

        if (this.valores.length === 0) {
            this.desenharExemplo();
        } else {
            this.reconstruir();
        }
    }

    desenharExemplo() {
        if (this.tipo === 'abb') {
            this.valores = [40, 20, 60, 10, 30, 50, 80, 25, 35];
        } else if (this.tipo === 'avl') {
            this.valores = [30, 20, 10, 25, 40, 50, 35];
        } else if (this.tipo === 'redblack') {
            this.valores = [40, 20, 60, 10, 30, 50, 80, 25, 35, 70];
        } else if (this.tipo === 'doisquatro') {
            this.valores = [10, 20, 30, 40, 50, 60, 70, 80, 90];
        } else {
            this.valores = [40, 20, 60];
        }

        this.reconstruir();
    }

    inserir(valor) {
        if (valor === null || isNaN(valor)) {
            alert('Digite um valor numérico para inserir.');
            return;
        }

        if (this.valores.includes(valor)) {
            alert(`O valor ${valor} já existe na árvore.`);
            return;
        }

        this.valores.push(valor);
        this.reconstruir();
    }

    remover(valor) {
        if (valor === null || isNaN(valor)) {
            alert('Digite um valor numérico para remover.');
            return;
        }

        const idx = this.valores.indexOf(valor);
        if (idx === -1) {
            alert(`O valor ${valor} não existe na árvore.`);
            return;
        }

        this.valores.splice(idx, 1);
        this.reconstruir();
    }

    async buscar(valor) {
        if (valor === null || isNaN(valor)) {
            alert('Digite um valor numérico para buscar.');
            return;
        }

        if (!this.raiz && this.valores.length === 0) {
            alert('A árvore está vazia.');
            return;
        }

        if (this.tipo === 'doisquatro') {
            await this.buscarEm24(valor);
            return;
        }

        const caminho = [];
        let atual = this.raiz;

        while (atual) {
            caminho.push(atual);
            if (valor === atual.valor) break;
            atual = valor < atual.valor ? atual.esq : atual.dir;
        }

        let encontrado = false;

        for (const no of caminho) {
            if (!no.mesh) continue;
            no.mesh.material.emissive.setHex(0xff00ff);
            no.mesh.material.emissiveIntensity = 0.8;
            await this.esperar(420);
            no.mesh.material.emissive.setHex(0x000000);
            no.mesh.material.emissiveIntensity = 0;
        }

        if (caminho.length > 0 && caminho[caminho.length - 1].valor === valor) {
            const no = caminho[caminho.length - 1];
            no.mesh.material.color.setHex(0x00ff00);
            no.mesh.material.emissive.setHex(0x00ff00);
            no.mesh.material.emissiveIntensity = 0.7;
            encontrado = true;

            await this.esperar(1200);
            this.aplicarCorOriginal(no);
        }

        if (!encontrado) {
            alert(`Valor ${valor} não encontrado.`);
        }
    }

    async buscarEm24(valor) {
        let encontrou = false;

        for (const obj of this.objetosCena) {
            if (!obj.userData || !Array.isArray(obj.userData.chaves)) continue;

            obj.material.emissive.setHex(0xff00ff);
            obj.material.emissiveIntensity = 0.7;
            await this.esperar(500);
            obj.material.emissive.setHex(0x000000);
            obj.material.emissiveIntensity = 0;

            if (obj.userData.chaves.includes(valor)) {
                obj.material.color.setHex(0x00ff00);
                obj.material.emissive.setHex(0x00ff00);
                obj.material.emissiveIntensity = 0.7;
                encontrou = true;
                await this.esperar(1200);
                obj.material.color.setHex(0xffaa00);
                obj.material.emissive.setHex(0x000000);
                obj.material.emissiveIntensity = 0;
                break;
            }
        }

        if (!encontrou) {
            alert(`Valor ${valor} não encontrado.`);
        }
    }

    esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reconstruir() {
        this.limparVisual();

        if (this.tipo === 'abb') {
            this.raiz = null;
            for (const v of this.valores) {
                this.raiz = this.inserirABB(this.raiz, v);
            }
            this.atualizarAlturas(this.raiz);
            this.desenharBinaria(this.raiz, 0, this.yInicial, 6.2, null, 'abb', 0);
        } else if (this.tipo === 'avl') {
            this.raiz = null;
            for (const v of this.valores) {
                this.raiz = this.inserirAVL(this.raiz, v);
            }
            this.atualizarAlturas(this.raiz);
            this.desenharBinaria(this.raiz, 0, this.yInicial, 6.2, null, 'avl', 0);
        } else if (this.tipo === 'redblack') {
            this.raiz = null;
            for (const v of this.valores) {
                this.raiz = this.inserirABB(this.raiz, v);
            }
            this.marcarRedBlack(this.raiz, 0, false);
            this.atualizarAlturas(this.raiz);
            this.desenharBinaria(this.raiz, 0, this.yInicial, 6.2, null, 'redblack', 0);
        } else if (this.tipo === 'doisquatro') {
            const ordenados = [...this.valores].sort((a, b) => a - b);
            const arv24 = this.construirArvore24(ordenados);
            this.raiz = null;
            if (this.valores.length > 0) {
                for (const v of this.valores) this.raiz = this.inserirABB(this.raiz, v);
            }
            this.desenharArvore24(arv24, 0, this.yInicial, 8.8, null, 0);
        }
    }

    inserirABB(no, valor) {
        if (no === null) return this.criarNoLogico(valor);

        if (valor < no.valor) no.esq = this.inserirABB(no.esq, valor);
        else if (valor > no.valor) no.dir = this.inserirABB(no.dir, valor);

        return no;
    }

    inserirAVL(no, valor) {
        if (no === null) return this.criarNoLogico(valor);

        if (valor < no.valor) no.esq = this.inserirAVL(no.esq, valor);
        else if (valor > no.valor) no.dir = this.inserirAVL(no.dir, valor);
        else return no;

        this.atualizarAlturaNo(no);
        const fb = this.fatorBalanceamento(no);

        if (fb > 1 && valor < no.esq.valor) return this.rotacaoDireita(no);
        if (fb < -1 && valor > no.dir.valor) return this.rotacaoEsquerda(no);

        if (fb > 1 && valor > no.esq.valor) {
            no.esq = this.rotacaoEsquerda(no.esq);
            return this.rotacaoDireita(no);
        }

        if (fb < -1 && valor < no.dir.valor) {
            no.dir = this.rotacaoDireita(no.dir);
            return this.rotacaoEsquerda(no);
        }

        return no;
    }

    criarNoLogico(valor) {
        return {
            valor,
            esq: null,
            dir: null,
            altura: 1,
            corRB: 'black',
            mesh: null
        };
    }

    altura(no) {
        return no ? no.altura : 0;
    }

    atualizarAlturaNo(no) {
        if (!no) return;
        no.altura = 1 + Math.max(this.altura(no.esq), this.altura(no.dir));
    }

    atualizarAlturas(no) {
        if (!no) return 0;
        const ae = this.atualizarAlturas(no.esq);
        const ad = this.atualizarAlturas(no.dir);
        no.altura = 1 + Math.max(ae, ad);
        return no.altura;
    }

    fatorBalanceamento(no) {
        return no ? this.altura(no.esq) - this.altura(no.dir) : 0;
    }

    rotacaoDireita(y) {
        const x = y.esq;
        const t2 = x.dir;

        x.dir = y;
        y.esq = t2;

        this.atualizarAlturaNo(y);
        this.atualizarAlturaNo(x);

        return x;
    }

    rotacaoEsquerda(x) {
        const y = x.dir;
        const t2 = y.esq;

        y.esq = x;
        x.dir = t2;

        this.atualizarAlturaNo(x);
        this.atualizarAlturaNo(y);

        return y;
    }

    marcarRedBlack(no, nivel = 0, paiVermelho = false) {
        if (!no) return;

        no.corRB = (nivel % 2 === 0 || paiVermelho) ? 'black' : 'red';
        this.marcarRedBlack(no.esq, nivel + 1, no.corRB === 'red');
        this.marcarRedBlack(no.dir, nivel + 1, no.corRB === 'red');
    }

    construirArvore24(valores) {
        if (!valores || valores.length === 0) return null;

        let nivel = [];
        let i = 0;

        while (i < valores.length) {
            const resto = valores.length - i;
            let tam = 2;
            if (resto === 1) tam = 1;
            else if (resto === 3) tam = 3;
            else if (resto === 2) tam = 2;
            else tam = 2;

            nivel.push({
                chaves: valores.slice(i, i + tam),
                filhos: []
            });

            i += tam;
        }

        while (nivel.length > 1) {
            const prox = [];
            let j = 0;

            while (j < nivel.length) {
                const resto = nivel.length - j;
                let grupo = 2;
                if (resto >= 4) grupo = 4;
                else if (resto === 3) grupo = 3;
                else grupo = 2;

                const filhos = nivel.slice(j, j + grupo);
                const chaves = [];

                for (let k = 1; k < filhos.length; k++) {
                    chaves.push(filhos[k].chaves[0]);
                }

                prox.push({ chaves, filhos });
                j += grupo;
            }

            nivel = prox;
        }

        return nivel[0];
    }

    desenharBinaria(no, x, y, espacamento, paiMesh, modo, profundidade) {
        if (!no) return;

        const yAtual = Math.max(this.yMin, y);
        const cor = this.obterCorNo(no, modo);
        const mesh = this.criarNoEsferico(x, yAtual, no.valor, cor);
        no.mesh = mesh;

        if (paiMesh) {
            this.criarLinha(
                new THREE.Vector3(paiMesh.position.x, paiMesh.position.y - this.raioNo, 0),
                new THREE.Vector3(mesh.position.x, mesh.position.y + this.raioNo, 0),
                modo === 'redblack' ? 0xbbbbbb : 0x888888
            );
        }

        if (modo === 'avl') {
            const fb = this.fatorBalanceamento(no);
            const info = this.criarTexto(`fb:${fb}`, '#00ffcc', 190, 64, 'bold 26px Arial');
            info.position.set(x, yAtual - 0.82, 0);
            info.scale.set(1.3, 0.42, 1);
        }

        const proxEsp = Math.max(1.15, espacamento * 0.58);
        const queda = Math.max(1.15, this.espY - profundidade * 0.10);
        const proxY = yAtual - queda;

        if (no.esq) this.desenharBinaria(no.esq, x - espacamento, proxY, proxEsp, mesh, modo, profundidade + 1);
        if (no.dir) this.desenharBinaria(no.dir, x + espacamento, proxY, proxEsp, mesh, modo, profundidade + 1);
    }

    desenharArvore24(no, x, y, espacamento, paiMesh, profundidade) {
        if (!no) return;

        const yAtual = Math.max(this.yMin, y);
        const largura = Math.max(2.2, no.chaves.length * 1.3);
        const texto = no.chaves.join(' | ');
        const mesh = this.criarNoCaixa(x, yAtual, texto, 0xffaa00, largura, 0.95);
        mesh.userData.chaves = [...no.chaves];

        if (paiMesh) {
            this.criarLinha(
                new THREE.Vector3(paiMesh.position.x, paiMesh.position.y - 0.45, 0),
                new THREE.Vector3(mesh.position.x, mesh.position.y + 0.45, 0),
                0xffdd88
            );
        }

        if (!no.filhos || no.filhos.length === 0) return;

        const qtd = no.filhos.length;
        const inicioX = x - ((qtd - 1) * espacamento) / 2;
        const proxEsp = Math.max(2.1, espacamento * 0.64);
        const proxY = yAtual - Math.max(1.2, this.espY - profundidade * 0.08);

        no.filhos.forEach((filho, i) => {
            const fx = inicioX + i * espacamento;
            this.desenharArvore24(filho, fx, proxY, proxEsp, mesh, profundidade + 1);
        });
    }

    obterCorNo(no, modo) {
        if (modo === 'abb') return 0x00aaff;
        if (modo === 'avl') return 0x22cc88;
        if (modo === 'redblack') return no.corRB === 'red' ? 0xcc2222 : 0x111111;
        return 0x00aaff;
    }

    aplicarCorOriginal(no) {
        if (!no || !no.mesh) return;
        const cor = this.obterCorNo(no, this.tipo);
        no.mesh.material.color.setHex(cor);
        no.mesh.material.emissive.setHex(0x000000);
        no.mesh.material.emissiveIntensity = 0;
    }

    criarNoEsferico(x, y, valor, corHex) {
        const geo = new THREE.SphereGeometry(this.raioNo, 24, 24);
        const mat = new THREE.MeshStandardMaterial({
            color: corHex,
            emissive: corHex,
            emissiveIntensity: 0.15
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, 0);
        this.cena.add(mesh);
        this.objetosCena.push(mesh);

        const label = this.criarTexto(String(valor), '#ffffff', 256, 128, 'bold 52px Arial');
        label.position.set(x, y + 1.0, 0);
        label.scale.set(1.8, 0.85, 1);

        return mesh;
    }

    criarNoCaixa(x, y, texto, corHex, largura = 2.2, altura = 0.95) {
        const geo = new THREE.BoxGeometry(largura, altura, 0.8);
        const mat = new THREE.MeshStandardMaterial({
            color: corHex,
            emissive: corHex,
            emissiveIntensity: 0.12
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, 0);
        this.cena.add(mesh);
        this.objetosCena.push(mesh);

        const label = this.criarTexto(texto, '#ffffff', 512, 128, 'bold 38px Arial');
        label.position.set(x, y + 1.0, 0);
        label.scale.set(2.5, 0.78, 1);

        return mesh;
    }

    criarTexto(texto, cor = '#ffffff', largura = 256, altura = 128, fonte = 'bold 48px Arial') {
        const canvas = document.createElement('canvas');
        canvas.width = largura;
        canvas.height = altura;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, largura, altura);
        ctx.fillStyle = cor;
        ctx.font = fonte;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(texto), largura / 2, altura / 2);

        const textura = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: textura,
            transparent: true
        });

        const sprite = new THREE.Sprite(material);
        this.cena.add(sprite);
        this.labels.push(sprite);

        return sprite;
    }

    criarLinha(p1, p2, cor = 0x888888) {
        const pontos = [p1.clone(), p2.clone()];
        const geo = new THREE.BufferGeometry().setFromPoints(pontos);
        const mat = new THREE.LineBasicMaterial({ color: cor });
        const linha = new THREE.Line(geo, mat);

        this.cena.add(linha);
        this.linhas.push(linha);
        return linha;
    }

    limparVisual() {
        this.objetosCena.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
            this.cena.remove(obj);
        });

        this.labels.forEach(lbl => {
            if (lbl.material?.map) lbl.material.map.dispose();
            if (lbl.material) lbl.material.dispose();
            this.cena.remove(lbl);
        });

        this.linhas.forEach(l => {
            if (l.geometry) l.geometry.dispose();
            if (l.material) l.material.dispose();
            this.cena.remove(l);
        });

        this.objetosCena = [];
        this.labels = [];
        this.linhas = [];
    }

    zerar() {
        this.limparVisual();
        this.raiz = null;
        this.valores = [];
    }

    limpar() {
        this.zerar();
    }
}