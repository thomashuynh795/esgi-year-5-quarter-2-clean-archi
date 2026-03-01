import { v4 as uuidv4 } from 'uuid';
import { IdGenerator } from '../domain/id-generator';

export class IdGeneratorAdapter implements IdGenerator {
  public generate(): string {
    return uuidv4();
  }
}
