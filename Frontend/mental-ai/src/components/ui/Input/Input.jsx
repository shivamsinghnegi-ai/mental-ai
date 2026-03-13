import React from 'react';
import styles from './Input.module.css';

const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      className={`${styles.input} ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
