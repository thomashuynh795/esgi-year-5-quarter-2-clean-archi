import sgMail from '@sendgrid/mail';
import { MailService } from '../domain/mail.service';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class MailServiceImpl implements MailService, OnModuleInit {
    public onModuleInit() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    private async sendEmailMessage(message: any): Promise<boolean> {
        return await new Promise((resolve, reject) => {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            sgMail.send(message)
                .then(() => {
                    resolve(true);
                })
                .catch((error: any) => {
                    reject(error);
                });
        });
    }
}
