import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import styles from './Auth.module.css';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Fake API call for now; replace with actual endpoint when ready
      // const response = await api.post('/auth/login', data);
      
      // Simulate network
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Fake successful response
      const fakeToken = 'sample_jwt_token_123';
      const fakeUser = { id: 1, name: 'Alex', email: data.email };
      
      setAuth(fakeUser, fakeToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.authCard}>
        <CardHeader className={styles.textCenter}>
          <div className={styles.logoCircle}></div>
          <CardTitle>Welcome to MindEase</CardTitle>
          <CardDescription>Your safe space to talk</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className={errors.email ? styles.inputError : ''}
              />
              {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? styles.inputError : ''}
              />
              {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
            </div>

            <Button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account? <Link to="/signup" className={styles.link}>Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
