import { Controller, Get } from '@nestjs/common';

import { HeoService } from '../services/hero.service';

@Controller({ path: 'hero', version: '1' })
export class HeroController {
  constructor(private readonly hero: HeoService) {}

  @Get('heroes')
  public getHeroes() {
    return this.hero.getHeroes();
  }

  @Get('apply-dataset')
  public applyDataset() {
    this.hero.applyDataset();
  }
}
