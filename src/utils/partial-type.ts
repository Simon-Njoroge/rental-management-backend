export function PartialType<T extends new (...args: any[]) => {}>(Base: T) {
  abstract class PartialClass extends (Base as any) {
    constructor(...args: any[]) {
      super(...args);
      Object.keys(this).forEach((key) => {
        (this as any)[key] = (this as any)[key];
      });
    }
  }
  return PartialClass as T;
}
