'use client';

import { useFormStatus } from 'react-dom';

export function AuthSubmitButton({ idle, loading }: { idle: string; loading: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
      {pending ? loading : idle}
    </button>
  );
}
