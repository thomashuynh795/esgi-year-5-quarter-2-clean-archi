
/**
 * Makes the object passed as parameter immutable recursively.
 * 
 * @param obj The object to freeze
 * @returns 
 */
export function freezeToAbsoluteZero<T>(obj: T): Readonly<T> {
    const propNames = Object.getOwnPropertyNames(obj as any);
    for (const name of propNames) {
        const value = (obj as any)[name];

        if (value && typeof value === 'object' && !Object.isFrozen(value)) {
            freezeToAbsoluteZero(value);
        }
    }
    return Object.freeze(obj);
}
