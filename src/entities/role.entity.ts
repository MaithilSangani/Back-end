import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity.js';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['MANAGER', 'SUPPORT', 'USER'],
    unique: true,
  })
  name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
