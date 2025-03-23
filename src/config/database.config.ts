import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

function typeormModuleOptions(): TypeOrmModuleOptions {
    return {
        type: 'mysql',
        host: process.env.TYPEORM_HOST,
        port: parseInt(process.env.TYPEORM_PORT ?? '3306', 10),
        username: process.env.TYPEORM_USERNAME,
        password: process.env.TYPEORM_PASSWORD,
        database: process.env.TYPEORM_DATABASE,
        entities: [join(__dirname, '../**/**/*entity{.ts,.js}')],
        synchronize: true,   
        logging: true,
        logger: 'file',
        //autoLoadEntities:true
    }
}
export default registerAs('database', () => ({
    config: typeormModuleOptions()
}));