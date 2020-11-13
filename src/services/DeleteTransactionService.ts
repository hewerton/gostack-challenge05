// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}
class DeleteTransactionService {
  private transactionsRepository = getCustomRepository(TransactionsRepository);

  public async execute({ id }: Request): Promise<void> {
    await this.transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
