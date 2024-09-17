import { ActionCondition } from '@prisma/client';

type Params = {
  conditions: ActionCondition[];
  value: number;
  defendersCount: number;
  guardiansCount: number;
  fractionCount: number;
};

export default (params: Params) => {
  switch (true) {
    case params.conditions.includes(ActionCondition.FOR_EVERY_DEFENDER): {
      return params.value * params.defendersCount;
    }
    case params.conditions.includes(ActionCondition.FOR_EVERY_GURDIAN): {
      return params.value * params.guardiansCount;
    }
    case params.conditions.includes(ActionCondition.FOR_EVERY_FRACTION): {
      return params.value * params.fractionCount;
    }
    default: {
      return params.value;
    }
  }
};
