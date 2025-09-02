import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const mockUser: User = {
    id: 'user-1',
    firstName: 'Samuel',
    lastName: 'Okuboyejo',
    email: 'sammy@example.com',
    isVerified: true,
    dateOfBirth: null,
    wallets: {},
    authProvider: {},
    firebaseUid: 'firebase-uid',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return user profile if user exists', async () => {
    mockRepository.findOne.mockResolvedValue(mockUser);

    const result = await userService.getProfile(mockUser.email);

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
    expect(result).toEqual({
      id: mockUser.id,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      email: mockUser.email,
      isVerified: mockUser.isVerified,
    });
  });

  it('should throw NotFoundException if user does not exist (getProfile)', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(
      userService.getProfile('nonexistent@example.com'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return user entity if user exists (findByEmail)', async () => {
    mockRepository.findOne.mockResolvedValue(mockUser);

    const result = await userService.findByEmail(mockUser.email);

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
    expect(result).toEqual(mockUser);
  });

  it('should throw NotFoundException if user does not exist (findByEmail)', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(
      userService.findByEmail('nonexistent@example.com'),
    ).rejects.toThrow(NotFoundException);
  });
});
