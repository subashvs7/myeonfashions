import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email:    Yup.string().email('Invalid email').required('Email required'),
  password: Yup.string().min(6, 'Min 6 chars').required('Password required'),
});

export const registerSchema = Yup.object({
  name:             Yup.string().min(2).required('Name required'),
  email:            Yup.string().email().required('Email required'),
  password:         Yup.string().min(8, 'Min 8 chars').required(),
  password_confirmation: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required(),
  phone:            Yup.string().matches(/^[6-9]\d{9}$/, 'Invalid phone').optional(),
});

export const addressSchema = Yup.object({
  full_name:     Yup.string().required('Full name required'),
  phone:         Yup.string().matches(/^[6-9]\d{9}$/, 'Invalid phone').required(),
  address_line1: Yup.string().required('Address required'),
  city:          Yup.string().required('City required'),
  state:         Yup.string().required('State required'),
  pincode:       Yup.string().matches(/^\d{6}$/, 'Invalid pincode').required(),
});

export const reviewSchema = Yup.object({
  rating: Yup.number().min(1).max(5).required(),
  title:  Yup.string().max(100),
  body:   Yup.string().max(2000),
});
