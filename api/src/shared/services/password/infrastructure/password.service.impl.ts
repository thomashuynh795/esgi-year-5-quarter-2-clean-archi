import * as argon2 from 'argon2';
import { PasswordService } from '../domain/password.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordServiceImpl implements PasswordService {
    public async hashPassword(plainPassword: string): Promise<string> {
        return await argon2.hash(plainPassword, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1,
        });
    }

    public async isPasswordCorrect(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await argon2.verify(hashedPassword, plainPassword);
    }

    public generateRandomTemporaryPassword(length: number): string {
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const allChars = uppercaseChars + lowercaseChars + numbers;
        let password = '';

        password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
        password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));

        for (let i = 3; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * allChars.length);
            password += allChars.charAt(randomIndex);
        }

        return password
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('');
    }
}
