export type TypeMap = {
  [key: string]: string[];
}

export function splitType(input: string, map: TypeMap): [cmd: string, value: string] {
    const value = input.trim();
    const str = value + ' ';
    for (const [key, values] of Object.entries(map)) {
        for (const value of values) {
            if (str.startsWith(value)) {
                return [key, str.slice(value.length).trim()];
            }
        }
    }
    return ['', value];
}