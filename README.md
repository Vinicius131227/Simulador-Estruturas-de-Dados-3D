# Simulador 3D de Estruturas de Dados

Projeto acadêmico desenvolvido individualmente para visualizar estruturas de dados em um ambiente 3D interativo, utilizando **JavaScript** e **Three.js**. O sistema foi criado com foco didático, permitindo observar visualmente o comportamento de diferentes estruturas e algoritmos por meio de animações, shaders, câmeras distintas, texturas e interação via interface gráfica e teclado.

## Objetivo

O objetivo do projeto é representar, em uma cena 3D, conceitos estudados em **estruturas de dados** e **computação gráfica**, unindo visualização interativa com recursos exigidos na atividade, como objetos 3D, shader próprio, câmeras, movimento, textura e documentação.

## Tecnologias Utilizadas

- **JavaScript** modular com `type="module"`
- **Three.js** para criação e renderização da cena 3D
- **HTML** e **CSS** para interface e organização visual do simulador
- **RawShaderMaterial** com shader customizado no módulo de ordenação

## Estruturas Implementadas

O simulador permite alternar entre diferentes estruturas e visualizações por meio da interface principal.

### Ordenação
Visualização de barras 3D com suporte aos algoritmos:
- Bubble Sort
- Selection Sort
- Insertion Sort
- Quick Sort
- Heap Sort

Recursos disponíveis:
- Execução automática
- Execução passo a passo
- Pausa/continuação
- Controle de velocidade

### Pilha
Representação visual da pilha com cubos texturizados empilhados verticalmente. Esse módulo também atende ao requisito de aplicação de textura em objeto 3D.

### Fila
Implementação com suporte a:
- Fila simples
- Fila com prioridade
- Fila circular

Os elementos são animados e reorganizados conforme o tipo selecionado.

### Lista
Implementação de:
- Lista simples
- Lista dupla
- Lista circular

Cada nó é representado por uma esfera com:
- Valor
- Índice
- Ligações visuais entre os elementos

Também permite:
- Inserção por valor
- Inserção por índice
- Remoção por posição
- Busca por valor

### Árvore
Visualização com suporte para:
- ABB
- AVL
- Red-Black
- 2-4

Possui interface para:
- Inserção
- Remoção
- Busca
- Geração de exemplo
- Reset

### Grafo
Representação de nós e arestas em 3D com visualização inspirada nos algoritmos:
- Dijkstra
- Bellman-Ford

Durante a execução, há alteração de cores para indicar relaxamento, caminho visitado e destaque de nós e arestas.

### Matriz Esparsa
A matriz esparsa é representada por uma grade no plano, com elementos posicionados apenas em parte das células, simulando uma matriz com poucos valores não nulos. O reset da matriz gera uma nova configuração.

## Requisitos Atendidos

| Requisito | Como foi atendido |
|---|---|
| Pelo menos um objeto 3D | O projeto possui diversos objetos 3D distribuídos entre os módulos, como barras, cubos, esferas, linhas, planos e icosaedros |
| Redimensionamento e posicionamento individual | Os objetos são manipulados individualmente por `position`, `scale` e cálculos próprios de layout em cada visualizador |
| Shader próprio | O módulo de ordenação utiliza `RawShaderMaterial` com shaders definidos em `shaders.js` |
| Pelo menos duas câmeras | O projeto implementa câmera em perspectiva e câmera ortográfica, com alternância pela tecla `C` |
| Movimento simples de pelo menos um objeto | Há animações em ordenação, fila e lista usando `requestAnimationFrame` |
| Aplicação de textura em pelo menos um objeto | A pilha utiliza textura aplicada aos cubos com `TextureLoader` |
| Documentação no GitHub | Este README documenta as funcionalidades, requisitos atendidos e forma de interação com o projeto |

## Requisito Extra

O projeto também contempla o requisito extra de **1 movimento e 3 objetos extras**, pois possui animações visíveis e múltiplos tipos de objetos 3D distintos.

### Exemplos de objetos extras
- Barras da ordenação com `BoxGeometry`
- Cubos texturizados da pilha
- Esferas da lista e da matriz
- Icosaedros do grafo
- Linhas de conexão em grafo e lista
- Planos representando as células da matriz

## Interação

O sistema pode ser controlado pela interface gráfica e também por atalhos de teclado.

### Interface gráfica
A interface lateral permite:
- Selecionar a estrutura desejada
- Escolher algoritmo de ordenação
- Alterar tipo de fila, lista e árvore
- Inserir, remover, buscar e resetar elementos
- Controlar velocidade, pausa e modo passo a passo

### Atalhos de teclado
- `C` → alterna entre câmera perspectiva e ortográfica
- `W` → executa inserção na estrutura ativa compatível
- `S` → executa remoção na estrutura ativa compatível

## Organização dos Arquivos

```text
index.html
main.js
style.css
shaders.js
VisualizadorOrdenacao.js
VisualizadorPilha.js
VisualizadorFila.js
VisualizadorLista.js
VisualizadorArvore.js
VisualizadorGrafo.js
VisualizadorMatriz.js
```

A aplicação foi estruturada em módulos separados por visualizador, facilitando manutenção, leitura e expansão do projeto.

## Como Executar

1. Clone ou baixe o repositório
2. Abra a pasta do projeto em um editor como o **VS Code**
3. Execute com um servidor local, para evitar problemas com módulos JavaScript
4. Abra o arquivo `index.html` no navegador por meio desse servidor

Exemplo com **Live Server** no VS Code:

```bash
# abrir a pasta do projeto no VS Code
# clicar com o botão direito em index.html
# selecionar "Open with Live Server"
```

## Autor

Projeto desenvolvido individualmente por **Vinicius Souza**.

## Considerações Finais

O simulador reúne conceitos de estruturas de dados e computação gráfica em uma aplicação interativa, atendendo aos requisitos da proposta e ampliando a experiência de aprendizagem com visualização 3D. A combinação entre interface, animação, câmeras, shader, textura e múltiplas estruturas torna o projeto uma ferramenta visual útil para compreensão dos conteúdos estudados.