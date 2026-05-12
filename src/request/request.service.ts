import { Injectable } from '@nestjs/common';
import { Request } from './entities/request.entity';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from './entities/request.entity';

@Injectable()
export class RequestService {
    constructor(
        @InjectModel(Request)
        private requestModel: typeof Request,
    ) { }

    async createRequest(request: CreateRequestDto) {
        return this.requestModel.create({
            userId: request.userId,
            amount: request.amount,
            status: RequestStatus.PENDING,
        });
    }

    async getAllRequests() {
        return this.requestModel.findAll();
    }

    async getRequestById(id: number) {
        return this.requestModel.findByPk(id);
    }

    async updateRequestStatus(id: number, status: RequestStatus) {
        return this.requestModel.update({ status }, { where: { id } });
    }

    async deleteRequest(id: number) {
        return this.requestModel.destroy({ where: { id } });
    }

    async findAll(dto: Partial<CreateRequestDto>) {
        return this.requestModel.findAll({
            where: { ...dto },
            include: { all: true },
        });
    }
}
