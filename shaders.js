export const vertexShader = `
    precision mediump float;
    attribute vec3 position;
    attribute vec2 uv;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentShader = `
    precision mediump float;
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform float uHighlight;

    void main() {
        // Se uHighlight for 1.0, o objeto brilha mais (amarelo), senão usa a cor base
        vec3 finalColor = mix(uColor, vec3(1.0, 1.0, 0.0), uHighlight);
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;