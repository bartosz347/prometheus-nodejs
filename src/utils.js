export const letTheCpuBurn = () => {
    new Array(100000).fill(Math.random()).map(a => a * 10)
}