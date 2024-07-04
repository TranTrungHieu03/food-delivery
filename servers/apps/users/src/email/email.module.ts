import {Global, Module} from '@nestjs/common';
import {EmailService} from './email.service';
import {MailerModule} from "@nestjs-modules/mailer";
import {ConfigService} from "@nestjs/config";
import {join} from "path";
import {EjsAdapter} from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";

@Global()
@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async (config: ConfigService) => ({
                transport: {
                    host: config.get("SMTP_HOST"),
                    port: parseInt(config.get("SMTP_PORT")),
                    secure: false,
                    service: config.get("SMTP_SERVICE"),
                    auth: {
                        user: config.get("SMTP_MAIL"),
                        pass: config.get("SMTP_PASSWORD"),
                    }
                }, 
                defaults: {
                    from: "FoodDeli"
                },
                template: {
                    dir: join(__dirname, "../../../../servers/email-templates"),
                    adapter: new EjsAdapter(),
                    options: {
                        strict: true
                    }
                }
            }),
            inject: [ConfigService]
        })
    ],
    providers: [EmailService],
    exports: [EmailService]
})
export class EmailModule {
}
