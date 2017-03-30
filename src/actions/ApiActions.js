import axios from 'axios';

export const validateJwt = jwt => ({
  type: 'VALIDATE_JWT',
  payload: axios.get('/api/validate-jwt', { headers: { authorization: `Bearer ${jwt}` } }),
});
