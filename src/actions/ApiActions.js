import axios from 'axios';

export const validateJwt = jwt => ({
  type: 'VALIDATE_JWT',
  payload: axios.get('/api/validate-jwt', { headers: { authorization: `Bearer ${jwt}` } }),
});

export const initFromLock = jwt => ({
  type: 'INIT_FROM_LOCK',
  payload: axios.post('/api/self/initFromLock', {}, { headers: { authorization: `Bearer ${jwt}` } }),
});

export const createChildUser = (jwt, newUsers) => ({
  type: 'CREATE_CHILD_USER',
  payload: axios.post('/api/child/createChildUser', { newUsers }, { headers: { authorization: `Bearer ${jwt}` } }),
});

export const getChildUser = jwt => ({
  type: 'GET_CHILD_USER',
  payload: axios.get('/api/child/getChildUser', { headers: { authorization: `Bearer ${jwt}` } }),
});
