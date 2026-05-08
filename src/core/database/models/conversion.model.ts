import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('conversions')
export class Conversion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fromCurrency!: string;

  @Column()
  toCurrency!: string;

  @Column('decimal')
  amount!: number;

  @Column('decimal')
  exchangeRate!: number;

  @Column('decimal')
  convertedAmount!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
