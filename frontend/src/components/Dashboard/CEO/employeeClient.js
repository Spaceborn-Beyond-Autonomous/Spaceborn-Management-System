// Minimal client helpers for employee modal actions
// Uses userController routes already implemented in backend/src/controllers/userController.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export async function updateEmployeeById(token, id, payload) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || data?.data || 'Failed to update employee');
  return data;
}

export function randomPassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const getRandom = (str) => str[Math.floor(Math.random() * str.length)];

  let password = '';
  password += getRandom(upper);
  password += getRandom(lower);
  password += getRandom(numbers);
  password += getRandom(special);

  for (let i = 0; i < 8; i++) {
    const all = lower + upper + numbers;
    password += getRandom(all);
  }
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function resetEmployeePassword(token, id, newPassword) {
  // Backend controller exists: resetPassword(req, res) under route POST /api/users/:id/reset-password
  const res = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ newPassword })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || data?.data || 'Failed to reset password');
  return data;
}

export async function deactivateEmployee(token, id) {
  // TERMINATE: permanently delete employee record: DELETE /api/users/:id
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || data?.data || 'Failed to deactivate employee');
  return data;
}

export async function activateEmployee(token, id) {
  // Backend controller has activateEmployee: POST /api/users/:id/activate
  const res = await fetch(`${API_BASE_URL}/users/${id}/activate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || data?.data || 'Failed to activate employee');
  return data;
}

