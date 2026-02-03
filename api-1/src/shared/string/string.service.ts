import { Injectable } from '@nestjs/common';

@Injectable()
export class StringService {
    purifyUrl(url: string): string {
        return url.replace(/\/+/g, '/').replace(/\s+/, '');
    }

    areAllUuids(...uuids: string[]): boolean {
        const regex = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$');
        return uuids.every(uuid => regex.test(uuid));
    }
}
