import { RequireAccessLevel } from './access-level.decorator';
import { SetMetadata } from '@nestjs/common';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('RequireAccessLevel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(RequireAccessLevel).toBeDefined();
  });

  it('should call SetMetadata with correct parameters', () => {
    const accessLevel = 2;

    RequireAccessLevel(accessLevel);

    expect(SetMetadata).toHaveBeenCalledWith('accessLevel', accessLevel);
  });

  it('should work with different access levels', () => {
    RequireAccessLevel(1);
    expect(SetMetadata).toHaveBeenCalledWith('accessLevel', 1);

    RequireAccessLevel(3);
    expect(SetMetadata).toHaveBeenCalledWith('accessLevel', 3);
  });

  it('should return the result of SetMetadata', () => {
    const mockReturnValue = () => 'test';
    (SetMetadata as jest.Mock).mockReturnValue(mockReturnValue);

    const result = RequireAccessLevel(2);

    expect(result).toBe(mockReturnValue);
  });
});
