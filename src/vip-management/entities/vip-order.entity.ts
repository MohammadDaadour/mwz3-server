import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { VipUser } from './vip-user.entity';
// import { Admin } from './admin.entity';

@Entity()
export class VipOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => VipUser)
  vipUser: VipUser;

  @Column()
  vipUserId: number;

  @Column('decimal')
  totalAmount: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'completed';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;

  @Column({ nullable: true })
  respondedAt?: Date;

//   @ManyToOne(() => Admin, { nullable: true })
//   admin?: Admin;

//   @Column({ nullable: true })
//   adminId?: number;
}