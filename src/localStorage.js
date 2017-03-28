export function loadState() {
  try {
    const serializedState = localStorage.getItem('state');
    if (!serializedState) throw new Error();
    return JSON.parse(serializedState);
  } catch (e) {
    return undefined;
  }
}

export function saveState(state) {
  const serializedState = JSON.stringify(state);
  localStorage.setItem('state',  serializedState);
}
