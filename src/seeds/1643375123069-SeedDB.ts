import { hash } from 'bcrypt';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDB1643375123069 implements MigrationInterface {
  name = 'SeedDB1643375123069';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = await hash('123456', 10);
    const authorsId = {
      one: '18129eae-7b9e-48d8-b7c8-4660e7749679',
      two: '593c199c-6715-44f4-81ba-6d4f22c78355',
      three: '35e4054c-fc49-4177-b4f9-75f75eab1177',
      four: '5c49e6ae-2ac7-448b-a912-05050b4c70b1',
    };
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('elixir'),('nodejs'),('javascript'),('typescript'),('ruby'),('ror'),('rabbitmq'),('software architecture')`,
    );
    await queryRunner.query(
      `INSERT INTO users (id, username, email, password) VALUES ('${authorsId.one}', 'user-one', 'one@example.com', '${password}'),('${authorsId.two}', 'user-two', 'two@example.com', '${password}'),('${authorsId.three}', 'user-three', 'three@example.com', '${password}'),('${authorsId.four}', 'user-four', 'four@example.com', '${password}')`,
    );
    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('awesome-article-one', 'Awesome Article one', 'Awesome Article one description', 'Awesome Article one body', 'nodejs,typescript', '${authorsId.one}'), ('awesome-article-two', 'Awesome Article two', 'Awesome Article two description', 'Awesome Article two body', 'software architecture,typescript', '${authorsId.two}'),('awesome-article-three', 'Awesome Article three', 'Awesome Article three description', 'Awesome Article three body', 'elixir,rabitmq', '${authorsId.three}'),('awesome-article-four', 'Awesome Article four', 'Awesome Article four description', 'Awesome Article four body', 'nodejs,rabbitmq', '${authorsId.one}');`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error('Down method not implemented');
  }
}
