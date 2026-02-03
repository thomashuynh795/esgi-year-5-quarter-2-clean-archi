import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
    async isDateWithinOpeningHours(date: Date): Promise<boolean> {
        const day = date.getUTCDay();
        const hour = date.getUTCHours();
        return day >= 1 && day <= 5 && hour >= 9 && hour < 20;
    }

    async isIso8601(s: string): Promise<boolean> {
        const iso8601Regex: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
        return iso8601Regex.test(s);
    }
}
