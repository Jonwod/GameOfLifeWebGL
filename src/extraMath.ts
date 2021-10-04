// From here: https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
export function properMod(x, n) {
    return ((x%n)+n)%n;
}