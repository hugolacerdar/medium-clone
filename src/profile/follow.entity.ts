import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'follows' })
export class FollowEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  followerId: string;

  @Column()
  followingId: string;
}
