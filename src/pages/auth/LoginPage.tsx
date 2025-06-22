import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { useAuthStore } from '@stores/auth';
import { UserRole } from '@types';
import { GraduationCap, Users, UserCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  userType: z.enum(['student', 'teacher', 'parent'])
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [selectedType, setSelectedType] = useState<UserRole | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      navigate('/feed');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const userTypes = [
    { 
      value: UserRole.STUDENT, 
      label: 'Student', 
      icon: GraduationCap,
      description: 'Access assignments and AI tutoring'
    },
    { 
      value: UserRole.TEACHER, 
      label: 'Teacher', 
      icon: Users,
      description: 'Manage classes and track progress'
    },
    { 
      value: UserRole.PARENT, 
      label: 'Parent', 
      icon: UserCircle,
      description: 'Monitor children\'s education'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SkooledIn</h1>
          <p className="mt-2 text-gray-600">AI-Powered Education Platform</p>
        </div>

        {/* User Type Selection */}
        {!selectedType ? (
          <div className="bg-white py-8 px-4 shadow-sm rounded-2xl sm:px-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              I am a...
            </h2>
            
            <div className="space-y-3">
              {userTypes.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  onClick={() => {
                    setSelectedType(value);
                    setValue('userType', value);
                  }}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-brand-primary hover:bg-brand-light/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center">
                    <Icon className="text-brand-primary" size={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">{label}</div>
                    <div className="text-sm text-gray-600">{description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white py-8 px-4 shadow-sm rounded-2xl sm:px-10">
            <button
              onClick={() => setSelectedType(null)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              ← Change user type
            </button>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Sign in as {selectedType}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                placeholder="Enter your email"
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                {...register('password')}
                error={errors.password?.message}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-brand-primary hover:text-brand-darker"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                Sign In
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <Link
                  to="/register"
                  className="font-medium text-brand-primary hover:text-brand-darker"
                >
                  Sign Up
                </Link>
              </div>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                Demo: {selectedType}@demo.com / demo123
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}