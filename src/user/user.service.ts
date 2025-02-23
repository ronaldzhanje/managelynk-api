import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { Knex } from 'knex';

export interface User {
  id: number;
  email: string;
  password: string;
}

@Injectable()
export class UserService {
  constructor(@Inject('KNEX_CONNECTION') private knex: Knex) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.knex('users')
      .where({ email })
      .first();
  }

  async create(userData: { email: string; password: string }): Promise<number> {
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const [id] = await this.knex('users')
      .insert(userData)
      .returning('id');
    
    return id;
  }

  async findById(id: number): Promise<User | undefined> {
    return this.knex('users')
      .where({ id })
      .first();
  }
} 