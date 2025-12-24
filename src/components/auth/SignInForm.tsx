import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { EyeCloseIcon, EyeIcon } from '../../icons';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Button from '../ui/button/Button';
import { loginApi } from '../../api/auth.api';
import toast from 'react-hot-toast';

export default function SignInForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (!formData.email || !formData.password) {
        if (!formData.email) {
          setEmailError('Please enter email')
        }

        if (!formData.password) {
          setPasswordError('Please enter password')
        }

        return
      }

      const res = await loginApi(formData);

      Cookies.set('accessToken', res.data.accessToken, {
        expires: 1,
      });

      toast.success('Login successful');
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(error?.response?.data?.message ||
        'Invalid email or password',)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold dark:text-white text-gray-800 text-title-sm sm:text-title-md">
              MKSK - Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Enter your email and password to sign in!
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* EMAIL */}
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="info@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {
                  emailError && <p className='text-red-400 py-1'>{emailError}</p>
                }
              </div>

              {/* PASSWORD */}
              <div>
                <Label>
                  Password
                  <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    // required
                  />
                  <span
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 size-5" />
                    )}
                  </span>


                </div>
                {
                  passwordError && <p className='text-red-400 py-1'>{passwordError}</p>
                }
              </div>

              {/* SUBMIT */}
              <div>
                <Button
                  className="w-full"
                  size="sm"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
