export const ID_GENERATOR_SERVICE = Symbol('ID_GENERATOR_SERVICE');

export interface IdGeneratorService {
    generateUuid(): string;
}
