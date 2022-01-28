import { ConnectionOptions } from 'typeorm';
import ormconfig from '@app/ormconfig';

const ormseedconfig: ConnectionOptions = {
  ...ormconfig,
  migrations: [__dirname + '/seeds/*.ts'],
  cli: {
    migrationsDir: 'src/seeds',
  },
};

export default ormseedconfig;
