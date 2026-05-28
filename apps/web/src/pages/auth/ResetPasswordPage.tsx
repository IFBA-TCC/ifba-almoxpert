import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/FormFields';

// ── Step 1: código ────────────────────────────────────────────────────────────
const codeSchema = z.object({
  code: z.string().length(6, 'O código deve ter 6 dígitos'),
});
type CodeForm = z.infer<typeof codeSchema>;

// ── Step 2: nova senha ────────────────────────────────────────────────────────
const passwordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Mínimo de 8 caracteres')
    .regex(/[a-z]/, 'Deve ter pelo menos uma letra minúscula')
    .regex(/[A-Z]/, 'Deve ter pelo menos uma letra maiúscula')
    .regex(/[^a-zA-Z0-9]/, 'Deve ter pelo menos um caractere especial'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});
type PasswordForm = z.infer<typeof passwordSchema>;

// ── Critério visual ───────────────────────────────────────────────────────────
const Criterion: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <li className={`flex items-center gap-1.5 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ok ? 'bg-green-500' : 'bg-gray-300'}`} />
    {label}
  </li>
);

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email    = (location.state as any)?.email ?? '';

  const [step, setStep]         = useState<1 | 2 | 3>(1);
  const [code, setCode]         = useState('');
  const [apiError, setApiError] = useState('');
  const [showNew, setShowNew]   = useState(false);
  const [showConf, setShowConf] = useState(false);

  // ── Step 1 form ──
  const codeForm = useForm<CodeForm>({ resolver: zodResolver(codeSchema) });

  const onCodeSubmit = (data: CodeForm) => {
    setCode(data.code);
    setApiError('');
    setStep(2);
  };

  // ── Step 2 form ──
  const passForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });
  const watchNew = passForm.watch('newPassword') ?? '';

  const criteria = {
    length:    watchNew.length >= 8,
    lowercase: /[a-z]/.test(watchNew),
    uppercase: /[A-Z]/.test(watchNew),
    special:   /[^a-zA-Z0-9]/.test(watchNew),
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setApiError('');
    try {
      await authService.resetPassword(email, code, data.newPassword);
      setStep(3);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setApiError(msg || 'Código inválido ou expirado. Volte e tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src="/iconeAlmoXpert.png" alt="AlmoxPert" className="h-16 w-auto object-contain" />
        </div>

        {/* ── Step 1: código ── */}
        {step === 1 && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Confirmar código</h1>
              <p className="text-sm text-gray-400">Insira o código de 6 dígitos enviado para o seu e-mail.</p>
            </div>

            <div className="flex items-center gap-2.5 px-4 py-3 mb-5 rounded-xl bg-blue-50 border border-blue-100">
              <Mail size={15} className="text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-blue-500">Código enviado para</p>
                <p className="text-sm font-semibold text-blue-700 truncate">{email || 'seu e-mail'}</p>
              </div>
            </div>

            <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
              <Input
                label="Código de verificação"
                type="text"
                placeholder="000000"
                maxLength={6}
                error={codeForm.formState.errors.code?.message}
                {...codeForm.register('code')}
              />
              <Button type="submit" className="w-full" size="lg">
                Próximo
              </Button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-4">
              Não recebeu?{' '}
              <Link to="/forgot-password" className="text-blue-600 hover:underline">
                Reenviar código
              </Link>
            </p>
          </>
        )}

        {/* ── Step 2: nova senha ── */}
        {step === 2 && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Nova senha</h1>
              <p className="text-sm text-gray-400">Crie uma senha segura para sua conta.</p>
            </div>

            {/* Critérios */}
            <div className="mb-5 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">A senha deve ter:</p>
              <ul className="space-y-1 text-xs">
                <Criterion ok={criteria.length}    label="Mínimo de 8 caracteres" />
                <Criterion ok={criteria.lowercase} label="Pelo menos uma letra minúscula" />
                <Criterion ok={criteria.uppercase} label="Pelo menos uma letra maiúscula" />
                <Criterion ok={criteria.special}   label="Pelo menos um caractere especial (!@#$%...)" />
              </ul>
            </div>

            <form onSubmit={passForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="relative">
                <Input
                  label="Nova senha"
                  type={showNew ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={<Lock size={15} />}
                  error={passForm.formState.errors.newPassword?.message}
                  {...passForm.register('newPassword')}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-9 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirmar nova senha"
                  type={showConf ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={<Lock size={15} />}
                  error={passForm.formState.errors.confirmPassword?.message}
                  {...passForm.register('confirmPassword')}
                />
                <button type="button" onClick={() => setShowConf(!showConf)}
                  className="absolute right-3.5 top-9 text-gray-400 hover:text-gray-600">
                  {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {apiError && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                  {apiError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={passForm.formState.isSubmitting}
              >
                Redefinir senha
              </Button>
            </form>

            <button
              onClick={() => { setStep(1); setApiError(''); }}
              className="flex items-center justify-center gap-1.5 mt-6 w-full text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={14} />
              Voltar e inserir outro código
            </button>
          </>
        )}

        {/* ── Step 3: sucesso ── */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Senha redefinida!</h1>
            <p className="text-sm text-gray-500 mb-6">
              Sua nova senha foi salva. Agora você pode entrar normalmente.
            </p>
            <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
              Ir para o login
            </Button>
          </div>
        )}

        {step === 1 && (
          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 mt-6 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={14} />
            Voltar ao login
          </Link>
        )}
      </div>
    </div>
  );
};
