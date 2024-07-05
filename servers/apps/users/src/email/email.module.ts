import {Global, Module} from '@nestjs/common';
import {EmailService} from './email.service';
import {MailerModule} from "@nestjs-modules/mailer";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {join} from "path";
import {EjsAdapter} from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";
import {UsersService} from "../users.service";
import {UsersResolver} from "../user.resolver";

@Global()
@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                transport: {
                    host: config.get("SMTP_HOST"),
                    port: parseInt(config.get("SMTP_PORT")),
                    secure: false,
                    service: config.get("SMTP_SERVICE"),
                    auth: { 
                        user: config.get("SMTP_USER"),
                        pass: config.get("SMTP_PASS"), 
                    }
                },
                defaults: {
                    from: "FoodDeli"
                },
                template: { 
                    dir: join(__dirname, "../../../../servers/email-templates"),
                    adapter: new EjsAdapter(),
                    options: {
                        strict: false
                    }
                }
            }),

        })
    ], 
    providers: [EmailService],
    exports: [EmailService]
})
export class EmailModule {
}
