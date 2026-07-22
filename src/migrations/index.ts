import * as migration_20260722_215051_initial from './20260722_215051_initial';

export const migrations = [
  {
    up: migration_20260722_215051_initial.up,
    down: migration_20260722_215051_initial.down,
    name: '20260722_215051_initial'
  },
];
