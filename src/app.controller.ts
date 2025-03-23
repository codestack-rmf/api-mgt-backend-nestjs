import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log("ENTRO AL METODO DE PRUEBA 1");
    return this.appService.getHello();
  }

  @Get("/otro-metodo")
  getHelloasd(): string {
    console.log("ENTRO AL METODO DE PRUEBA 2");
    return this.appService.getHello();
  }

}
