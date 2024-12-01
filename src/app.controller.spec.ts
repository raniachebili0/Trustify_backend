import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('someProtectedRoute', () => {
    it('should return the correct message with userId', () => {
      const mockReq = { userId: '12345' }; // Mock the req object
      expect(appController.someProtectedRoute(mockReq)).toEqual({
        message: 'Accessed Resource',
        userId: '12345',
      });
    });
  });
});
