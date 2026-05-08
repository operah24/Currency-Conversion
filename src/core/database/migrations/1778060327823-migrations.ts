import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1778060327823 implements MigrationInterface {
  name = 'Migrations1778060327823';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "conversions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fromCurrency" character varying NOT NULL, "toCurrency" character varying NOT NULL, "amount" numeric NOT NULL, "exchangeRate" numeric NOT NULL, "convertedAmount" numeric NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4af8c6388f42a1849ee9b22fa16" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "conversions"`);
  }
}
