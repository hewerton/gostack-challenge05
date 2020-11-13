import parse from 'csv-parse/lib/sync';
import fs from 'fs';
import path from 'path';

import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';

import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  fileName: string;
}

interface CSVRawTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: string;
  category: string;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  private categoriesRepository = getRepository(Category);

  private transactionsRepository = getCustomRepository(TransactionsRepository);

  private async parseCSV(fileName: string): Promise<CSVTransaction[]> {
    const csvPath = path.join(uploadConfig.destination, fileName);
    const content = await fs.promises.readFile(csvPath);
    const parser = parse(content, { columns: true, trim: true });

    const csvTransactions: CSVTransaction[] = parser.map(
      ({ title, type, value, category }: CSVRawTransaction): CSVTransaction => {
        const parsed: CSVTransaction = {
          title,
          type,
          value: parseInt(value, 10),
          category,
        };

        return parsed;
      },
    );

    return csvTransactions;
  }

  private async findOrCreateCategory(categoryTitle: string): Promise<Category> {
    try {
      const foundCatergory = await this.categoriesRepository.findOneOrFail({
        where: {
          title: categoryTitle,
        },
      });
      return foundCatergory;
    } catch (error) {
      const newCategory = this.categoriesRepository.create({
        title: categoryTitle,
      });
      await this.categoriesRepository.save(newCategory);
      return newCategory;
    }
  }

  public async execute({ fileName }: Request): Promise<Transaction[]> {
    const csvTransactions = await this.parseCSV(fileName);

    const transactions = await Promise.all(
      csvTransactions.map(
        async ({
          title,
          type,
          value,
          category: categoryTitle,
        }): Promise<Transaction> => {
          const category = await this.findOrCreateCategory(categoryTitle);
          const transaction = this.transactionsRepository.create({
            title,
            type,
            value,
            category,
          });
          await this.transactionsRepository.save(transaction);
          return transaction;
        },
      ),
    );

    return transactions;
  }
}

export default ImportTransactionsService;
