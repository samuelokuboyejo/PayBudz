import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../src/controllers/user.controller';
import { UserService } from '../../src/services/user.service';
import { NotFoundException } from '@nestjs/common';
import { UsernameResponse } from 'src/dto/username-response';
import { CheckUsernameDto } from 'src/dto/check-username-dto';
import { UserNameUpdateRequestDTO } from 'src/dto/username-update-request';

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUserProfileResponse = {
    id: 'user-1',
    firstName: 'Samuel',
    lastName: 'Okuboyejo',
    email: 'sammy@gmail.com',
    isVerified: true,
  };

  const mockUserService = {
    getProfile: jest.fn(),
    checkUsernameAvailability: jest.fn(),
    updateUsername: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get(UserService);
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

  describe('checkAvailability', () => {
    it('should return availability from the service', async () => {
      userService.checkUsernameAvailability.mockResolvedValue({
        available: true,
      });

      const dto: CheckUsernameDto = { username: 'john' };
      const result = await userController.checkAvailability(dto);

      expect(result).toEqual({ available: true });
      expect(userService.checkUsernameAvailability).toHaveBeenCalledWith(
        'john',
      );
    });
  });

  describe('updateUsername', () => {
    it('should return updated username from the service', async () => {
      const mockResponse: UsernameResponse = {
        id: '123',
        username: 'newname',
      };

      userService.updateUsername.mockResolvedValue(mockResponse);

      const dto: UserNameUpdateRequestDTO = { username: 'newname' };
      const result = await userController.updateUsername('123', dto);

      expect(result).toEqual(mockResponse);
      expect(userService.updateUsername).toHaveBeenCalledWith('123', 'newname');
    });
  });
});
