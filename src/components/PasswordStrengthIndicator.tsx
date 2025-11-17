import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains number', test: (p) => /[0-9]/.test(p) },
  { label: 'Contains special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const results = useMemo(() => 
    requirements.map(req => ({
      label: req.label,
      met: req.test(password)
    })),
    [password]
  );

  const strength = results.filter(r => r.met).length;
  const strengthPercentage = (strength / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercentage <= 40) return 'bg-destructive';
    if (strengthPercentage <= 80) return 'bg-warning';
    return 'bg-success';
  };

  const getStrengthLabel = () => {
    if (strengthPercentage <= 40) return 'Weak';
    if (strengthPercentage <= 80) return 'Medium';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password strength:</span>
          <span className="font-gaming text-foreground">{getStrengthLabel()}</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        {results.map((result, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 text-sm"
          >
            {result.met ? (
              <Check className="h-4 w-4 text-success flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={result.met ? 'text-success' : 'text-muted-foreground'}>
              {result.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
