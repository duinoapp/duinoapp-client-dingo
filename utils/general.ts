
export const asyncTimeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const asyncNextAnimationFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));