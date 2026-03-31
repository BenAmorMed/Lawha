import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository, getMetadataArgsStorage } from 'typeorm';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('Auth Security', () => {
  let service: AuthService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('User Entity', () => {
    it('should have passwordHash marked with select: false', () => {
      const columns = getMetadataArgsStorage().columns.filter(
        (col) => col.target === User && col.propertyName === 'passwordHash',
      );
      expect(columns.length).toBe(1);
      expect(columns[0].options.select).toBe(false);
    });
  });

  describe('AuthService.login', () => {
    it('should explicitly select passwordHash during login', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: 'customer'
      };

      const queryBuilder: any = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      await service.login({ email: 'test@example.com', password: 'password' });

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.passwordHash');
    });
  });

  describe('AuthService.validateUser', () => {
    it('should NOT select passwordHash by default', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as any);

      await service.validateUser('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      // Verification: findOne doesn't have passwordHash in results when select: false is set (TypeORM behavior)
      // and we didn't add any special select to this call.
    });
  });
});
