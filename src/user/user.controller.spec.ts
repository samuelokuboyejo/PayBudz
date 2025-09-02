import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserProfileResponse = {
    id: 'user-1',
    firstName: 'Samuel',
    lastName: 'Okuboyejo',
    email: 'sammy@gmail.com',
    isVerified: true,
  };

  const mockUserService = {
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the profile of the user', async () => {
    mockUserService.getProfile.mockResolvedValue(mockUserProfileResponse);

    const request = { user: { email: 'sammy@gmail.com' } };
    const result = await userController.getProfile(request);

    expect(userService.getProfile).toHaveBeenCalledWith('sammy@gmail.com');
    expect(result).toEqual(mockUserProfileResponse);
  });

  it('should throw NotFoundException if user not found', async () => {
    mockUserService.getProfile.mockRejectedValue(
      new NotFoundException('User not found'),
    );

    const request = { user: { email: 'notexist@gmail.com' } };

    await expect(userController.getProfile(request)).rejects.toThrow(
      NotFoundException,
    );
    expect(userService.getProfile).toHaveBeenCalledWith('notexist@gmail.com');
  });
});
