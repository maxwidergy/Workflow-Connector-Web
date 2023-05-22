import { useQuery } from '@tanstack/react-query';

async function fetchClients() {
  const response = await fetch('https://localhost:5001/api/v1/clients');
  if (!response.ok) {
    throw new Error('Error fetching clients');
  }
  return await response.json();
}

export function useClients() {
  return useQuery(['clients'], fetchClients);
}
