import {
    Table,
    Model,
    Column,
    DataType,
    HasMany,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { VipUser } from '../../vip-management/entities/vip-user.entity';

export enum RequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

@Table({
    modelName: 'Request',
    tableName: 'requests',
    timestamps: true,
    updatedAt: false,
    paranoid: true,
})
export class Request extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
    })
    id: number;

    @ForeignKey(() => VipUser)
    @Column({ type: DataType.INTEGER, allowNull: false })
    userId: number;

    @BelongsTo(() => VipUser)
    user: VipUser;

    @Column({ type: DataType.DECIMAL, allowNull: false })
    amount: number;

    @Column({ type: DataType.ENUM(...Object.values(RequestStatus)), allowNull: false })
    status: RequestStatus;
}