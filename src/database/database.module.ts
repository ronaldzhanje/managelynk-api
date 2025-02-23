import { Module } from '@nestjs/common';
import Knex from 'knex';
import knexConfig from '../knexfile';

const knexInstance = Knex(knexConfig);

@Module({
  providers: [
    {
      provide: 'KNEX_CONNECTION',
      useValue: knexInstance,
    },
  ],
  exports: ['KNEX_CONNECTION'],
})
export class DatabaseModule {}
