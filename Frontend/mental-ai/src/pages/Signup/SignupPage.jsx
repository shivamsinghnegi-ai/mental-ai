import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import styles from '../Login/Auth.module.css'; // Reuse Login styles

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/signup', data);
      const { token, user } = response.data;

      setAuth(user, token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to create account';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.authCard}>
        <CardHeader className={styles.textCenter}>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Start your journey to better mental health</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>Name</label>
              <Input
                id="name"
                type="text"
                placeholder="Preferred name"
                {...register('name')}
                className={errors.name ? styles.inputError : ''}
              />
              {errors.name && <span className={styles.errorMessage}>{errors.name.message}</span>}
            </div>

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
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
