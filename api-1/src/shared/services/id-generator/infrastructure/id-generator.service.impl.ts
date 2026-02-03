import { IdGeneratorService } from '../domain/id-generator.service';
import crypto from 'crypto';

export class IdGeneratorServiceImpl implements IdGeneratorService {
    public generateUuid(): string {
        return crypto.randomUUID();
    }
}
