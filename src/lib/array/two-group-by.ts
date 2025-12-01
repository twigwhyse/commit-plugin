export function twoGroupBy<T>(fn: (v: T) => boolean) {
  return (arr: T[]): [T[], T[]] => {
    let a: T[] = [];
    let b: T[] = [];
    arr.forEach(one => {
      if (fn(one)) {
        a.push(one);
      } else {
        b.push(one);
      }
    });
    return [a, b];
  };
}
