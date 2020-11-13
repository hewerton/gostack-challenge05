import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  private transactionsRepository = getCustomRepository(TransactionsRepository);

  private categoriesRepository = getRepository(Category);

  public async execute({
    title,
    type,
    value,
    category: categoryTitle,
  }: Request): Promise<Transaction> {
    // Checking balance
    if (type === 'outcome') {
      const balance = await this.transactionsRepository.getBalance();
      if (value > balance.total) {
        throw new AppError("There aren't enough funds.");
      }
    }

    // Searching category
    let category = await this.categoriesRepository.findOne({
      where: {
        title: categoryTitle,
      },
    });

    if (!category) {
      category = this.categoriesRepository.create({ title: categoryTitle });
      await this.categoriesRepository.save(category);
    }

    const transaction = this.transactionsRepository.create({
      title,
      type,
      value,
      category,
    });

    await this.transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
