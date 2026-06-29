import {
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
  useState,
} from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

const TOKEN = '';

function CreateUserForm({
  setUserWasCreated,
}: CreateUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordErrors: string[] = [];

  if (password.length > 0) {
    if (password.length < 10) {
      passwordErrors.push(
        'Password must be at least 10 characters long'
      );
    }

    if (password.length > 24) {
      passwordErrors.push(
        'Password must be at most 24 characters long'
      );
    }

    if (/\s/.test(password)) {
      passwordErrors.push(
        'Password cannot contain spaces'
      );
    }

    if (!/\d/.test(password)) {
      passwordErrors.push(
        'Password must contain at least one number'
      );
    }

    if (!/[A-Z]/.test(password)) {
      passwordErrors.push(
        'Password must contain at least one uppercase letter'
      );
    }

    if (!/[a-z]/.test(password)) {
      passwordErrors.push(
        'Password must contain at least one lowercase letter'
      );
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setApiError('');

    if (!username.trim()) {
      return;
    }

    if (passwordErrors.length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        'https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        setApiError(
          'Not authenticated to access this resource.'
        );
        return;
      }

      if (response.status === 500) {
        setApiError(
          'Something went wrong, please try again.'
        );
        return;
      }

      if (response.status === 400 || response.status === 422) {
        const data = await response.json();

        if (
          Array.isArray(data.errors) &&
          data.errors.includes('not_allowed')
        ) {
          setApiError(
            'Sorry, the entered password is not allowed, please try a different one.'
          );
          return;
        }

        setApiError(
          Array.isArray(data.errors)
            ? data.errors.join(', ')
            : 'Invalid request.'
        );
        return;
      }

      if (response.ok) {
        setUserWasCreated(true);
      }
    } catch {
      setApiError(
        'Something went wrong, please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={handleSubmit}>
        <label htmlFor="username" style={formLabel}>
          Username
        </label>

        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={formInput}
          aria-invalid={!username.trim()}
        />

        <label htmlFor="password" style={formLabel}>
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={formInput}
          aria-invalid={
            password.length > 0 &&
            passwordErrors.length > 0
          }
        />

        {passwordErrors.length > 0 && (
          <ul style={errorList}>
            {passwordErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        {apiError && (
          <p role="alert" style={errorText}>
            {apiError}
          </p>
        )}

        <button
          type="submit"
          style={formButton}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Creating...'
            : 'Create User'}
        </button>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};

const errorList: CSSProperties = {
  margin: '0',
  paddingLeft: '20px',
};

const errorText: CSSProperties = {
  color: '#c62828',
  margin: '0',
};