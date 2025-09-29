import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/services/user.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../src/entities/user.entity';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'user-1',
    firstName: 'Samuel',
    lastName: 'Okuboyejo',
    username: 'max123',
    email: 'sammy@example.com',
    isVerified: true,
    dateOfBirth: null,
    wallets: {},
    authProvider: {},
    firebaseUid: 'firebase-uid',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    exists: jest.fn(),
    update: jest.fn(),
    findOneByOrFail: jest.fn(),
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
    userRepository = module.get(getRepositoryToken(User)) as jest.Mocked<
      Repository<User>
    >;
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

  describe('checkUsernameAvailability', () => {
    it('should return false if username is reserved', async () => {
      const result = await userService.checkUsernameAvailability('admin');
      expect(result).toEqual({ available: false });
    });

    it('should return false if username already exists', async () => {
      userRepository.exists.mockResolvedValue(true);
      const result = await userService.checkUsernameAvailability('john');
      expect(result).toEqual({ available: false });
    });

    it('should return true if username is valid and available', async () => {
      userRepository.exists.mockResolvedValue(false);
      const result = await userService.checkUsernameAvailability('john123');
      expect(result).toEqual({ available: true });
    });
  });

  describe('updateUsername', () => {
    it('should update username when available', async () => {
      userRepository.exists.mockResolvedValue(false);
      userRepository.findOneByOrFail.mockResolvedValue({
        id: '123',
        username: 'newname',
      } as User);

      const result = await userService.updateUsername('123', 'NewName');
      expect(userRepository.update).toHaveBeenCalledWith('123', {
        username: 'newname',
      });
      expect(result).toEqual({ id: '123', username: 'newname' });
    });

    it('should throw conflict if username is not available', async () => {
      userRepository.exists.mockResolvedValue(true);

      await expect(
        userService.updateUsername('123', 'TakenName'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
