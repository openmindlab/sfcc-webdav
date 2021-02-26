import axios from 'axios';
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;
import { Token, tokenstring } from '../src/token';
describe('Token implementation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('token response', async () => {
    const tokenResponse = {
      access_token: 'pBQnIGMr50CzKyZAwvcrGcao968',
      scope: 'mail',
      token_type: 'Bearer',
      expires_in: 1799
    };
    mockAxios.post.mockResolvedValue({
      data: tokenResponse
    });
    const token = new Token();
    const response = await token.authorize();
    expect(response).toBe('pBQnIGMr50CzKyZAwvcrGcao968');
  });
  test('token as static', async () => {
    const tokenResponse = {
      access_token: 'pBQnIGMr50CzKyZAwvcrGcao968',
      scope: 'mail',
      token_type: 'Bearer',
      expires_in: 1799
    };
    mockAxios.post.mockResolvedValue({
      data: tokenResponse
    });
    const token = await tokenstring();
    expect(token).toBe('pBQnIGMr50CzKyZAwvcrGcao968');
  });
});
