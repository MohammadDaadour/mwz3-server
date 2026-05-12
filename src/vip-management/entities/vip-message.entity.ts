import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { VipUser } from './vip-user.entity';
// import { Admin } from './admin.entity';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => VipUser)
  vipUser: VipUser;

  @Column()
  vipUserId: number;

  @Column()
  message: string;

  @Column()
  sentBy: 'vip' | 'admin';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sentAt: Date;

  @Column({ default: false })
  isRead: boolean;

//   @ManyToOne(() => Admin, { nullable: true })
//   admin?: Admin;

//   @Column({ nullable: true })
//   adminId?: number;
}