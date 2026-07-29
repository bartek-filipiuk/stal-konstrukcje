import * as migration_20260722_215051_initial from './20260722_215051_initial';
import * as migration_20260729_062040_mcp_roles from './20260729_062040_mcp_roles';

export const migrations = [
  {
    up: migration_20260722_215051_initial.up,
    down: migration_20260722_215051_initial.down,
    name: '20260722_215051_initial',
  },
  {
    up: migration_20260729_062040_mcp_roles.up,
    down: migration_20260729_062040_mcp_roles.down,
    name: '20260729_062040_mcp_roles'
  },
];
