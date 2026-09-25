import React from 'react';
import { Check, X, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { PasswordStrengthResult } from '../../services/authService';

interface PasswordStrengthIndicatorProps {
  password: string;
  strength: PasswordStrengthResult;
  isDark?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength,
  isDark = true
}) => {
  if (!password) {
    return (
      <div className={`p-3 rounded-md border text-xs space-y-1.5 transition-all ${
        isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Shield size={14} className="text-blue-500" />
          <span>Password Security Instructions:</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-400 pl-1">
          <li className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>Minimum 8 characters</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>Uppercase letter (A-Z)</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>Lowercase letter (a-z)</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>At least one number (0-9)</span>
          </li>
          <li className="flex items-center gap-1.5 sm:col-span-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>Special character (e.g. !@#$%^&*)</span>
          </li>
        </ul>
      </div>
    );
  }

  const rules = [
    { label: 'At least 8 characters', met: strength.hasMinLength },
    { label: 'Uppercase letter (A-Z)', met: strength.hasUppercase },
    { label: 'Lowercase letter (a-z)', met: strength.hasLowercase },
    { label: 'Number (0-9)', met: strength.hasNumber },
    { label: 'Special symbol (!@#$%^&*)', met: strength.hasSpecial }
  ];

  const getStrengthBadge = () => {
    switch (strength.label) {
      case 'Very Secure':
        return { text: 'Very Secure', color: 'text-emerald-500', barColor: 'bg-emerald-500' };
      case 'Strong':
        return { text: 'Strong', color: 'text-sky-500', barColor: 'bg-sky-500' };
      case 'Good':
        return { text: 'Good', color: 'text-blue-500', barColor: 'bg-blue-500' };
      case 'Fair':
        return { text: 'Fair', color: 'text-amber-500', barColor: 'bg-amber-500' };
      default:
        return { text: 'Weak', color: 'text-red-500', barColor: 'bg-red-500' };
    }
  };

  const badge = getStrengthBadge();

  return (
    <div className={`p-3 rounded-md border text-xs space-y-2 transition-all ${
      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
    }`}>
      {/* Header & Score Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {strength.score >= 3 ? (
              <ShieldCheck size={14} className={badge.color} />
            ) : (
              <ShieldAlert size={14} className={badge.color} />
            )}
            <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Password Strength:
            </span>
          </div>
          <span className={`font-bold font-mono ${badge.color}`}>
            {badge.text} ({strength.score}/4)
          </span>
        </div>

        {/* 4-segment strength bar */}
        <div className="grid grid-cols-4 gap-1.5 h-1.5">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-full rounded-sm transition-all duration-300 ${
                step <= strength.score ? badge.barColor : isDark ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rules checklist instructions */}
      <div className="pt-1 border-t border-slate-800/60">
        <span className={`text-[11px] font-semibold block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Police Security Standard Instructions:
        </span>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
          {rules.map((rule, idx) => (
            <li
              key={idx}
              className={`flex items-center gap-1.5 transition-colors ${
                rule.met
                  ? 'text-emerald-500 font-medium'
                  : isDark ? 'text-slate-500' : 'text-slate-400'
              } ${idx === 4 ? 'sm:col-span-2' : ''}`}
            >
              {rule.met ? (
                <Check size={12} className="shrink-0 text-emerald-500" />
              ) : (
                <X size={12} className="shrink-0 text-slate-500 opacity-60" />
              )}
              <span>{rule.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
