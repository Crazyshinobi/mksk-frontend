import { useState } from 'react';
// import { notification } from 'antd';

import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';
import Button from '../../components/ui/button/Button';
import toast from 'react-hot-toast';

import { useCreateCompany } from '../../hooks/useCompanies';

export default function CreateCompany() {
    const { mutate, isPending } = useCreateCompany();

    const [form, setForm] = useState({
        companyName: '',
        companyDesc: '',
    });

    const [errors, setErrors] = useState<{
        companyName?: string;
        companyDesc?: string;
    }>({});

    // 🔹 Client-side validation
    const validate = () => {
        const newErrors: typeof errors = {};

        if (!form.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        } else if (form.companyName.length > 150) {
            newErrors.companyName =
                'Company name must be less than 150 characters';
        }

        if (form.companyDesc && form.companyDesc.length > 500) {
            newErrors.companyDesc =
                'Description must be less than 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        mutate(
            {
                companyName: form.companyName.trim(),
                companyDesc: form.companyDesc || null,
            },
            {
                onSuccess: (res) => {
                    toast.success(res.message || "Company created sucessfully")

                    setForm({
                        companyName: '',
                        companyDesc: '',
                    });
                },

                onError: (error: any) => {
                    toast.error( error?.response?.data?.message || 'Failed to create company');
                },

            },
        );
    };

    return (
        <>
            <PageMeta
                title="MKSK Admin Dashboard | Create Company"
                description="Create a new company"
            />

            <PageBreadcrumb pageTitle="Create Company" />

            <div className="space-y-6">
                <ComponentCard title="Add New Company">
                    {/* Company Name */}
                    <div>
                        <Label>Company Name <span className='text-red-500'>*</span></Label>
                        <Input
                            type="text"
                            placeholder="Enter Company Name"
                            value={form.companyName}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    companyName: e.target.value,
                                })
                            }
                        />
                        {errors.companyName && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.companyName}
                            </p>
                        )}
                    </div>

                    {/* Company Description */}
                    <div>
                        <Label>Company Description</Label>
                        <TextArea
                            placeholder="Enter Company Description"
                            rows={6}
                            value={form.companyDesc}
                            onChange={(value) =>
                                setForm({
                                    ...form,
                                    companyDesc: value,
                                })
                            }
                        />
                        {errors.companyDesc && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.companyDesc}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <Button
                        size="md"
                        variant="primary"
                        className="w-full flex justify-center items-center gap-2"
                        onClick={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                Creating...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </Button>

                </ComponentCard>
            </div>
        </>
    );
}
