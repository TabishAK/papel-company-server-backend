import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeStripeIdsNullable1729084800000 implements MigrationInterface {
  name = 'MakeStripeIdsNullable1729084800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tenant_payments\` MODIFY COLUMN \`stripeSubscriptionId\` VARCHAR(255) NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`tenant_payment_history\` MODIFY COLUMN \`stripeSubscriptionId\` VARCHAR(255) NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`tenant_payment_history\` MODIFY COLUMN \`stripeEventId\` VARCHAR(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tenant_payment_history\` MODIFY COLUMN \`stripeEventId\` VARCHAR(255) NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`tenant_payment_history\` MODIFY COLUMN \`stripeSubscriptionId\` VARCHAR(255) NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`tenant_payments\` MODIFY COLUMN \`stripeSubscriptionId\` VARCHAR(255) NOT NULL`,
    );
  }
}
