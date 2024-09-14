import { Controller, Get } from '@nestjs/common';

import { HeroService } from '../services/hero.service';

@Controller({ path: 'hero', version: '1' })
export class HeroController {
  constructor(private readonly hero: HeroService) {}

  @Get('heroes')
  public getHeroes() {
    return this.hero.getHeroes();
  }

  @Get('apply-dataset')
  public applyDataset() {
    return this.hero.applyDataset();
  }
}
